/*
 * app.js —— 页面主逻辑：无凭据轮询、严格校验、单调计时过期判定、textContent 渲染。
 *
 * 关键不变量：
 * - 每个时刻最多一个请求在途；请求有 8 秒超时；过期响应不会被采用。
 * - 采样年龄由 SampleAgeTracker 按 sample_hash 维护“高水位”：同一份样本
 *   重复到达（含重复发布）不重置基线；年龄=max(墙钟,单调,高水位)，
 *   时钟回拨、休眠恢复都不会让旧样本变新；重复发布不延长有效期（R07）。
 * - 结构与 hash 全部校验通过后，才以两阶段 examine/apply 提交序列守卫，
 *   任何坏样本都不会污染守卫基线（R08）。
 * - 网络错误/坏数据时保留旧读数，但状态条、卡片、任务区一致撤销
 *   “数据正常/当前有效”结论，旧读数明确标记（R10）。
 * - 任务信息读不到与“确实无任务”严格区分（R11）。
 * - 动态内容一律 createElement/textContent，任务名绝不作为 HTML。
 * - L3：GitHub Contents API 仅作为“默认关闭、显式配置”的备用源；
 *   只有尚无有效样本或采样年龄≥120s 且冷却到期时才用 API 替代本轮
 *   raw，每轮仍至多一个请求；匿名额度有限，冷却/限流规则见 fetchOnce。
 *   该备用源只尽力缓解缓存延迟，不承诺消除所有过期窗口。
 */
(function () {
  "use strict";

  var cfg = window.RWC_CONFIG;
  var V = window.RWCValidate;
  var C = window.RWCCanonical;
  var E = V.ERROR;

  var state = {
    mode: "disconnected",
    lastGood: null,   // {env, fetchedMs, sampledMs, publishedMs, hash, source}
    ageTracker: new V.SampleAgeTracker(),
    inflight: false,
    requestSeq: 0,
    guard: new V.SequenceGuard(),
    notice: null,
    errors: [],
    demo: false,
    demoSource: null,
    demoState: "normal",
    urlConfigured: false,
    // L4：可见更新诊断（只记录实际观察，不改变任何取数/校验逻辑）。
    // 最多只保留一个完成记录 + 当前在途状态 + 一个 API 冷却快照，
    // 无历史列表；渲染只读这些字段，不触发任何 fetch/存储。
    diag: {
      inflight: null,   // {source, startedAt}
      last: null,       // 最近一次已完成请求的记录
      apiNext: null     // {atMs, reason}（请求路径上缓存的快照）
    }
  };

  // L3：GitHub Contents API 备用源的冷却/限流状态（无 token 匿名访问）。
  var API_COOLDOWN_MIN_MS = 120000;   // 每次尝试（含失败）至少冷却 120s
  var API_BACKOFF_MAX_MS = 600000;    // 无有效限流头时的有限退避上限
  var LS_KEY_PREFIX = "rwc-api-cooldown:";
  var api = {
    attempts: 0,
    memoryNextAllowedMs: 0,
    backoffMs: 0,
    storageOk: null,       // null=未探测，true/false
    storageNote: "",
    locksOk: null          // Web Locks 是否可用（跨标签原子预约）
  };

  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }

  function fmtNum(v) {
    if (v === null || v === undefined) return null;
    return Number(v).toLocaleString("zh-CN");
  }
  function fmtLocal(ms) {
    return new Date(ms).toLocaleString("zh-CN", { hour12: false });
  }
  function fmtAge(ms) {
    if (ms === null || ms === undefined) return "—";
    if (ms < 0) return "刚刚（可能存在时钟偏差）";
    var s = Math.floor(ms / 1000);
    if (s < 60) return s + " 秒前";
    var m = Math.floor(s / 60);
    if (m < 60) return m + " 分 " + (s % 60) + " 秒前";
    var h = Math.floor(m / 60);
    if (h < 24) return h + " 小时 " + (m % 60) + " 分前";
    return Math.floor(h / 24) + " 天前";
  }

  // ------------------------------------------------------ 数据接收（R08）

  // ctx（请求截止上下文）由 fetchOnce 传入；缺失时为离线 demo 的无请求
  // 上下文调用（startDemo 路径），不设截止门。ctx.alive() 反映“请求仍拥有
  // 状态且单调时钟未到截止”。返回 {dead:true} 表示异步判定落在截止之后，
  // 调用方不得再提交任何状态。
  async function processEnvelope(env, source, ctx) {
    var now = Date.now();
    source = source === "api" ? "api" : "raw";
    function alive() { return !ctx || ctx.alive(); }
    // 1) 全部结构/数值/时间校验
    var errors = V.validateEnvelope(env, now);
    var hash = null;
    if (errors.length === 0) {
      // 2) hash 复核（全部通过后才允许动守卫）
      hash = await C.sampleHash(env.sample);
      // 截止门：异步 digest 可能在请求已超时/失去所有权后才返回；此后
      // 无论结果正确与否都不得提交任何状态。
      if (!alive()) return { dead: true };
      if (hash !== env.sample_hash) {
        errors.push({ code: E.SAMPLE_HASH_MISMATCH, detail: "" });
      }
    }
    var guardResult = null;
    if (errors.length === 0) {
      // 3) examine 只检查不提交
      guardResult = state.guard.examine(env.sample, hash, now);
      if (guardResult.errors.length) {
        errors = errors.concat(guardResult.errors);
      }
    }
    // 固定“判定所需身份”：重复判定用本请求已固定的 prevHash，不从此后
    // 可变的全局 state 猜测；sampledMs 在提交前固定。
    // R3：存在校验错误时（如 sample 缺失或为 null）绝不能访问未经校验的
    // env.sample 字段，否则 TypeError 会被外层误分流为 network/网络故障。
    // sampledMs 仅在无校验错误（sample 结构已由 validateEnvelope 确认）时解析。
    var sampledMs = errors.length
      ? null
      : V.parseIsoZ(env.sample.sampled_at);
    var fixedPrevHash = ctx
      ? ctx.prevHash
      : (state.lastGood ? state.lastGood.hash : null);
    var decision = errors.length
      ? { kind: "rejected", errors: errors, env: env }
      : { kind: (hash !== null && hash === fixedPrevHash)
            ? "duplicate" : "accepted",
          guardResult: guardResult, hash: hash,
          sampledMs: sampledMs, env: env };
    // 状态写入（接受与拒绝共用同一入口，内部无 await/锁/异步断点）。
    function applyDecision() {
      if (decision.kind === "rejected") {
        // 坏数据：不 apply 守卫、不接受数据、不重置年龄；撤销“数据正常”
        state.errors = decision.errors;
        state.mode = "error";
        state.notice = null;
      } else {
        // 4) 全部通过，提交序列状态
        state.guard.apply(decision.guardResult);
        var nowWall = Date.now();
        var nowMono = performance.now();
        // R07：年龄按 hash 取高水位；重复发布同一样本不续期
        state.ageTracker.accept(decision.hash, decision.sampledMs,
          nowWall, nowMono);
        state.lastGood = {
          env: env,
          fetchedMs: nowWall,
          sampledMs: decision.sampledMs,
          publishedMs: V.parseIsoZ(env.published_at),
          hash: decision.hash,
          source: source
        };
        state.errors = [];
        state.mode = "ok";
        // 只有“已接受过旧实例且新实例不同”才提示实例变化；首次观察不提示
        // 重启（页面可能在采集器运行很久之后才打开，首个序号未必是 1），
        // 也不声称序号从 1 开始——当前序号以样本实际字段为准。
        state.notice = decision.guardResult.restarted
          ? "检测到采集器实例变化（新实例 " +
            env.sample.collector_instance_id + "，当前采样序号 " +
            env.sample.sample_seq + "）"
          : null;
      }
    }
    if (ctx) {
      // 网络请求：最终截止门 + 状态写入 + 终结认领在同一个无 await 的同步
      // 段内完成（ctx.commit）。最终截止门在写入前，只读一次时钟；写入后
      // 不再重判，已在 7999ms 完成的接受不会因外层续体被推到 8000ms 而
      // 改判超时。
      return ctx.commit(decision, applyDecision);
    }
    // 离线 demo（无 ctx）：调用同一份状态提交逻辑，无 deadline/诊断/记账。
    applyDecision();
    return { committed: true, outcome: decision.kind };
  }

  // ------------------------------------------------------ 拉取

  // L2：每轮缓存区分。cache:no-store 只表达浏览器意图，不能保证 GitHub
  // Pages/CDN 或中间层的端到端新鲜度（实测 raw max-age=300 会让页面长期
  // 读到旧 publication）。因此每次轮询都在 URL 上附加“轮询时间片”参数：
  // 片长等于轮询周期（默认 15s），使同一轮询周期的 URL 与相邻周期不同，
  // 以尽力避免命中中间缓存；这只是尽力而为，不能保证穿透所有缓存层（API
  // 响应同样有 max-age）。参数值不参与任何数据判定，绝不用于给旧样本续命。
  // 正确处理已有 query（用 & 追加）与 fragment（保持在末尾）；key/value
  // 经 URLSearchParams 编码（URL 安全）。
  function buildPollUrl(rawUrl, nowMs) {
    var base = window.location && window.location.href
      ? window.location.href : "http://localhost/";
    var u = new URL(rawUrl, base);
    var slice = Math.floor(nowMs / cfg.refreshIntervalMs);
    u.searchParams.set("_rwc_poll", String(slice));
    return u.toString();
  }

  // L3：GitHub Contents API 备用 URL。强制 ref=telemetry，追加时间片
  // 尽力避免缓存；返回的是“要请求的完整 URL”，不携带任何 token，也不会
  // 去再请求响应中的 download_url。
  function buildApiUrl(apiUrl, nowMs) {
    var base = window.location && window.location.href
      ? window.location.href : "http://localhost/";
    var u = new URL(apiUrl, base);
    u.searchParams.set("ref", "telemetry");
    u.searchParams.set("_rwc_poll",
      String(Math.floor(nowMs / cfg.refreshIntervalMs)));
    return u.toString();
  }

  // 暴露给测试/调试：记录每轮实际请求 URL（测试可连续捕获）
  window.RWCBuildPollUrl = buildPollUrl;
  window.RWCBuildApiUrl = buildApiUrl;
  window.__RWC_REQUEST_URLS__ = [];
  window.__RWC_REQUESTS__ = [];
  window.__RWC_API_STATE__ = api;

  // -------------------------------------------- L3 冷却/限流（跨标签）
  function apiStorageKey() {
    var host = "unknown";
    try {
      host = new URL(cfg.contentsApiUrl,
        window.location.href || "http://localhost/").host;
    } catch (e) { host = "unknown"; }
    return LS_KEY_PREFIX + host;
  }

  function detectStorage() {
    if (api.storageOk !== null) return api.storageOk;
    try {
      var ls = window.localStorage;
      var probe = "__rwc_ls_probe__";
      ls.setItem(probe, "1");
      ls.removeItem(probe);
      api.storageOk = true;
    } catch (e) {
      api.storageOk = false;
    }
    return api.storageOk;
  }

  // Web Locks（navigator.locks）可用性：跨标签的“检查冷却 + 预约”必须靠
  // 同源独占锁才能原子；没有它就只能尽力而为。
  function detectLocks() {
    if (api.locksOk !== null) return api.locksOk;
    try {
      api.locksOk = !!(window.navigator && window.navigator.locks &&
        typeof window.navigator.locks.request === "function");
    } catch (e) {
      api.locksOk = false;
    }
    return api.locksOk;
  }

  // 汇总跨标签保障的真实能力，不可用时诚实说明退化，不默默声称安全。
  function apiFeatureNote() {
    var storageOk = detectStorage();
    var locksOk = detectLocks();
    if (storageOk && locksOk) {
      api.storageNote = "";
    } else if (storageOk && !locksOk) {
      api.storageNote = "GitHub Contents API 备用源的冷却可经 localStorage "
        + "共享，但当前环境没有 Web Locks，无法保证多标签并发启动时“检查+"
        + "预约”原子：多个标签同时发起可能各打一次 API，冷却共享为尽力而"
        + "为；单标签冷却仍严格生效。";
    } else {
      api.storageNote = "GitHub Contents API 备用源的限流冷却无法经 "
        + "localStorage 跨标签共享（当前环境"
        + (locksOk ? "无存储" : "无存储且无 Web Locks")
        + "），仅在本标签生效；多标签/多设备共享 IP 时不保证零限流。";
    }
    return api.storageNote;
  }

  function apiLockKey() {
    return apiStorageKey() + ":lock";
  }

  // 锁在运行期被证明不可用（request 抛错或拒绝）：立即标记降级并刷新
  // 能力提示，后续全部走本标签内存冷却，不产生未处理拒绝。
  function invalidateLocks() {
    api.locksOk = false;
    apiFeatureNote();
  }

  // 存储在探测通过后又读写异常（配额/隐私模式变化）：同样诚实降级。
  function invalidateStorage() {
    api.storageOk = false;
    apiFeatureNote();
  }

  // 在同源独占 Web Lock 内执行临界区（跨标签互斥）。锁请求本身拒绝或
  // 抛错时，标记降级并无锁直接执行临界区，保证已收到的限流头/冷却不被
  // 锁错误吞掉，也不产生未处理 Promise 拒绝。
  function withApiLock(fn) {
    if (!detectLocks()) {
      return Promise.resolve(fn());
    }
    var p;
    try {
      p = window.navigator.locks.request(apiLockKey(), function () {
        return fn();
      });
    } catch (e) {
      invalidateLocks();
      return Promise.resolve(fn());
    }
    if (!p || typeof p.then !== "function") {
      invalidateLocks();
      return Promise.resolve(fn());
    }
    return Promise.resolve(p).catch(function () {
      invalidateLocks();
      return fn();
    });
  }

  function apiCooldownRead(now) {
    var next = api.memoryNextAllowedMs;
    if (detectStorage()) {
      try {
        var raw = window.localStorage.getItem(apiStorageKey());
        if (raw) {
          var v = JSON.parse(raw);
          if (v && typeof v.nextAllowedMs === "number"
              && isFinite(v.nextAllowedMs)) {
            next = Math.max(next, v.nextAllowedMs);
            api.memoryNextAllowedMs = Math.max(api.memoryNextAllowedMs,
              v.nextAllowedMs);
          }
        }
      } catch (e) {
        // 探测后读异常：存储不再可靠，诚实降级，只按本标签内存冷却
        invalidateStorage();
      }
    }
    return next;
  }

  // 仅在锁内调用：取“当前值与新值的更晚者”，绝不覆盖其它标签已写入的
  // 更晚期限；任何成功/错误都不能缩短已预约的冷却。
  function apiCooldownCommit(now, nextMs) {
    var current = apiCooldownRead(now);
    nextMs = Math.max(nextMs, current);
    if (nextMs < now + API_COOLDOWN_MIN_MS) {
      nextMs = now + API_COOLDOWN_MIN_MS;   // 任何尝试至少冷却 120s
    }
    api.memoryNextAllowedMs = Math.max(api.memoryNextAllowedMs, nextMs);
    if (detectStorage()) {
      try {
        window.localStorage.setItem(apiStorageKey(), JSON.stringify({
          nextAllowedMs: api.memoryNextAllowedMs,
          updatedAt: now
        }));
      } catch (e) {
        // 探测后写异常（配额/隐私模式）：标记降级，内存冷却仍严格有效
        invalidateStorage();
      }
    }
    return api.memoryNextAllowedMs;
  }

  function finiteNonNegMs(v) {
    return typeof v === "number" && isFinite(v) && v >= 0;
  }

  // 解析 x-ratelimit-reset / x-ratelimit-remaining / retry-after，
  // 返回两类候选（L4 R1：原因归属必须可由证据支持）：
  //  applied  —— 对当前状态适用、可参与本轮最终期限竞争的头 {ms,label}；
  //  observed —— 观察到但对当前分支不适用的头（如 200 正余额时的 Reset），
  //              仅可在面板“另观察到”中说明，不参与最终期限决定。
  // 已过期或短于最终期限的头由 noteApiAttemptLocked 进一步区分，绝不标成
  // 最终采用原因。receiptMs 为响应实际收到时刻（相对 Retry-After 从此时
  // 起算），status 为 HTTP 状态。期限数值计算与冻结版逐路径一致。
  function apiRateLimit(headers, receiptMs, status) {
    var applied = [];
    var observed = [];
    function h(name) {
      try {
        return headers && headers.get ? headers.get(name) : null;
      } catch (e) { return null; }
    }
    // Retry-After（秒数或 HTTP-date）：相对秒数从响应收到时刻计算
    var retry = h("retry-after");
    if (retry !== null && retry !== undefined && String(retry).trim() !== "") {
      var r = String(retry).trim();
      if (/^\d+$/.test(r)) {
        var relMs = receiptMs + Number(r) * 1000;
        if (finiteNonNegMs(relMs)) {
          applied.push({ ms: relMs, label: "Retry-After（相对秒数）" });
        }
      } else {
        var t = Date.parse(r);
        if (!isFinite(t) || isNaN(t)) {
          // 非法日期：不进任何列表
        } else {
          applied.push({ ms: t, label: "Retry-After（HTTP 日期）" });
        }
      }
    }
    var reset = h("x-ratelimit-reset");
    // L4 R2：remaining 必须区分“已证实正余额”与“未证实”。头部读取本身
    // 抛错、缺失、空值、非法内容都不能证明正余额，只能统一说明“未证实
    // remaining=0”，绝不能把未知说成有余量。仅诊断措辞，适用性与数值
    // 逻辑不变（仍只有确切的 remaining=0 才采用 Reset）。
    var remaining = null;
    var remainingReadError = false;
    try {
      remaining = headers && headers.get
        ? headers.get("x-ratelimit-remaining")
        : null;
    } catch (e) {
      remaining = null;
      remainingReadError = true;
    }
    var remainingIsNonNegInt = remaining !== null && remaining !== undefined
      && /^\s*\d+\s*$/.test(String(remaining));
    var remainingNum = remainingIsNonNegInt ? Number(remaining) : null;
    var resetMs = 0;
    if (reset && /^\s*\d+\s*$/.test(String(reset))) {
      var parsed = Number(reset) * 1000 + 1000;
      if (finiteNonNegMs(parsed)) resetMs = parsed;
    }
    // 403/429：使用所有有效 Reset（即使 remaining 是正数）；
    // 200：只有 remaining=0 才等到 Reset，避免每次成功都等到整小时；
    // 其余状态下的 Reset 对本分支不适用，仅可“观察到”。
    if (resetMs) {
      if (status === 403 || status === 429) {
        applied.push({ ms: resetMs, label: "x-ratelimit-reset（403/429）" });
      } else if (status === 200) {
        if (remainingIsNonNegInt && remainingNum === 0) {
          applied.push({ ms: resetMs, label: "x-ratelimit-reset（remaining=0）" });
        } else if (remainingIsNonNegInt && remainingNum > 0) {
          // 已证实正余额（确切读到了非负整数且 > 0）
          observed.push("x-ratelimit-reset（200 且 x-ratelimit-remaining="
            + remainingNum + " 为正余额，本分支不适用）");
        } else {
          // 缺失/非法/读取抛错：只说明证据不足，不猜正余额
          var why = remainingReadError
            ? "remaining 头读取失败"
            : (remaining === null || remaining === undefined
                ? "未提供 remaining"
                : "remaining 值非法");
          observed.push("x-ratelimit-reset（200 但" + why
            + "，未证实 remaining=0，本分支不采用此 Reset）");
        }
      } else {
        observed.push("x-ratelimit-reset（HTTP " + status + " 本分支不适用）");
      }
    }
    return { applied: applied, observed: observed };
  }

  // 无有效限流头的有限指数退避（120s→240s→480s…上限 600s）。
  // 从响应收到时刻起算（请求在途耗时不白送）。
  function apiBackoffTarget(receiptMs) {
    api.backoffMs = api.backoffMs === 0
      ? API_COOLDOWN_MIN_MS
      : Math.min(api.backoffMs * 2, API_BACKOFF_MAX_MS);
    return receiptMs + api.backoffMs;
  }

  // 锁内计算一次尝试（成功/失败）后的最终冷却时刻并原子提交。
  // startedAt 为请求开始时刻（120s 基础预约从那时起算）；receiptMs 为
  // 响应收到时刻（相对 Retry-After 与无头退避从此时起算）；最终取更晚
  // 期限，成功/错误都不缩短。
  //
  // L4 R1：返回的 reason 只描述“由证据支持的最终期限原因”。先按冻结逻辑
  // 算出本轮局部目标 localTarget，再由 apiCooldownCommit 合并内存/共享期限：
  //  - 若最终期限被提交时已存在的更晚期限抬高，无法证明写入方（同毫秒、
  //    时钟变化、旧值合并都可能），原因只能标“共享或既有期限，未知”；
  //  - 已过期、短于最终期限或不适用于当前分支的头，只能列入“另观察到”，
  //    不得标为最终采用原因。
  function noteApiAttemptLocked(startedAt, receiptMs, kind, resp) {
    api.attempts += 1;
    var baseReservation = startedAt + API_COOLDOWN_MIN_MS;
    var receiptFloor = receiptMs + API_COOLDOWN_MIN_MS;
    var headers = resp && resp.headers;
    var status = resp && resp.status;
    var limit = headers
      ? apiRateLimit(headers, receiptMs, status)
      : { applied: [], observed: [] };
    var errorKind = kind === "rate-limited" || kind === "5xx"
        || kind === "network" || kind === "timeout";
    var localTarget;
    var comps = [];    // 本轮真正参与最终期限竞争的成分 {ms,label}
    var observed = limit.observed.slice();
    if (errorKind) {
      var eff = limit.applied.filter(function (c) { return c.ms > receiptMs; });
      if (eff.length) {
        api.backoffMs = 0;
        var headMs = Math.max.apply(null, eff.map(function (c) { return c.ms; }));
        localTarget = Math.max(baseReservation, headMs);
        comps.push({ ms: baseReservation, label: "基础 120 秒冷却（自请求开始）" });
        eff.forEach(function (c) { comps.push({ ms: c.ms, label: c.label }); });
      } else {
        // 没有晚于收到时刻的有效头：有限退避，且不短于基础预约
        var backoffTarget = apiBackoffTarget(receiptMs);
        localTarget = Math.max(baseReservation, backoffTarget);
        comps.push({ ms: baseReservation, label: "基础 120 秒冷却（自请求开始）" });
        comps.push({ ms: backoffTarget,
          label: "无有效限流头，有限指数退避（下一次不早于 "
            + Math.round((backoffTarget - receiptMs) / 1000) + " 秒）" });
      }
    } else {
      // ok / bad-data / 404：不短于基础预约。限流是响应约束，不能随
      // JSON/schema/hash/序号验证失败丢失：200 且 remaining=0（含坏 JSON、
      // 校验失败等 body 失败路径）同样等到 reset；普通 200 正余额、或 404
      // 时不采用限流头，不会因此等到整小时。
      api.backoffMs = 0;
      var take = (kind === "ok" || kind === "bad-data")
        ? limit.applied.filter(function (c) { return c.ms > receiptMs; })
        : [];
      var headMs2 = take.length
        ? Math.max.apply(null, take.map(function (c) { return c.ms; }))
        : 0;
      localTarget = Math.max(baseReservation, headMs2, receiptFloor);
      comps.push({ ms: receiptFloor, label: "基础 120 秒冷却（自响应收到）" });
      if (baseReservation > receiptFloor) {
        comps.push({ ms: baseReservation, label: "基础 120 秒冷却（自请求开始）" });
      }
      take.forEach(function (c) { comps.push({ ms: c.ms, label: c.label }); });
    }
    // 适用但未决定最终期限的头：已过期或早于本轮目标，只能“另观察到”。
    limit.applied.forEach(function (c) {
      if (c.ms <= receiptMs) {
        observed.push(c.label + "（已过期，未采用）");
      } else if (c.ms < localTarget) {
        observed.push(c.label + "（早于最终期限，未作为采用原因）");
      }
    });
    var finalMs = apiCooldownCommit(receiptMs, localTarget);
    var finalReason;
    if (finalMs > localTarget && finalMs > receiptFloor) {
      // 合并到了提交时已存在的更晚期限（内存或共享存储）。不从 updatedAt
      // 等时间戳猜测写入方——同毫秒、时钟变化、旧值合并都无法证明来源。
      finalReason = "最终期限来自共享或既有冷却记录（提交时合并到更晚值，"
        + "来源与原因未知）；本轮响应/退避决定的期限更短";
    } else if (finalMs > localTarget) {
      // 仅被“响应收到 + 120s”底线抬高：本轮响应头不是最终原因。
      finalReason = "基础 120 秒冷却（自响应收到；本轮响应头未更晚，"
        + "未作为最终原因）";
    } else {
      var winnerLabels = comps
        .filter(function (c) { return c.ms === localTarget; })
        .map(function (c) { return c.label; })
        .filter(function (w, i, arr) { return arr.indexOf(w) === i; });
      finalReason = winnerLabels.join("、") || "基础 120 秒冷却";
    }
    if (observed.length) {
      finalReason += "；另观察到：" + observed.join("、");
    }
    return { nextMs: finalMs, reason: finalReason };
  }

  function noteApiAttempt(startedAt, receiptMs, kind, resp) {
    return withApiLock(function () {
      return noteApiAttemptLocked(startedAt, receiptMs, kind, resp);
    });
  }

  // 请求开始前在同源锁内原子预约：检查冷却 + 写入至少 120s 的基础冷却。
  // 返回 true 表示本轮可以发 API；false 表示冷却未到（含并发中被其它
  // 标签抢先预约），本轮应回退为 raw。
  function reserveApiAttempt(now) {
    function check() {
      // L4 R1：读取与提交都是本路径本来就会执行的调用；诊断只顺带记录
      // 其返回值，不新增任何存储/锁调用。
      var next = apiCooldownRead(now);
      if (now < next) {
        diagSetApiNextFromEvidence(next,
          "预约检查未通过（冷却未到期；可能被其他标签抢先预约，原因未知）");
        return false;
      }
      var baseTarget = now + API_COOLDOWN_MIN_MS;
      var committed = apiCooldownCommit(now, baseTarget);
      // L4 R2：措辞必须有证据支持。同一路径在无 Web Locks/锁拒绝降级时
      // 也会执行，不能一概称“原子”；且 commit 可能合并到 check 读取之后
      // 由其他标签写入的更长期限（无锁时窗口确实存在），此时不能把最终
      // 期限归为基础 120 秒，只能说明共享或既有期限、来源原因未知。
      if (committed > baseTarget) {
        diagSetApiNextFromEvidence(committed,
          "请求开始前已尝试预约冷却，但提交时合并到共享或既有更晚期限"
          + "（来源与原因未知；无 Web Locks 时该窗口确实存在）");
      } else if (api.locksOk === true) {
        diagSetApiNextFromEvidence(committed,
          "已在同源 Web Lock 持有期间于请求开始前预约基础 120 秒冷却");
      } else {
        diagSetApiNextFromEvidence(committed,
          "已在请求开始前于本标签预约基础 120 秒冷却（当前无可用 Web "
          + "Locks，跨标签“检查+预约”不保证原子，以能力提示为准）");
      }
      return true;
    }
    // withApiLock 自身会在锁拒绝/抛错时标记降级并无锁执行 check
    if (detectLocks()) return withApiLock(check);
    apiFeatureNote();
    return Promise.resolve(check());
  }

  function currentSampleAgeMs(now) {
    if (!state.lastGood) return null;
    return state.ageTracker.ageMs(now, performance.now());
  }

  // L3：本轮是否用 API 替代 raw。条件：显式配置 + （尚无有效样本 或
  // 采样年龄≥120s）+ 冷却到期；否则继续 raw。每轮仍只发一个请求。
  function chooseSource(now) {
    if (!cfg.contentsApiUrl) return "raw";
    var age = currentSampleAgeMs(now);
    var eligible = state.lastGood === null ||
      (age !== null && age >= cfg.apiFallbackAgeMs);
    if (!eligible) {
      // L4 R1：样本仍新鲜时冻结逻辑本来就不读取冷却记录；诊断不得为此
      // 新增任何存储探测/读取，期限与原因如实标“本轮未检查、未知”。
      diagSetApiNextNotChecked("本轮未检查备用源冷却（样本仍新鲜，按规则"
        + "走 raw；期限未知，未做额外探测）");
      return "raw";
    }
    var next = apiCooldownRead(now);   // 自然路径上本来就会执行的读取
    if (now < next) {
      diagSetApiNextFromEvidence(next,
        "冷却未到期（现有冷却记录，具体来源/原因未知）");
      return "raw";
    }
    diagSetApiNextFromEvidence(0,
      "冷却已到期，本轮尝试备用源（后续预约结果为准）");
    return "api";
  }
  window.RWCChooseSource = chooseSource;

  // ============================ L4 更新诊断记录 ============================
  // 只在真实请求/冷却路径记录实际观察值；不改变轮询、备用选择、限流、
  // 预约锁、超时、序号/哈希校验、年龄计算与任何状态。字段只做无状态
  // 格式检查，缺失/非法一律“不可用”，绝不沿用上一次摘要。
  function diagSafeInt(v) {
    if (typeof v === "number" && isFinite(v) && Number.isInteger(v)
        && v >= 0 && v <= 9007199254740991) return v;
    return null;
  }
  function diagSafeIso(v) {
    if (typeof v !== "string") return null;
    var n = V.parseIsoZ(v);
    if (typeof n === "number" && isFinite(n)) return v;
    return null;
  }
  function diagChannelName(s) {
    if (s === "api") return "GitHub Contents API 备用源";
    if (s === "raw") return "raw 轮询";
    return "不可用";
  }
  function diagStart(source) {
    state.diag.inflight = {
      source: source === "api" ? "api" : "raw",
      startedAt: Date.now()
    };
  }
  function diagClear() {
    state.diag.inflight = null;
  }
  // L4 R1：API 冷却快照只允许记录“自然路径上已经发生”的读取/预约/提交
  // 返回值。observed=true 表示该期限来自本轮真实发生的控制路径调用；
  // observed=false 表示本轮冻结逻辑根本不会检查冷却，面板只能说未知。
  // 这些函数本身绝不触碰 localStorage / navigator.locks。
  function diagSetApiNextFromEvidence(atMs, reason) {
    state.diag.apiNext = {
      observed: true,
      atMs: typeof atMs === "number" && isFinite(atMs) ? atMs : 0,
      reason: reason || "冷却安排（原因未知）"
    };
  }
  function diagSetApiNextNotChecked(reason) {
    state.diag.apiNext = { observed: false, atMs: 0, reason: reason };
  }
  // rec.env 只在正文成功解析为 JSON 对象时传入：坏 JSON 时不传入任何
  // 正文内容，因此敏感串、非法字段不可能进入摘要。
  function diagFinish(rec) {
    var out = {
      source: rec.source === "api" || rec.source === "raw" ? rec.source : null,
      finishedAt: typeof rec.finishedAt === "number" && isFinite(rec.finishedAt)
        ? rec.finishedAt : null,
      httpStatus: diagSafeInt(rec.httpStatus),
      outcome: ["accepted", "duplicate", "rejected", "timeout",
        "network"].indexOf(rec.outcome) >= 0 ? rec.outcome : null,
      reason: typeof rec.reason === "string" ? rec.reason : "",
      declaredSampledAt: null,
      declaredPublishedAt: null,
      declaredSampleSeq: null,
      declaredPublicationSeq: null,
      bodyAvailable: false
    };
    var env = rec.env;
    if (env && typeof env === "object") {
      out.bodyAvailable = true;
      var s = env.sample && typeof env.sample === "object" ? env.sample : null;
      if (s) {
        out.declaredSampledAt = diagSafeIso(s.sampled_at);
        out.declaredSampleSeq = diagSafeInt(s.sample_seq);
      }
      out.declaredPublishedAt = diagSafeIso(env.published_at);
      out.declaredPublicationSeq = diagSafeInt(env.publication_seq);
    }
    // 终结记录的固定观察字段（无则 null）：记账类型、完成单调时刻、
    // 响应头收到墙钟时刻（仅观察事实，不参与冷却计算）。
    out.accountingKind = typeof rec.accountingKind === "string"
      ? rec.accountingKind : null;
    out.finishedAtMono = typeof rec.finishedAtMono === "number"
      && isFinite(rec.finishedAtMono) ? rec.finishedAtMono : null;
    out.headersReceivedAt = typeof rec.headersReceivedAt === "number"
      && isFinite(rec.headersReceivedAt) ? rec.headersReceivedAt : null;
    state.diag.last = out;
    return out;
  }
  // 被拒响应的白名单原因：直接取自校验错误码的中文映射（固定集合），
  // 不输出异常 detail。
  function diagRejectReason(codes) {
    var parts = [];
    (codes || []).forEach(function (code) {
      var t = V.ERROR_TEXT_ZH && V.ERROR_TEXT_ZH[code];
      if (parts.indexOf(t || code) === -1) parts.push(t || code);
    });
    return parts.join("；") || "未通过白名单校验";
  }

  async function fetchOnce() {
    if (state.inflight) return;            // 单请求在途
    state.inflight = true;
    var mySeq = ++state.requestSeq;
    var startedAt = Date.now();
    var source = chooseSource(startedAt);
    // L3c：发 API 请求前，先在同源 Web Lock 内原子“检查冷却 + 预约至少
    // 120s 基础冷却”。若并发中被其它标签抢先预约，本轮回退为 raw。
    if (source === "api") {
      var reserved = await reserveApiAttempt(startedAt);
      if (mySeq !== state.requestSeq) { state.inflight = false; return; }
      if (!reserved) {
        source = "raw";
        // L4 R1：预约失败的期限已由 reserveApiAttempt 内自然路径
        // （apiCooldownRead）记录；此处不再做任何额外存储读取。
      }
      // 预约成功的期限同样由 reserveApiAttempt 内的自然提交记录。
    }
    // source==="raw" 时不再有任何诊断专用存储读取：chooseSource 已在
    // 自然路径上记录（不合格时明确“未检查、未知”，冷却未到期时记录
    // 实际读到的期限）。
    // L4：在途记录（渠道此时已最终确定，不参与任何判定）
    diagStart(source);
    var requestUrl, acceptType;
    if (source === "api") {
      requestUrl = buildApiUrl(cfg.contentsApiUrl, startedAt);
      acceptType = "application/vnd.github.raw+json"; // 直接要文件内容
    } else {
      requestUrl = buildPollUrl(cfg.telemetryUrl, startedAt);
      acceptType = "application/json";
    }
    window.__RWC_REQUEST_URLS__.push(requestUrl);
    window.__RWC_REQUESTS__.push({ source: source, url: requestUrl });
    // 8 秒预算起点为“实际 fetch 发起”的单调时刻（不含此前 API 预约锁等待）。
    var fetchStartMono = performance.now();
    var deadlineMono = fetchStartMono + cfg.fetchTimeoutMs;
    var controller = new AbortController();
    var settled = false;      // 本轮只允许终结一次
    var timedOut = false;     // 已进入超时分支
    var respRef = null;       // 已收到的响应（超时/正文失败记账需要头部）
    // 仅作观察事实：响应头收到的墙钟时刻；不参与本轮冷却计算（冷却
    // floor 仍按原算法，以原 receiptMs/errReceiptMs 起算）。
    var headersReceivedAt = null;
    // 本请求固定的“上一已接受样本”身份，重复判定在提交前固定，不随后
    // 续可变的全局 state 变化。
    var prevHash = state.lastGood ? state.lastGood.hash : null;
    // 本请求是否仍拥有状态且未到截止（单调时钟只进不退；≥8000 即拒绝）。
    function reqAlive() {
      return mySeq === state.requestSeq && !timedOut && !settled
        && performance.now() < deadlineMono;
    }
    var reqCtx = { alive: reqAlive, commit: commit, prevHash: prevHash };

    // 身份归属：本请求是否仍是“当前请求”（有权写共享诊断/状态）。
    // 它与“本请求是否已终结”(settled) 是两个不同概念：已终结的请求仍可能
    // 拥有一个可完成的冷却持久化，但不得重终结或覆盖后来请求的诊断。
    function ownsNow() { return mySeq === state.requestSeq; }
    // 每个实际 API 请求只认领一次记账：超时、拒绝、接受、坏数据、网络异常
    // 任一终结分支都不会重复记账。记账为 fire-and-forget，不阻塞终结；
    // 完成后仅在仍拥有当前诊断时更新冷却期限显示。
    var accountingClaimed = false;
    var accountingPromise = null;
    function claimAccounting(kind, respArg, receiptMs) {
      if (source !== "api" || accountingClaimed) return accountingPromise;
      accountingClaimed = true;
      accountingPromise = noteApiAttempt(startedAt, receiptMs, kind, respArg)
        .then(function (note) {
          if (ownsNow()) diagSetApiNextFromEvidence(note.nextMs, note.reason);
          return note;
        })
        .catch(function () { /* 记账失败由 noteApiAttempt 内部降级处理 */ });
      return accountingPromise;
    }
    // 超时终结分支：全函数唯一可终结超时的地方。仅终结一次；保留旧数据、
    // 如实显示超时、释放本轮在途状态；不等待 digest 与冷却记账。
    function onTimeout() {
      if (settled) return;
      // 已在截止前完成接受/拒绝判定的请求，超时分支不得再改判或再记账
      settled = true;
      timedOut = true;
      try { controller.abort(); } catch (e) { /* 已中止则忽略 */ }
      var receipt = Date.now();
      state.errors = [{ code: E.FETCH_TIMEOUT, detail: "" }];
      state.mode = "error";   // 保留旧读数（不修改 lastGood）
      var reason = gotStatus === null
        ? "请求超时（未收到响应头）"
        : "已收到 HTTP " + gotStatus
          + " 响应头，但获取或校验超时（正文/校验未在预算内完成）";
      diagFinish({ source: source, finishedAt: finishTime(receipt),
        httpStatus: gotStatus, outcome: "timeout", reason: reason });
      claimAccounting("timeout", respRef, receipt);
      if (ownsNow()) { state.inflight = false; diagClear(); }
    }
    // 若已失去所有权、已终结或单调时钟到截止，完成一次超时终结并返回 true。
    function ensureTimeout() {
      if (settled) return true;
      if (timedOut || performance.now() >= deadlineMono) {
        onTimeout();
        return true;
      }
      return false;
    }
    var timer = setTimeout(onTimeout, cfg.fetchTimeoutMs);
    var gotStatus = null;   // L4：已收到响应头时的 HTTP 状态（用于正文超时）
    function failFetch(code, detail) {
      if (settled) return;   // 超时后迟到的错误不得覆盖状态
      state.errors = [{ code: code, detail: detail || "" }];
      state.mode = "error";   // 保留旧读数（不修改 lastGood），撤销有效结论
    }
    function diagFinishOnce(rec) {
      if (settled) return;   // 成功/拒绝/异常/超时只终结一次
      settled = true;
      diagFinish(rec);
    }
    function finishTime(ms) {
      return typeof ms === "number" && isFinite(ms) ? ms : Date.now();
    }
    // P1：真实完整接受/拒绝判定点的同步终结入口。整个函数无 await/锁/异步
    // 断点：最后一次身份与单调截止检查（只读一次时钟，最终截止门在写入前）
    // → 状态写入 → 认领 settled → 固定终结记录 → 写诊断 → 认领一次 API
    // 记账（记账持久化异步完成，不阻塞终结）。已完成于 7999ms 的接受即使
    // 外层续体被推到 8000ms 也不会再被改判：这里写入后 settled 已置位，
    // 计时器/迟到续体只能退出。
    function commit(decision, applySync) {
      if (settled || mySeq !== state.requestSeq) return { committed: false };
      if (performance.now() >= deadlineMono) {
        onTimeout();
        return { dead: true };
      }
      var finishWall = Date.now();
      var finishMono = performance.now();
      settled = true;   // 先认领终结，保证迟到续体不再提交
      try {
        applySync();
      } catch (e) {
        // 同步提交段异常按真实异常处理：不伪造成功、不静默吞掉；放开
        // settled 让外层 catch 做唯一一次真实异常终结（本段无 await，
        // 放开与抛出之间不存在竞争）。
        settled = false;
        throw e;
      }
      var outcome = decision.kind;
      var accountingKind = null;
      if (source === "api") {
        accountingKind = outcome === "rejected" ? "bad-data" : "ok";
        claimAccounting(accountingKind, respRef, receiptMs);
      }
      var rec;
      if (outcome === "rejected") {
        var codes = decision.errors.map(function (er) { return er.code; });
        rec = { source: source, finishedAt: finishTime(finishWall),
          httpStatus: gotStatus, outcome: "rejected",
          reason: diagRejectReason(codes), env: decision.env,
          accountingKind: accountingKind, finishedAtMono: finishMono,
          headersReceivedAt: headersReceivedAt };
      } else if (outcome === "duplicate") {
        rec = { source: source, finishedAt: finishTime(finishWall),
          httpStatus: gotStatus, outcome: "duplicate",
          reason: "与上次通过校验的内容相同，年龄不续期",
          env: decision.env, accountingKind: accountingKind,
          finishedAtMono: finishMono, headersReceivedAt: headersReceivedAt };
      } else {
        rec = { source: source, finishedAt: finishTime(finishWall),
          httpStatus: gotStatus, outcome: "accepted",
          reason: "新样本通过校验（是否新鲜以采样年龄为准）",
          env: decision.env, accountingKind: accountingKind,
          finishedAtMono: finishMono, headersReceivedAt: headersReceivedAt };
      }
      diagFinish(rec);
      return { committed: true, outcome: outcome,
        finishedAtWall: finishWall, finishedAtMono: finishMono };
    }
    try {
      var resp = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
        headers: { "Accept": acceptType },
        signal: controller.signal
      });
      if (mySeq !== state.requestSeq) return;  // 旧响应，丢弃
      if (ensureTimeout()) return;
      respRef = resp;
      var receiptMs = Date.now();
      headersReceivedAt = receiptMs;   // 仅观察事实，不参与冷却计算
      gotStatus = diagSafeInt(resp.status);
      if (source === "api") {
        // 403/429：遵从限流头/退避；5xx/304 等也计入尝试，绝不假设 304
        // 不占额度。拒绝判定在记账锁等待之前原子终结，记账只认一次、
        // 不阻塞终结；记账晚于 8000ms 返回也不得把本次拒绝改写成超时。
        if (resp.status === 403 || resp.status === 429) {
          if (ensureTimeout()) return;
          claimAccounting("rate-limited", resp, receiptMs);
          failFetch(E.HTTP_ERROR, "HTTP " + resp.status +
            "（Contents API 限流，已按 Reset/Retry-After 冷却）");
          diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
            httpStatus: resp.status, outcome: "rejected",
            reason: "HTTP " + resp.status
              + "（Contents API 限流，已按 Reset/Retry-After 冷却）" });
          return;
        }
        if (resp.status === 404) {
          if (ensureTimeout()) return;
          claimAccounting("404", resp, receiptMs);
          failFetch(E.HTTP_404);
          diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
            httpStatus: resp.status, outcome: "rejected",
            reason: "HTTP 404（备用源未找到公开文件）" });
          return;
        }
        if (!resp.ok || resp.status === 304) {
          if (ensureTimeout()) return;
          claimAccounting(resp.status >= 500 ? "5xx" : "network", resp,
            receiptMs);
          failFetch(E.HTTP_ERROR, "HTTP " + resp.status +
            (resp.status === 304 ? "（304 不视为免费成功）" : ""));
          diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
            httpStatus: resp.status, outcome: "rejected",
            reason: "HTTP " + resp.status
              + (resp.status === 304 ? "（304 不视为免费成功）" : "")
              + "（冷却/退避期限见诊断面板）" });
          return;
        }
      } else if (resp.status === 404) {
        failFetch(E.HTTP_404);
        diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
          httpStatus: resp.status, outcome: "rejected",
          reason: "HTTP 404（未找到公开文件）" });
        return;
      } else if (!resp.ok) {
        failFetch(E.HTTP_ERROR, "HTTP " + resp.status);
        diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
          httpStatus: resp.status, outcome: "rejected",
          reason: "HTTP " + resp.status });
        return;
      }
      var text = await resp.text();
      if (ensureTimeout()) return;
      receiptMs = Date.now();
      var env;
      try {
        env = JSON.parse(text);
      } catch (e) {
        // L4：坏 JSON 不传入任何正文，摘要只记录渠道/状态/结果，不含
        // body 片段（敏感串不会泄漏）。
        if (source === "api") {
          if (ensureTimeout()) return;
          claimAccounting("bad-data", resp, receiptMs);
        }
        failFetch(E.BAD_JSON);
        diagFinishOnce({ source: source, finishedAt: finishTime(receiptMs),
          httpStatus: gotStatus, outcome: "rejected",
          reason: "响应正文不是合法 JSON（未采用任何字段）" });
        return;
      }
      if (mySeq !== state.requestSeq) return;
      var procResult = await processEnvelope(env, source, reqCtx);
      // 提交与终结已在 processEnvelope 的同步段（ctx.commit）内认领：
      // 这里只能使用已认领的结果，不再 ensureTimeout、不再按 state.mode
      // 重新分类——最终截止门在提交前已读取过，提交后不再读时钟重判。
      if (mySeq !== state.requestSeq) return;
      if (procResult && procResult.dead) {
        // 已到截止（含定时器回调尚未执行的情况）：ensureTimeout 保证
        // 唯一超时终结一定发生；若 commit 已自行触发则其 settled 短路。
        ensureTimeout();
        return;
      }
      if (!procResult || !procResult.committed) {
        // 已终结/失去归属（如 digest 迟到恰好撞上超时）：交由唯一超时
        // 入口；未终结则什么也不做，直接返回（finally 按归属清理）。
        ensureTimeout();
        return;
      }
      // accepted/duplicate/rejected 已在同步段提交并落诊断；API 记账也
      // 已在 commit 内认领一次。这里直接返回，不重终结、不补记账。
    } catch (e) {
      // 所有异步续体写共享诊断/状态前都要验证归属权。
      if (!ownsNow()) return;
      if (settled || timedOut) return;   // 已终结：不得二次终结或覆盖
      // Abort（由我方超时 abort 触发）或单调时钟已到截止：统一走唯一超时
      // 终结分支（它保留已收到的头并只认领一次 timeout 记账）。
      if ((e && e.name === "AbortError")
          || performance.now() >= deadlineMono) {
        onTimeout();
        return;
      }
      var errReceiptMs = Date.now();
      if (source === "api") {
        // 网络错误记账与终结分离：只认一次、不等待、不覆盖后来请求诊断。
        // P3：传 respRef 而非 null——正文非 Abort 失败时已收到的响应头
        // （如 HTTP 200 + remaining=0 + 未来 Reset）必须保留给记账合并；
        // 未收到响应时 respRef 自然为 null。记账时刻仍用 errReceiptMs，
        // 不缩短原 120s floor；不改 noteApiAttempt/apiRateLimit 算法。
        claimAccounting("network", respRef, errReceiptMs);
      }
      failFetch(E.FETCH_NETWORK_ERROR);
      // L4 R1：固定白名单文案。若已收到响应头（如 HTTP 200 后
      // resp.text() 非 Abort 失败），必须如实保留“已收到响应”的事实；
      // 未收到响应头时才说未收到。异常 detail 一律不展示。
      diagFinishOnce({ source: source, finishedAt: finishTime(errReceiptMs),
        httpStatus: gotStatus, outcome: "network",
        headersReceivedAt: headersReceivedAt,
        reason: gotStatus === null
          ? "网络失败（未收到响应头；异常细节不展示）"
          : "已收到 HTTP " + gotStatus
            + " 响应头，但正文读取失败（异常细节不展示）" });
    } finally {
      clearTimeout(timer);
      // 只有仍是当前请求时才释放在途诊断；旧请求尾部不得清掉 B 的在途。
      if (ownsNow()) {
        state.inflight = false;
        diagClear();
      }
    }
  }

  // ------------------------------------------------------ 渲染

  function metricRow(name, value, naText) {
    var row = el("div", null, "metric-row");
    row.appendChild(el("span", name, "metric-name"));
    if (value === null) {
      row.appendChild(el("span", naText || "暂无数据", "metric-value na"));
    } else {
      row.appendChild(el("span", value, "metric-value"));
    }
    return row;
  }

  function renderGpu(gpu, dataValid, expired) {
    var card = el("div", null, "gpu-card");
    var head = el("h2", "GPU " + gpu.index);
    var nullCount = gpuNullMetricCount(gpu);
    var allKnown = nullCount === 0 && gpu.error === null;
    var stateText, cls;
    if (!dataValid) {
      // L3e：保留读数分两种——真实满 180 秒才称“已过期”；新鲜窗口内的
      // 保留读数只称“当前状态未确认”。
      stateText = expired
        ? "保留读数·已过期"
        : "保留读数·当前状态未确认";
      cls = "unknown";
    } else if (allKnown) {
      stateText = "正常";
      cls = "ok";
    } else if (nullCount === 5) {
      // 五个公开指标全部为 null（即使 gpu.error 恰为 null，这也是合法
      // schema 形状）：该卡没有任何有效读数；有效指标为零个。
      stateText = "无有效读数";
      cls = "unknown";
    } else if (gpu.error !== null || nullCount > 0) {
      // 只有部分指标缺失（例如仅 power_watts=null）：显存/温度等有效读数
      // 保留展示，卡片状态准确表述为“部分指标未知”。
      stateText = "部分指标未知";
      cls = "unknown";
    } else {
      stateText = "无有效读数";
      cls = "unknown";
    }
    head.appendChild(el("span", stateText, "gpu-state " + cls));
    card.appendChild(head);

    card.appendChild(metricRow("利用率",
      gpu.utilization_percent !== null ? gpu.utilization_percent + "%" : null));
    card.appendChild(metricRow("显存已用",
      gpu.memory_used_mib !== null ? fmtNum(gpu.memory_used_mib) + " MiB" : null));
    card.appendChild(metricRow("显存总量",
      gpu.memory_total_mib !== null ? fmtNum(gpu.memory_total_mib) + " MiB" : null));
    card.appendChild(metricRow("温度",
      gpu.temperature_c !== null ? gpu.temperature_c + " °C" : null));
    card.appendChild(metricRow("功耗",
      gpu.power_watts !== null ? gpu.power_watts + " W" : null));
    if (gpu.error) {
      card.appendChild(el("div",
        V.COLLECTOR_ERROR_TEXT_ZH[gpu.error] ||
          ("指标暂不可用（" + gpu.error + "）"), "metric-error"));
    }
    if (!dataValid) card.classList.add("stale-reading");
    return card;
  }

  // 样本级错误中与“任务信息未知”直接相关的枚举（其余错误同样不全绿，
  // 但语义不同，由通用分支处理）。
  var TASK_UNKNOWN_ERRORS = {
    COMPUTE_APPS_UNAVAILABLE: true,
    TASK_INFO_PARTIAL_UNKNOWN: true
  };

  function gpuMetricKeys() {
    return ["utilization_percent", "memory_used_mib", "memory_total_mib",
      "temperature_c", "power_watts"];
  }

  // K1：统计该卡缺失的指标数；5 项全缺 = 无有效读数，缺一部分 = 部分指标
  // 未知（其余有效指标必须保留展示，不能统称为“无有效读数”）。
  function gpuNullMetricCount(gpu) {
    return gpuMetricKeys().filter(function (k) {
      return gpu[k] === null;
    }).length;
  }

  // 单卡“有任何未知”= 该卡带 error，或任一公开指标为 null。
  function gpuUnknown(gpu) {
    return gpu.error !== null || gpuNullMetricCount(gpu) > 0;
  }

  // K1：汇总样本级错误 + 每卡 error/null 指标。
  // 任何非 null 的 sample.error 都不允许总体绿色；返回具体问题描述数组，
  // 无未知返回空数组（才可显示“数据正常”）。
  function samplePartialUnknown(sample) {
    if (!sample) return [];
    var problems = [];
    if (sample.error) {
      problems.push(V.COLLECTOR_ERROR_TEXT_ZH[sample.error] ||
        ("采集器报告异常：" + sample.error));
    }
    (sample.gpus || []).forEach(function (gpu) {
      var nullCount = gpuNullMetricCount(gpu);
      if (gpu.error) {
        problems.push("GPU " + gpu.index + "：" +
          (V.COLLECTOR_ERROR_TEXT_ZH[gpu.error] || gpu.error));
      }
      if (!gpu.error && nullCount > 0 && nullCount < 5) {
        problems.push("GPU " + gpu.index + "：部分指标未知"
          + "（其余有效指标仍显示）");
      } else if (!gpu.error && nullCount === 5) {
        problems.push("GPU " + gpu.index + "：无有效读数");
      }
    });
    return problems;
  }

  function tasksHeaderNote(sample, gpu) {
    // R11/K1：区分“读不到任务”与“确实无任务”。
    // 只要样本带任何非 null 错误，任务列表就不能被当作“当前无任务”。
    if (gpu.error === "GPU_NOT_FOUND" || gpu.error === "NVIDIA_SMI_UNAVAILABLE") {
      return "该卡缺失或不可用，任务未知";
    }
    if (sample.error === "COMPUTE_APPS_UNAVAILABLE") {
      return "任务信息暂不可用，无法判断当前是否有计算任务";
    }
    if (sample.error === "TASK_INFO_PARTIAL_UNKNOWN") {
      return "任务信息可能不完整（部分进程无法读取）";
    }
    if (sample.error) {
      // COLLECTOR_INTERNAL_ERROR / NVIDIA_SMI_UNAVAILABLE 等任何其他
      // 合法枚举：任务情况未知，tasks=[] 不能解读为“无任务”。
      return "采集器报告异常（" + sample.error +
        "），任务情况未知，不能据此判断无任务";
    }
    return null;
  }

  function renderTasks(sample, dataValid, expired) {
    var box = document.getElementById("tasks-container");
    box.textContent = "";
    if (!sample) {
      box.appendChild(el("p", "尚未连接，无法显示任务列表。", "tasks-empty"));
      return;
    }
    if (!dataValid) {
      // L3e：新鲜窗口内“本次更新未采用、保留读数但状态未确认”；真实满
      // 180 秒才称“过期”。
      var noteText = expired
        ? "监控数据已过期（采样年龄满 180 秒），以下为保留读数，" +
          "不代表当前任务情况。"
        : "本次更新未采用，保留上次通过校验的读数；以下为保留读数" +
          "（当前状态未确认），不代表当前任务情况。";
      var note = el("p", noteText, "tasks-empty");
      box.appendChild(note);
    }
    if (sample.error === "TASK_INFO_PARTIAL_UNKNOWN") {
      box.appendChild(el("p", "注意：任务信息可能不完整，部分任务进程无法读取。",
        "metric-error"));
    }
    if (sample.error === "COMPUTE_APPS_UNAVAILABLE") {
      box.appendChild(el("p", "任务列表整体暂不可用（采集器未能读取计算应用），" +
        "不能据此判断“无任务”。", "metric-error"));
    } else if (sample.error && !TASK_UNKNOWN_ERRORS[sample.error]) {
      // K1：任何其他非 null sample.error 下，tasks=[] 也不能当“无任务”
      box.appendChild(el("p",
        "采集器报告异常（" + sample.error + "），任务情况未知，" +
        "不得据此判断“无任务”。", "metric-error"));
    }
    for (var gi = 0; gi < 2; gi++) {
      var gpu = sample.gpus[gi];
      var group = el("div", null, "task-gpu-group");
      if (!dataValid) group.classList.add("stale-reading");
      group.appendChild(el("div", "GPU " + gi + " 任务显存",
        "task-gpu-title"));
      var headerNote = tasksHeaderNote(sample, gpu);
      var tasks = sample.tasks.filter(function (t) {
        return t.gpu_index === gi;
      });
      if (headerNote) {
        group.appendChild(el("p", headerNote, "tasks-empty"));
      } else if (tasks.length === 0 && !dataValid) {
        // 旧读数：网络失败/过期时不能把旧空列表说成“当前”无任务
        group.appendChild(el("p", "上次采样无任务记录（旧读数，不代表当前）",
          "tasks-empty"));
      } else if (tasks.length === 0) {
        // 只有在任务信息明确可用、数据当前有效且确实为空时，才说“无任务”
        group.appendChild(el("p", "当前无计算任务", "tasks-empty"));
      }
      tasks.forEach(function (t) {
        var row = el("div", null, "task-bar-row");
        row.appendChild(el("span", t.alias, "task-alias"));
        var track = el("div", null, "task-bar-track");
        var fill = el("div", null, "task-bar-fill");
        var pct = gpu.memory_total_mib
          ? Math.min(100, Math.round(t.used_memory_mib /
              gpu.memory_total_mib * 100))
          : 0;
        fill.style.width = pct + "%";
        track.appendChild(fill);
        row.appendChild(track);
        row.appendChild(el("span",
          fmtNum(t.used_memory_mib) + " MiB · " + pct + "%",
          "task-bar-mem"));
        group.appendChild(row);
      });
      box.appendChild(group);
    }
  }

  function render() {
    var nowWall = Date.now();
    var nowMono = performance.now();
    var panel = document.getElementById("status-panel");
    var icon = document.getElementById("status-icon");
    var text = document.getElementById("status-text");
    var detail = document.getElementById("status-detail");
    panel.className = "status-panel";
    var g = state.lastGood;
    var ageMs = g
      ? state.ageTracker.ageMs(nowWall, nowMono)
      : null;
    // R10：只有 mode 为 ok 且年龄未过期才是“当前有效”
    var dataValid = state.mode === "ok" && g !== null &&
      ageMs !== null && ageMs < cfg.staleAfterMs;
    // L3e：只有采样年龄真实达到 180 秒才称“过期”；本次更新失败但保留
    // 读数仍在新鲜窗口内时，只能说“当前状态未确认”，不能称过期。
    var expired = g !== null && ageMs !== null &&
      ageMs >= cfg.staleAfterMs;

    var errorReasons = state.errors.map(function (e) {
      return V.ERROR_TEXT_ZH[e.code] || e.code;
    }).join("；");

    // 状态条
    if (state.mode === "error" && !g) {
      panel.classList.add("status-error");
      icon.textContent = "✕";
      text.textContent = "无法显示监控数据";
      detail.textContent = errorReasons;
    } else if (state.mode === "error" && g) {
      if (expired) {
        // L3e：本次更新未采用且保留读数已真实满 180 秒：称“过期”，
        // 同时保留具体原因；错误状态样式不变。
        panel.classList.add("status-error");
        icon.textContent = "⏱";
        text.textContent = "监控数据已过期（本次更新未采用）";
        detail.textContent = "最后采样于 " + fmtAge(ageMs) +
          "；过期不代表服务器离线，可能是采集/发布链路暂停。" +
          "最近一次更新未采用：" + errorReasons + "；保留上次通过" +
          "校验的读数。";
      } else {
        // L3e：本次更新失败/未采用，但保留的读数仍在 180 秒新鲜窗口内：
        // 保留读数、明确当前状态未确认，不冒充“数据正常”，也不提前称过期。
        panel.classList.add("status-error");
        icon.textContent = "△";
        text.textContent = "本次更新未采用，保留上次通过校验的读数";
        detail.textContent = errorReasons + "；采样于 " + fmtAge(ageMs) +
          "；保留读数在 180 秒新鲜窗口内，但当前状态未确认。";
      }
    } else if (!g) {
      panel.classList.add("status-disconnected");
      icon.textContent = "○";
      text.textContent = "尚未连接";
      detail.textContent = state.urlConfigured
        ? "尚未收到公开数据；无真实数据时不会用样例冒充。"
        : "未配置公开数据地址（telemetryUrl），且无真实数据，不显示样例。";
    } else if (!dataValid) {
      // mode=ok 但采样年龄真实满 180 秒（无新样本、重复发布不续命）
      panel.classList.add("status-stale");
      icon.textContent = "⏱";
      text.textContent = "监控数据已过期";
      detail.textContent = "最后采样于 " + fmtAge(ageMs) +
        "；过期不代表服务器离线，可能是采集/发布链路暂停。";
    } else if (samplePartialUnknown(g.env.sample).length > 0) {
      // H4：fresh 但样本级或任意一张卡存在 error/缺失指标，不允许全绿；
      // 逐卡汇总后准确描述，仍有效的单卡读数继续正常展示。
      panel.classList.add("status-partial");
      icon.textContent = "◐";
      var probList = samplePartialUnknown(g.env.sample);
      // K1：只有每张卡的五项指标全部缺失（无任何可读指标）才称“无有效读数”；
      // 仅部分指标缺失（如只有 power_watts=null）时，显存/温度等读数保留，
      // 状态条只说“部分数据未知”。
      var allGpuNoReading = g.env.sample.gpus.length > 0 &&
        g.env.sample.gpus.every(function (gpu) {
          return gpuNullMetricCount(gpu) === 5;
        });
      text.textContent = allGpuNoReading
        ? "两张 GPU 无有效读数（指标暂不可用）"
        : "部分数据未知（其余有效读数仍显示）";
      detail.textContent = probList.join("；") + "；采样于 " + fmtAge(ageMs) +
        (state.notice ? "；" + state.notice : "") +
        "；仅公开脱敏指标，不得据此判断“无任务”。";
    } else if (state.notice) {
      panel.classList.add("status-restart");
      icon.textContent = "↻";
      text.textContent = "数据正常（检测到采集器实例变化）";
      detail.textContent = state.notice;
    } else {
      panel.classList.add("status-ok");
      icon.textContent = "●";
      text.textContent = "数据正常";
      detail.textContent = "采样于 " + fmtAge(ageMs) +
        "（仅公开脱敏指标）";
    }
    // L3：localStorage 不可用时，诚实说明跨标签冷却只在本标签生效
    if (cfg.contentsApiUrl && api.storageNote) {
      detail.textContent += "；" + api.storageNote;
    }

    // GPU 卡片（R10：无效时统一旧读数样式）
    var grid = document.getElementById("gpu-grid");
    grid.textContent = "";
    if (g) {
      g.env.sample.gpus.forEach(function (gpu) {
        grid.appendChild(renderGpu(gpu, dataValid, expired));
      });
    } else {
      for (var i = 0; i < 2; i++) {
        var card = el("div", null, "gpu-card");
        card.appendChild(el("h2", "GPU " + i));
        card.appendChild(el("p", "尚未连接", "tasks-empty"));
        grid.appendChild(card);
      }
    }

    renderTasks(g ? g.env.sample : null, dataValid, expired);

    // 时刻
    var sampled = document.getElementById("meta-sampled");
    var sampledAge = document.getElementById("meta-sampled-age");
    var published = document.getElementById("meta-published");
    var publishedAge = document.getElementById("meta-published-age");
    var fetched = document.getElementById("meta-fetched");
    var fetchedSub = document.getElementById("meta-fetched-sub");
    if (g) {
      sampled.textContent = fmtLocal(g.sampledMs);
      sampledAge.textContent = "采样年龄：" + fmtAge(ageMs);
      published.textContent = fmtLocal(g.publishedMs);
      publishedAge.textContent = "发布于 " + fmtAge(nowWall - g.publishedMs);
      fetched.textContent = fmtLocal(g.fetchedMs);
      var srcText = g.source === "api"
        ? "GitHub Contents API 备用源"
        : "raw 轮询";
      fetchedSub.textContent = "最近一次通过校验的数据获取时间／来源：" +
        srcText +
        "（cache:no-store 不代表 CDN 秒级鲜度，以采样年龄为准）";
    } else {
      sampled.textContent = "—";
      sampledAge.textContent = "—";
      published.textContent = "—";
      publishedAge.textContent = "—";
      fetched.textContent = "—";
      fetchedSub.textContent = "—";
    }

    // 页脚实例
    var footerInst = document.getElementById("footer-instance");
    footerInst.textContent = g
      ? "采集实例：" + g.env.sample.collector_instance_id +
        " ｜ 采样序号：" + g.env.sample.sample_seq +
        " ｜ 发布序号：" + g.env.publication_seq
      : "";

    // L4：更新诊断面板（纯渲染，只读 state.diag，不调冷却/存储/fetch）
    renderDiag(nowWall);
  }

  // ------------------------------------------------------ L4 诊断面板

  // 纯渲染：只写 textContent，不触碰 <details> 的 open 状态，不调用任何
  // 冷却、存储、取数或校验函数。缺失/非法字段一律“不可用”。
  function renderDiag(nowWall) {
    var elInf = document.getElementById("diag-inflight");
    if (!elInf) return;  // 无面板节点的旧 DOM / 测试环境不渲染
    var d = state.diag;

    if (d.inflight) {
      var secs = Math.max(0, Math.round((nowWall - d.inflight.startedAt) / 1000));
      elInf.textContent = diagChannelName(d.inflight.source)
        + " 请求中（已约 " + secs + " 秒）";
    } else {
      elInf.textContent = "空闲";
    }

    var elFin = document.getElementById("diag-finished");
    var elCh = document.getElementById("diag-channel");
    var elHttp = document.getElementById("diag-http");
    var elOut = document.getElementById("diag-outcome");
    var elDec = document.getElementById("diag-declared");
    var elApi = document.getElementById("diag-api-next");
    var last = d.last;

    function unavailable(v) {
      return (v === null || v === undefined || v === "") ? "不可用" : v;
    }
    function intText(v) {
      return v === null ? "不可用" : String(v);
    }

    if (!last) {
      elFin.textContent = "—";
      elCh.textContent = "—";
      elHttp.textContent = "—";
      elOut.textContent = "—";
      elDec.textContent = "—";
    } else {
      elFin.textContent = unavailable(last.finishedAt === null
        ? null : fmtLocal(last.finishedAt));
      elCh.textContent = unavailable(diagChannelName(last.source));
      elHttp.textContent = last.httpStatus === null
        ? "未收到 HTTP 状态" : String(last.httpStatus);
      var outcomeText;
      switch (last.outcome) {
        case "accepted":
          outcomeText = "已接受（新样本；不代表仍新鲜）";
          break;
        case "duplicate":
          outcomeText = "重复（与上次通过校验的内容相同，未续期）";
          break;
        case "rejected":
          outcomeText = "未采用：" + (last.reason || "白名单校验未通过");
          break;
        case "timeout":
          outcomeText = "超时：" + (last.reason || "请求超时");
          break;
        case "network":
          outcomeText = "网络失败：" + (last.reason || "未取得响应");
          break;
        default:
          outcomeText = "不可用";
      }
      elOut.textContent = outcomeText;

      var prefix = last.outcome === "accepted" || last.outcome === "duplicate"
        ? "已采用读数（响应声明）："
        : "仅响应声明（未采用，不代表已采用读数）：";
      var lines = [
        "采样时刻 " + (last.declaredSampledAt || "不可用"),
        "候选发布时间 " + (last.declaredPublishedAt || "不可用"),
        "采样序号 " + intText(last.declaredSampleSeq),
        "发布序号 " + intText(last.declaredPublicationSeq)
      ];
      if (!last.bodyAvailable) {
        elDec.textContent = "响应正文未解析（无声明字段，不可用）";
      } else {
        elDec.textContent = prefix + lines.join(" ｜ ");
      }
    }

    if (!cfg.contentsApiUrl) {
      elApi.textContent = "未启用 Contents API 备用源（默认关闭）";
    } else if (d.apiNext && d.apiNext.observed
               && d.apiNext.atMs > nowWall) {
      // 仅展示自然路径（chooseSource/reserve/noteApiAttempt）实际读到或
      // 提交的期限；未被证据支持的期限一律不显示倒计时。
      var wait = Math.max(0, Math.round((d.apiNext.atMs - nowWall) / 1000));
      elApi.textContent = "最早可尝试约 " + fmtLocal(d.apiNext.atMs)
        + "（约 " + wait + " 秒后）；原因："
        + (d.apiNext.reason || "未知")
        + "。实际仍受采样年龄与并发预约条件限制。";
    } else if (d.apiNext && !d.apiNext.observed) {
      // 本轮冻结逻辑本就不会检查冷却（如样本仍新鲜）：如实说明，不补探测。
      elApi.textContent = d.apiNext.reason
        + "；实际仍受采样年龄与并发预约条件限制。";
    } else if (d.apiNext && d.apiNext.observed) {
      elApi.textContent = "当前无冷却限制（仍需满足采样年龄≥120 秒等条件）";
    } else {
      elApi.textContent = "尚未完成本轮检查（期限未知，未做额外探测）";
    }
  }

  // ------------------------------------------------------ 阶段面板/论文

  function renderStatic() {
    document.getElementById("stage-achievement").textContent =
      cfg.stage.achievement;
    var ul = document.getElementById("stage-next");
    ul.textContent = "";
    cfg.stage.nextSteps.forEach(function (s) {
      ul.appendChild(el("li", s));
    });
    document.getElementById("stage-delivery").textContent =
      cfg.stage.delivery;
    document.getElementById("stage-deploy").textContent =
      cfg.stage.deploy;
    document.getElementById("stage-validity").textContent =
      cfg.stage.validity;

    var btn = document.getElementById("paper-button");
    if (cfg.paperUrl && /^https?:\/\//.test(cfg.paperUrl)) {
      btn.href = cfg.paperUrl;
      btn.classList.remove("disabled");
      btn.textContent = "查看私有论文（需权限）";
    } else {
      btn.removeAttribute("href");
      btn.classList.add("disabled");
      btn.textContent = "稿件待交付";
    }
  }

  // ------------------------------------------------------ 演示模式

  function startDemo() {
    state.demo = true;
    document.getElementById("demo-banner").hidden = false;
    state.demoSource = new window.RWCDemo.DemoSource();
    document.querySelectorAll("#demo-controls button").forEach(function (b) {
      b.addEventListener("click", function () {
        var newState = b.getAttribute("data-demo-state");
        // 从非正常状态恢复时模拟采集器重启（新实例、新 seq）
        if (state.demoState !== "normal" && newState === "normal") {
          state.demoSource.restart();
        }
        state.demoState = newState;
      });
    });
    setInterval(async function () {
      if (state.demoState === "error") {
        // 模拟网络错误：撤销“数据正常”，保留旧读数
        state.errors = [{ code: E.FETCH_NETWORK_ERROR, detail: "demo" }];
        state.mode = "error";
        render();
        return;
      }
      if (state.demoState === "stale") {
        // 模拟采集/发布链路暂停：不发新样本，上一次数据随年龄自然过期。
        // 状态条仍按每秒年龄计算变为“监控数据已过期”，不伪造离线。
        return;
      }
      var sample = state.demoSource.next();
      var nowIso = window.RWCDemo.isoZ(new Date());
      var envelope = {
        schema_version: "1.0",
        publication_seq: sample.sample_seq,
        published_at: nowIso,
        sample_hash: "",
        sample: sample
      };
      envelope.sample_hash = await C.sampleHash(sample);
      await processEnvelope(envelope);
      render();
    }, 2000);
  }

  // ------------------------------------------------------ 启动

  function boot() {
    renderStatic();
    var demoOn = new URLSearchParams(location.search).get("demo") === "1";
    if (demoOn) {
      startDemo();
      setInterval(render, 1000);
      render();
      return;
    }
    document.getElementById("demo-banner").hidden = true;
    state.urlConfigured = !!cfg.telemetryUrl;
    if (cfg.contentsApiUrl) {
      // 提前探测 localStorage 与 Web Locks 可用性，诚实显示保障退化
      apiFeatureNote();
    }
    if (!cfg.telemetryUrl) {
      // 主 raw 地址未配置时保持“尚未连接”；备用 API 不单独开启轮询
      setInterval(render, 1000);
      render();
      return;
    }
    fetchOnce();
    setInterval(fetchOnce, cfg.refreshIntervalMs);
    setInterval(render, 1000);   // 每秒检查采样年龄
    render();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

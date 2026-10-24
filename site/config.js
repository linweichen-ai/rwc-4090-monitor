/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status31";
window.RWC_CONFIG = {
  "telemetryUrl": "https://raw.githubusercontent.com/linweichen-ai/rwc-4090-monitor/telemetry/telemetry/latest.json",
  "contentsApiUrl": "https://api.github.com/repos/linweichen-ai/rwc-4090-monitor/contents/telemetry/latest.json",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/README.md",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "delivery": "当前论文为V6私有预备稿：入口提供在线全文、8页PDF和已验收的逐图附注。",
    "deploy": "本次修订仅涉及前端请求处理，后台采集与发布保持原有流程。",
    "nextSteps": [
      "验证实际网页连续新鲜度，以及停更后过期、恢复后采用最新数据的完整过程。",
      "继续核实可长期在线的HTTPS数据入口；离线验收不等于持续传播时效已解决。"
    ],
    "validity": "论文仍为V6初稿，本轮没有新增科学实验或检测成绩。连续网页新鲜度与停更恢复仍待验证。",
    "achievement": "请求截止与错误分类修订已通过离线验收：25个场景、58项断言及26项旧诊断检查。V6在线全文和私有索引保持。"
  }
};

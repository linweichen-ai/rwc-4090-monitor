/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status26";
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
    "delivery": "V6私有预备稿已提供统一阅读入口：在线正文、8页PDF和已验收的逐图配套附注。",
    "deploy": "逐图附注的数值、单位和结论范围已独立核对，单独采用；V6正文和PDF保持原版。",
    "nextSteps": [
      "豆包已收到一次隔离的离线产品原型任务：用真实发布器和网页函数验证每60秒发布与不可变文件读取。",
      "保留提交延迟、同一分钟冲突和备用通道冷却的失败场景；只有通过后才能决定是否进行有限现场验证。"
    ],
    "validity": "原设计的时间余量尚不能用于真实产品。网页持续新鲜度仍未通过；生产监控和当前参数保持，没有新增科学实验或检测成绩。",
    "achievement": "本轮原件、独立审查、已采用附注和修订任务已同步私有GitHub。点击论文入口可直接选择在线正文。"
  }
};

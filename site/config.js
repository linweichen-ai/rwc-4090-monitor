/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status33";
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
    "delivery": "私有论文入口提供V6在线全文、8页PDF、逐图附注和复现协议说明。",
    "deploy": "已修复窄屏状态标题被长错误挤压的问题；持续新鲜度和停更恢复仍未通过。",
    "nextSteps": [
      "待提供可长期在线的HTTPS数据入口。",
      "验证连续更新、停更后过期，以及恢复后采用最新数据的完整过程。"
    ],
    "validity": "本轮为合成数据布局验收，不代表真实手机或连续实时监控通过。V6仍为初步稿，没有新增科学实验或检测成绩。",
    "achievement": "桌面Edge中390×844独立视口已检查长错误、诊断展开、冷却说明和论文按钮；状态标题修订后可完整横向阅读。"
  }
};

/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status35";
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
    "achievement": "已接收实时数据服务初版并独立重跑26项测试；进一步核对发现真实数据库接入与异常处理缺陷，已交豆包定点修订。",
    "deploy": "新数据服务仍为私有、尚未发布；现有监控页面保持，暂未切换数据来源。",
    "nextSteps": [
      "验收修订后的数据服务，再验证真实上传和网页连续接收新样本。",
      "保留现有停更恢复结论，继续补齐持续新鲜度及断网、休眠恢复证据。"
    ],
    "validity": "初版自测通过不代表可以上线，连续实时监控尚未通过。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

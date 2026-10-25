/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status36";
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
    "achievement": "修订后的数据服务通过47项离线检查和实际构建，已完成私有部署；托管主要接口检查通过，慢速上传时限仍有已记录的限制。",
    "deploy": "新服务保持私有验收。上传器已收到，独立检查发现接入与停止边界缺陷，已交豆包定点修订；当前页面尚未切换数据来源。",
    "nextSteps": [
      "验收修订上传器，再接入真实样本并观察网页连续接收新样本。",
      "保留停更恢复结论，补齐持续新鲜度及断网、休眠恢复证据。"
    ],
    "validity": "私有部署和离线检查不代表连续实时监控通过。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

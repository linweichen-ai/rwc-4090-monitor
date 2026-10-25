/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status34";
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
    "deploy": "监控发布器已恢复为单实例运行；连续新鲜度、断网和休眠恢复仍未通过。",
    "nextSteps": [
      "提供可长期在线的HTTPS数据入口，并验证连续新样本的网页接收。",
      "继续完成断网和休眠情况下的发布恢复验收。"
    ],
    "validity": "本轮是实际监控恢复验收，不代表连续实时监控通过。V6仍为初步稿，没有新增科学实验或检测成绩。",
    "achievement": "一次受控停更后，网页自动显示数据过期；刷新仍按旧采样时间显示过期。恢复发布后，网页已采用新样本，观察时年龄约73秒。"
  }
};

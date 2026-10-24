/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261024-status12";
window.RWC_CONFIG = {
  "telemetryUrl": "https://raw.githubusercontent.com/linweichen-ai/rwc-4090-monitor/telemetry/telemetry/latest.json",
  "contentsApiUrl": "https://api.github.com/repos/linweichen-ai/rwc-4090-monitor/contents/telemetry/latest.json",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_preliminary.pdf",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "achievement": "V5私有阅读版已通过全文、公式、表格和7页视觉验收，可继续从下方论文按钮查看；没有新增科学实验。",
    "nextSteps": [
      "等待L4 R2完整原件，再独立验收两处诊断修订；通过后才决定是否采用。",
      "继续完成一页研究分析，在私有仓库记录判断；当前没有启动新的实验。"
    ],
    "delivery": "豆包声明已交付L4 R1，但完整原件尚未在本地收到。聊天差异仍有两处诊断误述，23:14已要求修订为R2；候选未运行或部署，线上监控程序保持原版。",
    "deploy": "截至22:59，原实例的新跟进区间完成20次发布；506条Git命令中1次push失败，出现2条相关警告，原程序在失败结束记录8.919秒后确认发布恢复，原因未知。这一段与固定30分钟的15次发布、截至22:19另10次发布分开统计。本机在线时每120秒发布，未设置开机自启动。",
    "validity": "网页持续新鲜度仍未通过验收；一次自动恢复不证明长期稳定或历史故障根因已解决。研究目前只做分析，没有新增实验，45秒研究检查和真实20图实验均未运行。"
  }
};

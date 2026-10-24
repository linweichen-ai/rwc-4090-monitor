/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261024-status11";
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
    "achievement": "V5私有阅读版已通过全文、公式、表格和7页视觉验收，可从下方论文按钮查看；无新增科学实验。",
    "nextSteps": [
      "等待L4 R1完整原件与独立验收，再决定是否采用。",
      "处理研究验收中断，补齐检查后再决定是否启动新的20图实验。"
    ],
    "delivery": "V5论文阅读版已验收。监控L4的三项静态问题已于22:39退回豆包修订；候选未运行或部署，等待L4 R1完整原件。",
    "deploy": "L1e保持原实例运行；固定30分钟内15次发布、375条Git命令成功；截至22:19，窗口后另有10次发布、250条Git命令成功，分开统计。本机在线时每120秒发布，未设置开机自启动。",
    "validity": "固定30分钟无故障不证明根因已修复、长期稳定或网页持续实时；请查看采样年龄与状态。没有新增科学实验，45秒研究检查和新的20图实验均未运行。"
  }
};

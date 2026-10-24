/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261024-status13";
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
      "接收L4 R2完整原件，核验身份后完成独立窄验收，再决定是否采用。",
      "研究分析已收到初版原件并归档；修订稿继续澄清方法与对照，完整判断保存在私有仓库。"
    ],
    "delivery": "豆包已交付L4 R2声明；可见差异中的两项诊断修订经双人静态复核通过。完整ZIP尚未收到，不能据此称独立测试通过；候选未运行或部署。",
    "deploy": "23:28:32确认原发布器实例与13份源码一致。当前日志快照缺少22:59后的前段，与已配置的轮转相符；捕获后段可见10条发布成功记录、239条命令成功，不能据此称整个区间零失败。截点时下一轮尚无完成记录。此前一次push失败曾自动恢复，原因未知；本机在线时每120秒发布，未设置开机自启动。",
    "validity": "网页持续新鲜度仍未通过验收；后端发布成功不保证浏览器取得新样本。研究只做分析，没有新增实验，45秒研究检查和真实20图实验均未运行。"
  }
};

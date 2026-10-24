/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status14";
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
    "delivery": "L4 R2可见差异中的两项诊断修订经双人静态复核通过；完整ZIP仍未收到，候选未独立执行或部署。研究分析的完整判断保存在私有仓库。",
    "deploy": "10月24日22:59–23:28历史窗口的日志轮转缺口已补齐：14次发布成功，354条已完成Git命令均成功；其中含下一轮已完成的4条命令，该轮在原截点没有发布确认，不计成败。本结果不代表此刻在线。此前一次push失败曾自动恢复，原因未知。既定发布间隔120秒，未设置开机自启动。",
    "nextSteps": [
      "接收L4 R2完整原件，核验身份后进行独立验收，再决定是否采用。",
      "本轮纯理论候选未形成可辨别的新方法，停止扩展并保留负结果；下一条路线须先给出可检验机制。"
    ],
    "validity": "网页持续新鲜度仍未通过验收，后端发布成功不保证浏览器取得新样本。新候选的停止判断来自理论审阅，不是真实图像实验结论；V5和冻结实验协议保持，45秒检查及真实20图实验均未运行。",
    "achievement": "当前论文仍是已通过全文、公式、表格和7页视觉验收的V5私有阅读版，可从下方按钮查看。本阶段没有新增科学实验。"
  }
};

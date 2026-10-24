/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status15";
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
    "delivery": "V6论文候选的适用边界与对照说明已完成可见正文静态审查；一处测试层级误述已退回并在R1可见段落中修正。完整原件及差异尚未核验，当前阅读版仍为V5。",
    "deploy": "10月24日22:59–23:28历史窗口的日志轮转缺口已补齐：14次发布成功，354条已完成Git命令均成功；其中含下一轮已完成的4条命令，该轮在原截点没有发布确认，不计成败。本结果不代表此刻在线。此前一次push失败曾自动恢复，原因未知。既定发布间隔120秒，未设置开机自启动。",
    "nextSteps": [
      "恢复浏览器连接后接收论文R1与监控L4 R2完整原件，核验身份及完整改动，再决定是否采用。",
      "另一候选只保留为待验证的诊断问题；现有理论与文献审查不构成方法创新或检测效果证据。"
    ],
    "validity": "网页持续新鲜度仍未通过验收，后端发布成功不保证浏览器取得新样本。监控L4 R2仅通过可见差异静态审阅，未独立运行部署。45秒研究检查及真实20图实验均未运行。浏览器扩展更新要求暂时中断了页面验收。",
    "achievement": "当前可阅读的是已通过全文、公式、表格和7页视觉验收的V5私有PDF，下方按钮保持该入口。V6候选尚未采用；本阶段没有新增科学实验。"
  }
};

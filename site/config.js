/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status16";
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
    "delivery": "V6 R1原件与完整差异已核验，双人完整审查通过并采用为当前Markdown写作稿；V6 PDF任务已于00:59交豆包，尚未交付。监控L4 R2原包身份与清单已核验，独立测试待完成，候选未部署。",
    "deploy": "10月25日00:47单次只读核查确认原实例和13份源码身份；00:43后两次发布、50条已完成Git命令均成功。仅覆盖该次核查及对应日志，不证明持续新鲜度。既定发布间隔120秒，未设置开机自启动。",
    "nextSteps": [
      "接收并验收V6 PDF；完成监控L4 R2独立验收后再决定是否采用。",
      "继续核对网页持续刷新与新鲜度；研究候选仅处于诊断阶段，45秒检查及真实20图实验尚未执行。"
    ],
    "validity": "浏览器已恢复。00:51页面曾保留38分59秒旧样本；重载后取得较新API样本，随后又拒绝倒退数据。网页持续刷新与新鲜度仍未通过验收，后端发布成功不保证页面取得新样本。45秒研究检查及真实20图实验均未执行。",
    "achievement": "当前Markdown已采用通过原件核验和双人完整审查的V6 R1，仅澄清写作边界与未来验证对照，没有新增科学实验。下方PDF按钮仍为已验收的7页V5；V6 PDF尚未交付。"
  }
};

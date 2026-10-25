/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status39";
window.RWC_CONFIG = {
  "telemetryUrl": "https://rwc-4090-live-data.chenlinwei.chatgpt.site/api/telemetry",
  "contentsApiUrl": "",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/README.md",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "delivery": "私有论文入口提供V6在线全文、8页PDF、逐图附注和复现协议说明。",
    "achievement": "完成一次5分28秒的浏览器观察：15个观测点、10次新样本更新，全部显示正常，最大样本年龄约63秒。",
    "deploy": "独立数据接口已接入，上传器每30秒串行更新。观察期间未重载页面，原Git发布器保留；完整记录与截图已保存到私有GitHub。",
    "nextSteps": [
      "继续验证断网和休眠后的恢复表现。",
      "保留异常与恢复记录，持续同步公开脱敏进度和私有证据。"
    ],
    "validity": "结论仅覆盖本次有限观察窗口，不代表长期稳定或断网、休眠恢复已通过。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

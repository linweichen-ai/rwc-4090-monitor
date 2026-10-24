/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status24";
window.RWC_CONFIG = {
  "telemetryUrl": "https://raw.githubusercontent.com/linweichen-ai/rwc-4090-monitor/telemetry/telemetry/latest.json",
  "contentsApiUrl": "https://api.github.com/repos/linweichen-ai/rwc-4090-monitor/contents/telemetry/latest.json",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v6_preliminary.pdf",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "delivery": "当前论文为8页V6私有预备稿。已完成一次五分钟有限测量：两条合成文件路径分别在发布确认后15.564秒和0.608秒首次读到正确内容。",
    "deploy": "本次只更新阶段说明，生产取数逻辑和发布参数保持。测量中的两条静态路径不能代表网页持续获得新快照。",
    "nextSteps": [
      "豆包比较两种固定时间槽取数方案，先给时间预算、失败反例和发布恢复设计，再决定是否实现。",
      "继续完成持续刷新和异常场景验收；研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "21轮观察中首次匹配后无回退；独立核对43份正文通过。但末轮请求存在至少1毫秒截止偏差，不能称测量协议全通过。网页持续新鲜度仍未通过，无新增科学实验结果。",
    "achievement": "原始测量、独立复算和下一阶段设计任务保存到私有GitHub；公开页面展示脱敏结果，V6论文通过私有入口阅读。"
  }
};

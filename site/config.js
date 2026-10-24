/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status28";
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
    "delivery": "当前论文为V6私有预备稿：入口提供在线全文、8页PDF和已验收的逐图附注。",
    "deploy": "已向豆包派发当前线上前端的小范围修复：请求满8秒后，迟到的校验结果不能更新页面，也不能干扰下一次请求。",
    "nextSteps": [
      "先固定测试时序，再对照原版与修订版；保留失败日志和逐事件轨迹，收到交付后独立验收。",
      "持续新鲜度仍待解决；继续核实可长期在线的HTTPS数据入口，再验证停更、过期与恢复。"
    ],
    "validity": "修复尚未交付或上线，当前继续使用原监控版本。L9候选已关闭；持续新鲜度尚未通过，没有新增科学实验或检测成绩。",
    "achievement": "修订任务、验收边界和发送记录已同步私有GitHub。论文仍是V6，点击入口可在线阅读。"
  }
};

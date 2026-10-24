/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status23";
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
    "delivery": "当前论文为已验收的8页V6私有预备稿。测量工具第一轮修订已收到，多数问题已修复，仍有正文超限停止和观察截止两处边界待补。",
    "deploy": "02:55核查窗口确认原监控实例、源码身份及38次完成发布；这不等于网页持续新鲜。本阶段只同步进度，没有部署新的取数逻辑。",
    "nextSteps": [
      "豆包补齐两处窄修正及相应反例；收到完整原件后独立验收，再开展有限真实测量。",
      "继续完成持续刷新和异常场景验收；研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "作者报告35项自测通过，但独立源码审查仍发现两个边界缺口。真实测量尚未开始，持续网页新鲜度仍未通过，没有新增科学实验结果。",
    "achievement": "修订原件、失败日志、独立审查及下一轮任务已同步私有GitHub；公开页面仅展示脱敏进度，V6论文通过私有入口阅读。"
  }
};

/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status21";
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
    "delivery": "当前论文为已验收的8页V6私有预备稿；监控复现修订包已归档，源码和时间轴已完成独立审查。",
    "deploy": "修订后的固定场景仍出现过期读数，持续新鲜度未通过。验收已纠正统计窗口和双标签计时口径，尚无新修复上线。",
    "nextSteps": [
      "豆包正在准备有限的双路径传播测量工具，对比提前请求过的404路径与首次读取路径；先验收工具，再做真实测量。",
      "继续补齐持续更新与窄屏验收；45秒研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "60秒发布在修正后的四组成对合成场景中仍有过期；结论只覆盖这些场景。测量尚未执行，不能认定缓存根因或承诺已解决。",
    "achievement": "修订原件、验收更正和下一步任务已同步私有GitHub。V6论文仍为预备稿，方法检测性能未评测。"
  }
};

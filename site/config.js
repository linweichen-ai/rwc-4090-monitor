/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status22";
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
    "delivery": "当前论文仍为已验收的8页V6私有预备稿。测量工具初版已收到，独立审查发现实际请求路径与证据保护缺陷，已退回修订。",
    "deploy": "原监控实例保持运行；最近核查窗口内有38次完成发布，源码身份一致。后台发布成功不等于网页持续新鲜，尚无新修复上线。",
    "nextSteps": [
      "豆包修正路径、完整404判定、超时证据和防重复运行保护；收到原件后核验，随后再决定是否开始有限真实测量。",
      "继续补齐持续更新与窄屏验收；45秒研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "测量工具的作者自测不能覆盖实际源码缺陷。尚未进行真实路径测量，也没有新增科学实验结果；监控持续新鲜度仍未通过。",
    "achievement": "测量初版原件、失败日志、独立验收和修订任务已同步私有GitHub；公开页面只显示脱敏进度，V6论文入口保持私有。"
  }
};

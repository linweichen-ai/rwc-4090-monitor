/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status37";
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
    "delivery": "私有论文入口提供V6在线全文、8页PDF、逐图附注和复现协议说明。",
    "achievement": "数据服务已完成私有部署。上传器的数值核对、停止指令和清理失败后停止逻辑通过7项独立检查；传输层仍需修订。",
    "deploy": "修订包已收到并归档。Windows检查发现合法响应读取和认证拒绝处理仍有缺陷，已交豆包进一步修复；当前页面继续使用原数据来源。",
    "nextSteps": [
      "修复传输层并完成独立验收，再接入真实样本、观察网页连续更新。",
      "保留停更恢复结论，补齐持续新鲜度及断网、休眠恢复证据。"
    ],
    "validity": "私有部署和离线检查不代表连续实时监控通过。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

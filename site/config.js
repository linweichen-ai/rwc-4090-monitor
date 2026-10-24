/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status32";
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
    "delivery": "当前私有论文入口提供V6在线全文、8页PDF，以及已验收的逐图附注和复现协议附注。",
    "deploy": "后台继续沿用原采集与发布流程；本轮预检曾见采样年龄246秒的旧读数，持续新鲜度仍未通过。",
    "nextSteps": [
      "待提供可长期在线的HTTPS数据入口。",
      "验证连续更新、停更后过期，以及恢复后采用最新数据的完整过程。"
    ],
    "validity": "V6仍为初步稿；本轮仅补充既有证据说明，没有新增科学实验或检测成绩。持续新鲜度与停更恢复尚未通过。",
    "achievement": "补齐20张正常支持图既有诊断的计数、特征处理、索引一致率和来源说明，作为独立附注提供；V6正文和PDF保持不变。"
  }
};

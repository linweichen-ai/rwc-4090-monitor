/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status30";
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
    "deploy": "R1静态审查未通过，尚未执行独立测试；线上继续保持原监控版本。",
    "nextSteps": [
      "先明确结果提交与请求终结的边界，补齐可复核测试计划，再决定有限独立验证。",
      "连续新鲜度仍未通过；继续核实可长期在线的HTTPS数据入口，再验证停更、过期与恢复。"
    ],
    "validity": "线上继续使用原监控版本。本轮没有新增科学实验或检测成绩，连续新鲜度尚未通过。",
    "achievement": "R1限时停止后的现状包已收到，31个原件已归档；测试夹具仍有启动与覆盖缺口。论文保持V6，可从私有索引在线阅读全文。"
  }
};

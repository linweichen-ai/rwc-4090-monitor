/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status29";
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
    "deploy": "截止保护候选已收到，但独立审查未通过；存在两处请求状态竞争，候选未部署。",
    "nextSteps": [
      "06:15已退回R1，仅修订源码和测试夹具，禁止执行测试；夹具问题另行核对。",
      "连续新鲜度仍未通过；继续核实可长期在线的HTTPS数据入口，再验证停更、过期与恢复。"
    ],
    "validity": "线上继续使用原监控版本。本轮没有新增科学实验或检测成绩，连续新鲜度尚未通过。",
    "achievement": "已定位候选中的两处问题：及时完成的请求可能被误标超时，旧请求可能改写下一次请求的提示。论文仍为V6，可从私有索引在线阅读。"
  }
};

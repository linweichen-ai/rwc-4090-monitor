/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status27";
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
    "delivery": "当前论文仍为V6私有预备稿，阅读入口提供在线正文、8页PDF和已验收的逐图附注。",
    "deploy": "L9候选未通过上线验收：发布失败恢复、旧事务兼容和网页旧响应检查存在源码缺陷，已停止本候选继续调试。",
    "nextSteps": [
      "原样保存61份交付文件及全部11轮日志；三路审查已区分产品缺陷、测试夹具问题和未运行项目。",
      "下一步核实可持续在线的HTTPS数据入口，再验证采样到网页显示、停更过期和恢复最新数据。"
    ],
    "validity": "线上仍为原监控版本，持续新鲜度尚未通过。模拟反例不能当作精确现场测量；没有新增科学实验或检测成绩。",
    "achievement": "原件、失败证据和拒绝上线的原因已同步私有GitHub。论文V6保持，点击论文入口可直接在线阅读。"
  }
};

/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status40";
window.RWC_CONFIG = {
  "telemetryUrl": "https://rwc-4090-live-data.chenlinwei.chatgpt.site/api/telemetry",
  "contentsApiUrl": "",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/README.md",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "delivery": "私有论文入口提供V6在线全文、8页PDF、逐图附注和复现协议说明。",
    "achievement": "一次自然上传网络错误后，30秒后确认了更高序号的新快照；此前请求是否提交成功及错误根因仍未知。",
    "deploy": "线上继续使用已验收的R3上传器及当前数据接口，原Git发布器保留。日志修订首版未通过静态审查，限时修订快照仍有清理与测试问题，暂不采用。",
    "nextSteps": [
      "修复日志边界并完成独立验收，再决定是否切换。",
      "继续验证新数据链路的停更与恢复范围，保留失败和未确认结果。"
    ],
    "validity": "原有限浏览器观察结论保持；一次自然恢复不代表断网、休眠恢复或长期稳定已通过。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status38";
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
    "achievement": "上传器修订通过34项Windows测试及6项独立边界检查。真实脱敏样本已上传，确认记录与公开接口回读一致。",
    "deploy": "本页已切换到独立实时数据接口，上传器每30秒串行更新。正在观察网页连续新样本；原Git发布器保留。",
    "nextSteps": [
      "完成浏览器至少10次新样本的连续观察，核对每次样本年龄。",
      "继续补齐断网和休眠恢复证据，保留所有失败与验证限制。"
    ],
    "validity": "当前只确认离线检查和真实接入；持续新鲜度观察尚未完成。论文V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

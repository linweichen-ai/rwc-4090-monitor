/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status25";
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
    "delivery": "当前论文为8页V6私有预备稿。已用既有20图结果补齐逐图描述表，原始数值及汇总通过独立复算。",
    "deploy": "每120秒发布一次的分钟槽候选暂不实施；其等待时间可能让读数过期。原设计没有完整模拟备用通道，不能据此宣称整个系统必然失败。",
    "nextSteps": [
      "豆包只评估一次每60秒发布与不可变分钟槽的组合，纳入备用通道、时钟偏差和异常恢复；尚未实现或上线。",
      "完成逐图附注的措辞验收，继续持续刷新和异常场景验证。"
    ],
    "validity": "本轮分析复用了旧图和旧数值，没有新增科学实验或检测成绩。网页持续新鲜度仍未通过；生产取数逻辑和当前参数保持。",
    "achievement": "原始设计、独立审查、完整逐图表和后续任务已同步私有GitHub。论文通过私有入口阅读，公开页面只展示脱敏进度。"
  }
};

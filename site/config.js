/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status41";
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
    "achievement": "日志修订通过47项Windows测试及2项独立边界检查：内存保留最近256条，每个日志文件最多1MiB，最多两个备份；错误清理路径通过。",
    "deploy": "已完成一次受控切换，复用原确认状态。新上传实例与公开接口回读一致；网页一次网络读取失败后自然恢复，未靠重载恢复。原Git发布器保留。",
    "nextSteps": [
      "按有限运行窗口复核日志容量及失败恢复记录。",
      "新链路真实断网、休眠恢复仍待验证；不把短时通过写成长期开机服务。"
    ],
    "validity": "本次为监控工程验收，未新增科学实验或检测成绩。V6仍为初步稿；上传依赖本机在线、未休眠和进程存活，尚无自动启动保障。"
  }
};

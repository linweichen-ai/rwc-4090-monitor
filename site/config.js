/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status42";
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
    "delivery": "监控工作台与私有初稿已形成交付：双卡真实脱敏指标、任务显存可视化、V6在线全文和8页PDF入口。",
    "achievement": "新数据链路完成一次受控暂停与恢复：旧样本超过180秒后显示过期，恢复上传后原页面未重载便取得新样本并恢复正常。",
    "deploy": "继续使用已验收的日志修订与相同数据接口，原确认状态保留；日志内存256条、每文件1MiB、最多两个备份，既有47项与2项独立验收结果保持。",
    "nextSteps": [
      "继续现有监督，在约定有限运行窗口复核实际覆盖、存储和失败恢复记录。",
      "保留历史故障与未确认结果；本机在线依赖不变，不新增自启动或无条件重启。"
    ],
    "validity": "本次只证明这一受控窗口，不扩大原浏览器观察，不代表真实断网、休眠恢复或长期无故障。V6仍为初步稿，本轮没有新增科学实验或检测成绩。"
  }
};

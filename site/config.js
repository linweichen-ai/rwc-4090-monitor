/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status20";
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
    "delivery": "当前论文为已验收的8页V6私有预备稿；监控诊断面板已上线。豆包的新鲜度复现初版已收到，文件身份核对通过，完整验收已退回修订。",
    "deploy": "网页此前已观察到旧读数过期，持续新鲜度仍未通过。初版复现有响应延迟模型、统计判据和双标签证据缺口，尚无新修复部署。",
    "nextSteps": [
      "豆包正在修正复现脚本和报告，补齐响应头与正文、双标签时间轴和固定采样相位；收到修订原件后独立验收。",
      "继续补齐持续更新与窄屏验收；45秒研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "60秒发布在一个合成场景中改善了末次读数年龄，但仍有过期窗口；不能写成零改善，也不能称已解决。当前阶段没有新增科学实验。",
    "achievement": "V6正文与PDF已同步私有GitHub。登录后可查看；GitHub内嵌PDF预览异常时可用文件页下载入口。论文仍为预备稿，方法检测性能未评测。"
  }
};

/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status17";
window.RWC_CONFIG = {
  "telemetryUrl": "https://raw.githubusercontent.com/linweichen-ai/rwc-4090-monitor/telemetry/telemetry/latest.json",
  "contentsApiUrl": "https://api.github.com/repos/linweichen-ai/rwc-4090-monitor/contents/telemetry/latest.json",
  "paperUrl": "https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_preliminary.pdf",
  "refreshIntervalMs": 15000,
  "fetchTimeoutMs": 8000,
  "staleAfterMs": 180000,
  "futureToleranceMs": 60000,
  "apiFallbackAgeMs": 120000,
  "stage": {
    "delivery": "监控L4 R2原包身份与77项清单通过，独立26项诊断和50项页面测试全部通过；本次发布加入可折叠的更新诊断面板。V6正文已验收并同步私有GitHub，V6 PDF仍在排版验收。",
    "deploy": "此次仅采用豆包已验收前端原件并保留部署配置；后端未更换或重启。00:47单次只读核查确认原实例和13份源码身份，00:43后两次发布及50条已完成Git命令成功；该窗口不证明持续在线或网页新鲜度。",
    "nextSteps": [
      "用真实浏览器诊断面板核对请求来源、响应声明、冷却期限与旧数据拒绝原因，继续验证持续刷新。",
      "接收并逐页验收V6 PDF；研究45秒检查及真实20图实验仍未执行。"
    ],
    "validity": "76项通过是本地合成验收；其中页面测试调用三次离线合成数据，不是服务器或真实GPU实验。诊断显示不改变取数规则，也不等于缓存或持续刷新问题已解决。此前页面曾保留38分59秒旧读数，仍保留该问题证据。",
    "achievement": "当前Markdown为已验收V6 R1，无新增科学实验；下方PDF按钮仍指向已验收的7页V5。监控新增诊断说明，持续网页新鲜度尚未通过验收。"
  }
};

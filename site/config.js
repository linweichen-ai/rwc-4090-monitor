/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status18";
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
    "delivery": "豆包交付的8页V6 PDF已通过原件清单、全文与67段数学核对和逐页视觉验收，已同步私有GitHub。监控L4 R2独立26项诊断与50项页面测试通过，更新诊断面板已上线。",
    "deploy": "本次仅更新已验收论文入口与阶段说明，保留诊断面板和全部取数配置；后端未更换或重启。01:17至01:24浏览器短时观察见样本序号5409推进至5427，不能据此保证持续在线或网页持续新鲜。",
    "nextSteps": [
      "继续用更新诊断核对响应来源、时间与旧数据拒绝原因，保留真实异常证据。",
      "继续审查研究验证方案；45秒研究检查及真实20图实验仍未执行。"
    ],
    "validity": "76项监控检查属于本地合成验收，其中页面测试含三次离线合成数据调用，不是科学实验。V6只补充论证与未来对照设计，检测性能仍未评测；此前38分59秒旧读数问题证据继续保留。",
    "achievement": "当前论文为8页V6私有阅读稿，PDF与当前Markdown一致，可通过下方按钮查看。监控已增加可折叠诊断；持续网页新鲜度尚未通过验收。"
  }
};

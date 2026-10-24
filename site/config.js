/* 公开部署配置：仅含公开快照地址、私有论文入口及已核实阶段说明。 */
window.RWC_ASSET_VERSION = "20261025-status19";
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
    "delivery": "当前论文为已验收的8页V6私有阅读稿；登录下载得到的文件字节与验收版本一致。监控L4 R2的26项诊断与50项页面测试已通过，诊断面板已上线。",
    "deploy": "本轮页面实际出现252秒和199秒旧读数，随后由新数据自动恢复；持续新鲜度仍未通过。对应固定日志窗口中6次后台发布成功，后台成功不能代替网页及时更新。",
    "nextSteps": [
      "豆包正在用冻结原版前端和独立虚拟时钟复现发布、冷却与轮询错开的问题；收到原件后独立验收，再决定修订方案。",
      "继续补齐持续更新与窄屏验收；45秒研究检查及新真实20图实验仍未执行。"
    ],
    "validity": "本轮只增加时效问题证据与离线复现任务，尚无修复部署或新科学实验。没有放宽180秒过期线、改变取数参数或重启发布器；静态反例尚不能解释每次现场延迟。",
    "achievement": "V6正文与PDF已同步私有GitHub；匿名访问论文仍受权限保护。GitHub内嵌PDF预览异常，可使用文件页下载入口。论文仍为预备稿，方法检测性能未评测。"
  }
};

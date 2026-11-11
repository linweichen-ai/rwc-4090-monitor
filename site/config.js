window.GPU_DASHBOARD_CONFIG = {
  apiUrl: "https://rwc-4090-live-data.chenlinwei.chatgpt.site/api/dashboard",
  refreshIntervalMs: 15000,
  staleAfterMs: 180000,
  report: {
    updatedAt: "2026-11-11T09:30:00+08:00",
    results: [
      { label: "基础设施", title: "双 4090 与双 5090 已纳入同一监控面板", detail: "两台服务器均已只读核对为双卡配置；页面把卡级显存、利用率、温度、功耗和任务占用统一展示。" },
      { label: "Static2", title: "已完成 6 次真实运行，但整段参考门槛为 0/6", detail: "现有证据尚不能支持全路径精度或漂移已经改善；离线特征深度支持不等同于在线定位效果。" },
      { label: "Mask2Former", title: "R23 cg_only 仍是离线主线方案", detail: "已报告的提升只属于限定诊断范围，不能写成整体精度提升。" },
      { label: "LabelAgent / MCA", title: "候选仍需真实回归与 GPU 试验", detail: "LabelAgent 的 29 例回归尚未执行；MCA/RWC 旧结果未超过同前端对照，真实 40 图 GPU pilot 未完成。" }
    ],
    conclusions: [
      "监控链路可以证明服务器与 GPU 当前状态，但不能替代实验验收。",
      "目前没有足够证据宣布 Static2 全路径定位改善，也没有足够证据宣布 MCA/RWC 超过对照。",
      "下一阶段仍应先完成预先定义的真实实验、对照与验收条件，再更新方法结论。"
    ],
    note: "这是公开摘要，不包含服务器地址、凭据、算法细节、原始数据或未公开论文内容。结论按证据更新，不用运行中的 GPU 状态包装科研结果。"
  }
};

# 双 RTX 4090 公开监控与进度

2026-10-24 最新阶段（status12）：V5私有阅读版已验收，仍可通过以下链接阅读。监控L4 R1由豆包声明已交付，但完整原件尚未在本地收到；聊天差异还存在两处诊断误述，23:14已要求修订为R2。候选没有运行或部署，线上监控程序保持原版。

**[阅读当前V5 PDF（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_preliminary.pdf)** · [阅读V5冻结正文（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_manuscript.md) · [打开监控网页](https://linweichen-ai.github.io/rwc-4090-monitor/)

截至22:59，原发布器实例继续运行。本次单独跟进区间为22:19:36.9397347之后至22:59:40.6855558，新增20次发布；506条Git命令中505条成功、1次push失败，产生2条相关警告。原程序按既有逻辑重试，在失败结束日志后的8.919秒确认发布恢复；具体失败原因未知。未记录超时、ERROR或迭代失败。本次记录与固定30分钟内的15次发布、截至22:19另10次发布分别统计，不合并为新的固定观察窗口。

网页持续新鲜度仍未通过验收，一次自动恢复也不证明长期稳定或历史故障根因已解决。一页研究分析正在进行，完整判断保存在私有仓库；没有新增实验，45秒研究检查和真实20图实验均未运行。下一步接收L4 R2完整原件并独立验收，再决定是否采用。

以下为历史阶段记录，原文保留；其中“最新”仅指各条记录写下时的状态。

2026-10-24 最新阶段：V5私有阅读版已通过全文、公式、表格和7页视觉验收，可从以下PDF链接查看；无新增科学实验。监控L4的三项静态问题已于22:39退回豆包修订，候选尚未运行或部署；等待L4 R1完整原件与独立验收。

**[阅读当前V5 PDF（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_preliminary.pdf)** · [阅读V5冻结正文（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_manuscript.md) · [历史v4 PDF（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v4_preliminary.pdf)

L1e原实例继续运行，本机在线时每120秒发布；固定30分钟内15次发布、375条Git命令成功，截至22:19窗口后另有10次发布、250条Git命令成功，两段分开统计。网页持续新鲜度仍未通过验收。研究中断处理与补齐检查完成后，再决定是否启动新的20图实验。

以下为先前阶段记录，保留各时点原有结论。

2026-10-24 最新阶段：V5冻结正文R1已通过数学及修改范围复核，已交豆包排版；当前已验收PDF仍为7页v4。L4聊天差异静态审阅发现诊断可能影响原有共享冷却，已退回修订；候选未运行或部署，完整原件仍待接收。没有新增科学实验。

**[阅读V5最新正文（私有，PDF排版中）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v5_manuscript.md)** · [阅读已验收v4 PDF（私有）](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v4_preliminary.pdf)

L1e固定30分钟观察窗口内有15次成功发布、375条Git命令全部成功。截至22:19，固定窗口结束后另有10次成功发布、250条Git命令全部成功；这段后续记录单独统计，不并入固定窗口。原实例继续运行，短时无故障不证明根因已修复、长期稳定或网页持续实时。以下历史时点记录保留。

2026-10-24 22:04阶段：固定21:30:26.576–22:00:26.576窗口内15次发布成功、375条Git命令全成功，14个发布间隔118.858–120.898秒；原唯一实例与13份源码身份在终点后核对一致。这不证明根因修复、长期稳定或网页持续实时。更新诊断与论文补充候选正在豆包执行，尚未采用；论文保持7页v4。

2026-10-24 21:31更新：发布器启动方式候选通过11项Windows定向测试及三个实际子进程场景，已完成一次受控切换；首个新发布的本地状态与GitHub远端一致。固定30分钟自然观察进行中，原启动故障根因和持续时效尚未确认。研究补充检查仍受平台执行中断影响，新的20图实验未运行，论文保持7页v4私有初稿。以下历史时点记录保留。

2026-10-24 20:58更新：监控文案修订上线并通过线上字节核对，实际页面已观察到过期读数自动恢复为新样本，持续实时性仍待验收。研究两项缺失输入检查通过；坏缓存验收未完成，45秒补充检查在输入准备后遇平台检查中断，尚未启动。新的20图实验未运行，论文仍为7页v4私有初稿。以下旧时点记录保留。

**[打开监控网页](https://linweichen-ai.github.io/rwc-4090-monitor/)** · [阅读私有论文 v4 PDF 初稿](https://github.com/linweichen-ai/mca-paper/blob/codex/mca-rwc-innovation/workstreams/rwc_4090/paper/rwc_v4_preliminary.pdf)

2026-10-24 20:28阶段更新。诊断版发布器已完成受控切换，首次失败后已自动恢复，发布状态与远端一致。现在已取得系统启动错误码，尚未找到具体原因，不能称稳定性已通过。网页备用通道已读到更新快照；请继续查看采样时间和180秒过期标记。

- **论文保持7页v4初稿。** 上方私有PDF需登录有仓库权限的GitHub账号；预览失败可点Download raw file。没有新增实验结论。
- **监控持续更新与诊断并行。** 原采集器保持运行，发布器诊断版仅一次切换；故障后自动恢复已有证据，持续实时性仍待验收。
- **研究继续窄修订。** 新包独立验收发现超时边界问题，正在修订；正式20图实验尚未运行。未发表方法和完整证据只在私有仓库。

服务器每20秒采集、本机在线时每120秒发布、网页每15秒请求；未设置开机自启动。请求频率不等于端到端时效保证，过期也不能直接解释为服务器离线。

本公开仓库不包含服务器地址、凭据、进程ID、原图、权重或私有研究历史。[详细记录（私有）](https://github.com/linweichen-ai/mca-paper/tree/codex/mca-rwc-innovation/workstreams/rwc_4090)。

2026-10-24 20:35文案澄清：页面改为标示“最近有效获取”，一次更新失败时说明保留读数和失败原因。180秒过期、灰色卡片与异常判定规则保持不变，已独立核对179999/180000/180001毫秒边界。该更新不代表持续实时性通过。

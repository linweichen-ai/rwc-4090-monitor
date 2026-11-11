# 双节点 GPU 采集器

`gpu_dashboard_collector.py` 每 30 秒只读调用 `nvidia-smi` 与 `ps`，将双 4090
或双 5090 的白名单状态上传到统一数据入口。它不会上传服务器地址、GPU UUID、
原始 PID、完整命令、路径或写入令牌。

页面中的“进程运行时长”来自操作系统进程时长，只是占卡时间的近似上界；进程
可能在运行期间暂时没有使用 GPU。单进程 GPU 利用率来自 `nvidia-smi pmon` 的
瞬时采样，驱动不提供时显示未知。

账号显示名称由服务器本地 `~/.config/gpu-dashboard/owner-map.json` 控制；未映射
账号自动变成稳定别名。令牌仅保存在权限为 `0600` 的本机环境文件中，不进入 Git。


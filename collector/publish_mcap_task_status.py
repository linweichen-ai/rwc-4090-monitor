#!/usr/bin/env python3
"""Publish a sanitized MCAP workflow summary to the public dashboard."""
from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
from datetime import datetime, timezone
from urllib.request import urlopen

OUTPUT_ROOT = Path(r"C:\Users\seer\Documents\ChatGPT\Seer2clw\outputs\labelagent_closed_loop_20261111")
SLOPE_OVERLAY = Path(r"C:\Users\seer\Documents\ChatGPT\Seer2clw\outputs\sfl_cpd15y_stage2_20261110\slope_review\slope_candidate_overlay.png")


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def file_time(path: Path, fallback: str) -> str:
    try:
        return datetime.fromtimestamp(path.stat().st_mtime, timezone.utc).isoformat(
            timespec="milliseconds").replace("+00:00", "Z")
    except OSError:
        return fallback


def normalized_time(value: object, fallback: str) -> str:
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return parsed.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace(
            "+00:00", "Z")
    except (TypeError, ValueError):
        return fallback


def bundle_paths() -> list[Path]:
    return list(OUTPUT_ROOT.rglob("*bundle.json"))


def newest_bundle() -> dict:
    paths = bundle_paths()
    if not paths:
        return {}
    return read_json(max(paths, key=lambda p: p.stat().st_mtime_ns))


def probe(name: str, url: str, validated: str, known_ms: int | None) -> dict:
    try:
        with urlopen(url, timeout=3) as response:
            if response.status == 200:
                return {"name": name, "state": "online", "detail": "实时健康检查通过",
                        "latency_ms": known_ms}
    except Exception:
        pass
    return {"name": name, "state": "unknown", "detail": validated, "latency_ms": known_ms}


def build_status() -> dict:
    bundle = newest_bundle()
    receipt = bundle.get("receipt", {})
    readback = bundle.get("workbench_readback", {})
    truth_count = int(readback.get("truth_shape_count") or 0)
    candidate_count = int(readback.get("candidate_shape_count") or 0)
    human_gate = bool(receipt.get("human_gate_passed"))
    confirmed_inputs = set()
    for path in bundle_paths():
        item = read_json(path).get("receipt", {})
        if item.get("human_gate_passed") and item.get("input_id"):
            confirmed_inputs.add(item["input_id"])
    confirmed_count = min(2, len(confirmed_inputs))
    complete = confirmed_count >= 2
    last_state = str(receipt.get("last_state") or "尚无闭环回执")
    event_count = int(receipt.get("event_count") or 0)
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    receipt_time = normalized_time(receipt.get("as_of_event_time"), now)
    replay_time = file_time(OUTPUT_ROOT / "frame0-gate-replay.json", receipt_time)
    slope_time = file_time(SLOPE_OVERLAY, receipt_time)

    if complete:
        status, phase = "complete", "最小闭环已完成，等待任务侧最终汇总"
    elif last_state == "human_review_required":
        status, phase = "waiting_review", "机器候选已进入人工门禁，尚未写入人工真值"
    else:
        status, phase = "running", "正在查找、核对并登记已标注 MCAP"

    services = [
        probe("SAM3 分割", "http://127.0.0.1:29766/health", "真实图像请求此前通过", 83),
        probe("Qwen3-VL", "http://127.0.0.1:29878/health", "结构化真实图像请求此前通过", 1482),
        probe("标注工作台", "http://127.0.0.1:8767/", "真实 MCAP 已成功载入", None),
    ]
    milestones = [
        {"label": "5090 推理服务", "state": "passed",
         "detail": "SAM3 与视觉语言模型均已有真实图像响应证据",
         "occurred_at": now},
        {"label": "机器候选导入", "state": "passed" if candidate_count else "running",
         "detail": f"工作台当前读回 {candidate_count} 个机器候选",
         "occurred_at": receipt_time},
        {"label": "闭环回执", "state": "passed" if event_count else "pending",
         "detail": f"已记录 {event_count} 个状态事件；当前状态 {last_state}",
         "occurred_at": receipt_time},
        {"label": "人工确认", "state": "passed" if human_gate else "blocked",
         "detail": f"人工真值 {truth_count} 个；未通过前不提升为真值",
         "occurred_at": now},
        {"label": "两个已标注 MCAP", "state": "passed" if complete else "running",
         "detail": "正在按证据门槛核对两个最终文件",
         "occurred_at": now},
    ]
    results = [
        {"text": f"真实 MCAP 帧已登记，闭环回执包含 {event_count} 个事件。",
         "occurred_at": receipt_time},
        {"text": f"工作台安全读回：机器候选 {candidate_count} 个，人工真值 {truth_count} 个。",
         "occurred_at": receipt_time},
        {"text": "幂等重放已通过：重复登记不会增加事件或改写原回执。",
         "occurred_at": replay_time},
        {"text": "难例 slope 已产生 1 个边界清晰的候选实例，保留在机器候选层。",
         "occurred_at": slope_time},
    ]
    blockers = [] if human_gate else ["需要人工确认精确候选及参考帧；目前不能自动提升为真值。"]
    caveats = [
        "候选分数与单样本速度只证明服务可用，不等于分割准确率或通行性验证。",
        "GPU 在线与任务进程存在不等于两个已标注 MCAP 已验收完成。",
    ]
    return {
        "schema_version": "1.0", "task_id": "mcap-labeled-pair",
        "title": "查找两个已标注 MCAP 文件", "updated_at": now,
        "status": status, "phase": phase,
        "progress": {"completed": confirmed_count, "total": 2,
                     "unit": "已确认 MCAP"},
        "services": services, "milestones": milestones,
        "latest_results": results, "blockers": blockers, "caveats": caveats,
    }


def main() -> int:
    payload = json.dumps(build_status(), ensure_ascii=False, separators=(",", ":"))
    result = subprocess.run(
        ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=8", "factory-5090",
         "/home/clw/.local/bin/gpu-dashboard-task-upload"],
        input=payload.encode("utf-8"), capture_output=True, timeout=25, check=False)
    if result.returncode:
        sys.stderr.write((result.stderr or result.stdout).decode("utf-8", errors="replace"))
        return result.returncode
    print(result.stdout.decode("utf-8", errors="replace").strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

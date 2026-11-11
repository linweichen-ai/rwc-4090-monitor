#!/usr/bin/env python3
"""Read-only NVIDIA telemetry collector for the public dual-node dashboard.

Only allowlisted, bounded fields are uploaded. Full commands, paths, raw PIDs,
GPU UUIDs, hostnames and credentials are never included in the payload.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import secrets
import subprocess
import tempfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path


ENDPOINT = "https://rwc-4090-live-data.chenlinwei.chatgpt.site/api/dashboard"
NODE_NAMES = {
    "dual-4090": "NVIDIA GeForce RTX 4090",
    "dual-5090": "NVIDIA GeForce RTX 5090",
}
SYSTEM_USERS = {"root", "gdm", "display", "nvidia-persistenced"}


def iso_z(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def run_text(args: list[str], timeout: float = 8.0) -> str:
    return subprocess.run(
        args,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        timeout=timeout,
        env={**os.environ, "LC_ALL": "C"},
    ).stdout


def atomic_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            json.dump(value, handle, ensure_ascii=False, sort_keys=True)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(name, 0o600)
        os.replace(name, path)
    finally:
        try:
            os.unlink(name)
        except FileNotFoundError:
            pass


def load_state(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        if (isinstance(value, dict) and isinstance(value.get("instance"), str)
                and isinstance(value.get("seq"), int)
                and isinstance(value.get("salt"), str)):
            return value
    except (OSError, ValueError):
        pass
    return {
        "instance": "i-" + secrets.token_hex(8),
        "seq": 0,
        "salt": secrets.token_hex(16),
    }


def load_owner_map(path: Path | None) -> dict[str, str]:
    if path is None or not path.exists():
        return {"clw": "clw"}
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("owner map must be an object")
    result: dict[str, str] = {}
    for key, label in value.items():
        if not isinstance(key, str) or not isinstance(label, str) or not (1 <= len(label) <= 32):
            raise ValueError("invalid owner map entry")
        result[key] = label
    return result


def owner_label(username: str, mapping: dict[str, str], salt: str) -> str:
    if username in mapping:
        return mapping[username]
    if username in SYSTEM_USERS or username.startswith("systemd-"):
        return "系统"
    digest = hashlib.sha256((salt + "\0" + username).encode()).hexdigest()[:6]
    return "用户-" + digest


def parse_number(value: str, *, integer: bool = False):
    value = value.strip()
    if value in {"", "-", "[N/A]", "N/A"}:
        return None
    try:
        number = float(value)
    except ValueError:
        return None
    return int(round(number)) if integer else round(number, 2)


def read_gpus() -> tuple[list[dict], dict[str, int]]:
    fields = [
        "index", "name", "uuid", "utilization.gpu", "memory.used",
        "memory.total", "temperature.gpu", "power.draw",
    ]
    text = run_text([
        "nvidia-smi", "--query-gpu=" + ",".join(fields),
        "--format=csv,noheader,nounits",
    ])
    gpus: list[dict] = []
    uuid_to_index: dict[str, int] = {}
    for row in csv.reader(text.splitlines()):
        if len(row) != len(fields):
            raise RuntimeError("unexpected gpu row")
        index = int(row[0].strip())
        total = int(round(float(row[5].strip())))
        gpus.append({
            "index": index,
            "name": row[1].strip(),
            "utilization_percent": parse_number(row[3], integer=True),
            "memory_used_mib": int(round(float(row[4].strip()))),
            "memory_total_mib": total,
            "temperature_c": parse_number(row[6], integer=True),
            "power_watts": parse_number(row[7]),
            "processes": [],
        })
        uuid_to_index[row[2].strip()] = index
    return sorted(gpus, key=lambda item: item["index"]), uuid_to_index


def read_pmon() -> list[dict]:
    text = run_text(["nvidia-smi", "pmon", "-c", "1", "-s", "um"], timeout=10.0)
    rows: list[dict] = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split(None, 11)
        if len(parts) < 12:
            continue
        try:
            gpu_index = int(parts[0])
            pid = int(parts[1])
        except ValueError:
            continue
        rows.append({
            "gpu_index": gpu_index,
            "pid": pid,
            "type": parts[2],
            "sm": parse_number(parts[3], integer=True),
            "fb": parse_number(parts[9], integer=True) or 0,
            "command": os.path.basename(parts[11])[:64] or "unknown",
        })
    return rows


def read_process(pid: int) -> tuple[str, int, str] | None:
    try:
        text = run_text(["ps", "-o", "user=,etimes=,comm=", "-p", str(pid)], timeout=3.0).strip()
    except (subprocess.SubprocessError, OSError):
        return None
    parts = text.split(None, 2)
    if len(parts) != 3:
        return None
    try:
        elapsed = max(0, int(parts[1]))
    except ValueError:
        return None
    return parts[0], elapsed, os.path.basename(parts[2])[:64] or "unknown"


def collect(node_id: str, state_path: Path, owner_map_path: Path | None) -> dict:
    if node_id not in NODE_NAMES:
        raise ValueError("unsupported node")
    state = load_state(state_path)
    mapping = load_owner_map(owner_map_path)
    gpus, _ = read_gpus()
    if len(gpus) != 2 or any(NODE_NAMES[node_id] not in gpu["name"] for gpu in gpus):
        raise RuntimeError("gpu identity mismatch")
    by_index = {gpu["index"]: gpu for gpu in gpus}
    now = datetime.now(timezone.utc)
    for proc in read_pmon():
        gpu = by_index.get(proc["gpu_index"])
        if gpu is None:
            continue
        detail = read_process(proc["pid"])
        if detail is None:
            username, elapsed, command = "unknown", 0, proc["command"]
        else:
            username, elapsed, command = detail
        started = now - timedelta(seconds=elapsed)
        identity = f"{username}\0{proc['pid']}\0{iso_z(started)}"
        job_alias = "job-" + hashlib.sha256((state["salt"] + identity).encode()).hexdigest()[:8]
        kind = {"C": "compute", "G": "graphics", "C+G": "mixed"}.get(proc["type"], "unknown")
        memory = int(proc["fb"])
        gpu["processes"].append({
            "owner": owner_label(username, mapping, state["salt"]),
            "process": command,
            "kind": kind,
            "job_alias": job_alias,
            "started_at": iso_z(started),
            "runtime_seconds": elapsed,
            "memory_used_mib": min(memory, gpu["memory_total_mib"]),
            "memory_percent": round(100 * memory / gpu["memory_total_mib"], 2),
            "gpu_util_percent": proc["sm"],
        })
    for gpu in gpus:
        gpu["processes"].sort(key=lambda item: item["memory_used_mib"], reverse=True)
    state["seq"] += 1
    atomic_json(state_path, state)
    return {
        "schema_version": "2.0",
        "node_id": node_id,
        "collector_instance_id": state["instance"],
        "sample_seq": state["seq"],
        "sampled_at": iso_z(now),
        "gpus": gpus,
        "notes": [
            "用户名按本机映射表显示；未映射账号使用稳定别名。",
            "进程运行时长来自操作系统，近似表示占卡时间，不等于连续 GPU 活跃时长。",
        ],
    }


def upload(snapshot: dict, token: str) -> dict:
    body = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    request = urllib.request.Request(
        ENDPOINT,
        data=body,
        method="PUT",
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            "User-Agent": "gpu-dashboard-collector/2.0",
        },
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        if response.status != 200:
            raise RuntimeError(f"upload rejected: HTTP {response.status}")
        return json.loads(response.read(65537).decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--node", required=True, choices=sorted(NODE_NAMES))
    parser.add_argument("--interval", type=int, default=30)
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--collect-only", action="store_true")
    parser.add_argument("--state-dir", type=Path,
                        default=Path.home() / ".local/state/gpu-dashboard")
    parser.add_argument("--owner-map", type=Path,
                        default=Path.home() / ".config/gpu-dashboard/owner-map.json")
    args = parser.parse_args()
    if not (15 <= args.interval <= 3600):
        parser.error("interval must be 15..3600 seconds")
    token = os.environ.get("GPU_DASHBOARD_TOKEN", "")
    if not args.collect_only and len(token) < 24:
        parser.error("GPU_DASHBOARD_TOKEN is missing or too short")
    state_path = args.state_dir / args.node / "state.json"
    while True:
        started = time.monotonic()
        try:
            snapshot = collect(args.node, state_path, args.owner_map)
            if args.collect_only:
                print(json.dumps(snapshot, ensure_ascii=False, indent=2))
            else:
                result = upload(snapshot, token)
                print(json.dumps({
                    "time": snapshot["sampled_at"],
                    "node": args.node,
                    "seq": snapshot["sample_seq"],
                    "accepted": bool(result.get("accepted")),
                    "duplicate": bool(result.get("duplicate")),
                }, ensure_ascii=False), flush=True)
        except (OSError, ValueError, RuntimeError, subprocess.SubprocessError,
                urllib.error.URLError, json.JSONDecodeError) as error:
            print(json.dumps({
                "time": iso_z(datetime.now(timezone.utc)),
                "node": args.node,
                "error": type(error).__name__,
            }), flush=True)
            if args.once or args.collect_only:
                return 1
        if args.once or args.collect_only:
            return 0
        remaining = args.interval - (time.monotonic() - started)
        time.sleep(max(1.0, remaining))


if __name__ == "__main__":
    raise SystemExit(main())


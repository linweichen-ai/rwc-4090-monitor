#!/bin/sh
set -eu
. "$HOME/.config/gpu-dashboard/dual-5090.env"
exec curl --fail-with-body --silent --show-error \
  -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GPU_DASHBOARD_TOKEN" \
  --data-binary @- \
  "https://rwc-4090-live-data.chenlinwei.chatgpt.site/api/dashboard/task"

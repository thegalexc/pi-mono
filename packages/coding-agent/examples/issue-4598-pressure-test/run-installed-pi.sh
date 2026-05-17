#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

exec pi \
  --no-context-files \
  --no-extensions \
  --no-skills \
  --tools tall_image \
  -e "$DIR/tall-image-tool.js" \
  "$(cat "$DIR/prompt.txt")"

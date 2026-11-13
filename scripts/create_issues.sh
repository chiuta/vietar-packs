#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
gh label create "good first issue" --color 7057ff --force >/dev/null
while IFS= read -r t; do
  [ -n "$t" ] && gh issue create --title "$t" --label "good first issue" --body "See CONTRIBUTING.md. Ask questions in this issue — we are happy to help."
done < good-first-issues.txt

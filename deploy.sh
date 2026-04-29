#!/usr/bin/env bash
# 한 번에 의존성 설치 → 빌드 → PM2 재시작
# (git pull 은 직접 수행한 뒤에 실행할 것)
# 사용법: ./deploy.sh
#
# 전제: ecosystem.config.js 의 두 앱(travel-api, travel-web)이 이미 한 번이라도
#       pm2 start ecosystem.config.js 로 등록되어 있어야 함.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

log() { printf '\n\033[1;36m[deploy]\033[0m %s\n' "$*"; }

log "nest: npm ci"
( cd nest && npm ci )

log "nest: build"
( cd nest && npm run build )

log "next: npm ci"
( cd next && npm ci )

log "next: build"
( cd next && npm run build )

log "PM2 재시작 (없으면 새로 등록)"
if pm2 describe travel-api > /dev/null 2>&1 && pm2 describe travel-web > /dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

log "완료"
pm2 status

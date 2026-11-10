#!/usr/bin/env bash
# Морьтон Эмч — iPhone апп (Mac + Xcode). Нэг команд:
#   ./mobile/build-ios.sh              → Xcode-д нээнэ (утсаа залгаад ▶ дарж туршина)
#   TEAM_ID=XXXXXXXXXX ./mobile/build-ios.sh archive
#                                      → архивлаад Organizer нээнэ → «Distribute App» → TestFlight
set -euo pipefail
cd "$(dirname "$0")"
command -v xcodebuild >/dev/null || { echo "❌ Xcode суугаагүй байна (App Store → Xcode)"; exit 1; }
./scripts/prepare.sh ios
if [ "${1:-open}" = "archive" ]; then
  : "${TEAM_ID:?TEAM_ID=Apple Developer Team ID (developer.apple.com → Membership)}"
  ARCHIVE="$PWD/build/MoritonVet.xcarchive"
  WS=ios/App/App.xcworkspace; [ -d "$WS" ] && TARGET=(-workspace "$WS") || TARGET=(-project ios/App/App.xcodeproj)
  xcodebuild "${TARGET[@]}" -scheme App -configuration Release -destination 'generic/platform=iOS' \
    -archivePath "$ARCHIVE" -allowProvisioningUpdates DEVELOPMENT_TEAM="$TEAM_ID" CODE_SIGN_STYLE=Automatic archive
  open "$ARCHIVE"
  echo "📦 Organizer нээгдлээ → Distribute App → TestFlight & App Store"
else
  npx cap open ios
fi

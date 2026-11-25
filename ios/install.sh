#!/bin/bash
# Морьтон Эмч — iPhone-д суулгах (нэг команд)
#   bash <(curl -fsSL https://raw.githubusercontent.com/Moriton-tech/Moriton/v2/ios/install.sh)
set -euo pipefail
say()  { printf "\n▸ %s\n" "$1"; }
fail() { printf "\n✗ %s\n" "$1"; exit 1; }

REPO="https://github.com/Moriton-tech/Moriton"
BRANCH="${BRANCH:-v2}"
SRC="$HOME/moriton-emch"
TEAM_ID="${TEAM_ID:-FCY9Y2B5SG}"
BUNDLE_ID="mn.moriton.emch"
BUILD="$HOME/Library/Developer/Xcode/DerivedData/MoritonEmch-cli"

command -v xcodebuild >/dev/null || fail "Xcode суугаагүй байна."

say "Кодыг татаж байна ($BRANCH)"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch -q --depth 1 origin "$BRANCH"
  git -C "$SRC" checkout -q -B "$BRANCH" FETCH_HEAD
else
  rm -rf "$SRC"
  git clone -q --depth 1 -b "$BRANCH" "$REPO" "$SRC"
fi
cd "$SRC/ios"

if ! command -v xcodegen >/dev/null; then
  command -v brew >/dev/null || fail "XcodeGen хэрэгтэй. Эхлээд Homebrew суулгана: https://brew.sh — дараа нь энэ командыг дахин ажиллуул."
  say "XcodeGen суулгаж байна"
  brew install xcodegen
fi

say "Xcode төсөл үүсгэж байна"
xcodegen generate >/dev/null
xattr -cr . 2>/dev/null || true

say "Холбосон iPhone хайж байна"
JSON="$(mktemp)"
xcrun devicectl list devices --json-output "$JSON" >/dev/null 2>&1 || true
DEVICE=$(/usr/bin/python3 - "$JSON" <<'PY'
import json, sys
try:
    data = json.load(open(sys.argv[1]))
except Exception:
    sys.exit(0)
for d in data.get("result", {}).get("devices", []):
    hw = d.get("hardwareProperties", {})
    conn = d.get("connectionProperties", {})
    if hw.get("platform") == "iOS" and hw.get("deviceType") == "iPhone" and conn.get("tunnelState") != "unavailable":
        print(d.get("identifier", ""))
        break
PY
)
[ -n "$DEVICE" ] || fail "iPhone олдсонгүй. Кабелиар холбоод түгжээг тайлж «Trust» дарна. Settings → Privacy & Security → Developer Mode асаалттай байх ёстой."

say "Бүтээж байна (анх удаа 1–2 минут)"
if ! xcodebuild -project MoritonEmch.xcodeproj -scheme MoritonEmch -configuration Debug \
     -destination "generic/platform=iOS" -derivedDataPath "$BUILD" -allowProvisioningUpdates \
     DEVELOPMENT_TEAM="$TEAM_ID" build > "$SRC/build.log" 2>&1; then
  grep -E "error:" "$SRC/build.log" | head -20 || true
  fail "Бүтээлт амжилтгүй. Дээрх улаан мөрүүдийг (эсвэл $SRC/build.log-ийн төгсгөлийг) Claude-д илгээнэ үү."
fi

APP="$BUILD/Build/Products/Debug-iphoneos/MoritonEmch.app"
xattr -cr "$APP" 2>/dev/null || true
say "iPhone руу суулгаж байна"
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" "$BUNDLE_ID" >/dev/null 2>&1 || \
  echo "  Апп нээгдэхгүй бол iPhone дээр: Settings → General → VPN & Device Management → хөгжүүлэгчийг Trust."
say "Суулаа. iPhone дээрээ «Морьтон Эмч»-ийг нээнэ үү."

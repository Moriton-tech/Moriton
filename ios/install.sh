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
best = None
for d in data.get("result", {}).get("devices", []):
    hw = d.get("hardwareProperties", {})
    conn = d.get("connectionProperties", {})
    if hw.get("platform") != "iOS" or hw.get("deviceType") != "iPhone":
        continue
    if conn.get("tunnelState") == "unavailable":
        continue
    # Кабелиар холбогдсон утсыг эхэлж сонгоно (Wi-Fi-аар «танигдсан» өөр утас байж болно)
    score = (2 if conn.get("transportType") == "wired" else 0) + (1 if conn.get("tunnelState") == "connected" else 0)
    if best is None or score > best[0]:
        best = (score, d.get("identifier", ""), d.get("deviceProperties", {}).get("name", ""))
if best:
    print(best[1] + "|" + best[2])
PY
)
DEVICE_NAME="${DEVICE#*|}"; DEVICE="${DEVICE%%|*}"
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
say "iPhone руу суулгаж байна: ${DEVICE_NAME:-$DEVICE}"
OK=0
for TRY in 1 2 3; do
  if xcrun devicectl device install app --device "$DEVICE" "$APP" > "$SRC/install.log" 2>&1; then OK=1; break; fi
  echo "  Утастай холбогдож чадсангүй ($TRY/3). iPhone-ийн түгжээг тайлаад дэлгэцийг асаалттай байлгана уу…"
  sleep 6
done
if [ "$OK" != 1 ]; then
  grep -m3 "ERROR" "$SRC/install.log" || true
  fail "Апп бүтсэн ч утас руу хуулж чадсангүй. iPhone-ийн түгжээг тайл → кабелийг салгаад дахин залга → «Trust» гарвал дар → энэ командыг дахин ажиллуул."
fi
xcrun devicectl device process launch --device "$DEVICE" "$BUNDLE_ID" >/dev/null 2>&1 || \
  echo "  Апп нээгдэхгүй бол iPhone дээр: Settings → General → VPN & Device Management → хөгжүүлэгчийг Trust."
say "Суулаа. iPhone дээрээ «Морьтон Эмч»-ийг нээнэ үү."

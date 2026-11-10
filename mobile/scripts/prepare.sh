#!/usr/bin/env bash
# Морьтон Эмч — native төслийг бэлтгэнэ (android | ios). build-android.sh / build-ios.sh / GitHub Actions дуудна.
set -euo pipefail
PLATFORM="${1:?android эсвэл ios}"
cd "$(dirname "$0")/.."
VERSION_NAME="${VERSION_NAME:-$(node -p "require('./package.json').version")}"
VERSION_CODE="${VERSION_CODE:-$(date +%y%m%d%H)}"

if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
[ -d "$PLATFORM" ] || npx cap add "$PLATFORM"
npx capacitor-assets generate --"$PLATFORM" \
  --iconBackgroundColor '#022438' --iconBackgroundColorDark '#022438' \
  --splashBackgroundColor '#022438' --splashBackgroundColorDark '#022438'

if [ "$PLATFORM" = "android" ]; then
  MAN=android/app/src/main/AndroidManifest.xml
  # Үзлэг, шинжилгээний зураг авахад камер хэрэгтэй
  grep -q 'android.permission.CAMERA' "$MAN" || perl -0pi -e 's#(<uses-permission android:name="android.permission.INTERNET" />)#$1\n    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera" android:required="false" />#' "$MAN"
  perl -pi -e "s/versionCode \\d+/versionCode ${VERSION_CODE}/; s/versionName \"[^\"]*\"/versionName \"${VERSION_NAME}\"/" android/app/build.gradle
else
  PLIST=ios/App/App/Info.plist
  if [ -x /usr/libexec/PlistBuddy ]; then
    pb() { /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PLIST"; }
    pb NSCameraUsageDescription "Үзлэг, шинжилгээний зураг авахад камер ашиглана"
    pb NSPhotoLibraryUsageDescription "Үзлэг, шинжилгээний зураг хавсаргахад зургийн сан ашиглана"
    pb CFBundleDevelopmentRegion "mn"
    /usr/libexec/PlistBuddy -c "Set :ITSAppUsesNonExemptEncryption false" "$PLIST" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PLIST"
  fi
fi
npx cap sync "$PLATFORM"
echo "✅ $PLATFORM төсөл бэлэн (хувилбар ${VERSION_NAME} / ${VERSION_CODE})"

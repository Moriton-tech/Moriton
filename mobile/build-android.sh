#!/usr/bin/env bash
# Морьтон Эмч — Android апп бүтээх (Android Studio / SDK суусан компьютер дээр).
#   ./build-android.sh            → debug APK (утсанд шууд суулгаж турших)
#   ./build-android.sh release    → Play Store-д оруулах AAB (keystore шаардана, README-г үз)
set -euo pipefail
cd "$(dirname "$0")"
./scripts/prepare.sh android
cd android
if [ "${1:-debug}" = "release" ]; then
  : "${KEYSTORE:?KEYSTORE=keystore файлын зам}" "${KEYSTORE_PASSWORD:?}" "${KEY_ALIAS:?}" "${KEY_PASSWORD:?}"
  ./gradlew bundleRelease \
    -Pandroid.injected.signing.store.file="$KEYSTORE" -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$KEY_ALIAS" -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
  echo "📦 app/build/outputs/bundle/release/app-release.aab → Play Console-д оруулна"
else
  ./gradlew assembleDebug
  echo "📦 app/build/outputs/apk/debug/app-debug.apk → утсанд суулгаж туршина"
fi

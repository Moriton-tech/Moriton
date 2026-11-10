# 📱 Морьтон Эмч — эмч нарт зориулсан апп (Android / iPhone)

Морьтон системийг Play Store / App Store-оор тараах **багц**. Апп нээгдэхэд системийн
`https://moriton-tech.github.io/Moriton/` хаягийг дотроо ачаалж, эмч нэвтэрмэгц **«Миний ажил»** нүүр рүү ордог.

- Системд засвар оруулаад GitHub-ын `main` руу push хийхэд апп **автоматаар шинэчлэгдэнэ** — store-д дахин оруулах шаардлагагүй.
  Store-д шинэ хувилбар зөвхөн нэр, лого, зөвшөөрөл (камер г.м.) өөрчлөгдөхөд л хэрэгтэй.
- Апп ID: `mn.moriton.vet` · нэр: «Морьтон Эмч» (`capacitor.config.json`)
- ⚠️ Апп дотроос **хэвлэх** боломжгүй (утасны WebView хэвлэх цонх нээдэггүй). Хэвлэх ажлыг компьютер дээрээс хийнэ.
- ⚠️ Доорх бүтээх скриптүүдийг Claude-ийн орчинд **бүрэн ажиллуулж шалгаагүй** (Android SDK, Xcode байхгүй) —
  зөвхөн төсөл үүсгэх алхам (`scripts/prepare.sh android`) шалгагдсан. Эхний бүтээлт дээр алдаа гарвал мэдэгдээрэй.

## 1. Android

### А. Хамгийн хялбар — GitHub өөрөө бүтээнэ (компьютерт юм суулгахгүй)
1. GitHub → репо → **Actions** → «Android апп (Морьтон Эмч)» → **Run workflow**.
2. 5–8 минутын дараа доор **Artifacts → moriton-vet-android** гарна. Дотор нь `app-debug.apk` —
   Android утас руу илгээгээд шууд суулгаж туршина.
3. Play Store-д оруулах `app-release.aab` авахын тулд гарын үсгийн түлхүүр (keystore) нэг удаа үүсгэнэ (Mac Terminal):
   ```bash
   keytool -genkey -v -keystore moriton.keystore -alias moriton -keyalg RSA -keysize 2048 -validity 10000
   base64 -i moriton.keystore | pbcopy     # → clipboard
   ```
   GitHub → Settings → Secrets and variables → Actions → New secret:
   `ANDROID_KEYSTORE_BASE64` (clipboard), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (= `moriton`), `ANDROID_KEY_PASSWORD`.
   **Keystore файл, нууц үгээ алдаж болохгүй** — алдвал апп-аа шинэчилж чадахгүй болно. Репод бүү оруул.
4. Run workflow дахин → `app-release.aab` → Play Console → Testing → **Internal testing** → Create release → AAB оруулна → эмч нарын Gmail-ийг тестерээр нэмнэ → холбоосыг илгээнэ.

### Б. Өөрийн компьютер дээр (Android Studio суусан бол)
```bash
./mobile/build-android.sh            # debug APK
KEYSTORE=~/moriton.keystore KEYSTORE_PASSWORD=... KEY_ALIAS=moriton KEY_PASSWORD=... ./mobile/build-android.sh release
```

## 2. iPhone (Mac + Xcode)
```bash
./mobile/build-ios.sh                              # Xcode-д нээнэ — утсаа залгаад ▶
TEAM_ID=XXXXXXXXXX ./mobile/build-ios.sh archive   # архив → Organizer → Distribute App → TestFlight
```
Эхний удаа Xcode → Settings → Accounts-д Apple Developer бүртгэлээр нэвтэрсэн байх ёстой.
App Store Connect-д `mn.moriton.vet` Bundle ID-тай апп үүсгэсний дараа TestFlight → Internal Testing-д эмч нарыг нэмнэ.

## 3. Store-ийн шаардлага — урьдчилан мэдэх зүйл
- **Google Play (хувийн бүртгэл):** нийтэд (Production) гаргахын өмнө 12 тестертэй, 14 хоногийн хаалттай тест шаарддаг.
  Эмч нарт өгөхөд Internal / Closed testing холбоос хангалттай — Production заавал биш.
- **Apple:** нэг байгууллагын ажилтнуудад зориулсан аппыг нийтийн App Store-д ихэвчлэн буцаадаг (Guideline 3.2).
  Зам: **TestFlight** (build 90 хоногт дуусна → 3 сар тутам `build-ios.sh archive`), эсвэл App Review-д
  «unlisted distribution» гэж тэмдэглэн илгээж, зөвхөн холбоосоор татдаг болгох.
- Хоёр store хоёулаа шалгагчид **туршилтын нэвтрэх нэр, нууц үг** шаардана — системд «Туршилт» хэрэглэгч үүсгээд өгнө.
- Нууцлалын бодлогын (Privacy Policy) вэб хаяг хэрэгтэй.

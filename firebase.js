import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  terminate, clearIndexedDbPersistence,
  doc, collection, onSnapshot, setDoc, getDoc, deleteDoc, getDocs, query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCB20uvd_XsWju91IERQGs6yGFYSBSUx10",
  authDomain: "moriton-4ecc0.firebaseapp.com",
  projectId: "moriton-4ecc0",
  storageBucket: "moriton-4ecc0.firebasestorage.app",
  messagingSenderId: "472702397725",
  appId: "1:472702397725:web:3f19849c1f61bd4e7805f4",
  measurementId: "G-M3E63XQKX5"
};

const fbApp = initializeApp(firebaseConfig);
// ── 💾 Firestore дискэн кэш (IndexedDB) ───────────────────────
// Кэшгүй үед хуудас нээх бүрд БҮХ document дахин татагддаг байсан —
// утсан дээр, удаан сүлжээнд энэ нь хэдэн арван секунд авдаг.
// persistentLocalCache-тай бол: эхний удаа л бүтнээр татна, дараа нь
// зөвхөн ӨӨРЧЛӨГДСӨН document сүлжээгээр ирнэ (delta sync).
// Олон таб зэрэг нээвэл persistentMultipleTabManager зохицуулна.
let db;
try {
  db = initializeFirestore(fbApp, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalAutoDetectLongPolling: true // мобайл/прокси сүлжээнд стрим тасрахаас хамгаална
  });
  console.info('[FB] Дискэн кэш идэвхтэй (delta sync)');
} catch (e) {
  console.warn('[FB] Дискэн кэш эхлүүлж чадсангүй, санах ойн кэш ашиглана:', e && e.message);
  db = getFirestore(fbApp);
}
const storage = getStorage(fbApp);
const auth  = getAuth(fbApp);

// ── Collection/Document reference ─────────────────────────────
// colName дотор тусдаа document авах
window.__fbColDoc = (colName, docId) => doc(db, colName, docId);

// Хуучин кодтой нийцтэй (clinic/key document — migration хэрэгцээнд)
window.__fbDocFor = (key) => doc(db, 'clinic', key);

// ── Document бичих ─────────────────────────────────────────────
window.__fbSetDoc = setDoc;

// ── Document нэг удаа унших ────────────────────────────────────
window.__fbGetDoc = getDoc;

// ── Document устгах ────────────────────────────────────────────
window.__fbDeleteDoc = deleteDoc;

// ── Collection document бүрийг нэг удаа татах ─────────────────
window.__fbColQuery = async (colName) => {
  const snap = await getDocs(collection(db, colName));
  return snap.docs;
};

// ── Collection real-time сонсох ────────────────────────────────
// callback: (changes: [{type, docId, data}], allIds, isFirst) дуудна
//   allIds  — сервэр дээр ОДОО байгаа бүх document ID (reconcile хийхэд)
//   isFirst — энэ collection-ийн анхны snapshot мөн эсэх
// Анхны snapshot ХООСОН байсан ч заавал callback дуудна — эс бөгөөс
// локал кэштэй тулгах (reconcile) боломжгүй болж, компьютер бүр
// өөр өөр жагсаалт харуулдаг.
window.__fbColListen = (colName, callback, onError, opts) => {
  // opts.orderField + opts.limitN өгвөл зөвхөн сүүлийн N бичлэгийг сонсоно
  // (лог мэтийн хязгааргүй өсдөг collection-д сүлжээний ачааллыг багасгана)
  let ref = collection(db, colName);
  if (opts && opts.orderField && opts.limitN) {
    ref = query(ref, orderBy(opts.orderField, 'desc'), limit(opts.limitN));
  }
  let firstSnap = true, firstServerPending = true;
  return onSnapshot(ref, { includeMetadataChanges: true }, (snap) => {
    const changes = snap.docChanges().map(change => ({
      type: change.type,       // 'added' | 'modified' | 'removed'
      docId: change.doc.id,
      data: change.doc.data()
    }));
    const allIds = snap.docs.map(d => d.id);
    const isFirst = firstSnap;
    firstSnap = false;
    // ⚠️ fromCache: энэ snapshot дискэн кэшнээс ирсэн үү (сервэрээс биш).
    // Кэшнээс ирсэн жагсаалтыг сервэрийн үнэн жагсаалт гэж үзэж болохгүй.
    const fromCache = !!(snap.metadata && snap.metadata.fromCache);
    // Холболтын бодит төлөв: fromCache=false гэдэг нь сервэртэй ЯГ ОДОО
    // холбоотой гэсэн үг. Метадата солигдох бүрд дуудагдана (шүүлтээс өмнө).
    try { if (window.__fbNoteConn) window.__fbNoteConn(fromCache); } catch (e) {}
    // Сервэрээс ИРСЭН АНХНЫ snapshot — локал кэшийг сервэртэй тулгах цорын
    // ганц зөв мөч. Кэштэй үед эхний snapshot кэшнээс ирдэг бөгөөд агуулга нь
    // ижил бол дараагийн сервэрийн snapshot-д changes ХООСОН байна. Тиймээс
    // зөвхөн changes-ээр шалгавал тулгах алхам хэзээ ч ажиллахгүй өнгөрнө.
    const isFirstServer = !fromCache && firstServerPending;
    if (!fromCache) firstServerPending = false;
    if (changes.length > 0 || isFirst || isFirstServer) {
      callback(changes, allIds, isFirst, fromCache, isFirstServer);
    }
  }, onError || (() => {}));
};

// ── Нэг document real-time сонсох ─────────────────────────────
window.__fbDocListen = (docRef, callback, onError) => {
  return onSnapshot(docRef, callback, onError || (() => {}));
};

// ── onSnapshot backward compat ─────────────────────────────────
window.__fbOnSnapshot = onSnapshot;

// ── 🔑 Нэвтрэлт/токен баталгаажуулах ──────────────────────────
// Anonymous хэрэглэгчийн ID токен 1 цагийн хугацаатай. Сүлжээ тасарсан
// үед SDK-ийн автомат шинэчлэлт (securetoken.googleapis.com) унаж,
// хуудсыг дахин ачаалах хүртэл ХУУЧИН токенээр хүсэлт явуулсаар байдаг.
// Storage тэр токеныг хүлээж авахгүй — 403 (storage/unauthorized).
// Тиймээс зураг илгээхийн ӨМНӨ токеныг шалгана, шаардвал сэргээнэ.
window.__fbEnsureAuth = async (forceRefresh) => {
  if (!auth.currentUser) {
    await signInAnonymously(auth);          // нэвтрэлт унасан бол дахин үүсгэнэ
  }
  if (!auth.currentUser) throw new Error('Нэвтрэлт үүсгэж чадсангүй');
  await auth.currentUser.getIdToken(!!forceRefresh); // forceRefresh=true → шинэ токен
  return auth.currentUser.uid;
};

// Токены эрүүл мэндийг шалгах (оношилгоонд)
window.__fbTokenCheck = async () => {
  try {
    if (!auth.currentUser) return { ok: false, reason: 'нэвтрэлт байхгүй' };
    const res = await auth.currentUser.getIdTokenResult(true); // албадан шинэчилнэ
    return { ok: true, expires: res.expirationTime || '' };
  } catch (e) {
    return { ok: false, reason: (e && (e.code || e.message)) || 'алдаа' };
  }
};

// ── Firebase Storage ───────────────────────────────────────────
window.__fbUploadImage = async (path, dataUrl) => {
  const put = async () => {
    const r = storageRef(storage, path);
    await uploadString(r, dataUrl, "data_url");
    return await getDownloadURL(r);
  };
  try {
    await window.__fbEnsureAuth(false);
    return await put();
  } catch (err) {
    const code = (err && (err.code || err.message)) + '';
    // 403 гарвал токен хуучирсан байж магадгүй — НЭГ УДАА шинэ токеноор дахин оролдоно.
    // (Дүрэм үнэхээр хаасан бол хоёр дахь оролдлого мөн уналаа гэж алдаа буцаана.)
    if (/unauthorized|permission|403/i.test(code)) {
      console.warn('[FB] Storage 403 — токен шинэчилж дахин оролдож байна…');
      await window.__fbEnsureAuth(true);
      return await put();
    }
    throw err;
  }
};
window.__fbDeleteImageByUrl = async (url) => {
  try {
    const r = storageRef(storage, url);
    await deleteObject(r);
  } catch (e) {}
};

// ── Оношилгоонд зориулсан мэдээлэл ─────────────────────────────
// Storage алдаа гарахад «нэвтрэлт байна уу, аль bucket руу бичиж
// байна вэ» гэдгийг мэдэхгүй бол шалтгааныг таах болно.
window.__fbAuthInfo = () => ({
  ready:     !!window.__fbReady,
  uid:       auth.currentUser ? auth.currentUser.uid : null,
  anonymous: auth.currentUser ? !!auth.currentUser.isAnonymous : null,
  bucket:    firebaseConfig.storageBucket || '',
  projectId: firebaseConfig.projectId || '',
  online:    (typeof navigator !== 'undefined') ? navigator.onLine : true
});

// Тодорхой замаар устгах (оношилгооны туршилтын файлыг цэвэрлэхэд)
window.__fbDeletePath = async (path) => {
  await deleteObject(storageRef(storage, path));
};

// ── Дискэн кэш ҮНЭХЭЭР ажиллаж байгаа эсэх ────────────────────
// initializeFirestore алдаа өгөхгүй ч IndexedDB боломжгүй бол SDK
// чимээгүй санах ойн кэш рүү буудаг. Тиймээс IndexedDB дотор Firestore-ийн
// сан үүссэн эсэхээр шалгана.
window.__fbPersistenceCheck = async () => {
  try {
    if (!window.indexedDB) return { ok: false, detail: 'IndexedDB байхгүй' };
    if (indexedDB.databases) {
      const dbs = await indexedDB.databases();
      const fs = dbs.filter(d => (d.name || '').startsWith('firestore/'));
      if (fs.length) return { ok: true, detail: fs.map(d => d.name).join(', ') };
      return { ok: false, detail: 'Firestore-ийн сан үүсээгүй' };
    }
    // Safari-ийн хуучин хувилбар: databases() байхгүй → нээж үзнэ
    return await new Promise((res) => {
      const rq = indexedDB.open('__mt_probe');
      rq.onsuccess = () => { try { rq.result.close(); indexedDB.deleteDatabase('__mt_probe'); } catch (e) {} res({ ok: true, detail: 'IndexedDB нээгдэж байна (Firestore сан шалгах боломжгүй)' }); };
      rq.onerror = () => res({ ok: false, detail: 'IndexedDB нээгдэхгүй' });
    });
  } catch (e) { return { ok: false, detail: e && e.message }; }
};

// ── Кэш цэвэрлэх (гацсан төхөөрөмжид) ─────────────────────────
window.__fbResetCache = async () => {
  try { await terminate(db); } catch (e) {}
  try { await clearIndexedDbPersistence(db); } catch (e) { console.warn('[FB] кэш цэвэрлэх:', e && e.message); }
};

// ── Device ID — echo guard ─────────────────────────────────────
window.__fbDeviceId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ── Firebase Anonymous Auth ────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.__fbReady = true;
    window.dispatchEvent(new Event("firebase-ready"));
  } else {
    signInAnonymously(auth).catch((err) => {
      console.error("Firebase anonymous auth failed:", err);
      window.__fbReady = true;
      window.dispatchEvent(new Event("firebase-ready"));
    });
  }
});

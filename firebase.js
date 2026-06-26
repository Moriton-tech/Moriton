import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, doc, onSnapshot, setDoc, getDoc
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
const db = getFirestore(fbApp);
const storage = getStorage(fbApp);
const auth = getAuth(fbApp);

// ── Firestore хандалт ──────────────────────────────────────────────────────
// ⚠️ Firestore document бүр дээд тал нь 1MB.
// Тиймээс STATE-ийн талбар бүрийг ТУСДАА document болгоно:
//   clinic/horses, clinic/exams, clinic/fins, ...
window.__fbDocFor = (key) => doc(db, "clinic", key);
window.__fbOnSnapshot = onSnapshot;
window.__fbSetDoc = setDoc;
window.__fbGetDoc = getDoc; // нэг удаагийн хурдан унших — login-д users шууд ачаалахад ашиглана

// ── Firebase Storage ───────────────────────────────────────────────────────
// Зургийг Firebase Storage-д хадгалж, татах URL-ийг буцаана.
window.__fbUploadImage = async (path, dataUrl) => {
  const r = storageRef(storage, path);
  await uploadString(r, dataUrl, "data_url");
  return await getDownloadURL(r);
};
// Storage доторх зургийг устгана (download URL-аар).
window.__fbDeleteImageByUrl = async (url) => {
  try {
    const r = storageRef(storage, url);
    await deleteObject(r);
  } catch (e) { /* аль хэдийн устсан байж болно */ }
};

// ── Device ID — echo guard ─────────────────────────────────────────────────
window.__fbDeviceId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ── Firebase Anonymous Auth ────────────────────────────────────────────────
// Хэрэглэгч системд нэвтрэхийн өмнө Firebase-д anonymous буюу нэрээ нууцалсан
// байдлаар автоматаар нэвтэрнэ. Firestore Rules request.auth != null шалгана.
// Ингэснээр зөвхөн манай апп-аас ирсэн хүсэлт зөвшөөрөгдөж,
// гадны скрипт, Postman, хакерын шууд хүсэлт бүгд БЛОКЛОГДОНО.
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Auth амжилттай — Firebase бэлэн
    window.__fbReady = true;
    window.dispatchEvent(new Event("firebase-ready"));
  } else {
    // Auth байхгүй бол anonymous нэвтрэлт хийнэ
    signInAnonymously(auth).catch((err) => {
      console.error("Firebase anonymous auth failed:", err);
      // Auth амжилтгүй болсон ч апп ажиллах боломжийг үлдээнэ (offline)
      window.__fbReady = true;
      window.dispatchEvent(new Event("firebase-ready"));
    });
  }
});

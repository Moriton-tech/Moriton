import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getFirestore, doc, collection, onSnapshot, setDoc, getDoc, deleteDoc, getDocs, query, orderBy, limit
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
const db    = getFirestore(fbApp);
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
// callback: (changes: [{type, docId, data}]) дуудна
window.__fbColListen = (colName, callback, onError) => {
  const colRef = collection(db, colName);
  return onSnapshot(colRef, (snap) => {
    const changes = snap.docChanges().map(change => ({
      type: change.type,       // 'added' | 'modified' | 'removed'
      docId: change.doc.id,
      data: change.doc.data()
    }));
    if (changes.length > 0) callback(changes);
  }, onError || (() => {}));
};

// ── Нэг document real-time сонсох ─────────────────────────────
window.__fbDocListen = (docRef, callback, onError) => {
  return onSnapshot(docRef, callback, onError || (() => {}));
};

// ── onSnapshot backward compat ─────────────────────────────────
window.__fbOnSnapshot = onSnapshot;

// ── Firebase Storage ───────────────────────────────────────────
window.__fbUploadImage = async (path, dataUrl) => {
  const r = storageRef(storage, path);
  await uploadString(r, dataUrl, "data_url");
  return await getDownloadURL(r);
};
window.__fbDeleteImageByUrl = async (url) => {
  try {
    const r = storageRef(storage, url);
    await deleteObject(r);
  } catch (e) {}
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

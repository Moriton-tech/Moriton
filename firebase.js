import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
  import {
    getFirestore, doc, onSnapshot, setDoc, getDoc
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
  import {
    getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";

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

  // ⚠️ Firestore document бүр дээд тал нь 1MB.
  // Тиймээс STATE-ийн талбар бүрийг ТУСДАА document болгоно:
  //   clinic/horses, clinic/exams, clinic/fins, ...
  window.__fbDocFor = (key) => doc(db, "clinic", key);
  window.__fbOnSnapshot = onSnapshot;
  window.__fbSetDoc = setDoc;
  window.__fbGetDoc = getDoc; // нэг удаагийн хурдан унших — login-д users шууд ачаалахад ашиглана

  // Зургийг Firebase Storage-д хадгалж, татах URL-ийг буцаана.
  // dataUrl = "data:image/jpeg;base64,...."
  window.__fbUploadImage = async (path, dataUrl) => {
    const r = storageRef(storage, path);
    await uploadString(r, dataUrl, "data_url");
    return await getDownloadURL(r);
  };
  // Storage доторх зургийг устгана (download URL-аар).
  window.__fbDeleteImageByUrl = async (url) => {
    try {
      const r = storageRef(storage, url); // gs:// эсвэл https download URL аль аль нь зөвшөөрнө
      await deleteObject(r);
    } catch (e) { /* аль хэдийн устсан байж болно */ }
  };

  // 🆔 Device ID — echo guard-д ашиглана (timestamp биш)
  // Хуудас дахин ачаалах бүрт шинэ ID үүснэ
  window.__fbDeviceId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  window.__fbReady = true;
  window.dispatchEvent(new Event("firebase-ready"));
/* ============================================================
   Морьтон Адууны Төв — PWA удирдлага
   ------------------------------------------------------------
   • Service worker бүртгэх
   • Шинэ хувилбарыг АВТОМАТААР ачаалах (аюулгүй мөчийг хүлээнэ)
   • "Суулгах" товч (Chrome / Edge)
   • Интернэт тасарсныг мэдэгдэх заагч
   ============================================================ */
(function () {
  'use strict';

  var SW_URL = './sw.js';
  var UPDATE_CHECK_MS = 60 * 1000; // минут тутам шинэ хувилбар шалгана

  /* ── 0. Дэмжлэг шалгах ─────────────────────────────────────── */
  if (!('serviceWorker' in navigator)) return;

  var host = location.hostname;
  var secure =
    location.protocol === 'https:' || host === 'localhost' || host === '127.0.0.1';
  if (!secure) {
    console.info(
      '[PWA] Service worker зөвхөн HTTPS эсвэл localhost дээр ажиллана. ' +
        'Одоо: ' + location.protocol + ' — PWA идэвхгүй.'
    );
    return;
  }

  /* ── 1. Автомат шинэчлэлт ──────────────────────────────────── */
  // Хуудсыг ачаалах үед аль хэдийн SW эзэмшиж байсан эсэх.
  // Анхны суулгалт дээр controllerchange гардаг тул шаардлагагүй reload-оос сэргийлнэ.
  var hadController = !!navigator.serviceWorker.controller;
  var reloadQueued = false;

  // Хэрэглэгч ажиллаж байх үед reload хийвэл бөглөж байсан өгөгдөл алдагдана.
  function userIsBusy() {
    var el = document.activeElement;
    if (
      el &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
      !el.readOnly &&
      !el.disabled
    ) {
      return true;
    }
    if (document.querySelector('.mod-bd.show, .drawer-bd.show, dialog[open]')) {
      return true;
    }
    return false;
  }

  function reloadWhenIdle() {
    if (!userIsBusy()) {
      location.reload();
      return;
    }
    setTimeout(reloadWhenIdle, 4000); // модал/талбар хаагдахыг хүлээнэ
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloadQueued) return;
    reloadQueued = true;
    reloadWhenIdle();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register(SW_URL)
      .then(function (reg) {
        var check = function () {
          reg.update().catch(function () {});
        };
        setInterval(check, UPDATE_CHECK_MS);
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) check();
        });
        window.addEventListener('online', check);
      })
      .catch(function (err) {
        console.warn('[PWA] Service worker бүртгэгдсэнгүй:', err);
      });
  });

  /* ── 2. Суулгах товч ───────────────────────────────────────── */
  var deferredPrompt = null;
  var installBtn = null;

  function injectStyles() {
    if (document.getElementById('pwa-style')) return;
    var s = document.createElement('style');
    s.id = 'pwa-style';
    s.textContent =
      '#pwa-install{position:fixed;right:16px;bottom:16px;z-index:4000;' +
      'display:none;align-items:center;gap:8px;padding:11px 18px;border:0;' +
      'border-radius:999px;background:#022438;color:#e8c87a;cursor:pointer;' +
      "font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;" +
      'box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .15s ease}' +
      '#pwa-install:hover{transform:translateY(-2px)}' +
      '#pwa-install.on{display:flex}' +
      '#pwa-offline{position:fixed;left:50%;transform:translateX(-50%);' +
      'top:0;z-index:4500;display:none;padding:7px 20px;' +
      'border-radius:0 0 12px 12px;background:#b45309;color:#fff;' +
      "font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;" +
      'box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
      '#pwa-offline.on{display:block}' +
      '@media print{#pwa-install,#pwa-offline{display:none !important}}';
    document.head.appendChild(s);
  }

  function buildInstallBtn() {
    injectStyles();
    installBtn = document.createElement('button');
    installBtn.id = 'pwa-install';
    installBtn.type = 'button';
    installBtn.textContent = '⤓  Програм болгож суулгах';
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installBtn.classList.remove('on');
      });
    });
    document.body.appendChild(installBtn);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!installBtn) buildInstallBtn();
    installBtn.classList.add('on');
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    if (installBtn) installBtn.classList.remove('on');
  });

  /* ── 3. Офлайн заагч ───────────────────────────────────────── */
  // ⚠️ Энэ нь зөвхөн АНХААРУУЛГА. Өгөгдлийн оффлайн кэш энэ хувилбарт байхгүй.
  var offlineBar = null;

  function paintNet() {
    if (!offlineBar) return;
    if (navigator.onLine) offlineBar.classList.remove('on');
    else offlineBar.classList.add('on');
  }

  function initNetIndicator() {
    injectStyles();
    offlineBar = document.createElement('div');
    offlineBar.id = 'pwa-offline';
    offlineBar.textContent =
      '⚠  Интернэт холболт тасарсан — өөрчлөлт хадгалагдахгүй байж болзошгүй';
    document.body.appendChild(offlineBar);
    paintNet();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetIndicator);
  } else {
    initNetIndicator();
  }
  window.addEventListener('online', paintNet);
  window.addEventListener('offline', paintNet);
})();

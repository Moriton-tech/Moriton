/* ============================================================
   🎃 HALLOWEEN — Морьтон систем (2026-10-30 → 2026-10-31 24:00)
   ------------------------------------------------------------
   • ЗӨВХӨН харагдах чимэглэл: том аалзнууд + аалзны тор. Сарьсан багваахай БАЙХГҮЙ. Аалзны толгой = Хонгорын царай.
   • Төхөөрөмжийн цагаар 2026-11-01 00:00 болмогц өөрөө бүрмөсөн унтарна
     (нээлттэй байгаа таб дээр ч минут тутам шалгана).
   • Өгөгдөл, Firebase, бизнес логикт огт хүрэхгүй.
   • Гараар унтраах: зүүн доод буланд 🕷 товч (төхөөрөмж бүрд тусдаа мэдэгдэнэ).
     Шууд унтраах: хаяг дээр ?halloween=off нэмнэ; асаах: ?halloween=on
   ============================================================ */
(function () {
  'use strict';

  var END = new Date(2026, 10, 1, 0, 0, 0).getTime();   // 11-р сарын 1, 00:00 (орон нутгийн цаг)
  var KEY = 'hw_off_2026';
  var TOAST_KEY = 'hw_toast_2026';
  var SCARE_KEY = 'hw_scare_2026';

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* URL-аар шууд удирдах */
  try {
    var q = new URLSearchParams(location.search).get('halloween');
    if (q === 'off') lsSet(KEY, '1');
    if (q === 'on') lsSet(KEY, '0');
    if (q === 'scare') { lsSet(KEY, '0'); lsSet(SCARE_KEY, '0'); }   // шалгахад: дахин цочооно
  } catch (e) {}

  if (Date.now() >= END) return;           // хугацаа дууссан — юу ч хийхгүй

  var layer = null, toggle = null, themeMeta = null, origTheme = null, timer = null;

  /* ── SVG: нэг аалз ──────────────────────────────────── */
  function spiderSVG(uid, face) {
    face = face || 'icons/halloween-face.jpg';
    var Lleg = [
      'M50 52 L26 28 L8 40 L4 66',
      'M49 58 L20 46 L4 62 L2 86',
      'M49 64 L20 70 L6 88 L8 110',
      'M51 70 L30 92 L22 112 L24 118'
    ];
    function mirror(d) {
      return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, function (m, x, y) {
        return (120 - parseFloat(x)) + ' ' + y;
      });
    }
    var left = Lleg.map(function (d) { return '<path d="' + d + '"/>'; }).join('');
    var right = Lleg.map(function (d) { return '<path d="' + mirror(d) + '"/>'; }).join('');
    return '' +
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<defs>' +
        '<clipPath id="hwc' + uid + '"><circle cx="60" cy="43" r="20"/></clipPath>' +
        '<radialGradient id="hwb' + uid + '" cx="40%" cy="30%" r="80%">' +
          '<stop offset="0" stop-color="#4a3a5e"/><stop offset="1" stop-color="#120b1a"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<g fill="none" stroke="#150d1e" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">' +
        '<g class="hw-legs-l">' + left + '</g>' +
        '<g class="hw-legs-r">' + right + '</g>' +
      '</g>' +
      /* хэвлий */
      '<ellipse cx="60" cy="80" rx="17" ry="20" fill="url(#hwb' + uid + ')"/>' +
      '<path d="M54 70 L66 70 L60 80 L66 90 L54 90 L60 80 Z" fill="#F28C28" opacity=".9"/>' +
      /* толгой — ХОНГОРЫН ЦАЙРАЙ (icons/halloween-face.jpg) */
      '<circle cx="60" cy="43" r="22" fill="#F28C28"/>' +
      '<image href="' + face + '" x="40" y="23" width="40" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#hwc' + uid + ')"/>' +
      '<circle cx="60" cy="43" r="20" fill="none" stroke="#1b1026" stroke-width="1.6"/>' +
      /* соёо */
      '<path d="M54 63 L55.8 70 L57.6 63 M62.4 63 L64.2 70 L66 63" stroke="#e9e2ee" stroke-width="1.8" fill="#e9e2ee" stroke-linejoin="round" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* ── SVG: булангийн аалзны тор ─────────────────────── */
  function webSVG() {
    var R = [40, 80, 120, 160], n = 6, i, j, d = '';
    var pts = [];
    for (i = 0; i <= n; i++) {
      var a = (Math.PI / 2) * (i / n);                 // 0..90°
      pts.push([Math.cos(a), Math.sin(a)]);
      d += 'M0 0 L' + (pts[i][0] * 160).toFixed(1) + ' ' + (pts[i][1] * 160).toFixed(1) + ' ';
    }
    for (j = 0; j < R.length; j++) {
      for (i = 0; i < n; i++) {
        var x1 = pts[i][0] * R[j], y1 = pts[i][1] * R[j];
        var x2 = pts[i + 1][0] * R[j], y2 = pts[i + 1][1] * R[j];
        var mx = (x1 + x2) / 2 * 0.86, my = (y1 + y2) / 2 * 0.86;   // дундаа хонхойно
        d += 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' ';
      }
    }
    return '<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  /* ── Угсрах ─────────────────────────────────────────── */
  function build() {
    if (layer) return;
    layer = document.createElement('div');
    layer.id = 'hw-layer';
    layer.setAttribute('aria-hidden', 'true');

    var html = '';
    html += '<div class="hw-web l">' + webSVG() + '</div>';
    html += '<div class="hw-web r">' + webSVG() + '</div>';

    /* [x%, хэмжээ(px), доош бууx гүн, bob хугацаа, sway хугацаа, саатал] — бүгд ТОМ */
    var hangers = [
      ['9%',  'clamp(120px,32vw,175px)', '16vh', '7.5s', '5.2s', '0s'],
      ['91%', 'clamp(145px,36vw,215px)', '24vh', '9s',   '6.1s', '1.4s'],
      ['58%', 'clamp(110px,28vw,150px)',  '10vh', '6.5s', '4.6s', '2.6s']
    ];
    hangers.forEach(function (h, k) {
      html += '<div class="hw-hang" style="--x:' + h[0] + ';--s:' + h[1] + ';--drop:' + h[2] +
              ';--bob:' + h[3] + ';--sway:' + h[4] + ';--delay:' + h[5] + '">' +
              '<div class="hw-sway">' + spiderSVG('h' + k) + '</div></div>';
    });
    html += '<div class="hw-crawl">' + spiderSVG('c', 'icons/halloween-face2.jpg') + '</div>';

    layer.innerHTML = html;
    document.body.appendChild(layer);

    toggle = document.createElement('button');
    toggle.id = 'hw-toggle';
    toggle.type = 'button';
    toggle.title = 'Halloween чимэглэлийг унтраах';
    toggle.setAttribute('aria-label', 'Halloween чимэглэлийг унтраах');
    toggle.textContent = '🕷';
    toggle.addEventListener('click', function () { lsSet(KEY, '1'); disable(); });
    document.body.appendChild(toggle);

    /* Хөтөчийн дээд хэсгийн өнгө (PWA/утас) */
    themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) { origTheme = themeMeta.getAttribute('content'); themeMeta.setAttribute('content', '#1b1026'); }

    document.body.classList.add('hw-on');
    greet();
    arm();
  }

  /* Өдөрт нэг удаа богино мэндчилгээ */
  function greet() {
    var today = new Date().toDateString();
    if (lsGet(TOAST_KEY) === today) return;
    lsSet(TOAST_KEY, today);
    var t = document.createElement('div');
    t.id = 'hw-toast';
    t.textContent = '🎃 Аймшигтай Halloween! Аалзнууд таны ажлыг харж байна 🕷️';
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 600);
    setTimeout(function () { t.classList.remove('show'); }, 5200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 6000);
  }


  /* ── Цочоох: дурын ТОВЧ эхний удаа дарахад ганцхан удаа ─────────
     • Дуугүй. Товшилтыг хаахгүй (товч ердийнхөөрөө ажиллана).
     • ~1.6 сек, нэг л удаа анивчина (гэрэлд мэдрэмтгий хүнд аюулгүй).
     • Төхөөрөмж бүрд нэг л удаа. Дахин шалгах: ?halloween=scare           */
  var SCARE_SEL = 'button, .btn, [role="button"], input[type="button"], input[type="submit"], .ni';
  var scareArmed = false;

  function onFirstClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest(SCARE_SEL);
    if (!el || el.id === 'hw-toggle') return;
    if (lsGet(SCARE_KEY) === '1' || Date.now() >= END) { disarm(); return; }
    lsSet(SCARE_KEY, '1');
    disarm();
    setTimeout(scare, 120);          // товчийн үйлдэл эхлээд явчихсаны дараа
  }
  function arm() {
    if (scareArmed || lsGet(SCARE_KEY) === '1') return;
    document.addEventListener('click', onFirstClick, true);
    scareArmed = true;
  }
  function disarm() {
    if (!scareArmed) return;
    document.removeEventListener('click', onFirstClick, true);
    scareArmed = false;
  }
  function scare() {
    if (document.getElementById('hw-scare')) return;
    var o = document.createElement('div');
    o.id = 'hw-scare';
    o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<div class="hw-scare-bg"></div><div class="hw-scare-spider">' + spiderSVG('s') + '</div>';
    document.body.appendChild(o);
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 1900);
  }

  function disable() {
    disarm();
    document.body.classList.remove('hw-on');
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    if (toggle && toggle.parentNode) toggle.parentNode.removeChild(toggle);
    layer = null; toggle = null;
    if (themeMeta && origTheme) themeMeta.setAttribute('content', origTheme);
  }

  /* Хугацаа дуусмагц өөрөө унтарна (таб нээлттэй байсан ч) */
  function tick() {
    if (Date.now() >= END) { disable(); if (timer) clearInterval(timer); }
  }

  function start() {
    if (lsGet(KEY) === '1') return;
    build();
    timer = setInterval(tick, 60000);
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();

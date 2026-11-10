// ============================================================
// ops.js — 2026-11-10 (2026.11.03-ны шуурхай хурлын саналууд)
// ============================================================
//  ⚙️ Системийн тохиргоо — бүлэг (таб) + хайлт
//  🐎 Үржүүлгийн адуу — тусдаа хоногийн тариф, залгах сануулгагүй, тусдаа цэс
//  🌅 Өглөөний хуваарилалт — ахлах эмч байрлагч адууг эмчид хуваарилна → эмчийн даалгавар,
//     «Өдрийн мэдээ» текст (хуулах / илгээх / хэвлэх)
//  📱 Миний ажил — эмчийн апп-ын нүүр
//  💊 ERP-ээс эмийн нэршил импортлох (Excel) + «зөвхөн каталогоос» горим
//
// Өгөгдөл (шинэ collection үүсгээгүй):
//   clinic_config.opsCfg = { breed:{dailyFee, owners[], callReminder}, medStrict, erp:{ms,by,file,count} }
//   inps.breeding  = true | false | (байхгүй → эзний нэрээр автомат)
//   horses.breeding = true | false
//   inps.assigns   = { 'YYYY-MM-DD': { docId, docName, task, by, ms } }
//   clinic_config.medCatalog[] += { code, src:'erp', aliases[], cat }
// ============================================================

// ── Тохиргоо ─────────────────────────────────────────────────
const BREED_DEFAULT = { dailyFee: 40000, owners: [], callReminder: false };
function opsCfg() { return (STATE.opsCfg && typeof STATE.opsCfg === 'object') ? STATE.opsCfg : {}; }
function breedCfg() {
  const b = Object.assign({}, BREED_DEFAULT, opsCfg().breed || {});
  b.dailyFee = parseFloat(b.dailyFee); if (isNaN(b.dailyFee) || b.dailyFee < 0) b.dailyFee = BREED_DEFAULT.dailyFee;
  b.owners = (Array.isArray(b.owners) ? b.owners : []).map(x => String(x || '').trim()).filter(Boolean);
  b.callReminder = !!b.callReminder;
  return b;
}
function saveOpsCfg(patch) {
  STATE.opsCfg = Object.assign({}, opsCfg(), patch || {});
  lsSet('mt_ops_cfg', STATE.opsCfg);
  try { fbSaveClinicConfig(); } catch (e) { console.error('opsCfg save', e); }
}
function _opsKey(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
function _opsWeekday(dateStr) { return ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'][new Date(dateStr + 'T12:00:00').getDay()]; }
function _opsModal(title, bodyHTML, maxW) {
  let m = document.getElementById('ops-modal');
  if (!m) {
    m = document.createElement('div'); m.className = 'mod-bd'; m.id = 'ops-modal';
    m.innerHTML = '<div class="mod" id="ops-modal-box"><div class="mod-h"><span class="mod-title" id="ops-modal-title"></span><button class="btn btn-r btn-xs" onclick="closeModal(\'ops-modal\')">✕</button></div><div class="mod-body" id="ops-modal-body"></div></div>';
    document.body.appendChild(m);
  }
  document.getElementById('ops-modal-box').style.maxWidth = (maxW || 720) + 'px';
  document.getElementById('ops-modal-title').innerHTML = title;
  document.getElementById('ops-modal-body').innerHTML = bodyHTML;
  openModal('ops-modal');
}
function _opsPrint(title, html) {
  const w = window.open('', '_blank');
  if (!w) { toast('Хэвлэх цонх нээгдсэнгүй — popup зөвшөөрнө үү', 'err'); return; }
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>' + escHTML(title) + '</title><style>' +
    'body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:14mm}h1{font-size:16px;margin:0 0 4px}h2{font-size:13px;margin:14px 0 4px}' +
    'table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}th{background:#eee}' +
    '.r{text-align:right}.m{color:#555;font-size:11px}.sig{margin-top:22px;display:flex;gap:40px;font-size:12px}@media print{button{display:none}}' +
    '</style></head><body>' + html + '<script>setTimeout(function(){window.print()},250)<\/script></body></html>');
  w.document.close();
}
function _opsCSV(name, rows) {
  const csv = rows.map(r => r.map(c => { const s = String(c == null ? '' : c); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ── Нүүр хуудас / нэвтэрсний дараах буулт ────────────────────
function isNativeApp() {
  try { if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return true; } catch (_) {}
  return /MoritonVet/i.test(navigator.userAgent || '');
}
function homePage() {
  if (canAccess('dashboard')) return 'dashboard';
  const p = ALL_PAGES.find(x => x.id !== 'dashboard' && canAccess(x.id));
  return p ? p.id : 'dashboard';
}
function opsLanding() {
  let narrow = false; try { narrow = window.matchMedia('(max-width: 820px)').matches; } catch (_) {}
  if (canAccess('my') && (isNativeApp() || narrow)) { nav('my'); return; }
  if (!canAccess(STATE.activePage || 'dashboard')) nav(homePage());
}

// ============================================================
// 🐎 ҮРЖҮҮЛГИЙН АДУУ
// ============================================================
function breedOwnerMatch(owner) {
  const o = _opsKey(owner); if (!o) return false;
  return breedCfg().owners.some(k => { k = _opsKey(k); return k && o.includes(k); });
}
function _breedHorse(rec) { return (rec && rec.horseId && typeof recById === 'function') ? recById('horses', rec.horseId) : null; }
// Байрлагч / үзлэгийн бичлэг үржүүлгийн адууных уу: бичлэг дээрх тэмдэглэгээ → адууны карт → эзний нэр
function isBreedingInp(i) {
  if (!i) return false;
  if (i.breeding === true) return true;
  if (i.breeding === false) return false;
  const h = _breedHorse(i);
  if (h && h.breeding === true) return true;
  if (h && h.breeding === false) return false;
  return breedOwnerMatch(i.owner);
}
const isBreedingExam = isBreedingInp;
function breedCanEdit() { return canEditData() || (STATE.user && ['Менежер', 'Санхүү'].includes(STATE.user.role)); }
function setInpBreeding(inpId, on) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId)); if (!i) return;
  if (!breedCanEdit()) { toast('⛔ Засах эрхгүй', 'err'); renderIDetail(); return; }
  on = !!on;
  const oldFee = getDailyFee(i);
  i.breeding = on; i.ms = nowMs();
  // Хоногийн төлбөрийг гараар тусгайлан тохируулаагүй (эсвэл нөгөө ангиллын анхдагчтай тэнцүү) бол шинэ ангиллын тариф руу шилжинэ
  if (i.dailyFee != null && i.dailyFee !== '' && [DEFAULT_DAILY_FEE, breedCfg().dailyFee].includes(parseFloat(i.dailyFee))) delete i.dailyFee;
  const h = _breedHorse(i);
  if (h) { h.breeding = on; h.ms = nowMs(); fbSaveRecord('horses', h); }
  saveAll(); fbSaveRecord('inps', i);
  const newFee = getDailyFee(i);
  writeLog(on ? 'Үржүүлгийн адуу гэж тэмдэглэв' : 'Үржүүлгийн адуу тэмдэглэгээг авав', i.id, i.horse + ' — ' + (i.owner || ''), 'Хоногийн төлбөр ' + fmt(oldFee) + ' → ' + fmt(newFee), inpExamNum(i));
  if (i.discharged && oldFee !== newFee) { try { recomputeDischargedInvoice(i, 'үржүүлгийн тариф ' + fmt(newFee)); } catch (e) { console.error(e); } }
  try { renderInpatient(); renderIDetail(); updateBadges(); } catch (_) {}
  toast(on ? '🐎 Үржүүлгийн адуу · хоног ' + fmt(newFee) : 'Үйлчлүүлэгчийн адуу · хоног ' + fmt(newFee), 'ok');
}
// Байрлан эмчлүүлэх → Адууны мэдээлэл таб дээрх мөр
function breedInfoRowHTML(i) {
  const on = isBreedingInp(i), auto = (i.breeding !== true && i.breeding !== false);
  return `<div class="breed-row ${on ? 'on' : ''}">
    <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:800;font-size:13px;flex:1;min-width:200px">
      <input type="checkbox" ${on ? 'checked' : ''} ${breedCanEdit() ? '' : 'disabled'} onchange="setInpBreeding('${escHTML(i.id)}', this.checked)" style="width:18px;height:18px">
      🐎 Үржүүлгийн адуу
    </label>
    <span class="muted" style="font-size:11.5px">${on ? 'Хоногийн төлбөр <b>' + fmt(getDailyFee(i)) + '</b> · эзэнд залгах сануулгагүй' + (auto ? ' · эзний нэрээр автоматаар танигдсан' : '') : 'Асаавал хоногийн төлбөр ' + fmt(breedCfg().dailyFee) + ' болж, залгах сануулга гарахгүй'}</span>
  </div>`;
}

// ── Тооцоо ───────────────────────────────────────────────────
function _brDaysUpTo(i, ms) {
  const adm = parseFloat(i.admittedMs) || dateStrToMs(i.admittedDate) || 0;
  if (!adm) return 0;
  const a = new Date(adm), admStart = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  if (ms < admStart) return 0;
  return inpatientDays(adm, ms);
}
// Тухайн сард ногдох хоног, дүн (хуримтлалаар): хоног = сарын эцэс хүртэлх хоног − өмнөх сарын эцэс хүртэлх хоног
function brMonthCalc(i, ym) {
  const y = +ym.slice(0, 4), m = +ym.slice(5, 7);
  const mStart = new Date(y, m - 1, 1).getTime(), mEnd = new Date(y, m, 1).getTime() - 1;
  const adm = parseFloat(i.admittedMs) || dateStrToMs(i.admittedDate) || 0;
  const outMs = i.discharged ? (parseFloat(i.dischargedMs) || (i.dischargedDate ? dateStrToMs(i.dischargedDate) + 12 * 3600000 : nowMs())) : nowMs();
  const admDate = i.admittedDate || localDateStr(new Date(adm)), outDate = i.discharged ? (i.dischargedDate || localDateStr(new Date(outMs))) : '';
  const first = ym + '-01', last = ym + '-31';
  if (admDate > last || (outDate && outDate < first)) return null;
  const endRef = Math.min(outMs, mEnd);
  const days = Math.max(0, _brDaysUpTo(i, endRef) - _brDaysUpTo(i, mStart - 1));
  const fee = getDailyFee(i);
  let svc = 0, med = 0, logN = 0;
  (Array.isArray(i.log) ? i.log : []).forEach(l => {
    const d = (l.date || '').slice(0, 10); if (d < first || d > last) return;
    logN++;
    const s = (l.services || []).reduce((a, b) => a + (parseFloat(b && b.price) || 0), 0);
    const md = (l.meds || []).reduce((a, b) => a + (parseFloat(b && b.price) || 0), 0);
    svc += s; med += md;
    const rest = (parseFloat(l.amount) || 0) - s - md; if (rest > 0) svc += rest; // хуучин бичлэг: задаргаагүй дүн
  });
  const exam = (admDate >= first && admDate <= last) ? (parseFloat(i.initialAmount) || 0) : 0;
  let home = 0;
  if (i.discharged && outDate >= first && outDate <= last) { try { const f = _inpDischargeFinOf(i); if (f && f.breakdown) home = parseFloat(f.breakdown.homeMeds) || 0; } catch (_) {} }
  const accom = days * fee;
  return { days, fee, accom, svc, med, exam, home, logN, total: accom + svc + med + exam + home, admDate, outDate };
}
function brStatus(i) {
  if (!i.discharged) return { t: 'Байрлаж буй', cls: 'b-p', due: 0 };
  let f = null; try { f = _inpDischargeFinOf(i); } catch (_) {}
  if (!f) return { t: 'Гарсан', cls: '', due: 0 };
  const due = (typeof getDueAmount === 'function') ? getDueAmount(f) : (f.paid ? 0 : (parseFloat(f.amount) || 0));
  return due > 0 ? { t: 'Төлөгдөөгүй ' + fmt(due), cls: 'b-r', due } : { t: 'Төлөгдсөн', cls: 'b-g', due: 0 };
}
function breedingInps() { return (STATE.inps || []).filter(isBreedingInp); }

const BR = { tab: 'in', month: '', q: '' };
function setBrTab(t) { BR.tab = t; renderBreeding(); }
function renderBreeding() {
  const body = document.getElementById('br-body'); if (!body) return;
  if (!BR.month) BR.month = todayStr().slice(0, 7);
  const all = breedingInps();
  const act = all.filter(i => !i.discharged);
  const ym = BR.month;
  const rows = all.map(i => ({ i, c: brMonthCalc(i, ym) })).filter(x => x.c);
  const mTotal = rows.reduce((a, x) => a + x.c.total, 0), mDays = rows.reduce((a, x) => a + x.c.days, 0);
  const unpaid = all.reduce((a, i) => a + brStatus(i).due, 0);
  const accrued = act.reduce((a, i) => a + Math.max(0, getInpFullTotal(i) - getInpPrepaidTotal(i)), 0);
  const cfg = breedCfg();
  const sub = document.getElementById('br-sub');
  if (sub) sub.textContent = 'Хоногийн тариф ' + fmt(cfg.dailyFee) + ' · одоо ' + act.length + ' адуу байрлаж байна';
  const q = _opsKey(BR.q);
  const hit = i => !q || _opsKey([i.horse, i.owner, i.diagnosis, i.location, i.docName, inpExamNum(i)].join(' ')).includes(q);
  let html = `
    <div class="br-sum">
      <div class="br-sum-c"><div class="br-sum-n">${act.length}</div><div class="br-sum-l">🛏 Одоо байрлаж буй</div></div>
      <div class="br-sum-c"><div class="br-sum-n">${rows.length} <small>адуу · ${mDays} хоног</small></div><div class="br-sum-l">📅 ${escHTML(ym)} сард</div></div>
      <div class="br-sum-c"><div class="br-sum-n">${fmt(mTotal)}</div><div class="br-sum-l">🧾 Сарын хуримтлагдсан дүн</div></div>
      <div class="br-sum-c ${unpaid + accrued > 0 ? 'warn' : ''}"><div class="br-sum-n">${fmt(unpaid + accrued)}</div><div class="br-sum-l">💳 Төлөгдөөгүй <small>(нэхэмжилсэн ${fmt(unpaid)} + байрлаж буй ${fmt(accrued)})</small></div></div>
    </div>
    <div class="card">
      <div class="tabs" style="margin-bottom:12px">
        <button class="tab ${BR.tab === 'in' ? 'active' : ''}" onclick="setBrTab('in')">🛏 Байрлаж буй <span class="badge b-p" style="margin-left:4px">${act.length}</span></button>
        <button class="tab ${BR.tab === 'month' ? 'active' : ''}" onclick="setBrTab('month')">📅 Сарын тооцоо</button>
        <button class="tab ${BR.tab === 'exam' ? 'active' : ''}" onclick="setBrTab('exam')">🩺 Үзлэг (байрлаагүй)</button>
      </div>
      <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px">
        ${BR.tab !== 'in' ? `<div class="fld" style="margin:0"><label>Сар</label><input class="inp" type="month" value="${escHTML(ym)}" onchange="BR.month=this.value||todayStr().slice(0,7);renderBreeding()"></div>` : ''}
        <div class="fld" style="margin:0;flex:1;min-width:180px"><label>Хайх</label><input class="inp" id="br-q" value="${escHTML(BR.q)}" placeholder="Зүс, эзэн, онош, байрлал..." oninput="BR.q=this.value;_brDebounced()"></div>
        ${BR.tab === 'month' ? `<button class="btn btn-sm" onclick="brExportCSV()">📄 CSV</button><button class="btn btn-sm btn-p" onclick="brPrintMonth()">🖨 Хэвлэх</button>` : ''}
      </div>`;
  if (BR.tab === 'in') {
    const list = act.filter(hit).sort((a, b) => (a.admittedMs || 0) - (b.admittedMs || 0));
    html += list.length ? `<div class="br-list">${list.map(i => {
      const days = inpatientDays(i.admittedMs), ts = inpTreatStatus(i, todayStr()), d = inpDoctorOf(i), a = asgFor(i, todayStr());
      const total = getInpFullTotal(i);
      return `<div class="br-item" onclick="brOpen('${escHTML(i.id)}')">
        <div class="br-item-h"><span class="br-horse">🐎 ${escHTML(i.horse || '')}</span><span class="br-days">${days} хоног</span></div>
        <div class="br-meta">👤 ${escHTML(i.owner || '—')} · 📍 ${escHTML(i.location || 'байрлал заагаагүй')} · 👨‍⚕️ ${escHTML(a ? a.docName : (d ? d.name : (i.docName || '—')))} · орсон ${escHTML(i.admittedDate || '')}</div>
        <div class="br-diag">${escHTML(i.diagnosis || '—')}</div>
        <div class="br-item-f"><span class="badge ${ts === 'done' ? 'b-g' : ts === 'missing' ? 'b-r' : ''}">${ts === 'done' ? '📝 Өнөөдөр эмчилгээ хийсэн' : ts === 'missing' ? '📝 Өнөөдөр бичээгүй' : '📝 Орсон өдөр'}</span>
          ${i.severity ? '<span class="badge b-o">' + escHTML(i.severity) + '</span>' : ''}
          <span class="br-amt">${fmt(total)} <small>хуримтлагдсан</small></span></div>
      </div>`; }).join('')}</div>`
      : '<div class="empty"><div class="empty-em">🐎</div>Одоо байрлаж буй үржүүлгийн адуу алга<div class="muted" style="font-size:12px;margin-top:6px">Адууг «Байрлан эмчлүүлэх → Адууны мэдээлэл» дээр 🐎 гэж тэмдэглэх, эсвэл Тохиргоо → Эмнэлэг → Үржүүлгийн адуу хэсэгт эзний нэрийг оруулна.</div></div>';
  } else if (BR.tab === 'month') {
    const list = rows.filter(x => hit(x.i)).sort((a, b) => String(a.c.admDate).localeCompare(String(b.c.admDate)));
    const T = list.reduce((t, x) => { ['days', 'accom', 'svc', 'med', 'exam', 'home', 'total'].forEach(k => t[k] = (t[k] || 0) + x.c[k]); return t; }, {});
    html += list.length ? `<div class="tbl-wrap"><table><thead><tr><th>Адуу</th><th>Орсон → гарсан</th><th style="text-align:right">Хоног</th><th style="text-align:right">Хоногийн хөлс</th><th style="text-align:right">Үзлэг</th><th style="text-align:right">Эмчилгээ</th><th style="text-align:right">Эм</th><th style="text-align:right">Нийт</th><th>Төлөв</th></tr></thead><tbody>
      ${list.map(({ i, c }) => { const st = brStatus(i); return `<tr style="cursor:pointer" onclick="brOpen('${escHTML(i.id)}')"><td><b>${escHTML(i.horse || '')}</b><div class="muted" style="font-size:11px">${escHTML(i.owner || '')}${inpExamNum(i) ? ' · №' + escHTML(inpExamNum(i)) : ''}</div></td>
        <td style="white-space:nowrap">${escHTML(c.admDate)} → ${escHTML(c.outDate || '…')}</td><td style="text-align:right">${c.days}</td>
        <td style="text-align:right">${fmt(c.accom)}<div class="muted" style="font-size:10.5px">× ${fmt(c.fee)}</div></td><td style="text-align:right">${fmt(c.exam)}</td><td style="text-align:right">${fmt(c.svc)}</td><td style="text-align:right">${fmt(c.med + c.home)}</td>
        <td style="text-align:right" class="bold">${fmt(c.total)}</td><td><span class="badge ${st.cls}">${escHTML(st.t)}</span></td></tr>`; }).join('')}
      <tr style="font-weight:900;background:var(--input)"><td colspan="2">Нийт · ${list.length} адуу</td><td style="text-align:right">${T.days || 0}</td><td style="text-align:right">${fmt(T.accom || 0)}</td><td style="text-align:right">${fmt(T.exam || 0)}</td><td style="text-align:right">${fmt(T.svc || 0)}</td><td style="text-align:right">${fmt((T.med || 0) + (T.home || 0))}</td><td style="text-align:right">${fmt(T.total || 0)}</td><td></td></tr>
      </tbody></table></div>
      <div class="muted" style="font-size:11.5px;margin-top:8px">Сарын дүн нь тухайн сард ногдох хоног, тэр сард хийсэн эмчилгээ, эмээр хуримтлалаар бодогдсон. Нэхэмжлэх нь адуу гарах үед Санхүү цэсэнд нэг удаа үүснэ.</div>`
      : '<div class="empty"><div class="empty-em">📅</div>Энэ сард байрлан эмчлүүлсэн үржүүлгийн адуу алга</div>';
  } else {
    const first = ym + '-01', last = ym + '-31';
    const ex = (STATE.exams || []).filter(e => e && !e.inpatient && (e.date || '').slice(0, 10) >= first && (e.date || '').slice(0, 10) <= last && isBreedingExam(e))
      .filter(e => !q || _opsKey([e.horse, e.owner, e.diagnosis, e.docName, e.examNum].join(' ')).includes(q))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const sum = ex.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);
    html += ex.length ? `<div class="tbl-wrap"><table><thead><tr><th>Огноо</th><th>Адуу</th><th>Эмч</th><th>Онош</th><th>Үйлчилгээ</th><th style="text-align:right">Дүн</th></tr></thead><tbody>
      ${ex.map(e => `<tr><td style="white-space:nowrap">${escHTML((e.date || '').slice(0, 10))}</td><td><b>${escHTML(e.horse || '')}</b><div class="muted" style="font-size:11px">${escHTML(e.owner || '')}${e.examNum ? ' · №' + escHTML(e.examNum) : ''}</div></td><td>${escHTML(e.docName || '')}</td><td>${escHTML(e.diagnosis || '')}</td><td class="muted" style="font-size:11.5px">${escHTML((e.services || []).map(s => s && s.name).filter(Boolean).join(', '))}</td><td style="text-align:right" class="bold">${fmt(parseFloat(e.amount) || 0)}</td></tr>`).join('')}
      <tr style="font-weight:900;background:var(--input)"><td colspan="5">Нийт · ${ex.length} үзлэг</td><td style="text-align:right">${fmt(sum)}</td></tr></tbody></table></div>`
      : '<div class="empty"><div class="empty-em">🩺</div>Энэ сард үржүүлгийн адууны (байрлаагүй) үзлэг алга<div class="muted" style="font-size:12px;margin-top:6px">Үзлэгийг эзний нэрээр (Тохиргоо → Үржүүлгийн адуу) таньдаг.</div></div>';
  }
  html += '</div>';
  const keep = document.activeElement && document.activeElement.id === 'br-q';
  body.innerHTML = html;
  if (keep) { const el = document.getElementById('br-q'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
}
let __brT = null; function _brDebounced() { clearTimeout(__brT); __brT = setTimeout(renderBreeding, 250); }
function brOpen(inpId) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId)); if (!i) return;
  const days = inpatientDays(i.admittedMs, i.dischargedMs), fee = getDailyFee(i), st = brStatus(i), d = inpDoctorOf(i);
  const logs = (Array.isArray(i.log) ? i.log : []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const treat = getInpDailyTotal(i), exam = parseFloat(i.initialAmount) || 0;
  _opsModal('🐎 ' + escHTML(i.horse || '') + ' <span class="muted" style="font-size:12px;font-weight:600">· ' + escHTML(i.owner || '') + '</span>', `
    <div class="fg r3">
      <div class="fld"><label>Орсон → гарсан</label><div class="bold">${escHTML(i.admittedDate || '')} → ${escHTML(i.discharged ? (i.dischargedDate || '') : 'байрлаж байна')}</div></div>
      <div class="fld"><label>Хоног</label><div class="bold">${days}</div></div>
      <div class="fld"><label>Төлөв</label><div><span class="badge ${st.cls}">${escHTML(st.t)}</span></div></div>
      <div class="fld"><label>Байрлал</label><div class="bold">${escHTML(i.location || '—')}</div></div>
      <div class="fld"><label>Эмчлэгч эмч</label><div class="bold">${escHTML(d ? d.name : (i.docName || '—'))}</div></div>
      <div class="fld"><label>Үзлэгийн №</label><div class="bold">${escHTML(inpExamNum(i) || '—')}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Онош</label><div style="background:var(--input);padding:8px 10px;border-radius:8px;font-size:13px">${escHTML(i.diagnosis || '—')}</div></div>
    <div class="ch" style="margin-top:12px">💰 Тооцоо</div>
    <div class="tbl-wrap"><table><tbody>
      <tr><td>Анхны үзлэг</td><td style="text-align:right">${fmt(exam)}</td></tr>
      <tr><td>Хоногийн хөлс (${days} × ${fmt(fee)})</td><td style="text-align:right">${fmt(days * fee)}</td></tr>
      <tr><td>Өдөр тутмын эмчилгээ, эм</td><td style="text-align:right">${fmt(treat)}</td></tr>
      <tr style="font-weight:900"><td>Нийт</td><td style="text-align:right">${fmt(exam + days * fee + treat)}</td></tr>
    </tbody></table></div>
    <div class="ch" style="margin-top:12px">📋 Өдөр тутмын эмчилгээ <span class="ch-r">${logs.length}</span></div>
    ${logs.length ? `<div class="tbl-wrap" style="max-height:300px;overflow:auto"><table><thead><tr><th>Огноо</th><th>Эмч</th><th>T / P / R</th><th>Биеийн байдал · эмчилгээ</th><th>Эм</th><th style="text-align:right">Дүн</th></tr></thead><tbody>
      ${logs.map(l => `<tr><td style="white-space:nowrap">${escHTML((l.date || '').slice(0, 10))}${l.slot ? '<div class="muted" style="font-size:10.5px">' + escHTML(l.slot) + '</div>' : ''}</td><td>${escHTML(l.docName || '')}</td><td style="white-space:nowrap">${escHTML(l.temp || '—')} / ${escHTML(l.pulse || '—')} / ${escHTML(l.resp || '—')}</td><td style="font-size:12px">${l.diagnosis ? '<b>' + escHTML(l.diagnosis) + '</b><br>' : ''}${escHTML(l.note || '')}${(l.services || []).length ? '<div class="muted" style="font-size:11px">' + escHTML(l.services.map(s => s.name).join(', ')) + '</div>' : ''}</td><td style="font-size:11.5px">${escHTML((l.meds || []).map(m => (m.name || m) + (m.qty ? ' ' + m.qty + (m.unit || '') : '')).join(', '))}</td><td style="text-align:right">${fmt(parseFloat(l.amount) || 0)}</td></tr>`).join('')}
    </tbody></table></div>` : '<div class="muted" style="font-size:12px">Эмчилгээний бичлэг алга</div>'}
    <div class="row" style="justify-content:flex-end;gap:6px;margin-top:12px">
      ${canAccess('inpatient') ? `<button class="btn btn-sm btn-p" onclick="closeModal('ops-modal');openInpHorse('${escHTML(i.id)}','treat')">🏥 Байрлан эмчлүүлэх хэсэгт нээх</button>` : ''}
      <button class="btn btn-sm" onclick="closeModal('ops-modal')">Хаах</button>
    </div>`, 820);
}
function _brMonthRows() {
  const q = _opsKey(BR.q);
  return breedingInps().map(i => ({ i, c: brMonthCalc(i, BR.month) })).filter(x => x.c)
    .filter(x => !q || _opsKey([x.i.horse, x.i.owner, x.i.diagnosis, x.i.location, x.i.docName].join(' ')).includes(q))
    .sort((a, b) => String(a.c.admDate).localeCompare(String(b.c.admDate)));
}
function brExportCSV() {
  const rows = [['Адуу', 'Эзэн', 'Үзлэгийн №', 'Орсон', 'Гарсан', 'Сарын хоног', 'Хоногийн тариф', 'Хоногийн хөлс', 'Үзлэг', 'Эмчилгээ', 'Эм', 'Нийт', 'Төлөв']];
  _brMonthRows().forEach(({ i, c }) => rows.push([i.horse, i.owner, inpExamNum(i), c.admDate, c.outDate, c.days, c.fee, c.accom, c.exam, c.svc, c.med + c.home, c.total, brStatus(i).t]));
  _opsCSV('urjuulgiin-aduu-' + BR.month + '.csv', rows);
}
function brPrintMonth() {
  const list = _brMonthRows();
  const T = list.reduce((t, x) => { ['days', 'accom', 'svc', 'med', 'exam', 'home', 'total'].forEach(k => t[k] = (t[k] || 0) + x.c[k]); return t; }, {});
  _opsPrint('Үржүүлгийн адуу ' + BR.month, `<h1>Үржүүлгийн адууны эмчилгээний тооцоо — ${escHTML(BR.month)}</h1>
    <div class="m">${escHTML((STATE.dailyCfg && STATE.dailyCfg.branch) || 'Морьтон адууны эмнэлэг')} · хоногийн тариф ${fmt(breedCfg().dailyFee)} · хэвлэсэн ${escHTML(fmtDateTime(nowMs()))} · ${escHTML((STATE.user && STATE.user.name) || '')}</div>
    <table style="margin-top:8px"><thead><tr><th>№</th><th>Адуу</th><th>Орсон → гарсан</th><th class="r">Хоног</th><th class="r">Хоногийн хөлс</th><th class="r">Үзлэг</th><th class="r">Эмчилгээ</th><th class="r">Эм</th><th class="r">Нийт</th></tr></thead><tbody>
    ${list.map(({ i, c }, n) => `<tr><td>${n + 1}</td><td><b>${escHTML(i.horse || '')}</b><div class="m">${escHTML(i.diagnosis || '')}</div></td><td>${escHTML(c.admDate)} → ${escHTML(c.outDate || '…')}</td><td class="r">${c.days}</td><td class="r">${fmt(c.accom)}</td><td class="r">${fmt(c.exam)}</td><td class="r">${fmt(c.svc)}</td><td class="r">${fmt(c.med + c.home)}</td><td class="r"><b>${fmt(c.total)}</b></td></tr>`).join('')}
    <tr><th colspan="3">Нийт · ${list.length} адуу</th><th class="r">${T.days || 0}</th><th class="r">${fmt(T.accom || 0)}</th><th class="r">${fmt(T.exam || 0)}</th><th class="r">${fmt(T.svc || 0)}</th><th class="r">${fmt((T.med || 0) + (T.home || 0))}</th><th class="r">${fmt(T.total || 0)}</th></tr></tbody></table>
    <div class="sig"><span>Эмнэлэг: ........................</span><span>Үржүүлгийн менежер: ........................</span><span>Нягтлан бодогч: ........................</span></div>`);
}

// ── ⚙️ Тохиргоо: үржүүлгийн адуу ─────────────────────────────
function renderOpsCfg() {
  const c = breedCfg();
  const set = (id, v) => { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = v; };
  set('breed-cfg-fee', c.dailyFee); set('breed-cfg-call', c.callReminder ? '1' : '0'); set('breed-cfg-owners', c.owners.join('\n'));
  const info = document.getElementById('breed-cfg-info');
  if (info) { const n = breedingInps().filter(i => !i.discharged).length; info.textContent = 'Одоо ' + n + ' үржүүлгийн адуу байрлаж байна'; }
  const st = document.getElementById('erp-med-strict'); if (st) st.checked = !!opsCfg().medStrict;
  erpMedStatus();
}
function saveBreedCfgFromForm() {
  if (!canManageUsers || !canManageUsers()) { toast('⛔ Зөвхөн админ', 'err'); return; }
  const fee = parseFloat((document.getElementById('breed-cfg-fee') || {}).value);
  if (isNaN(fee) || fee < 0) { toast('Хоногийн төлбөр буруу байна', 'err'); return; }
  const owners = [...new Set(String((document.getElementById('breed-cfg-owners') || {}).value || '').split('\n').map(x => x.trim()).filter(Boolean))];
  const callReminder = ((document.getElementById('breed-cfg-call') || {}).value === '1');
  const before = breedCfg();
  saveOpsCfg({ breed: { dailyFee: fee, owners, callReminder } });
  writeLog('Үржүүлгийн адууны тохиргоо', '', '', 'Хоног ' + fmt(before.dailyFee) + ' → ' + fmt(fee) + ' · эзний түлхүүр үг ' + owners.length);
  renderOpsCfg(); try { updateBadges(); } catch (_) {}
  toast('✅ Хадгалагдлаа · хоног ' + fmt(fee), 'ok');
}

// ============================================================
// 🌅 ӨГЛӨӨНИЙ ХУВААРИЛАЛТ
// ============================================================
const ASG = { date: '', draft: {} };
function asgCanAssign() { return !!STATE.user && (canApproveDx() || ['Ерөнхий эмч', 'Ахлах эмч', 'Админ', 'Менежер'].includes(STATE.user.role)); }
function asgFor(i, date) { const a = i && i.assigns && i.assigns[date]; return (a && a.docId) ? a : null; }
// Тухайн өдөр эмнэлэгт байсан адуу (тэр өдөр гарсан нь хуваарилагдсан байсан бол л үлдэнэ)
function asgInHospital(date) { return (STATE.inps || []).filter(i => inpInHospitalOn(i, date) && (!i.discharged || (i.dischargedDate || '') > date || asgFor(i, date))); }
function asgUnassignedCount(date) { if (!asgCanAssign()) return 0; return asgInHospital(date).filter(i => !i.discharged && !asgFor(i, date)).length; }
function asgMine(date) { const me = currentUserDoctor(); if (!me) return []; return (STATE.inps || []).filter(i => { const a = asgFor(i, date); return a && String(a.docId) === String(me.id) && inpInHospitalOn(i, date); }); }
function asgDone(i, date) { return inpLogsOn(i, date).length > 0; }
function asgTagHTML(i) { const a = asgFor(i, todayStr()); return a ? `<span class="inpc-tag inpc-tag-asg" title="Өглөөний хуваарилалт${a.task ? ': ' + escHTML(a.task) : ''}">🌅 ${escHTML(a.docName || '')}</span>` : ''; }
function _asgRow(i, date) {
  const saved = asgFor(i, date) || {}, dr = ASG.draft[String(i.id)];
  return { docId: dr ? dr.docId : (saved.docId || ''), task: dr ? dr.task : (saved.task || ''), dirty: !!dr && (String(dr.docId || '') !== String(saved.docId || '') || String(dr.task || '') !== String(saved.task || '')) };
}
function asgSet(inpId, field, value) {
  const i = (STATE.inps || []).find(x => String(x.id) === String(inpId)); if (!i) return;
  const cur = _asgRow(i, ASG.date);
  ASG.draft[String(inpId)] = { docId: field === 'docId' ? value : cur.docId, task: field === 'task' ? value : cur.task };
  _asgPaintBar();
}
function _asgDirtyCount() { return asgInHospital(ASG.date).filter(i => _asgRow(i, ASG.date).dirty).length; }
function _asgPaintBar() {
  const n = _asgDirtyCount(), b = document.getElementById('asg-save');
  if (b) { b.textContent = n ? '💾 Хадгалах (' + n + ' өөрчлөлт)' : '💾 Хадгалах'; b.classList.toggle('btn-p', n > 0); }
  const s = document.getElementById('asg-sum'); if (s) s.innerHTML = _asgSummaryHTML();
}
function _asgSummaryHTML() {
  const list = asgInHospital(ASG.date), by = {};
  let none = 0;
  list.forEach(i => { const r = _asgRow(i, ASG.date); if (!r.docId) { none++; return; } by[r.docId] = (by[r.docId] || 0) + 1; });
  const chips = Object.keys(by).map(id => { const d = (STATE.doctors || []).find(x => String(x.id) === String(id)); return `<span class="asg-chip">👨‍⚕️ ${escHTML(d ? d.name : '?')} · <b>${by[id]}</b></span>`; });
  if (none) chips.push(`<span class="asg-chip warn">⚠ Хуваарилаагүй · <b>${none}</b></span>`);
  return chips.join('') || '<span class="muted" style="font-size:12px">Байрлаж буй адуу алга</span>';
}
function asgFill(mode) {
  const date = ASG.date, prev = addDaysStr(date, -1);
  let n = 0;
  asgInHospital(date).forEach(i => {
    const cur = _asgRow(i, date); if (cur.docId) return; // аль хэдийн сонгосныг дарахгүй
    let docId = '', task = cur.task;
    if (mode === 'prev') { const p = asgFor(i, prev); if (p) { docId = p.docId; if (!task) task = p.task || ''; } }
    else { const d = inpDoctorOf(i); if (d) docId = d.id; }
    if (docId && (STATE.doctors || []).some(d => String(d.id) === String(docId))) { ASG.draft[String(i.id)] = { docId, task }; n++; }
  });
  renderReview();
  toast(n ? '⤵ ' + n + ' адуунд эмч санал болголоо — шалгаад «Хадгалах» дарна уу' : 'Бөглөх хоосон мөр алга', n ? 'ok' : 'err');
}
function asgSave() {
  if (!asgCanAssign()) { toast('⛔ Хуваарилах эрхгүй (ахлах эмч, менежер, админ)', 'err'); return; }
  const date = ASG.date, me = (STATE.user && STATE.user.name) || '', now = nowMs();
  let n = 0; const names = [];
  asgInHospital(date).forEach(i => {
    const r = _asgRow(i, date); if (!r.dirty) return;
    if (!i.assigns || typeof i.assigns !== 'object') i.assigns = {};
    const d = (STATE.doctors || []).find(x => String(x.id) === String(r.docId));
    if (d) i.assigns[date] = { docId: d.id, docName: d.name, task: String(r.task || '').trim(), by: me, ms: now };
    else i.assigns[date] = { docId: '', docName: '', task: '', by: me, ms: now }; // хоосон = хуваарилалт авсан (талбар устгахгүй — sync найдвартай)
    i.ms = now; fbSaveRecord('inps', i); n++; names.push((i.horse || '') + '→' + (d ? d.name : '—'));
  });
  ASG.draft = {};
  if (!n) { toast('Өөрчлөлт алга', 'err'); return; }
  saveAll();
  writeLog('Өглөөний хуваарилалт', '', date, n + ' адуу: ' + names.join(', ').slice(0, 300));
  try { updateBadges(); } catch (_) {}
  renderReview();
  toast('✅ ' + n + ' адууг хуваариллаа — эмч нарын «Миний ажил»-д даалгавар болж гарна', 'ok');
}
function asgHTML() {
  if (!ASG.date) ASG.date = todayStr();
  const date = ASG.date, can = asgCanAssign();
  const locs = inpLocations(), locIx = l => { const k = locs.indexOf(l); return k < 0 ? 999 : k; };
  const list = asgInHospital(date).sort((a, b) => locIx(a.location) - locIx(b.location) || String(a.horse || '').localeCompare(String(b.horse || '')));
  const docs = STATE.doctors || [];
  const isToday = date === todayStr();
  const doneN = list.filter(i => asgDone(i, date)).length;
  return `
    <div class="rv-ctl">
      <div class="fld"><label>Огноо</label><input class="inp" type="date" value="${escHTML(date)}" max="${escHTML(addDaysStr(todayStr(), 1))}" onchange="ASG.date=this.value||todayStr();ASG.draft={};renderReview()"></div>
      ${can ? `<button class="btn btn-sm" onclick="asgFill('prev')" title="Өчигдөр хэн үзсэн бол өнөөдөр мөн тэр эмчид">⤵ Өчигдрийнхөөр бөглөх</button>
      <button class="btn btn-sm" onclick="asgFill('doc')" title="Адуу бүрийн эмчлэгч эмчид нь">👨‍⚕️ Эмчлэгч эмчээр бөглөх</button>
      <button class="btn btn-sm" id="asg-save" onclick="asgSave()">💾 Хадгалах</button>` : ''}
      <button class="btn btn-sm btn-p" onclick="asgOpenDaily()">📋 Өдрийн мэдээ</button>
    </div>
    <div class="asg-sum" id="asg-sum">${_asgSummaryHTML()}</div>
    <div class="muted" style="font-size:12px;margin:6px 0 10px">${escHTML(date)} (${_opsWeekday(date)}) · байрлаж буй <b>${list.length}</b> адуу · эмчилгээ бичигдсэн <b>${doneN}</b>${can ? '' : ' · зөвхөн ахлах эмч, менежер, админ хуваарилна'}</div>
    ${list.length ? `<div class="asg-list">${list.map(i => {
      const r = _asgRow(i, date), d = inpDoctorOf(i), done = asgDone(i, date), saved = asgFor(i, date);
      const days = inpatientDays(i.admittedMs, date === todayStr() ? undefined : dateStrToMs(date) + 13 * 3600000);
      const opts = '<option value="">— сонгох —</option>' + docs.map(x => `<option value="${escHTML(x.id)}" ${String(x.id) === String(r.docId) ? 'selected' : ''}>${escHTML(x.name)}${d && String(d.id) === String(x.id) ? ' ★' : ''}</option>`).join('');
      return `<div class="asg-row ${r.docId ? '' : 'none'} ${done ? 'done' : ''}">
        <div class="asg-h">
          <div><span class="asg-horse" onclick="openInpHorse('${escHTML(i.id)}','treat')">${isBreedingInp(i) ? '🐎' : '🐴'} ${escHTML(i.horse || '')}</span>
            <span class="muted" style="font-size:11.5px"> · 📍 ${escHTML(i.location || 'байрлалгүй')} · ${days} хоног${i.severity ? ' · ' + escHTML(i.severity) : ''}</span></div>
          <span class="badge ${done ? 'b-g' : (isToday ? '' : 'b-r')}">${done ? '✅ бичсэн' + (inpLogsOn(i, date)[0].docName ? ' · ' + escHTML(inpLogsOn(i, date)[0].docName) : '') : (isToday ? '⏳ хүлээгдэж буй' : 'бичээгүй')}</span>
        </div>
        <div class="asg-diag">${escHTML(i.diagnosis || '—')}${d ? ' <span class="muted">· эмчлэгч: ' + escHTML(d.name) + '</span>' : ''}</div>
        <div class="asg-f">
          <select class="inp" ${can ? '' : 'disabled'} onchange="asgSet('${escHTML(i.id)}','docId',this.value)">${opts}</select>
          <input class="inp" ${can ? '' : 'disabled'} value="${escHTML(r.task)}" placeholder="Даалгавар / анхаарах зүйл (заавал биш)" oninput="asgSet('${escHTML(i.id)}','task',this.value)">
        </div>
        ${saved ? `<div class="muted" style="font-size:10.5px;margin-top:3px">хуваарилсан: ${escHTML(saved.by || '')} · ${escHTML(fmtDateTime(saved.ms))}</div>` : ''}
      </div>`; }).join('')}</div>` : '<div class="empty"><div class="empty-em">🛏️</div>Энэ өдөр байрлаж буй адуу алга</div>'}`;
}
// «Өдрийн мэдээ» — чат/мэйлээр илгээхэд бэлэн текст
function asgDailyText(date) {
  const list = asgInHospital(date), prev = addDaysStr(date, -1);
  const branch = (STATE.dailyCfg && STATE.dailyCfg.branch) || 'Морьтон адууны эмнэлэг';
  const by = {}, none = [];
  list.forEach(i => { const a = asgFor(i, date); if (!a) { none.push(i); return; } (by[a.docName] = by[a.docName] || []).push(i); });
  const sev = k => list.filter(i => i.severity === k).length;
  const breedN = list.filter(isBreedingInp).length;
  const yList = asgInHospital(prev).filter(i => inpTreatStatus(i, prev) === 'done' || inpTreatStatus(i, prev) === 'missing');
  const yDone = yList.filter(i => inpTreatStatus(i, prev) === 'done').length;
  const admitted = (STATE.inps || []).filter(i => i.admittedDate === prev).length, out = (STATE.inps || []).filter(i => i.discharged && i.dischargedDate === prev).length;
  const dayOf = i => inpatientDays(i.admittedMs, date === todayStr() ? undefined : dateStrToMs(date) + 13 * 3600000);
  const line = (i, n) => {
    const a = asgFor(i, date), plan = inpPlanFor(i, date);
    let crs = []; try { crs = (typeof courseItemsFor === 'function') ? courseItemsFor(i, date).map(m => m.name) : []; } catch (_) {}
    return ' ' + n + '. ' + (isBreedingInp(i) ? '🐎 ' : '') + (i.horse || '') + ' (' + (i.owner || '—') + ') · ' + (i.location || 'байрлалгүй') + ' · ' + dayOf(i) + ' дахь хоног' + (i.severity ? ' · ' + i.severity : '') +
      (i.diagnosis ? '\n    Онош: ' + String(i.diagnosis).replace(/\s+/g, ' ').slice(0, 140) : '') +
      (crs.length ? '\n    Курс: ' + crs.join(', ') : '') +
      (plan ? '\n    Төлөвлөгөө: ' + String(plan.text).replace(/\s+/g, ' ').slice(0, 200) : '') +
      (a && a.task ? '\n    Даалгавар: ' + a.task : '');
  };
  const who = [...new Set(list.map(i => (asgFor(i, date) || {}).by).filter(Boolean))].join(', ');
  let t = '📋 ӨДРИЙН МЭДЭЭ — ' + date.replace(/-/g, '.') + ', ' + _opsWeekday(date) + '\n' + branch + ' · байрлан эмчилгээ\n\n';
  t += 'Байрлаж буй: ' + list.length + ' адуу' + (breedN ? ' (үүнээс үржүүлгийн ' + breedN + ')' : '') + '\n';
  if (sev('Хүнд') + sev('Дунд') + sev('Хөнгөн')) t += 'Хүнд ' + sev('Хүнд') + ' · Дунд ' + sev('Дунд') + ' · Хөнгөн ' + sev('Хөнгөн') + '\n';
  t += 'Өчигдөр: шинээр байрласан ' + admitted + ' · гарсан ' + out + ' · эмчилгээ бичигдсэн ' + yDone + '/' + yList.length + '\n';
  Object.keys(by).sort().forEach(doc => { t += '\n👨‍⚕️ ' + doc + ' — ' + by[doc].length + ' адуу\n' + by[doc].map((i, k) => line(i, k + 1)).join('\n') + '\n'; });
  if (none.length) t += '\n⚠ Хуваарилаагүй — ' + none.length + ' адуу\n' + none.map((i, k) => line(i, k + 1)).join('\n') + '\n';
  t += '\nХуваарилсан: ' + (who || '—') + ' · ' + fmtDateTime(nowMs());
  return t;
}
function asgOpenDaily() {
  const date = ASG.date || todayStr();
  if (_asgDirtyCount()) { if (!confirm('Хадгалаагүй хуваарилалт байна. Хадгалаад үргэлжлүүлэх үү?')) return; asgSave(); }
  _opsModal('📋 Өдрийн мэдээ — ' + escHTML(date), `
    <div class="muted" style="font-size:12px;margin-bottom:8px">Хуваарилалтаас автоматаар бэлтгэсэн. Илгээхээс өмнө энд засаж болно — групп чат, мэйл рүү хуулж тавина.</div>
    <textarea class="inp" id="asg-daily-text" rows="16" style="font-family:inherit;font-size:13px;line-height:1.5;white-space:pre-wrap">${escHTML(asgDailyText(date))}</textarea>
    <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px">
      <button class="btn btn-sm btn-p" onclick="asgCopyDaily()">📋 Хуулах</button>
      ${navigator.share ? '<button class="btn btn-sm btn-p" onclick="asgShareDaily()">📤 Илгээх</button>' : ''}
      <button class="btn btn-sm" onclick="asgPrintDaily()">🖨 Хэвлэх</button>
      <button class="btn btn-sm" onclick="closeModal('ops-modal')">Хаах</button>
    </div>`, 680);
}
function asgCopyDaily() {
  const el = document.getElementById('asg-daily-text'); if (!el) return;
  const done = () => toast('📋 Хуулагдлаа — чат руу буулгана уу', 'ok');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(el.value).then(done).catch(() => { el.select(); document.execCommand('copy'); done(); });
  else { el.select(); document.execCommand('copy'); done(); }
}
function asgShareDaily() { const el = document.getElementById('asg-daily-text'); if (el && navigator.share) navigator.share({ title: 'Өдрийн мэдээ', text: el.value }).catch(() => {}); }
function asgPrintDaily() {
  const date = ASG.date || todayStr(), list = asgInHospital(date);
  const by = {}; list.forEach(i => { const a = asgFor(i, date); const k = a ? a.docName : '⚠ Хуваарилаагүй'; (by[k] = by[k] || []).push(i); });
  _opsPrint('Өдрийн мэдээ ' + date, `<h1>Өдрийн мэдээ — байрлан эмчилгээний хуваарилалт</h1>
    <div class="m">${escHTML((STATE.dailyCfg && STATE.dailyCfg.branch) || 'Морьтон адууны эмнэлэг')} · ${escHTML(date)} (${_opsWeekday(date)}) · байрлаж буй ${list.length} адуу</div>
    ${Object.keys(by).sort().map(doc => `<h2>${escHTML(doc)} — ${by[doc].length} адуу</h2><table><thead><tr><th>№</th><th>Адуу / эзэн</th><th>Байрлал</th><th>Хоног</th><th>Онош</th><th>Даалгавар / төлөвлөгөө</th><th style="width:70px">Хийсэн ✓</th></tr></thead><tbody>
      ${by[doc].map((i, n) => { const a = asgFor(i, date), p = inpPlanFor(i, date); return `<tr><td>${n + 1}</td><td><b>${escHTML(i.horse || '')}</b>${isBreedingInp(i) ? ' (үржүүлгийн)' : ''}<div class="m">${escHTML(i.owner || '')}</div></td><td>${escHTML(i.location || '')}</td><td>${inpatientDays(i.admittedMs)}</td><td>${escHTML(i.diagnosis || '')}</td><td>${escHTML((a && a.task) || '')}${p ? '<div class="m">' + escHTML(p.text) + '</div>' : ''}</td><td></td></tr>`; }).join('')}
    </tbody></table>`).join('')}
    <div class="sig"><span>Ахлах эмч: ........................</span><span>Огноо: ${escHTML(date)}</span></div>`);
}

// ============================================================
// 📱 МИНИЙ АЖИЛ — эмчийн апп-ын нүүр
// ============================================================
function myPendingCount() {
  const today = todayStr();
  let n = asgMine(today).filter(i => !asgDone(i, today)).length;
  try { n += callDueList().filter(_myInp).length; } catch (_) {}
  try { n += dxOpenList().filter(e => e.dxStatus === 'returned' && _isMyExam(e)).length; } catch (_) {}
  return n;
}
function renderMyWork() {
  const body = document.getElementById('my-body'); if (!body) return;
  const me = currentUserDoctor();
  if (!me) { body.innerHTML = '<div class="card"><div class="empty"><div class="empty-em">📱</div>«Миний ажил» нь эмчийн бүртгэлтэй хэрэглэгчид зориулагдсан.<div class="muted" style="font-size:12px;margin-top:6px">Тохиргоо → Хэрэглэгч ба эрх → Эмч нар хэсэгт нэвтрэх нэртэйгээ ижил нэртэй эмч бүртгэнэ.</div></div></div>'; return; }
  const today = todayStr(), h = new Date().getHours();
  const greet = h < 11 ? 'Өглөөний мэнд' : h < 18 ? 'Өдрийн мэнд' : 'Оройн мэнд';
  const tasks = asgMine(today).sort((a, b) => (asgDone(a, today) ? 1 : 0) - (asgDone(b, today) ? 1 : 0) || String(a.location || '').localeCompare(String(b.location || '')));
  const doneN = tasks.filter(i => asgDone(i, today)).length;
  const taskIds = new Set(tasks.map(i => String(i.id)));
  const mineInp = (STATE.inps || []).filter(i => !i.discharged && _myInp(i) && !taskIds.has(String(i.id)));
  let calls = []; try { calls = callDueList().filter(_myInp); } catch (_) {}
  let ret = [], pend = []; try { const open = dxOpenList(); ret = open.filter(e => e.dxStatus === 'returned' && _isMyExam(e)); pend = open.filter(e => e.dxStatus === 'pending' && _isMyExam(e)); } catch (_) {}
  const waitN = (STATE.waiting || []).filter(x => !x.plTrip).length;
  const myExams = (STATE.exams || []).filter(e => (e.date || '').slice(0, 10) === today && _isMyExam(e)).length;
  const unassigned = asgUnassignedCount(today);
  const card = (i, isTask) => {
    const a = asgFor(i, today), done = asgDone(i, today), plan = inpPlanFor(i, today), cs = inpCallState(i);
    let crs = []; try { crs = (typeof courseItemsFor === 'function') ? courseItemsFor(i, today) : []; } catch (_) {}
    const last = (Array.isArray(i.log) ? i.log : []).slice().sort((x, y) => String(y.date).localeCompare(String(x.date)) || (y.ms || 0) - (x.ms || 0))[0];
    return `<div class="my-task ${done ? 'done' : ''}">
      <div class="my-task-h">
        <div class="my-task-name">${isBreedingInp(i) ? '🐎' : '🐴'} ${escHTML(i.horse || '')}</div>
        <span class="badge ${done ? 'b-g' : 'b-o'}">${done ? '✅ Бичсэн' : '⏳ Хийгээгүй'}</span>
      </div>
      <div class="my-task-meta">📍 ${escHTML(i.location || 'байрлалгүй')} · ${inpatientDays(i.admittedMs)} дахь хоног · 👤 ${escHTML(i.owner || '—')}${i.severity ? ' · <b>' + escHTML(i.severity) + '</b>' : ''}</div>
      <div class="my-task-diag">${escHTML(i.diagnosis || '—')}</div>
      ${a && a.task ? `<div class="my-note my-note-o">📌 <b>Ахлах эмчийн даалгавар:</b> ${escHTML(a.task)}</div>` : ''}
      ${plan ? `<div class="my-note my-note-p">🗓 <b>Өнөөдрийн төлөвлөгөө:</b> <span style="white-space:pre-wrap">${escHTML(plan.text)}</span></div>` : ''}
      ${crs.length ? `<div class="my-note">💊 <b>Курс:</b> ${escHTML(crs.map(m => m.name + (m.note ? ' (' + m.note + ')' : '')).join(' · '))}</div>` : ''}
      ${last ? `<div class="my-last">Сүүлд: ${escHTML((last.date || '').slice(5, 10))} ${escHTML(last.docName || '')} · T ${escHTML(last.temp || '—')} · P ${escHTML(last.pulse || '—')} · R ${escHTML(last.resp || '—')}</div>` : ''}
      <div class="my-task-act">
        <button class="btn btn-p" onclick="openInpHorse('${escHTML(i.id)}','treat')">📝 ${done ? 'Дахин бичлэг нэмэх' : 'Эмчилгээ бичих'}</button>
        ${cs.due && i.phone ? `<a class="btn" href="tel:${escHTML(String(i.phone).replace(/[^0-9+]/g, ''))}" style="text-decoration:none">📞 Эзэнд залгах</a>` : ''}
      </div>
    </div>`;
  };
  const quick = [['waiting', '⏳', 'Хүлээлт', waitN], ['exam', '🩺', 'Үзлэг', myExams ? 'өнөөдөр ' + myExams : ''], ['inpatient', '🏥', 'Байрлан', (STATE.inps || []).filter(x => !x.discharged).length], ['lab', '🧪', 'Шинжилгээ', ''], ['planned', '🗓️', 'Төлөвлөгөөт', ''], ['history', '📋', 'Түүх', '']].filter(q => canAccess(q[0]));
  body.innerHTML = `
    <div class="my-hero">
      <div><div class="my-hello">${greet}, ${escHTML(me.name)}</div><div class="my-date">${escHTML(today.replace(/-/g, '.'))} · ${_opsWeekday(today)}</div></div>
      ${tasks.length ? `<div class="my-prog"><div class="my-prog-n">${doneN}/${tasks.length}</div><div class="my-prog-l">даалгавар</div></div>` : ''}
    </div>
    ${tasks.length ? `<div class="my-bar"><div style="width:${Math.round(doneN / tasks.length * 100)}%"></div></div>` : ''}
    ${(asgCanAssign() && unassigned) ? `<div class="d-alert d-alert-o" style="margin-bottom:10px" onclick="RV.tab='assign';nav('review')"><span>🌅 Өнөөдөр эмчид хуваарилаагүй адуу: <b>${unassigned}</b></span><span>Хуваарилах ›</span></div>` : ''}
    ${ret.length ? `<div class="d-alert d-alert-r" style="margin-bottom:10px" onclick="openDxModal('${escHTML(ret[0].id)}')"><span>↩ Ахлах эмч таны <b>${ret.length}</b> оношийг буцаасан <small>· ${escHTML(ret.map(e => e.horse).join(', ').slice(0, 80))}</small></span><span>Засах ›</span></div>` : ''}
    ${calls.length ? `<div class="d-alert d-alert-r" style="margin-bottom:10px" onclick="INP_VIEW='cards';INP_DAYS_F='call';nav('inpatient')"><span>📞 Эзэнд нь залгах адуу: <b>${calls.length}</b> <small>· ${escHTML(calls.map(i => i.horse).join(', ').slice(0, 80))}</small></span><span>Харах ›</span></div>` : ''}
    <div class="my-sec">🌅 Өнөөдрийн даалгавар <span class="ch-r">${tasks.length}</span></div>
    ${tasks.length ? tasks.map(i => card(i, true)).join('') : `<div class="card"><div class="empty" style="padding:18px"><div class="empty-em">🌤️</div>Өнөөдөр танд хуваарилсан адуу алга<div class="muted" style="font-size:12px;margin-top:4px">Ахлах эмч өглөөний хуваарилалт хиймэгц энд гарч ирнэ.</div></div></div>`}
    ${mineInp.length ? `<div class="my-sec">🛏 Миний эмчилж буй бусад адуу <span class="ch-r">${mineInp.length}</span></div>${mineInp.map(i => card(i, false)).join('')}` : ''}
    ${pend.length ? `<div class="my-sec">⏳ Хянагдаж буй онош <span class="ch-r">${pend.length}</span></div><div class="card" style="padding:10px 12px">${pend.map(e => `<div class="rv-row" onclick="openDxModal('${escHTML(e.id)}')" style="cursor:pointer"><span><b>${escHTML(e.horse || '')}</b> <span class="muted">· ${escHTML((e.date || '').slice(0, 10))}</span></span><span class="muted">›</span></div>`).join('')}</div>` : ''}
    <div class="my-sec">⚡ Түргэн цэс</div>
    <div class="my-quick">${quick.map(q => `<button class="my-q" onclick="nav('${q[0]}')"><span class="my-q-i">${q[1]}</span><span class="my-q-l">${q[2]}</span>${q[3] !== '' && q[3] !== 0 ? `<span class="my-q-n">${escHTML(String(q[3]))}</span>` : ''}</button>`).join('')}</div>`;
}

// ── Самбарын сануулга + цэсний тоо ───────────────────────────
function opsDashAlerts(out) {
  const today = todayStr();
  const mine = asgMine(today);
  if (mine.length) {
    const left = mine.filter(i => !asgDone(i, today));
    out.unshift(`<div class="d-alert ${left.length ? 'd-alert-o' : 'd-alert-p'}" onclick="nav('my')"><span>🌅 Өнөөдөр танд <b>${mine.length}</b> адуу хуваарилагдсан${left.length ? ' · <b>' + left.length + '</b> бичээгүй <small>· ' + escHTML(left.map(i => i.horse).join(', ').slice(0, 100)) + '</small>' : ' · бүгд бичигдсэн ✅'}</span><span>Миний ажил ›</span></div>`);
  }
  const un = asgUnassignedCount(today);
  if (un) out.unshift(`<div class="d-alert d-alert-o" onclick="RV.tab='assign';ASG.date='';nav('review')"><span>🌅 Өнөөдөр эмчид хуваарилаагүй байрлагч адуу: <b>${un}</b></span><span>Хуваарилах ›</span></div>`);
}
function opsBadges() {
  if (!STATE.user) return;
  let n = 0; try { n = canAccess('my') ? myPendingCount() : 0; } catch (_) {}
  document.querySelectorAll('[data-bdg="my"]').forEach(el => { el.textContent = n; el.style.display = n ? '' : 'none'; });
  const dot = document.getElementById('bn-dot-my'); if (dot) { dot.textContent = n > 99 ? '99+' : n; dot.classList.toggle('show', n > 0); }
  let b = 0; try { b = breedingInps().filter(i => !i.discharged).length; } catch (_) {}
  document.querySelectorAll('[data-bdg="breed"]').forEach(el => { el.textContent = b; el.style.display = b ? '' : 'none'; });
}
// updateBadges-д залгана (app.js-ийг өөрчлөхгүйгээр)
(function () {
  if (typeof updateBadges !== 'function' || updateBadges.__ops) return;
  const orig = updateBadges;
  const wrapped = function () { const r = orig.apply(this, arguments); try { opsBadges(); } catch (e) { console.error('ops badges', e); } return r; };
  wrapped.__ops = true;
  updateBadges = wrapped; // eslint-disable-line no-global-assign
})();

// ============================================================
// ⚙️ СИСТЕМИЙН ТОХИРГОО — бүлэг (таб) + хайлт
// ============================================================
const ADM_GROUPS = {
  people:  'Хэн нэвтрэх, аль цэсийг харах, ямар эмч нар ажиллахыг эндээс тохируулна.',
  clinic:  'Байрлан эмчлүүлэх байрлал, эзэнд залгах сануулга, үржүүлгийн адуу, үзлэгийн хуудасны дугаарлалт.',
  finance: 'Үйлчилгээний үнэ, эмч нарын урамшууллын тооцоо, мөнгөн дүн харах код.',
  med:     'Эмийн нэршлийг ERP-тэй нийцүүлэх, шинжилгээний үйлчилгээ ба эрх.',
  data:    'Өгөгдлөө Excel / JSON-оор татаж нөөцлөх. Аюултай үйлдлүүд доор тусдаа хаалттай байна.',
  system:  'Хэн юу хийснийг харах лог, устгасан үзлэгийн архив, зураг байршуулалтын оношилгоо, хувилбар.'
};
let ADM_TAB = '';
function setAdminTab(g, keepSearch) {
  if (!ADM_GROUPS[g]) g = 'people';
  ADM_TAB = g; lsSet('mt_adm_tab', g);
  if (!keepSearch) { const s = document.getElementById('adm-search'); if (s) s.value = ''; }
  document.querySelectorAll('#adm-tabs .adm-tab').forEach(b => b.classList.toggle('on', b.dataset.ag === g));
  document.querySelectorAll('#adm-grid .adm-card').forEach(c => c.classList.toggle('adm-hide', c.dataset.ag !== g));
  const d = document.getElementById('adm-desc'); if (d) { d.textContent = ADM_GROUPS[g]; d.style.display = ''; }
  const e = document.getElementById('adm-empty'); if (e) e.classList.add('hidden');
}
function admSearch(q) {
  q = _opsKey(q);
  if (!q) { setAdminTab(ADM_TAB || 'people', true); return; }
  let n = 0;
  document.querySelectorAll('#adm-grid .adm-card').forEach(c => {
    const hit = _opsKey(c.textContent).includes(q) || Array.from(c.querySelectorAll('input[placeholder],textarea[placeholder]')).some(i => _opsKey(i.placeholder).includes(q));
    c.classList.toggle('adm-hide', !hit); if (hit) n++;
  });
  document.querySelectorAll('#adm-tabs .adm-tab').forEach(b => b.classList.remove('on'));
  const d = document.getElementById('adm-desc'); if (d) { d.textContent = '«' + q + '» — ' + n + ' тохиргоо олдлоо (бүх бүлгээс)'; }
  const e = document.getElementById('adm-empty'); if (e) e.classList.toggle('hidden', n > 0);
}
function opsRenderAdmin() {
  const s = document.getElementById('adm-search');
  if (s && s.value.trim()) admSearch(s.value); else setAdminTab(ADM_TAB || lsGet('mt_adm_tab', 'people') || 'people', true);
  renderOpsCfg();
  const v = document.getElementById('adm-ver-info');
  if (v) {
    const sc = document.querySelector('script[src*="app.js"]'), m = sc && /v=([\w-]+)/.exec(sc.getAttribute('src') || '');
    v.innerHTML = 'Кодын хувилбар: <b>' + escHTML(m ? m[1] : '—') + '</b><br>Горим: <b>' + (isNativeApp() ? '📱 Апп (store)' : (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? '📲 Суулгасан PWA' : '🌐 Хөтөч')) + '</b><br>Хэрэглэгч: <b>' + escHTML((STATE.user && STATE.user.name) || '') + '</b> · ' + escHTML((STATE.user && STATE.user.role) || '');
  }
}

// ============================================================
// 💊 ERP-ЭЭС ЭМИЙН НЭРШИЛ ИМПОРТЛОХ
// ============================================================
function medStrict() { return !!opsCfg().medStrict && typeof medCatalog === 'function' && medCatalog().length > 0; }
function medNamesFor(q, limit) { return (typeof medSearchAll === 'function') ? medSearchAll(q, limit || 20).map(r => r.name) : []; }
function setMedStrict(on) {
  if (!canManageUsers || !canManageUsers()) { toast('⛔ Зөвхөн админ', 'err'); renderOpsCfg(); return; }
  if (on && !medCatalog().length) { toast('Эхлээд ERP-ийн жагсаалтаа оруулна уу — каталог хоосон байна', 'err'); renderOpsCfg(); return; }
  saveOpsCfg({ medStrict: !!on });
  writeLog('Эмийн нэршил: зөвхөн каталогоос', '', '', on ? 'асаав' : 'унтраав');
  renderOpsCfg();
  toast(on ? '🔒 Эмч нар эмээ зөвхөн каталогоос сонгоно' : '🔓 Чөлөөт жагсаалт нээлттэй', 'ok');
}
function erpMedStatus() {
  const el = document.getElementById('erp-med-status'); if (!el) return;
  const e = opsCfg().erp, cat = (typeof medCatalog === 'function') ? medCatalog() : [];
  const erpN = cat.filter(m => m.src === 'erp').length;
  el.innerHTML = `<div style="background:var(--input);border-radius:8px;padding:8px 12px;font-size:12.5px;line-height:1.6">
    Каталогт <b>${cat.length}</b> эм · үүнээс ERP-ээс <b>${erpN}</b>${cat.length - erpN ? ' · гараар нэмсэн <b>' + (cat.length - erpN) + '</b>' : ''}<br>
    ${e ? 'Сүүлд оруулсан: <b>' + escHTML(fmtDateTime(e.ms)) + '</b> · ' + escHTML(e.by || '') + ' · ' + escHTML(e.file || '') + ' (' + (e.count || 0) + ' мөр)' : '<span class="muted">ERP-ийн файл хараахан оруулаагүй</span>'}</div>`;
}
const ERP = { rows: [], headers: [], map: {}, file: '', cat: '', updPrice: false, updUnit: false, prune: false };
const ERP_PAT = {
  code:  [/^(код|бар ?код|дотоод код|барааны код)$/i, /internal reference|default_code|reference|^code$|^sku$/i, /код|code|sku|barcode/i],
  name:  [/^(нэр|барааны нэр|бараа|эмийн нэр|бүтээгдэхүүн(ий нэр)?)$/i, /^(name|product|product name|display name)$/i, /нэр|name|бараа/i],
  unit:  [/хэмжих нэгж|^нэгж$/i, /unit of measure|uom/i, /нэгж|unit/i],
  price: [/зарах үнэ|борлуулах үнэ|худалдах үнэ/i, /sales price|list_price|sale price/i, /^үнэ$|^price$/i],
  cat:   [/ангилал|бүлэг/i, /categ/i]
};
async function _erpNeedXLSX() {
  if (typeof XLSX !== 'undefined') return true;
  if (typeof ensureXLSX === 'function') { try { if (await ensureXLSX()) return typeof XLSX !== 'undefined'; } catch (_) {} }
  if (typeof XLSX === 'undefined') toast('Excel сан ачаалж чадсангүй — интернэт холболтоо шалгана уу', 'err');
  return typeof XLSX !== 'undefined';
}
async function erpMedTemplate() {
  if (!(await _erpNeedXLSX())) return;
  const ws = XLSX.utils.aoa_to_sheet([['Код', 'Барааны нэр', 'Хэмжих нэгж', 'Зарах үнэ', 'Ангилал'], ['EM-0001', 'Пенициллин 100мл', 'мл', 500, 'Эм'], ['EM-0002', 'Флуниксин 50мл', 'мл', 1200, 'Эм']]);
  ws['!cols'] = [{ wch: 12 }, { wch: 34 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Эм');
  XLSX.writeFile(wb, 'ERP-emiin-jagsaalt-zagvar.xlsx');
}
async function erpMedFileChosen(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const buf = await f.arrayBuffer(); ev.target.value = '';
  if (!(typeof canEditMedCatalog === 'function' && canEditMedCatalog()) && !(canManageUsers && canManageUsers())) { toast('⛔ Каталог засах эрхгүй', 'err'); return; }
  if (!(await _erpNeedXLSX())) return;
  try {
    const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
    let best = null;
    wb.SheetNames.forEach(n => { const a = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, defval: '', raw: true }); if (!best || a.length > best.length) best = a; });
    erpMedParse(best || [], f.name);
  } catch (e) { console.error(e); toast('Файл задлахад алдаа: ' + e.message, 'err'); }
}
function erpMedParse(aoa, fileName) {
  // Толгой мөр: эхний 20 мөрөөс «нэр» төст багана агуулсан, хамгийн олон бөглөгдсөн мөр
  let hi = -1;
  for (let r = 0; r < Math.min(20, aoa.length); r++) {
    const cells = (aoa[r] || []).map(c => String(c == null ? '' : c).trim());
    if (cells.filter(Boolean).length >= 2 && cells.some(c => ERP_PAT.name.some(p => p.test(c)))) { hi = r; break; }
  }
  if (hi < 0) { toast('Толгой мөр олдсонгүй — «Барааны нэр» гэсэн баганатай байх ёстой. «Загвар файл»-ыг харна уу.', 'err'); return; }
  const headers = (aoa[hi] || []).map(c => String(c == null ? '' : c).trim());
  const pick = (pats, taken) => { for (const p of pats) { const k = headers.findIndex((h, ix) => h && p.test(h) && !taken.includes(ix)); if (k >= 0) return k; } return -1; };
  const map = {}; const taken = [];
  ['code', 'name', 'unit', 'price', 'cat'].forEach(k => { map[k] = pick(ERP_PAT[k], taken); if (map[k] >= 0) taken.push(map[k]); });
  ERP.headers = headers; ERP.map = map; ERP.file = fileName || ''; ERP.cat = ''; ERP.updPrice = false; ERP.updUnit = false; ERP.prune = false;
  ERP.rows = aoa.slice(hi + 1).filter(r => Array.isArray(r) && r.some(c => String(c == null ? '' : c).trim() !== ''));
  erpMedPreview();
}
function _erpUnit(u) {
  u = String(u || '').trim(); if (!u) return '';
  const units = (typeof MED_UNITS !== 'undefined') ? MED_UNITS : [];
  const k = _opsKey(u).replace(/\./g, '');
  const alias = { 'ml': 'мл', 'мл': 'мл', 'l': 'л', 'л': 'л', 'литр': 'л', 'g': 'гр', 'гр': 'гр', 'г': 'гр', 'kg': 'кг', 'кг': 'кг', 'mg': 'мг', 'мг': 'мг', 'pcs': 'ш', 'unit': 'ш', 'units': 'ш', 'unit(s)': 'ш', 'ш': 'ш', 'ширхэг': 'ш', 'тун': 'тун', 'dose': 'тун', 'шахмал': 'ш', 'tab': 'ш', 'флакон': 'фл', 'фл': 'фл', 'vial': 'фл', 'bottle': 'фл', 'ампул': 'амп', 'амп': 'амп', 'amp': 'амп', 'хайрцаг': 'багц', 'box': 'багц', 'багц': 'багц', 'pack': 'багц' };
  const a = alias[k] || u;
  return units.find(x => _opsKey(x) === _opsKey(a)) || a;
}
function _erpItems() {
  const m = ERP.map, cell = (r, k) => (m[k] >= 0 ? String(r[m[k]] == null ? '' : r[m[k]]).trim() : '');
  const seen = new Set(), out = [];
  ERP.rows.forEach(r => {
    const name = cell(r, 'name').replace(/\s+/g, ' '); if (!name) return;
    const cat = cell(r, 'cat'); if (ERP.cat && cat !== ERP.cat) return;
    const code = cell(r, 'code'), key = code ? 'c:' + _opsKey(code) : 'n:' + _opsKey(name);
    if (seen.has(key)) return; seen.add(key);
    const pr = m.price >= 0 ? parseFloat(String(r[m.price]).replace(/[^\d.\-]/g, '')) : NaN;
    out.push({ code, name, unit: _erpUnit(cell(r, 'unit')), price: isNaN(pr) ? null : pr, cat });
  });
  return out;
}
function _erpDiff() {
  const items = _erpItems(), cat = medCatalog();
  const byCode = new Map(), byName = new Map();
  cat.forEach(c => { if (c.code) byCode.set(_opsKey(c.code), c); byName.set(_opsKey(c.name), c); });
  const res = { add: [], rename: [], link: [], same: [], missing: [], items };
  const matched = new Set();
  items.forEach(it => {
    let c = it.code ? byCode.get(_opsKey(it.code)) : null;
    if (!c) c = byName.get(_opsKey(it.name));
    if (!c) { res.add.push(it); return; }
    matched.add(String(c.id)); it._c = c;
    if (_opsKey(c.name) !== _opsKey(it.name)) res.rename.push(it);
    else if (c.src !== 'erp' || (it.code && c.code !== it.code)) res.link.push(it);
    else res.same.push(it);
  });
  res.missing = cat.filter(c => !matched.has(String(c.id)));
  return res;
}
function erpMedPreview() {
  const box = document.getElementById('erp-med-preview'); if (!box) return;
  if (!ERP.rows.length) { box.innerHTML = ''; return; }
  const m = ERP.map, H = ERP.headers;
  const sel = (k, label, req) => `<div class="fld" style="margin:0;min-width:140px;flex:1"><label>${label}${req ? ' *' : ''}</label><select class="inp" onchange="ERP.map.${k}=parseInt(this.value);erpMedPreview()"><option value="-1">— байхгүй —</option>${H.map((h, ix) => h ? `<option value="${ix}" ${m[k] === ix ? 'selected' : ''}>${escHTML(h)}</option>` : '').join('')}</select></div>`;
  if (m.name < 0) { box.innerHTML = `<div class="erp-box"><b>Нэрийн баганыг сонгоно уу</b><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:8px">${sel('name', 'Барааны нэр', true)}</div></div>`; return; }
  const cats = m.cat >= 0 ? [...new Set(ERP.rows.map(r => String(r[m.cat] == null ? '' : r[m.cat]).trim()).filter(Boolean))].sort() : [];
  const D = _erpDiff();
  const big = D.items.length > 2500;
  box.innerHTML = `<div class="erp-box">
    <div class="ch" style="margin-bottom:6px">📄 ${escHTML(ERP.file)} <span class="ch-r">${ERP.rows.length} мөр</span></div>
    <div class="row" style="gap:8px;flex-wrap:wrap;align-items:flex-end">
      ${sel('code', 'Код')}${sel('name', 'Барааны нэр', true)}${sel('unit', 'Нэгж')}${sel('price', 'Үнэ')}${sel('cat', 'Ангилал')}
      ${cats.length ? `<div class="fld" style="margin:0;min-width:160px;flex:1"><label>Зөвхөн энэ ангиллыг</label><select class="inp" onchange="ERP.cat=this.value;erpMedPreview()"><option value="">Бүх ангилал (${ERP.rows.length})</option>${cats.map(c => `<option ${ERP.cat === c ? 'selected' : ''}>${escHTML(c)}</option>`).join('')}</select></div>` : ''}
    </div>
    ${m.code < 0 ? '<div class="erp-warn">⚠ Кодын багана сонгогдоогүй — нэрээр л тааруулна. ERP-д нэр өөрчлөгдвөл шинэ эм гэж ойлгогдох тул кодтой экспорт хийхийг зөвлөе.</div>' : ''}
    ${big ? '<div class="erp-warn">⚠ ' + D.items.length + ' бараа байна. Зөвхөн эмийн ангиллыг сонгож оруулахыг зөвлөе — бүх барааг оруулбал хайлт удааширч, тохиргооны багтаамж хэтэрч болно.</div>' : ''}
    <div class="erp-stats">
      <span class="erp-st g">➕ Шинэ <b>${D.add.length}</b></span>
      <span class="erp-st o">✏️ Нэр өөрчлөгдөх <b>${D.rename.length}</b></span>
      <span class="erp-st p">🔗 Кодтой холбогдох <b>${D.link.length}</b></span>
      <span class="erp-st">✓ Өөрчлөлтгүй <b>${D.same.length}</b></span>
      <span class="erp-st r">ERP-д байхгүй <b>${D.missing.length}</b></span>
    </div>
    ${D.rename.length ? `<div style="font-size:12px;margin:6px 0"><b>Нэр өөрчлөгдөх:</b> ${D.rename.slice(0, 12).map(it => '«' + escHTML(it._c.name) + '» → «' + escHTML(it.name) + '»').join(' · ')}${D.rename.length > 12 ? ' …' : ''}</div>` : ''}
    ${D.missing.length ? `<div style="font-size:12px;margin:6px 0" class="muted"><b>Каталогт байгаа ч ERP файлд байхгүй:</b> ${D.missing.slice(0, 15).map(c => escHTML(c.name)).join(', ')}${D.missing.length > 15 ? ' …' : ''}</div>` : ''}
    <div class="tbl-wrap" style="max-height:220px;overflow:auto;margin-top:6px"><table><thead><tr><th>Код</th><th>Нэр</th><th>Нэгж</th><th style="text-align:right">Үнэ</th><th>Ангилал</th><th></th></tr></thead><tbody>
      ${D.items.slice(0, 40).map(it => `<tr><td>${escHTML(it.code)}</td><td class="bold">${escHTML(it.name)}</td><td>${escHTML(it.unit)}</td><td style="text-align:right">${it.price != null ? fmt(it.price) : ''}</td><td class="muted">${escHTML(it.cat)}</td><td>${!it._c ? '<span class="badge b-g">шинэ</span>' : (_opsKey(it._c.name) !== _opsKey(it.name) ? '<span class="badge b-o">нэр солигдоно</span>' : '')}</td></tr>`).join('')}
    </tbody></table></div>
    ${D.items.length > 40 ? `<div class="muted" style="font-size:11px;margin-top:4px">Эхний 40 мөр · нийт ${D.items.length}</div>` : ''}
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px;font-size:12.5px">
      <label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer"><input type="checkbox" ${ERP.updPrice ? 'checked' : ''} ${m.price < 0 ? 'disabled' : ''} onchange="ERP.updPrice=this.checked" style="margin-top:2px"><span><b>Байгаа эмийн үнэ, нэгжийг ERP-ийнхээр дарж бичих</b> <span class="muted">— анхаар: ERP-ийн үнэ савлагааны (флакон, хайрцаг) үнэ байж болно; каталог 1 мл / 1 ширхгийн үнээр бодож эмчилгээний төлбөр гаргадаг. Шинэ эмд ERP-ийн үнэ, нэгж үргэлж орно.</span></span></label>
      <label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer"><input type="checkbox" ${ERP.prune ? 'checked' : ''} onchange="ERP.prune=this.checked" style="margin-top:2px"><span><b>ERP файлд байхгүй ${D.missing.length} нэрийг каталогоос хасах</b> <span class="muted">— өмнөх эмчилгээний бичлэг хэвээр үлдэнэ, зөвхөн шинээр сонгох боломжгүй болно.</span></span></label>
    </div>
    <div class="row" style="gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="btn btn-p" onclick="erpMedApply()">✅ Каталогт оруулах (${D.add.length + D.rename.length + D.link.length} өөрчлөлт)</button>
      <button class="btn" onclick="ERP.rows=[];erpMedPreview()">Болих</button>
    </div>
  </div>`;
}
function erpMedApply() {
  if (!(typeof canEditMedCatalog === 'function' && canEditMedCatalog()) && !(canManageUsers && canManageUsers())) { toast('⛔ Каталог засах эрхгүй', 'err'); return; }
  const D = _erpDiff(), me = (STATE.user && STATE.user.name) || '', now = nowMs();
  const upd = ERP.updPrice;
  if (!D.items.length) { toast('Оруулах мөр алга', 'err'); return; }
  if (!confirm('ERP-ийн жагсаалтыг эмийн каталогт нэгтгэх үү?\n\nШинэ: ' + D.add.length + '\nНэр өөрчлөгдөх: ' + D.rename.length + '\nКодтой холбогдох: ' + D.link.length + (ERP.prune ? '\nКаталогоос хасагдах: ' + D.missing.length : '') + (upd ? '\n\n⚠ Байгаа эмийн үнэ, нэгж ERP-ийнхээр солигдоно.' : ''))) return;
  if (!Array.isArray(STATE.medCatalog)) STATE.medCatalog = [];
  D.items.forEach(it => {
    const c = it._c;
    if (!c) { STATE.medCatalog.push({ id: uid(), name: it.name, unit: it.unit || '', price: it.price != null ? it.price : 0, note: '', code: it.code || '', cat: it.cat || '', src: 'erp', by: me, ms: now }); return; }
    if (_opsKey(c.name) !== _opsKey(it.name)) { c.aliases = [...new Set([...(Array.isArray(c.aliases) ? c.aliases : []), c.name])].slice(-8); c.name = it.name; }
    else if (c.name !== it.name) c.name = it.name; // том/жижиг үсэг, зайн зөрүү
    if (it.code) c.code = it.code;
    if (it.cat) c.cat = it.cat;
    c.src = 'erp';
    if (upd) { if (it.price != null) c.price = it.price; if (it.unit) c.unit = it.unit; }
    else { if (!c.unit && it.unit) c.unit = it.unit; if (!(parseFloat(c.price) > 0) && it.price != null) c.price = it.price; }
    c.by = me; c.ms = now;
  });
  if (ERP.prune) D.missing.forEach(c => { c.deleted = true; c.ms = now; c.by = me; });
  lsSet('mt_med_catalog', STATE.medCatalog);
  STATE.opsCfg = Object.assign({}, opsCfg(), { erp: { ms: now, by: me, file: ERP.file, count: D.items.length } });
  lsSet('mt_ops_cfg', STATE.opsCfg);
  try { fbSaveClinicConfig(); } catch (e) { console.error(e); }
  writeLog('ERP-ээс эмийн нэршил оруулав', '', ERP.file, 'шинэ ' + D.add.length + ', нэр өөрчлөгдсөн ' + D.rename.length + ', холбогдсон ' + D.link.length + (ERP.prune ? ', хасагдсан ' + D.missing.length : ''));
  const n = D.add.length + D.rename.length + D.link.length;
  ERP.rows = []; erpMedPreview(); renderOpsCfg();
  toast('✅ ERP-ийн ' + D.items.length + ' эм каталогт нэгдлээ (' + n + ' өөрчлөлт)', 'ok');
  if (!opsCfg().medStrict && confirm('Одоо «Зөвхөн каталогийн нэрээр эм бичих» горимыг асаах уу?\n\nАсаавал эмч нар эмээ зөвхөн ERP-ийн нэрээр сонгоно — нэршил зөрөхгүй.')) setMedStrict(true);
}

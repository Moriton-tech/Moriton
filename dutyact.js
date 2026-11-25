// ============================================================
// 🌙 Жижүүр эмчийн ээлж хүлээлцэх акт (маягт МК01-М-060) — вэб дээр харах, хэвлэх, хянах
// ------------------------------------------------------------
// Актыг эмч нар утасны апп («Морьтон Эмч») дээр бөглөж хүлээлцдэг (collection: duty).
// Энэ модуль вэб дээр жагсаалтыг харуулж, цаасан маягтын хэлбэрээр хэвлэж,
// ахлах эмч «Хянасан» гэж тэмдэглэх боломж өгнө. Бусад модульд хүрэхгүй — бие даасан цонх.
// Мөрийн жагсаалт ios/MoritonEmch/Core.swift → DutyForm-той ИЖИЛ байх ёстой.
// ============================================================
(function () {
  'use strict';
  const G = ['Дэвтэр бөглөсөн эсэх', 'Эмчилгээ, арчилгаа маллагаа', 'БТТ хүлээлцэх', 'Эд хэрэгсэл, цэвэрлэгээ', 'Нийт адууны тоо', 'Бусад'];
  const ITEMS = [
    [1, 0, 'ХАБЭАД'], [2, 0, 'ЭАД'], [3, 0, 'ИАБД, ЯАБД'],
    [4, 1, 'Усалгаа өвсөлгөө хийгдсэн эсэх'], [5, 1, 'Хүнд адуунд хяналт тавьсан эсэх'], [6, 1, 'Цагийн тариа хийсэн эсэх'],
    [7, 2, 'Хээлийн эхо апп цэвэр, цэнэгтэй эсэх'], [8, 2, 'Хөлийн эхо апп цэвэр, цэнэгтэй эсэх'], [9, 2, 'Рентген аппарат цэвэр, цэнэгтэй эсэх'],
    [10, 2, 'Залгиур дуран апп цэвэр, цэнэгтэй эсэх'], [12, 2, 'Утлагын апп цэвэр, цэнэгтэй эсэх'], [13, 2, 'Шарлагын апп цэвэр, цэнэгтэй эсэх'],
    [14, 2, 'Шүдний багаж'], [15, 2, 'Зонд'],
    [17, 3, 'Утас цэнэг сүлжээ хэвийн эсэх'], [18, 3, 'Ногт, чөдөр'], [19, 3, 'Нийт түлхүүр, станц бүрэн эсэх'], [20, 3, 'Тэжээлийн сав цэвэр эсэх'],
    [21, 4, 'Тусгаарлалт'], [22, 4, 'Эмнэлэгт'], [23, 4, 'Модон зүчээнд'], [24, 4, 'Хойд саравчинд'], [25, 4, 'Шинэ зүчээнд'],
    [26, 4, 'Байгалийн зүчээнд'], [27, 4, '1-р нарлагааны хашаанд'], [28, 4, '2-р нарлагааны хашаанд'], [29, 4, '3-р нарлагааны хашаанд'],
    [30, 5, 'Үзлэг системд бүртгэгдсэн эсэх'], [31, 5, 'Өвс тэжээлийн зарцуулалтын тоо'], [32, 5, 'Эмнэлгийн байр пайз зүүсэн эсэх']
  ];
  let ACTS = [];
  let OPEN = null;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const when = (ms) => {
    ms = parseFloat(ms) || 0; if (!ms) return '';
    const d = new Date(ms), p = (n) => String(n).padStart(2, '0');
    return p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  };
  const me = () => { try { return (typeof STATE !== 'undefined' && STATE.user && STATE.user.name) || ''; } catch (_) { return ''; } };
  const canReview = () => { try { return typeof canApproveDx === 'function' && canApproveDx(); } catch (_) { return false; } };
  const sent = (a) => !!(a.handover && a.handover.sentMs);
  const accepted = (a) => !!(a.handover && a.handover.acceptedMs);
  const reviewed = (a) => !!(a.review && a.review.by);
  function statusOf(a) {
    if (!sent(a)) return ['Бөглөж байна — ээлж өгөөгүй', 'b-o'];
    if (!accepted(a)) return ['Хүлээн аваагүй', 'b-o'];
    return reviewed(a) ? ['Хүлээн авсан · ' + a.review.by + ' хянасан', 'b-g'] : ['Хүлээн авсан · ахлах эмч хянаагүй', 'b-a'];
  }
  const cell = (a, no) => (a.act && a.act.items && a.act.items[String(no)]) || {};

  async function load() {
    if (typeof window.__fbColQuery !== 'function') throw new Error('Сервертэй холбогдоогүй байна');
    const docs = await window.__fbColQuery('duty');
    ACTS = docs.map((d) => d.data()).filter((a) => a && a.id)
      .sort((a, b) => (a.date === b.date ? (b.ms || 0) - (a.ms || 0) : (a.date < b.date ? 1 : -1)));
    paintBadge();
  }
  function paintBadge() {
    const n = canReview() ? ACTS.filter((a) => sent(a) && !reviewed(a)).length : 0;
    document.querySelectorAll('[data-bdg="duty"]').forEach((el) => { el.textContent = n; el.style.display = n ? '' : 'none'; });
  }

  function overlay() {
    let ov = document.getElementById('duty-ov');
    if (ov) return ov;
    ov = document.createElement('div');
    ov.id = 'duty-ov';
    ov.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(2,36,56,.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 12px;overflow:auto';
    ov.innerHTML = '<div id="duty-box" role="dialog" aria-label="Ээлж хүлээлцэх акт" style="background:#fff;border-radius:14px;max-width:860px;width:100%;padding:18px 20px;box-shadow:0 10px 40px rgba(0,0,0,.25)"></div>';
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    return ov;
  }
  function close() { const ov = document.getElementById('duty-ov'); if (ov) ov.remove(); OPEN = null; }
  const box = () => overlay().querySelector('#duty-box');
  const head = (title, back) => `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        ${back ? '<button class="btn" data-da="back">‹ Жагсаалт</button>' : ''}
        <div style="font-size:17px;font-weight:700">${esc(title)}</div>
      </div>
      <button class="btn" data-da="close">Хаах</button>
    </div>`;

  function renderList() {
    OPEN = null;
    const rows = ACTS.map((a) => {
      const st = statusOf(a), n = a.act && a.act.items ? Object.keys(a.act.items).length : 0;
      return `<tr data-id="${esc(a.id)}" style="cursor:pointer;border-top:1px solid #eee">
        <td style="padding:9px 8px;white-space:nowrap">${esc(a.date)}</td>
        <td style="padding:9px 8px"><b>${esc(a.docName)}</b>${a.handover && a.handover.toName ? ' → ' + esc(a.handover.toName) : ''}</td>
        <td style="padding:9px 8px;white-space:nowrap">${a.act ? n + '/' + ITEMS.length + ' мөр · ' + (parseInt(a.act.total, 10) || 0) + ' адуу' : '—'}</td>
        <td style="padding:9px 8px"><span class="badge ${st[1]}">${esc(st[0])}</span></td></tr>`;
    }).join('');
    box().innerHTML = head('🌙 Жижүүр эмчийн ээлж хүлээлцэх акт', false) +
      '<div class="muted" style="font-size:12px;margin-bottom:8px">Актыг эмч нар «Морьтон Эмч» утасны апп дээр бөглөж хүлээлцэнэ. Мөр дээр дарж бүтнээр харна, хэвлэнэ.</div>' +
      (ACTS.length ? '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="text-align:left;color:#5A6B76;font-size:11.5px"><th style="padding:6px 8px">Огноо</th><th style="padding:6px 8px">Өгсөн → авсан</th><th style="padding:6px 8px">Акт</th><th style="padding:6px 8px">Төлөв</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty">Акт хараахан бөглөгдөөгүй</div>');
    wire();
  }

  function tableHTML(a, forPrint) {
    const b = forPrint ? 'border:1px solid #000;' : 'border:1px solid #ddd;';
    let html = `<table style="width:100%;border-collapse:collapse;font-size:${forPrint ? 11 : 13}px"><thead><tr>
      <th style="${b}padding:4px 6px;width:28px">№</th><th style="${b}padding:4px 6px" colspan="2">Шалгах зүйл</th>
      <th style="${b}padding:4px 6px;width:38%">Тайлбар / Тоо</th><th style="${b}padding:4px 6px;width:38px">Чек</th></tr></thead><tbody>`;
    G.forEach((g, gi) => {
      const list = ITEMS.filter((x) => x[1] === gi);
      list.forEach((it, i) => {
        const c = cell(a, it[0]);
        html += `<tr><td style="${b}padding:4px 6px;text-align:center">${it[0]}</td>` +
          (i === 0 ? `<td style="${b}padding:4px 6px;width:19%" rowspan="${list.length}">${esc(g)}</td>` : '') +
          `<td style="${b}padding:4px 6px">${esc(it[2])}</td><td style="${b}padding:4px 6px">${esc(c.t || '')}</td>` +
          `<td style="${b}padding:4px 6px;text-align:center">${c.ok ? '☑' : '☐'}</td></tr>`;
      });
    });
    return html + '</tbody></table>';
  }
  function signsHTML(a) {
    const h = a.handover || {};
    return `<div style="display:flex;flex-wrap:wrap;gap:8px 28px;margin-top:10px;font-size:13px">
      <div>Хүлээлгэн өгсөн эмч: <b>${esc(a.docName || '')}</b> <span class="muted">${esc(when(h.sentMs))}</span></div>
      <div>Хүлээн авсан эмч: <b>${esc(accepted(a) ? (h.acceptedBy || h.toName || '') : (h.toName ? h.toName + ' (хүлээн аваагүй)' : '—'))}</b> <span class="muted">${esc(when(h.acceptedMs))}</span></div>
      <div>Хянасан ахлах эмч: <b>${esc(reviewed(a) ? a.review.by : '—')}</b> <span class="muted">${esc(when(a.review && a.review.ms))}</span></div>
    </div>`;
  }
  function renderDetail(id) {
    const a = ACTS.find((x) => String(x.id) === String(id)); if (!a) return renderList();
    OPEN = a.id;
    const total = a.act ? (parseInt(a.act.total, 10) || 0) : 0;
    box().innerHTML = head(a.date + ' · ' + (a.docName || ''), true) +
      (a.act ? tableHTML(a, false) + `<div style="margin-top:8px;font-size:13px"><b>Нийт адуу: ${total}</b></div>` +
        (a.act.note ? `<div style="margin-top:6px;font-size:13px">Нэмэлт тэмдэглэл: ${esc(a.act.note)}</div>` : '')
        : '<div class="empty">Энэ бичлэгт акт бөглөгдөөгүй</div>') +
      (a.handover && a.handover.acceptNote ? `<div style="margin-top:6px;font-size:13px">Хүлээн авагчийн тэмдэглэл: ${esc(a.handover.acceptNote)}</div>` : '') +
      signsHTML(a) +
      `<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
        ${canReview() && sent(a) && !reviewed(a) ? '<button class="btn btn-primary" data-da="review">✔ Хянасан гэж тэмдэглэх</button>' : ''}
        ${a.act ? '<button class="btn" data-da="print">🖨 Хэвлэх</button>' : ''}
      </div>`;
    wire();
  }

  function printAct(a) {
    const total = a.act ? (parseInt(a.act.total, 10) || 0) : 0;
    const w = window.open('', '_blank');
    if (!w) { if (typeof toast === 'function') toast('Хэвлэх цонх нээгдсэнгүй — pop-up зөвшөөрнө үү', 'err'); return; }
    w.document.write(`<!doctype html><html lang="mn"><head><meta charset="utf-8"><title>Ээлж хүлээлцэх акт ${esc(a.date)}</title>
      <style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#000}h1{font-size:15px;text-align:center;margin:0 0 4px}.r{text-align:right;font-size:11px}.muted{color:#444}</style></head><body>
      <div class="r">МК01-М-060</div><h1>ЖИЖҮҮР ЭМЧИЙН ЭЭЛЖ ХҮЛЭЭЛЦЭХ АКТ</h1><div class="r">${esc(String(a.date || '').replace(/-/g, '.'))}</div>
      ${tableHTML(a, true)}
      <div style="margin-top:6px;font-size:11px"><b>Нийт адуу: ${total}</b>${a.act && a.act.note ? ' · Тэмдэглэл: ' + esc(a.act.note) : ''}</div>
      ${signsHTML(a)}
      <div class="muted" style="margin-top:10px;font-size:9px">Морьтон системээс хэвлэв. Гарын үсгийн оронд апп-д нэвтэрсэн хэрэглэгчийн нэр, цаг бичигдсэн.</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (_) {} }, 300);
  }

  async function review(a) {
    if (!canReview()) return;
    try {
      const now = Date.now();
      // merge:true — зөвхөн review ба ms талбарыг бичнэ, актын бусад хэсэгт хүрэхгүй
      await window.__fbSetDoc(window.__fbColDoc('duty', String(a.id)), { review: { by: me(), ms: now }, ms: now }, { merge: true });
      a.review = { by: me(), ms: now };
      try { if (typeof writeLog === 'function') writeLog('Ээлж хүлээлцэх акт хянасан', a.id, a.date + ' — ' + (a.docName || ''), ''); } catch (_) {}
      paintBadge();
      renderDetail(a.id);
      if (typeof toast === 'function') toast('✔ Хянасан гэж тэмдэглэлээ', 'ok');
    } catch (e) {
      console.error(e);
      if (typeof toast === 'function') toast('Хадгалагдсангүй: ' + (e && e.message ? e.message : e), 'err');
    }
  }

  function wire() {
    const b = box();
    b.querySelectorAll('[data-da="close"]').forEach((el) => el.addEventListener('click', close));
    b.querySelectorAll('[data-da="back"]').forEach((el) => el.addEventListener('click', renderList));
    b.querySelectorAll('tr[data-id]').forEach((el) => el.addEventListener('click', () => renderDetail(el.dataset.id)));
    const a = OPEN ? ACTS.find((x) => String(x.id) === String(OPEN)) : null;
    b.querySelectorAll('[data-da="print"]').forEach((el) => el.addEventListener('click', () => a && printAct(a)));
    b.querySelectorAll('[data-da="review"]').forEach((el) => el.addEventListener('click', () => a && review(a)));
  }

  async function open() {
    box().innerHTML = head('🌙 Жижүүр эмчийн ээлж хүлээлцэх акт', false) + '<div class="muted">Ачаалж байна…</div>';
    wire();
    try { await load(); renderList(); }
    catch (e) {
      console.error(e);
      box().innerHTML = head('🌙 Жижүүр эмчийн ээлж хүлээлцэх акт', false) +
        '<div class="empty">Актыг уншиж чадсангүй: ' + esc(e && e.message ? e.message : e) + '</div>';
      wire();
    }
  }

  document.addEventListener('click', (e) => {
    const ni = e.target && e.target.closest ? e.target.closest('.ni-duty') : null;
    if (ni) { e.preventDefault(); open(); }
  });
  // Хянах шаардлагатай актын тоог цэсэнд харуулна (нэвтэрсний дараа нэг удаа)
  setTimeout(() => { if (me()) load().catch(() => {}); }, 9000);
})();

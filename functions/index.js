// ============================================================
//  Морьтон Эмч — мэдэгдэл илгээгч (Firebase Cloud Functions)
// ------------------------------------------------------------
//  Firestore-д бичлэг өөрчлөгдөхөд (вэб, апп аль нь ч бичсэн бай)
//  холбогдох эмчийн iPhone руу Apple (APNs)-аар мэдэгдэл явуулна.
//  Төхөөрөмжүүд: devices/{id} — апп нэвтрэх үед өөрөө бүртгэнэ.
//
//  ⚠️ Бодит орчинд ХАРААХАН туршаагүй. Суулгах алхам: ios/README.md
// ============================================================
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const http2 = require('http2');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const APNS_KEY_P8 = defineSecret('APNS_KEY_P8'); // .p8 файлын бүх агуулга
const APNS_KEY_ID = defineSecret('APNS_KEY_ID'); // Apple дээрх Key ID
const TEAM_ID = 'FCY9Y2B5SG';
const BUNDLE_ID = 'mn.moriton.emch';
// Firestore сангийн байршилтай таарах ёстой. Таарахгүй бол deploy алдаа зөв бүсийг хэлнэ.
const REGION = process.env.MORITON_REGION || 'asia-northeast1';
const opts = { region: REGION, secrets: [APNS_KEY_P8, APNS_KEY_ID] };

const b64 = (x) => Buffer.from(x).toString('base64url');
let cached = { jwt: '', at: 0 };
function apnsJwt() {
  const now = Math.floor(Date.now() / 1000);
  if (cached.jwt && now - cached.at < 2400) return cached.jwt; // Apple: 20–60 минут тутам шинэчилнэ
  const head = b64(JSON.stringify({ alg: 'ES256', kid: APNS_KEY_ID.value().trim() }));
  const body = b64(JSON.stringify({ iss: TEAM_ID, iat: now }));
  const sig = crypto.sign('sha256', Buffer.from(head + '.' + body), {
    key: APNS_KEY_P8.value().replace(/\\n/g, '\n'), dsaEncoding: 'ieee-p1363'
  });
  cached = { jwt: head + '.' + body + '.' + b64(sig), at: now };
  return cached.jwt;
}

function sendOne(device, note) {
  const host = device.env === 'production' ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
  return new Promise((resolve) => {
    const client = http2.connect(host);
    client.on('error', (e) => resolve({ status: 0, reason: String(e) }));
    const req = client.request({
      ':method': 'POST', ':path': '/3/device/' + device.token,
      authorization: 'bearer ' + apnsJwt(),
      'apns-topic': BUNDLE_ID, 'apns-push-type': 'alert', 'apns-priority': '10'
    });
    let status = 0, data = '';
    req.on('response', (h) => { status = h[':status']; });
    req.on('data', (c) => { data += c; });
    req.on('end', () => { client.close(); resolve({ status, reason: data }); });
    req.on('error', (e) => { client.close(); resolve({ status: 0, reason: String(e) }); });
    req.end(JSON.stringify({
      aps: { alert: { title: note.title, body: note.body }, sound: 'default', 'thread-id': note.thread || 'moriton', 'content-available': 1 }
    }));
  });
}

async function notify(query, note) {
  const snap = await query.get();
  await Promise.all(snap.docs.map(async (d) => {
    const dev = d.data();
    if (!dev.token) return;
    if (Array.isArray(dev.mute) && dev.mute.includes(note.thread)) return; // эмч апп-ын тохиргооноос унтраасан
    const r = await sendOne(dev, note);
    if (r.status === 410 || /BadDeviceToken|Unregistered/.test(r.reason)) await d.ref.delete(); // апп устгагдсан
    else if (r.status !== 200) console.warn('APNs', dev.user, r.status, r.reason);
  }));
}

const devices = () => db.collection('devices');
const todayUB = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ulaanbaatar' }).format(new Date());
const data = (snap) => (snap && snap.exists ? snap.data() : null);

// 1) Ахлах эмч өглөө адуу хуваарилахад → тухайн эмчид
exports.onInpWritten = onDocumentWritten({ document: 'inps/{id}', ...opts }, async (event) => {
  const before = data(event.data.before), after = data(event.data.after);
  if (!after || after.discharged) return;
  const day = todayUB();
  const a = after.assigns && after.assigns[day];
  const b = before && before.assigns && before.assigns[day];
  if (!a || !a.docId) return;
  if (b && String(b.docId) === String(a.docId) && (b.task || '') === (a.task || '')) return;
  await notify(devices().where('docId', '==', String(a.docId)), {
    title: 'Шинэ даалгавар',
    body: `${after.horse || 'Адуу'}${after.location ? ' · ' + after.location : ''} — ${a.task || 'өнөөдрийн эмчилгээ'}`,
    thread: 'tasks'
  });
});

// 2) Хүлээлтэд шинэ адуу бүртгэгдэхэд → бүх төхөөрөмжид (газрын үзлэгийнхээс бусад)
exports.onWaitingWritten = onDocumentWritten({ document: 'waiting/{id}', ...opts }, async (event) => {
  const before = data(event.data.before), after = data(event.data.after);
  if (before || !after || after.plTrip) return;
  await notify(devices(), {
    title: 'Хүлээлтэд шинэ адуу',
    body: `${after.horse || ''} · ${after.owner || ''}${after.symptoms ? ' — ' + after.symptoms : ''}`,
    thread: 'waiting'
  });
});

// 3) Ахлах эмч оношийг буцаахад → үзлэг хийсэн эмчид
exports.onExamWritten = onDocumentWritten({ document: 'exams/{id}', ...opts }, async (event) => {
  const before = data(event.data.before), after = data(event.data.after);
  if (!after || after.dxStatus !== 'returned' || (before && before.dxStatus === 'returned')) return;
  if (!after.docName) return;
  await notify(devices().where('user', '==', after.docName), {
    title: 'Онош буцаагдлаа',
    body: `${after.horse || ''} — ахлах эмч оношийг засуулахаар буцаалаа`,
    thread: 'dx'
  });
});

// 4) Шинжилгээний хариу гарахад → захиалсан эмчид
exports.onLabWritten = onDocumentWritten({ document: 'labs/{id}', ...opts }, async (event) => {
  const before = data(event.data.before), after = data(event.data.after);
  if (!after || after.status !== 'done' || (before && before.status === 'done')) return;
  if (!after.docName) return;
  await notify(devices().where('user', '==', after.docName), {
    title: 'Шинжилгээний хариу гарлаа',
    body: `${after.horse || 'Сорьц'} — ${after.service || ''}`,
    thread: 'lab'
  });
});

// 5) Жижүүр эмч ээлжээ хүлээлгэн өгөхөд → хүлээн авах эмчид; хүлээн авахад → өгсөн эмчид
exports.onDutyWritten = onDocumentWritten({ document: 'duty/{id}', ...opts }, async (event) => {
  const before = data(event.data.before), after = data(event.data.after);
  if (!after || !after.handover) return;
  const h = after.handover, hb = (before && before.handover) || {};
  if (h.sentMs && h.sentMs !== hb.sentMs && h.toDocId) {
    await notify(devices().where('docId', '==', String(h.toDocId)), {
      title: 'Ээлж хүлээн авах',
      body: `${after.docName || 'Жижүүр эмч'} ээлжээ танд хүлээлгэн өглөө${h.note ? ' — ' + String(h.note).slice(0, 120) : ''}`,
      thread: 'duty'
    });
  }
  if (h.acceptedMs && !hb.acceptedMs && after.docId) {
    await notify(devices().where('docId', '==', String(after.docId)), {
      title: 'Ээлж хүлээн авлаа',
      body: `${h.acceptedBy || h.toName || 'Эмч'} ээлжийг хүлээн авлаа`,
      thread: 'duty'
    });
  }
});

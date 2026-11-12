// ============================================================
// 🗺️ ТӨЛӨВЛӨГӨӨТ ҮЗЛЭГИЙН ГАЗРЫН ЗУРАГ
// ------------------------------------------------------------
// «Төлөвлөгөөт үзлэг» хуудасны «🗺️ Газрын зураг» горим.
// Энэ файл зөвхөн тэр горимыг анх нээхэд ачаалагдана (ensurePlMap).
// Дата: Firestore-оос kind=='planned' бүх үзлэгийг нэг удаа уншина
// (зөвхөн унших — юу ч бичихгүй) + санах ой дахь шинэ үзлэгүүд.
// Байршил: mn-sums.js (сумын төвийн координат). Мөнгөн дүн — код (finVisible).
// ============================================================
const PLMAP_GEO = {"W":1000,"H":413,"T":{"xo":9758132.63428,"yo":6360796.24282,"k":0.0030352881712895,"mx":-999,"my":9851.0,"minx":-999,"maxy":9851,"S":0.09216589861751152},"A":{"Дархан-Уул":["M578,107 580,106 583,103 590,106 592,109 592,117 592,122 586,124 579,120 574,121 569,124 562,122 563,119 564,108 562,102 569,95 572,95 572,98 569,103 578,107Z",576,110],"Улаанбаатар":["M594,161 602,159 609,169 616,171 614,181 607,182 602,179 596,178 588,179 584,178 583,173 581,169 581,164 579,158 594,161Z",595,171],"Хөвсгөл":["M290,95 292,98 297,99 305,94 305,91 310,89 313,91 322,85 327,76 328,66 319,61 317,56 318,53 314,49 313,47 316,38 316,34 320,27 326,27 326,23 329,17 338,14 341,12 346,0 350,3 357,6 360,8 371,10 378,16 381,16 397,17 424,28 427,27 435,28 445,31 449,33 447,37 448,43 450,47 450,55 453,58 452,61 453,65 458,66 462,71 456,75 454,80 446,89 447,91 460,96 467,100 464,102 460,102 456,107 452,110 442,113 437,118 433,120 432,128 423,129 414,124 404,119 399,125 394,127 398,131 394,133 391,140 395,145 388,148 387,151 383,151 377,149 373,149 371,155 363,156 361,155 358,157 353,154 350,142 355,134 351,122 342,122 339,127 335,128 329,126 321,126 315,126 304,120 295,119 291,118 284,112 283,109 286,104 292,99 290,95Z",373,87],"Увс":["M70,87 71,84 77,83 85,79 91,79 92,76 96,74 101,70 109,68 114,69 116,66 119,65 124,60 129,59 137,59 140,58 141,53 144,52 146,55 152,60 156,56 162,56 163,62 166,63 176,63 180,64 202,64 204,71 205,77 209,81 214,87 223,86 228,90 236,90 240,92 239,101 242,109 246,111 247,115 244,120 243,130 242,133 237,134 228,139 219,140 208,139 198,136 185,141 179,148 177,152 171,148 169,143 165,141 162,141 156,145 141,142 138,144 135,137 131,137 129,130 124,129 120,132 115,138 112,140 111,134 107,130 104,128 98,119 98,116 91,115 90,111 79,105 75,97 73,89 70,87Z",154,101],"Дорноговь":["M754,281 746,286 740,296 740,300 736,307 735,310 738,312 739,316 743,320 749,325 752,331 752,334 746,336 742,341 726,347 721,350 713,358 711,363 706,367 705,369 694,374 689,375 682,378 676,381 669,382 661,381 654,383 646,382 631,382 630,364 631,358 630,348 629,334 622,316 620,312 621,303 623,300 625,293 626,292 639,290 642,289 645,285 649,284 646,268 646,260 646,253 648,249 643,250 639,245 640,235 639,231 632,224 636,220 630,219 628,216 633,214 645,216 652,213 655,207 659,208 661,214 663,212 665,216 661,226 668,236 673,239 684,239 692,234 694,227 694,221 697,221 706,231 709,237 718,242 722,243 730,237 742,242 746,250 747,254 746,265 749,267 750,270 753,274 754,281Z",684,286],"Өмнөговь":["M621,303 620,312 622,316 629,334 630,348 631,358 630,364 631,382 591,387 563,398 543,408 537,413 533,411 524,411 521,411 521,403 497,407 476,398 444,391 440,388 435,381 432,379 425,378 419,378 381,373 369,376 366,353 364,322 365,319 374,316 381,321 389,329 418,330 420,329 435,321 447,317 463,316 474,317 472,311 482,291 494,284 498,277 508,278 509,279 509,287 512,291 528,294 549,296 552,296 558,305 560,311 568,315 581,314 589,309 607,304 612,305 621,303Z",506,339],"Хэнтий":["M730,237 722,243 718,242 709,237 706,231 697,221 694,221 694,227 692,234 684,239 673,239 668,236 661,226 665,216 663,212 661,214 659,208 655,207 651,203 647,193 642,187 643,185 643,182 645,177 645,171 649,170 657,165 662,156 662,154 656,135 653,129 646,123 646,119 647,115 659,114 666,114 675,116 677,118 684,117 686,119 698,121 704,118 711,122 715,122 722,119 734,113 739,114 744,112 755,111 758,110 761,113 759,115 762,127 761,130 769,143 771,151 770,158 771,165 774,170 776,175 761,179 758,182 756,187 757,192 749,191 745,193 739,200 738,210 733,218 731,224 733,231 730,237Z",704,172],"Баянхонгор":["M369,376 365,377 314,371 312,351 316,339 316,333 318,323 317,312 318,307 324,303 326,298 326,289 326,285 329,282 333,271 334,267 332,256 330,252 323,244 319,243 309,234 307,228 307,222 309,217 315,199 323,198 327,192 327,189 331,184 331,181 334,179 340,178 342,179 344,185 350,188 357,188 361,185 370,181 371,186 375,190 376,197 378,203 392,200 397,208 399,208 403,213 418,212 420,214 428,223 429,229 426,233 427,236 427,241 423,243 421,247 422,255 419,264 415,269 416,279 418,284 423,286 430,290 428,295 430,303 435,321 420,329 418,330 389,329 381,321 374,316 365,319 364,322 366,353 369,376Z",367,258],"Архангай":["M353,154 358,157 361,155 363,156 371,155 373,149 377,149 383,151 387,151 388,148 395,145 391,140 394,133 398,131 394,127 399,125 404,119 414,124 423,129 432,128 435,132 439,133 442,136 447,135 449,141 451,148 454,152 455,154 458,157 463,158 468,165 469,170 475,174 477,179 480,179 487,188 495,194 495,197 491,199 480,199 475,193 464,190 463,192 466,196 463,201 460,203 459,208 457,209 451,205 441,208 437,211 420,214 418,212 403,213 399,208 397,208 392,200 378,203 376,197 375,190 371,186 370,181 361,185 357,188 350,188 344,185 342,179 340,178 334,179 331,181 324,180 325,172 324,168 325,164 334,164 339,159 353,154Z",409,171],"Завхан":["M353,154 339,159 334,164 325,164 324,168 325,172 324,180 331,181 331,184 327,189 327,192 323,198 315,199 309,217 307,222 301,220 295,223 287,222 287,219 284,216 282,211 278,209 269,212 266,204 262,198 240,185 232,184 229,185 225,181 222,180 214,180 204,179 197,177 186,181 178,182 172,174 169,164 173,162 178,156 177,152 179,148 185,141 198,136 208,139 219,140 228,139 237,134 242,133 243,130 244,120 247,115 246,111 242,109 239,101 240,92 252,87 255,90 258,88 264,89 268,92 271,91 274,93 278,91 287,92 290,95 292,99 286,104 283,109 284,112 291,118 295,119 304,120 315,126 321,126 329,126 335,128 339,127 342,122 351,122 355,134 350,142 353,154Z",271,151],"Говь-Алтай":["M314,371 294,369 271,371 267,370 266,363 254,353 251,345 247,337 244,328 241,324 235,323 235,317 237,312 226,313 216,310 213,306 205,303 200,298 192,297 185,289 179,287 165,284 167,267 167,259 168,256 172,254 176,249 176,246 183,231 180,224 187,223 191,220 200,216 202,212 197,204 195,198 189,194 180,187 178,182 186,181 197,177 204,179 214,180 222,180 225,181 229,185 232,184 240,185 262,198 266,204 269,212 278,209 282,211 284,216 287,219 287,222 295,223 301,220 307,222 307,228 309,234 319,243 323,244 330,252 332,256 334,267 333,271 329,282 326,285 326,289 326,298 324,303 318,307 317,312 318,323 316,333 316,339 312,351 314,371Z",250,263],"Ховд":["M177,152 178,156 173,162 169,164 172,174 178,182 180,187 189,194 195,198 197,204 202,212 200,216 191,220 187,223 180,224 183,231 176,246 176,249 172,254 168,256 167,259 167,267 165,284 155,283 147,285 138,284 132,282 121,282 117,282 115,279 109,280 105,277 100,276 97,278 93,268 90,266 92,256 101,245 101,242 98,234 102,224 101,219 109,220 114,224 116,221 127,222 129,219 121,213 115,209 114,206 115,200 109,193 109,187 104,177 100,166 96,163 94,155 96,152 95,147 91,144 95,143 104,140 112,140 115,138 120,132 124,129 129,130 131,137 135,137 138,144 141,142 156,145 162,141 165,141 169,143 171,148 177,152Z",137,205],"Баян-Өлгий":["M112,140 104,140 95,143 91,144 95,147 96,152 94,155 96,163 100,166 104,177 109,187 109,193 115,200 114,206 115,209 121,213 129,219 127,222 116,221 114,224 109,220 101,219 99,214 99,212 96,208 92,206 84,195 84,188 80,183 80,181 72,177 71,172 69,172 66,175 62,175 55,166 49,166 46,168 40,168 37,164 33,163 26,159 25,154 21,152 15,148 8,146 6,144 10,140 7,138 2,136 0,131 4,129 2,127 2,121 6,121 12,117 11,113 13,110 27,108 29,110 35,110 34,107 38,109 44,108 45,102 50,104 52,102 60,99 58,96 58,91 66,90 70,87 73,89 75,97 79,105 90,111 91,115 98,116 98,119 104,128 107,130 111,134 112,140Z",67,151],"Булган":["M495,197 495,194 487,188 480,179 477,179 475,174 469,170 468,165 463,158 458,157 455,154 454,152 451,148 449,141 447,135 442,136 439,133 435,132 432,128 433,120 437,118 442,113 452,110 456,107 460,102 464,102 467,100 460,96 447,91 446,89 454,80 456,75 462,71 467,72 473,75 480,75 482,79 487,79 495,82 499,80 504,81 511,81 516,76 522,81 524,87 521,88 522,93 528,100 526,102 525,110 524,113 521,124 516,123 514,125 508,123 505,126 505,128 513,130 517,132 522,136 522,143 522,151 518,156 514,162 517,165 518,168 521,169 527,170 527,175 529,181 522,181 520,184 515,184 507,189 510,193 510,195 504,197 495,197Z",489,132],"Орхон":["M517,132 513,130 505,128 505,126 508,123 514,125 516,123 521,124 523,128 517,132Z",514,127],"Сэлэнгэ":["M522,143 522,136 517,132 523,128 521,124 524,113 525,110 526,102 528,100 522,93 521,88 524,87 522,81 516,76 520,75 524,75 534,72 540,71 547,68 556,70 561,70 567,71 569,74 575,76 581,74 588,74 592,76 598,79 600,84 606,88 610,88 621,89 628,90 628,101 631,104 638,107 640,110 647,115 646,119 646,123 640,123 632,127 627,125 620,126 615,129 621,136 618,142 615,143 606,145 601,143 595,144 589,147 585,147 573,140 570,142 567,140 568,136 562,133 554,135 550,138 552,142 544,145 537,148 522,143ZM578,107 569,103 572,98 572,95 569,95 562,102 564,108 563,119 562,122 569,124 574,121 579,120 586,124 592,122 592,117 592,109 590,106 583,103 580,106 578,107Z",575,111],"Өвөрхангай":["M495,197 504,197 510,195 511,202 515,205 516,211 513,213 518,220 519,226 524,230 522,235 518,240 510,242 509,254 507,256 498,257 494,261 493,265 499,272 498,277 494,284 482,291 472,311 474,317 463,316 447,317 435,321 430,303 428,295 430,290 423,286 418,284 416,279 415,269 419,264 422,255 421,247 423,243 427,241 427,236 426,233 429,229 428,223 420,214 437,211 441,208 451,205 457,209 459,208 460,203 463,201 466,196 463,192 464,190 475,193 480,199 491,199 495,197Z",468,242],"Дундговь":["M498,277 499,272 493,265 494,261 498,257 507,256 509,254 510,242 518,240 522,235 524,230 526,231 533,226 535,223 543,226 549,229 557,218 560,218 571,222 573,224 589,224 595,226 602,230 609,230 615,228 617,226 624,222 625,216 628,216 630,219 636,220 632,224 639,231 640,235 639,245 643,250 648,249 646,253 646,260 646,268 649,284 645,285 642,289 639,290 626,292 625,293 623,300 621,303 612,305 607,304 589,309 581,314 568,315 560,311 558,305 552,296 549,296 528,294 512,291 509,287 509,279 508,278 498,277Z",577,258],"Төв":["M646,123 653,129 656,135 662,154 662,156 657,165 649,170 645,171 641,171 637,175 636,178 637,183 643,185 642,187 647,193 651,203 655,207 652,213 645,216 633,214 628,216 625,216 624,222 617,226 615,228 609,230 602,230 595,226 589,224 573,224 571,222 560,218 557,218 549,229 543,226 535,223 533,226 526,231 524,230 519,226 518,220 513,213 516,211 515,205 511,202 510,195 510,193 507,189 515,184 520,184 522,181 529,181 527,175 527,170 521,169 518,168 517,165 514,162 518,156 522,151 522,143 537,148 544,145 552,142 550,138 554,135 562,133 568,136 567,140 570,142 573,140 585,147 589,147 595,144 601,143 606,145 615,143 618,142 621,136 615,129 620,126 627,125 632,127 640,123 646,123ZM594,161 579,158 581,164 581,169 583,173 584,178 588,179 596,178 602,179 607,182 614,181 616,171 609,169 602,159 594,161Z",584,177],"Говьсүмбэр":["M645,171 645,177 643,182 643,185 637,183 636,178 637,175 641,171 645,171Z",641,177],"Дорнод":["M776,175 774,170 771,165 770,158 771,151 769,143 761,130 762,127 759,115 761,113 758,110 768,107 777,108 787,104 788,101 792,95 803,87 812,84 815,81 825,76 831,78 840,78 847,82 854,89 859,92 871,92 880,88 885,87 896,91 900,95 880,133 879,137 872,147 873,157 871,159 863,163 865,170 874,179 878,179 881,175 886,173 894,174 905,173 912,175 920,181 921,181 926,176 927,181 935,178 937,174 935,167 940,168 946,167 958,169 965,177 974,181 977,187 981,188 981,191 994,201 996,207 1000,211 1000,218 993,223 986,222 982,222 974,220 971,217 966,216 963,220 960,219 954,219 948,218 937,223 935,226 931,226 927,223 922,224 921,231 919,232 904,231 897,234 888,223 886,222 873,222 867,224 853,224 845,227 841,221 837,217 831,214 830,212 831,201 830,199 824,197 810,187 791,183 785,181 781,181 775,184 776,175Z",877,170],"Сүхбаатар":["M730,237 733,231 731,224 733,218 738,210 739,200 745,193 749,191 757,192 756,187 758,182 761,179 776,175 775,184 781,181 785,181 791,183 810,187 824,197 830,199 831,201 830,212 831,214 837,217 841,221 845,227 853,224 867,224 873,222 886,222 888,223 897,234 890,242 885,250 886,254 884,257 879,259 867,268 858,269 846,270 839,268 833,270 829,277 821,283 818,287 813,288 805,294 788,293 777,290 772,288 768,283 754,281 753,274 750,270 749,267 746,265 747,254 746,250 742,242 730,237Z",803,235]}};
const PLMAP = { docs: null, loading: false, loadedAt: 0, err: '', filt: 'all', sel: null, sort: {} };
const PLMAP_COLORS = ['#c2562d', '#2f7d6b', '#6a4fb3', '#b8860b', '#2b6cb0', '#b23a6b', '#5b8c2a', '#8a5a44', '#0e7c86', '#a33ea1'];

function plmapProj(lat, lon) {
  const T = PLMAP_GEO.T, R = 6371007.181;
  const x = R * lon * Math.PI / 180, y = 1.25 * R * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * Math.PI / 180));
  const X = (x - T.xo) * T.k + T.mx, Y = (y - T.yo) * T.k + T.my;
  return [Math.round((X - T.minx) * T.S * 10) / 10, Math.round((T.maxy - Y) * T.S * 10) / 10];
}
function plmapEsc(s) { return escHTML(s == null ? '' : String(s)); }

async function plmapLoad(force) {
  if (PLMAP.loading) return;
  if (PLMAP.docs && !force) return;
  if (!window.__fbQuery || !window.__fbReady) { PLMAP.err = 'Сервертэй холбогдоогүй — зөвхөн энэ төхөөрөмж дээрх үзлэгүүдийг харуулж байна'; return; }
  PLMAP.loading = true; PLMAP.err = '';
  try {
    const res = await window.__fbQuery('exams', [['kind', '==', 'planned']]);
    PLMAP.docs = (res.docs || []).filter(d => d && d.id);
    PLMAP.loadedAt = Date.now();
  } catch (e) {
    console.warn('[plmap] load', e);
    PLMAP.err = 'Бүх үзлэгийг татаж чадсангүй (' + (e && e.message || e) + ') — энэ төхөөрөмж дээрх үзлэгүүдийг харуулж байна';
  }
  PLMAP.loading = false;
}
// Серверээс татсан + санах ой дахь (шинээр шивсэн) үзлэгийг нэгтгэнэ
function plmapExams() {
  const m = new Map();
  (PLMAP.docs || []).forEach(d => m.set(String(d.id), d));
  (STATE.exams || []).forEach(e => { if (e && e.kind === 'planned') { const o = m.get(String(e.id)); if (!o || (e.ms || 0) >= (o.ms || 0)) m.set(String(e.id), e); } });
  const del = new Set((STATE.deletedExams || []).map(x => String((x && (x._archId || (x.exam && x.exam.id))) || '')));
  return [...m.values()].filter(e => !del.has(String(e.id)) && !e.deleted);
}

// Үзлэгүүдийг явц + аймаг + байршлаар бүлэглэнэ
function plmapBuild(exams) {
  const trips = (STATE.trips || []);
  const tIdx = {}; trips.forEach((t, i) => tIdx[String(t.id)] = t);
  const P = {};
  exams.forEach(e => {
    const tid = String(e.tripId || '');
    const aimag = String(e.province || '').trim() || '—';
    const r = mnSumLookup(aimag, e.soum);
    const locName = (r.status === 'ok' || r.status === 'fixed' || r.status === 'fuzzy') ? r.name : r.status === 'alias' ? r.name : r.status === 'empty' ? '' : String(e.soum || '').trim();
    const key = tid + '|' + aimag + '|' + locName;
    const p = P[key] || (P[key] = { key, trip: tid, aimag, soum: locName, status: r.status, look: r, raw: new Set(), ex: [], horses: new Set(), owners: new Set(), dates: new Set(), sv: {}, dc: {}, amt: 0 });
    if (r.status === 'fixed' || r.status === 'fuzzy') p.raw.add(String(e.soum).trim());
    p.ex.push(e); p.horses.add(String(e.horseId || e.horse || e.id)); if (e.owner) p.owners.add(String(e.owner).trim());
    if (e.date) p.dates.add(e.date);
    (e.services || []).forEach(s => { const n = s && (s.name || s); if (n) p.sv[n] = (p.sv[n] || 0) + 1; });
    [e.docName, e.assistDocName].filter(Boolean).forEach(n => p.dc[n] = (p.dc[n] || 0) + 1);
    p.amt += parseFloat(e.amount) || 0;
  });
  const places = Object.values(P).map(p => {
    const ll = p.look.ll; const xy = ll ? plmapProj(ll[0], ll[1]) : null;
    return Object.assign(p, { n: p.ex.length, h: p.horses.size, o: p.owners.size, dates: [...p.dates].sort(), raw: [...p.raw], xy,
      svL: Object.entries(p.sv).sort((a, b) => b[1] - a[1]), dcL: Object.entries(p.dc).sort((a, b) => b[1] - a[1]) });
  });
  // Явцын өнгө: огнооны дарааллаар
  const tids = [...new Set(places.map(p => p.trip))];
  const tdate = id => (tIdx[id] && tIdx[id].date) || (places.filter(p => p.trip === id).flatMap(p => p.dates).sort()[0]) || '';
  tids.sort((a, b) => tdate(a) < tdate(b) ? -1 : 1);
  const tinfo = tids.map((id, i) => {
    const t = tIdx[id] || { id, route: id ? '(устгагдсан явц)' : '(явцгүй)', date: '' };
    const Pp = places.filter(p => p.trip === id); const ds = Pp.flatMap(p => p.dates).sort();
    const order = Pp.slice().sort((a, b) => (a.dates[0] || '') < (b.dates[0] || '') ? -1 : 1);
    return { id, t, color: PLMAP_COLORS[i % PLMAP_COLORS.length], from: ds[0] || '', to: ds[ds.length - 1] || '',
      n: Pp.reduce((a, p) => a + p.n, 0), h: Pp.reduce((a, p) => a + p.h, 0), amt: Pp.reduce((a, p) => a + p.amt, 0),
      aimags: [...new Set(order.map(p => p.aimag))], docs: Object.entries(Pp.reduce((m, p) => { p.dcL.forEach(([k, v]) => m[k] = (m[k] || 0) + v); return m; }, {})).sort((a, b) => b[1] - a[1]) };
  });
  return { places, trips: tinfo, tmap: Object.fromEntries(tinfo.map(x => [x.id, x])) };
}

function plmapRouteAimags(t) {
  return String(t.route || t.location || t.province || '').split(/[,;\/]+/).map(s => s.trim()).filter(Boolean);
}
function plmapNotes(B) {
  const N = [];
  B.trips.forEach(T => {
    const t = T.t; if (!t || !t.id) return;
    const rec = t.date || '', recEnd = t.endDate || t.date || '';
    if (T.from && (T.from < rec || T.to > recEnd)) N.push(`«${plmapEsc(t.route || t.location || '—')}» явцын огноо ${rec} → ${recEnd} боловч үзлэгүүд ${T.from} → ${T.to} хооронд хийгдсэн — явцын огноог засна уу.`);
    const route = plmapRouteAimags(t);
    const ubLike = a => a === 'Улаанбаатар' ? route.some(r => /багануур|налайх|багахангай|улаанбаатар|уб/i.test(r)) : false;
    const extra = T.aimags.filter(a => a !== '—' && !route.includes(a) && !ubLike(a));
    const miss = route.filter(r => PROVS.includes(r) && !T.aimags.includes(r));
    if (extra.length) N.push(`«${plmapEsc(t.route || '—')}» явцын маршрутад ороогүй ${plmapEsc(extra.join(', '))} аймагт үзлэг бүртгэгдсэн.`);
    if (miss.length) N.push(`«${plmapEsc(t.route || '—')}» явцын маршрутад ${plmapEsc(miss.join(', '))} байгаа ч тэнд үзлэг бүртгэгдээгүй.`);
  });
  const by = s => B.places.filter(p => p.status === s);
  const sum = arr => arr.reduce((a, p) => a + p.n, 0);
  const em = by('empty'); if (em.length) N.push(`<b>${sum(em)}</b> үзлэгт сум бичигдээгүй (${plmapEsc([...new Set(em.map(p => p.aimag))].join(', '))}) — аймгийн төвд тавив.`);
  by('fixed').forEach(p => N.push(`${plmapEsc(p.aimag)}: «${plmapEsc(p.raw.join('», «'))}» → «${plmapEsc(p.soum)}» гэж нэгтгэв (бичлэгийн жижиг ялгаа).`));
  by('fuzzy').forEach(p => N.push(`${plmapEsc(p.aimag)}: «${plmapEsc(p.raw.join('», «'))}» гэж бичсэнийг «${plmapEsc(p.soum)}» гэж үзэв (үсгийн алдаа байх магадлалтай).`));
  by('other').forEach(p => N.push(`${plmapEsc(p.aimag)} · «${plmapEsc(p.soum)}» (${p.n} үзлэг): энэ нь ${plmapEsc(p.look.others.join(', '))} аймгийн сум — аймаг эсвэл сум буруу байж магадгүй; аймгийн төвд тавив.`));
  by('unknown').forEach(p => N.push(`${plmapEsc(p.aimag)} · «${plmapEsc(p.soum)}» (${p.n} үзлэг): сумын жагсаалтад алга — аймгийн төвд тавив.`));
  const na = by('noaimag'); if (na.length) N.push(`<b>${sum(na)}</b> үзлэгт аймаг бичигдээгүй — газрын зураг дээр гарахгүй.`);
  N.push('«Адуу» тоо нь газар тус бүрээр давхардалгүй тоологдсон; нэг адуу хоёр газар үзүүлсэн бол хоёр удаа орно.');
  return N;
}

function renderPlMap(force) {
  const host = $('#pl-map-host'); if (!host) return;
  __finRerender = () => renderPlMap();
  if (!PLMAP.docs && !PLMAP.loading && !PLMAP.err) {
    host.innerHTML = '<div class="card"><div class="empty"><div class="empty-em">🗺️</div>Төлөвлөгөөт үзлэгүүдийг татаж байна…</div></div>';
    plmapLoad().then(() => { if (STATE.activePage === 'planned' && STATE.plView === 'map') renderPlMap(); });
    return;
  }
  const all = plmapExams();
  const B = plmapBuild(all);
  if (PLMAP.filt !== 'all' && !B.tmap[PLMAP.filt]) PLMAP.filt = 'all';
  const P = B.places.filter(p => PLMAP.filt === 'all' || p.trip === PLMAP.filt);
  const Pm = P.filter(p => p.xy);
  if (PLMAP.sel && !P.some(p => p.key === PLMAP.sel)) PLMAP.sel = null;
  const fin = finVisible();
  const n = P.reduce((a, p) => a + p.n, 0), h = P.reduce((a, p) => a + p.h, 0), amt = P.reduce((a, p) => a + p.amt, 0);
  const ds = P.flatMap(p => p.dates).sort();
  const aim = new Set(P.map(p => p.aimag).filter(a => a !== '—')), soum = new Set(P.filter(p => p.soum).map(p => p.aimag + '|' + p.soum));
  const trips = new Set(P.map(p => p.trip));
  const tc = id => (B.tmap[id] || {}).color || '#888';

  const chips = [['all', 'Бүх явц', '']].concat(B.trips.slice().reverse().map(T => [T.id, (T.from || T.t.date || '').slice(5) + ' · ' + (T.aimags.filter(a => a !== '—').join(', ') || T.t.route || '—'), T.color]));
  const kpi = [['📋 Үзлэг', n, 'accent'], ['🐎 Адуу', h, ''], ['📍 Аймаг', aim.size, 'purple'], ['🏘 Сум', soum.size, ''], ['📅 Хээрийн өдөр', new Set(ds).size, 'green'], ['🚙 Явц', trips.size, '']];
  if (fin) kpi.push(['💰 Нийт дүн', fmtCompact(amt), 'green']);

  host.innerHTML = `
    <div class="card">
      <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">
        <div><div class="ph-title" style="font-size:16px">🗺️ Төлөвлөгөөт үзлэг — газрын зураг</div>
          <div class="muted" style="font-size:12px">${PLMAP.filt === 'all' ? 'Бүх явц' : 'Явц: ' + plmapEsc((B.tmap[PLMAP.filt].t || {}).route || '—')}${ds.length ? ' · ' + ds[0] + ' – ' + ds[ds.length - 1] : ''}${PLMAP.loadedAt ? ' · ' + new Date(PLMAP.loadedAt).toTimeString().slice(0, 5) + '-д татав' : ''}</div></div>
        <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center">
          <span id="plm-fin-lock"></span>
          <button class="btn btn-sm" onclick="plmapRefresh()" ${PLMAP.loading ? 'disabled' : ''}>🔄 Шинэчлэх</button>
        </div>
      </div>
      ${PLMAP.err ? `<div class="plm-flag" style="margin-top:8px">${plmapEsc(PLMAP.err)}</div>` : ''}
      <div class="plm-chips">${chips.map(([id, l, c]) => `<button class="plm-chip ${String(PLMAP.filt) === String(id) ? 'on' : ''}" onclick="plmapFilter('${plmapEsc(id)}')">${c ? `<i style="background:${c}"></i>` : ''}${plmapEsc(l)}</button>`).join('')}</div>
      <div class="stats plm-stats">${kpi.map(([l, v, c]) => `<div class="stat ${c}"><div class="stat-l">${l}</div><div class="snum">${v}</div></div>`).join('')}</div>
    </div>
    ${!P.length ? '<div class="card"><div class="empty"><div class="empty-em">🗺️</div>Төлөвлөгөөт үзлэг алга</div></div>' : `
    <div class="plm-grid">
      <div class="card plm-mapcard">
        <svg id="plm-svg" viewBox="-8 -8 ${PLMAP_GEO.W + 16} ${PLMAP_GEO.H + 16}" role="img" aria-label="Монголын газрын зураг"></svg>
        <div class="plm-legend">
          <span>Аймгийн өнгө = үзлэгийн тоо</span>
          <span class="plm-ramp"><span>бага</span><i style="background:#dbe7f1"></i><i style="background:#b3cde3"></i><i style="background:#7fabd0"></i><i style="background:#3f7fb3"></i><span>их</span></span>
          <span>● сум (хэмжээ = үзлэг, өнгө = явц)</span><span>┄ явцын маршрут</span>
        </div>
      </div>
      <div class="card plm-panel" id="plm-panel"></div>
    </div>
    <div class="plm-two">
      <div class="card"><div class="ch">🚙 Явц тус бүрээр</div><div class="tbl-wrap" style="overflow-x:auto"><table class="plm-tbl" id="plm-t-trip"></table></div></div>
      <div class="card"><div class="ch">📍 Аймаг тус бүрээр</div><div class="tbl-wrap" style="overflow-x:auto"><table class="plm-tbl" id="plm-t-aimag"></table></div></div>
    </div>
    <div class="card"><div class="ch">🏘 Сум / байршил тус бүрээр</div><div class="tbl-wrap" style="overflow-x:auto"><table class="plm-tbl" id="plm-t-place"></table></div></div>
    <div class="card"><div class="ch">⚠️ Датаны анхааруулга</div><ul class="plm-notes">${plmapNotes({ places: P, trips: B.trips.filter(T => PLMAP.filt === 'all' || T.id === PLMAP.filt) }).map(x => `<li>${x}</li>`).join('')}</ul>
      <div class="muted" style="font-size:11px;margin-top:6px">Сумын байршил ойролцоо (сумын төв). Сумын нэрийг үзлэгийн маягт дээр жагсаалтаас сонгосноор газрын зураг зөв гарна.</div></div>`}`;

  // Мөнгөний түгжээний мөр
  const lk = $('#plm-fin-lock');
  if (lk) lk.innerHTML = fin ? '<span class="badge b-g">🔓 Дүн харагдаж байна</span> <button class="btn btn-xs" onclick="finLock()">🔒</button>'
    : '<button class="btn btn-xs" onclick="openFinPinModal(()=>renderPlMap())">🔑 Дүн харах</button>';
  if (!P.length) return;

  // ── Газрын зураг
  const byA = {}; P.forEach(p => { if (p.aimag !== '—') byA[p.aimag] = (byA[p.aimag] || 0) + p.n; });
  const maxA = Math.max(1, ...Object.values(byA));
  const q = v => { const r = v / maxA; return r > .75 ? '#3f7fb3' : r > .5 ? '#7fabd0' : r > .25 ? '#b3cde3' : '#dbe7f1'; };
  const A = PLMAP_GEO.A; let s = '';
  Object.keys(A).forEach(a => { s += `<path class="plm-aimag" d="${A[a][0]}" ${byA[a] ? `style="fill:${q(byA[a])}"` : ''} data-a="${plmapEsc(a)}"></path>`; });
  Object.keys(A).forEach(a => { if (!['Улаанбаатар', 'Дархан-Уул', 'Орхон', 'Говьсүмбэр'].includes(a)) s += `<text class="plm-alabel" x="${A[a][1]}" y="${A[a][2]}">${plmapEsc(a)}</text>`; });
  [...new Set(Pm.map(p => p.trip))].forEach(t => {
    const pts = Pm.filter(p => p.trip === t).slice().sort((a, b) => (a.dates[0] || '') < (b.dates[0] || '') ? -1 : (a.dates[0] || '') > (b.dates[0] || '') ? 1 : b.n - a.n);
    if (pts.length > 1) s += `<polyline class="plm-route" style="stroke:${tc(t)}" points="${pts.map(p => p.xy.join(',')).join(' ')}"></polyline>`;
  });
  const maxN = Math.max(1, ...B.places.map(p => p.n));
  const rad = p => 4 + Math.sqrt(p.n / maxN) * 24;
  const big = Pm.slice().sort((a, b) => b.n - a.n);
  s += big.map(p => `<circle class="plm-bub ${PLMAP.sel === p.key ? 'sel' : ''} ${['other', 'unknown', 'empty'].includes(p.status) ? 'approx' : ''}" cx="${p.xy[0]}" cy="${p.xy[1]}" r="${rad(p).toFixed(1)}" style="fill:${tc(p.trip)}" data-k="${plmapEsc(p.key)}"></circle>`).join('');
  const lblMin = big.length > 12 ? big[11].n : 0;
  s += big.filter(p => p.n >= Math.max(lblMin, 2)).map(p => `<text class="plm-blabel" x="${(p.xy[0] + rad(p) + 3).toFixed(1)}" y="${(p.xy[1] + 4).toFixed(1)}">${plmapEsc(p.soum || p.aimag)} ${p.n}</text>`).join('');
  const svg = $('#plm-svg'); svg.innerHTML = s;
  let tip = $('#plm-tip'); if (!tip) { tip = document.createElement('div'); tip.id = 'plm-tip'; tip.className = 'plm-tip'; document.body.appendChild(tip); }
  const showTip = (e, html) => { tip.innerHTML = html; tip.style.display = 'block'; const x = Math.min(e.clientX + 12, window.innerWidth - tip.offsetWidth - 8); tip.style.left = x + 'px'; tip.style.top = (e.clientY + 12) + 'px'; };
  svg.querySelectorAll('.plm-bub').forEach(c => {
    const p = P.find(x => x.key === c.dataset.k);
    c.addEventListener('mousemove', e => showTip(e, `<b>${plmapEsc(p.aimag)}${p.soum ? ' · ' + plmapEsc(p.soum) : ''}</b><br>${p.n} үзлэг · ${p.h} адуу${fin ? ' · ' + fmtCompact(p.amt) : ''}<br><span class="muted">${p.dates.join(', ')}</span>`));
    c.addEventListener('mouseleave', () => tip.style.display = 'none');
    c.addEventListener('click', () => { tip.style.display = 'none'; PLMAP.sel = p.key; renderPlMap(); });
  });
  svg.querySelectorAll('.plm-aimag').forEach(el => {
    const a = el.dataset.a;
    el.addEventListener('mousemove', e => { if (!byA[a]) { tip.style.display = 'none'; return; } const pp = P.filter(p => p.aimag === a); showTip(e, `<b>${plmapEsc(a)}</b><br>${byA[a]} үзлэг · ${pp.length} байршил${fin ? ' · ' + fmtCompact(pp.reduce((x, p) => x + p.amt, 0)) : ''}`); });
    el.addEventListener('mouseleave', () => tip.style.display = 'none');
  });

  // ── Хажуугийн самбар
  const panel = $('#plm-panel');
  const rows = arr => '<ul class="plm-rows">' + arr.map(([k, v]) => `<li><span>${plmapEsc(k)}</span><b>${v}</b></li>`).join('') + '</ul>';
  const sp = PLMAP.sel ? P.find(p => p.key === PLMAP.sel) : null;
  if (sp) {
    const T = B.tmap[sp.trip];
    const st = { other: `«${plmapEsc(sp.soum)}» нь ${plmapEsc((sp.look.others || []).join(', '))} аймгийн сум — аймгийн төвд тавив`, unknown: `«${plmapEsc(sp.soum)}» сумын жагсаалтад алга — аймгийн төвд тавив`, empty: 'Сум бичигдээгүй — аймгийн төвд тавив', fuzzy: `«${plmapEsc(sp.raw.join('», «'))}» гэж бичсэнийг «${plmapEsc(sp.soum)}» гэж үзэв`, fixed: `«${plmapEsc(sp.raw.join('», «'))}» → «${plmapEsc(sp.soum)}» гэж нэгтгэв`, noaimag: 'Аймаг бичигдээгүй' }[sp.status];
    const exs = sp.ex.slice().sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
    panel.innerHTML = `<div class="muted" style="font-size:12px"><i class="plm-sw" style="background:${tc(sp.trip)}"></i>${plmapEsc((T.t || {}).route || '—')}</div>
      <div class="plm-big">${plmapEsc(sp.aimag)}${sp.soum ? ' · ' + plmapEsc(sp.soum) : ' <span class="muted" style="font-size:12px;font-weight:600">(сум бичигдээгүй)</span>'}</div>
      <div class="muted" style="font-size:12px">${sp.dates.join(', ')}</div>
      ${st ? `<div class="plm-flag">${st}</div>` : ''}
      ${rows([['Үзлэг', sp.n], ['Адуу', sp.h], ['Эзэд', sp.o], ['Хээрийн өдөр', sp.dates.length]].concat(fin ? [['Нийт дүн', fmt(sp.amt)], ['Нэг үзлэгт дундаж', fmt(Math.round(sp.amt / sp.n))]] : []))}
      <div class="ch" style="margin-top:12px">Түгээмэл үйлчилгээ</div>${rows(sp.svL.slice(0, 6))}
      <div class="ch" style="margin-top:12px">Эмч</div>${rows(sp.dcL.map(([k, v]) => [k, v + ' үзлэг']))}
      <div class="ch" style="margin-top:12px">Үзлэгүүд (${sp.n})</div>
      <div class="plm-exlist">${exs.map(e => `<div class="plm-ex" onclick="plmapOpenExam('${plmapEsc(e.id)}')"><span>${plmapEsc(e.date || '')} · <b>${plmapEsc(e.horse || '—')}</b> <span class="muted">${plmapEsc(e.owner || '')}</span></span><span class="muted">№${plmapEsc(e.examNum || '')}</span></div>`).join('')}</div>
      <button class="btn btn-sm" style="margin-top:10px" onclick="PLMAP.sel=null;renderPlMap()">← Нийт дүн рүү</button>`;
  } else {
    const top = P.slice().sort((a, b) => b.n - a.n).slice(0, 8), mx = top[0].n;
    const sv = {}; P.forEach(p => p.svL.forEach(([k, v]) => sv[k] = (sv[k] || 0) + v));
    panel.innerHTML = `<div class="ch">Хамгийн олон үзлэгтэй газар</div>
      <ul class="plm-rows">${top.map(p => `<li class="plm-toprow" onclick="PLMAP.sel='${plmapEsc(p.key).replace(/'/g, "\\'")}';renderPlMap()"><div class="row" style="justify-content:space-between"><span><i class="plm-sw" style="background:${tc(p.trip)}"></i>${plmapEsc(p.soum || p.aimag)} <span class="muted">${p.soum ? plmapEsc(p.aimag) : ''}</span></span><b>${p.n}</b></div><div class="plm-bar"><i style="width:${p.n / mx * 100}%"></i></div></li>`).join('')}</ul>
      <div class="ch" style="margin-top:12px">Түгээмэл үйлчилгээ</div>${rows(Object.entries(sv).sort((a, b) => b[1] - a[1]).slice(0, 6))}
      <div class="muted" style="font-size:11px;margin-top:8px">Бөмбөлөг эсвэл мөр дээр дарж дэлгэрэнгүйг харна.</div>`;
  }

  // ── Хүснэгтүүд
  const TT = B.trips.filter(T => PLMAP.filt === 'all' || T.id === PLMAP.filt);
  plmapTable('plm-t-trip', [['Явц'], ['Огноо (бодит)'], ['Хүрсэн аймаг'], ['Үзлэг', 1], ['Адуу', 1]].concat(fin ? [['Дүн', 1]] : []), TT.map(T => {
    const t = T.t || {}; const dd = t.date && (T.from < t.date || T.to > (t.endDate || t.date));
    return { v: [t.route || '', T.from, T.aimags.length, T.n, T.h, T.amt], click: `plmapFilter('${plmapEsc(T.id)}')`,
      cells: [`<i class="plm-sw" style="background:${T.color}"></i>${plmapEsc(t.route || t.location || '—')}<div class="muted" style="font-size:11px">${plmapEsc(T.docs.map(d => d[0]).join(', '))}</div>`,
        `<span style="white-space:nowrap">${T.from.slice(5)} → ${T.to.slice(5)}</span>${dd ? `<div class="plm-diff">явцад: ${(t.date || '').slice(5)} → ${(t.endDate || t.date || '').slice(5)}</div>` : ''}`,
        plmapEsc(T.aimags.join(' → ')), T.n, T.h].concat(fin ? [fmtCompact(T.amt)] : []) };
  }), 1);
  const AG = {}; P.forEach(p => { const a = AG[p.aimag] || (AG[p.aimag] = { n: 0, h: 0, amt: 0, s: new Set(), t: new Set() }); a.n += p.n; a.h += p.h; a.amt += p.amt; if (p.soum) a.s.add(p.soum); a.t.add(p.trip); });
  plmapTable('plm-t-aimag', [['Аймаг'], ['Сум'], ['Үзлэг', 1], ['Адуу', 1]].concat(fin ? [['Дүн', 1]] : []), Object.entries(AG).map(([k, a]) => ({ v: [k, a.s.size, a.n, a.h, a.amt],
    cells: [[...a.t].map(t => `<i class="plm-sw" style="background:${tc(t)}"></i>`).join('') + plmapEsc(k), [...a.s].map(plmapEsc).join(', ') || '<span class="muted">—</span>', a.n, a.h].concat(fin ? [fmtCompact(a.amt)] : []) })), 2);
  plmapTable('plm-t-place', [['Аймаг'], ['Сум / байршил'], ['Огноо'], ['Үзлэг', 1], ['Адуу', 1]].concat(fin ? [['Дүн', 1]] : []).concat([['Гол үйлчилгээ'], ['Эмч']]), P.map(p => ({
    v: [p.aimag, p.soum, p.dates[0] || '', p.n, p.h].concat(fin ? [p.amt] : []).concat(['', '']), click: `PLMAP.sel='${plmapEsc(p.key).replace(/'/g, "\\'")}';renderPlMap();window.scrollTo({top:0,behavior:'smooth'})`,
    cells: [`<i class="plm-sw" style="background:${tc(p.trip)}"></i>${plmapEsc(p.aimag)}`, (p.soum ? plmapEsc(p.soum) : '<span class="muted">бичигдээгүй</span>') + (['fixed', 'fuzzy', 'other', 'unknown'].includes(p.status) ? ' <span class="plm-diff">⚠</span>' : ''),
      `<span style="white-space:nowrap">${p.dates.map(d => d.slice(5)).join(', ')}</span>`, p.n, p.h].concat(fin ? [fmtCompact(p.amt)] : [])
      .concat([`<span style="font-size:11px">${p.svL.slice(0, 2).map(([k, v]) => plmapEsc(k) + ' (' + v + ')').join('<br>')}</span>`, `<span style="font-size:11px">${plmapEsc(p.dcL.map(d => d[0]).join(', '))}</span>`]) })), 3);
}

function plmapTable(id, head, rows, defKey) {
  const tb = document.getElementById(id); if (!tb) return;
  const st = PLMAP.sort[id] || (PLMAP.sort[id] = { k: defKey, dir: -1 });
  if (st.k >= head.length) { st.k = defKey; st.dir = -1; }
  const r = rows.slice().sort((a, b) => { const x = a.v[st.k], y = b.v[st.k]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'mn')) * st.dir; });
  tb.innerHTML = '<thead><tr>' + head.map((h, i) => `<th class="${h[1] ? 'n' : ''}" onclick="plmapSort('${id}',${i})">${h[0]}${i === st.k ? (st.dir < 0 ? ' ↓' : ' ↑') : ''}</th>`).join('') + '</tr></thead><tbody>' +
    r.map(x => `<tr ${x.click ? `class="click" onclick="${x.click}"` : ''}>${x.cells.map((c, i) => `<td class="${head[i] && head[i][1] ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('') + '</tbody>';
}
function plmapSort(id, k) { const st = PLMAP.sort[id] || (PLMAP.sort[id] = { k, dir: -1 }); if (st.k === k) st.dir *= -1; else { st.k = k; st.dir = -1; } renderPlMap(); }
function plmapFilter(id) { PLMAP.filt = id === 'all' ? 'all' : String(id); PLMAP.sel = null; renderPlMap(); }
async function plmapRefresh() { PLMAP.err = ''; await plmapLoad(true); renderPlMap(); toast('🗺️ Шинэчлэгдлээ', 'ok'); }
function plmapOpenExam(id) {
  if (!(STATE.exams || []).some(x => String(x.id) === String(id))) {
    const d = (PLMAP.docs || []).find(x => String(x.id) === String(id));
    if (d && typeof fbApplyRecord === 'function') fbApplyRecord('exams', d);
  }
  openExamDetail(id);
}

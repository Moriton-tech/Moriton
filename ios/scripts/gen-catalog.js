// app.js дахь үйлчилгээ / эм / шинж тэмдгийн үндсэн жагсаалтыг апп-д зориулж catalog.json болгоно.
// Вэб дээр эдгээр жагсаалт өөрчлөгдвөл:  node ios/scripts/gen-catalog.js  (репогийн үндсэн хавтсаас)
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'app.js'), 'utf8');
function grab(name) {
  const m = src.match(new RegExp('const ' + name + '\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
  if (!m) throw new Error(name + ' олдсонгүй');
  return Function('"use strict"; return ' + m[1])();
}
function grabObj(name) {
  const m = src.match(new RegExp('const ' + name + '\\s*=\\s*(\\{[\\s\\S]*?\\n\\});'));
  if (!m) throw new Error(name + ' олдсонгүй');
  return Function('"use strict"; return ' + m[1])();
}
const out = { services: grab('SVCS'), meds: grab('MED_LIST'), symptoms: grab('SYMPTOM_LIST'), rolePages: grabObj('ROLE_DEFAULT_PAGES') };
fs.writeFileSync(path.join(__dirname, '..', 'MoritonEmch', 'catalog.json'), JSON.stringify(out));
console.log('services', out.services.length, 'meds', out.meds.length, 'symptoms', out.symptoms.length, 'roles', Object.keys(out.rolePages).length);

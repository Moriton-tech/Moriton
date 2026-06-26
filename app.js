// ============================================================
// MORTON EQUINE CLINIC - JS
// ============================================================
'use strict';

// ----- DATA: PROVINCES -----
const PROVS = ['Улаанбаатар','Архангай','Баян-Өлгий','Баянхонгор','Булган','Говь-Алтай',
  'Говьсүмбэр','Дархан-Уул','Дорноговь','Дорнод','Дундговь','Завхан','Орхон',
  'Өвөрхангай','Өмнөговь','Сүхбаатар','Сэлэнгэ','Төв','Увс','Ховд','Хөвсгөл','Хэнтий'];

// ----- DATA: SERVICES -----
const SVCS = [
  'Эмчийн үзлэг, оношилгоо','Шүд засах /аранга авах/','ЭХО Дотор','ЭХО Хөл',
  'ЭХО Ороо тодорхойлох','ЭХО Хээл шалгах','Рентген оношилгоо','ЭХО+Рентген оношилгоо',
  'Ходоодны дуран оношилгоо','Хамрын хөндий, залгиурын дуран','Хамар, залгиур-Ходоодны дуран',
  'Утлага','Шарлага','Зонд тавих +liquid','Ходоод угаах','Туурай, гахай засах урд 2 хөл',
  'Туурай, гахай засах 4 хөл','Тахлах урд 2 хөл /тахны үнэ ороогүй/','Тариа тарих',
  'Дусал шингэн хийх','Гипсдэх /+материал/','Боолт солих /+материал/','Нойтон боолт /+материал/',
  'Хүйтэн боолт','Усанд зогсоох физик эмчилгээ','Үений тариа /+кеналог/','Үений тариа /NewDN/',
  'Эсийн эмчилгээ PRP','Сав угаах','Шинжилгээ Биохими','Шинжилгээ Нийлүүлэг','Шинжилгээ Хачиг',
  'Шинжилгээ Ям','Шинжилгээ Цагаан эс тоолох','Шинжилгээ Гени','Дуудлага Ойрын /500м дотор/',
  'Дуудлага Дунд 20км','Дуудлага Дунд 25км','Дуудлага Дунд 50км','Дуудлага Холын 50-100км',
  'Дуудлага Холын 101-150км','Дуудлага Холын 150км+','Ивэрхий оёх Унага','Ивэрхий оёх Том адуу',
  'Түгжрэл колик 1-2 цаг','Түгжрэл колик 2-4 цаг','Түгжрэл колик 4-6 цаг','Түгжрэл колик 6 цагаас дээш',
  'Буглаа нээх жижиг','Буглаа нээх том','Шарх цэвэрлэх жижиг','Шарх цэвэрлэх дунд','Шарх цэвэрлэх том',
  'Шарх оёх жижиг 10см','Шарх оёх дунд 15см+','Шарх оёх том 20см+','Хавдар авах','Ургацаг авах',
  'Эрүү хадах мэс засал','Хэвлийн хөндий нээх','Нүдний мэс засал','Имплант авах','Кесар хагалгаа',
  'Хөнгөлөх','Чив тайрах','Залгиурын мэс засал','Колик мэс засал','Яс хадах шрупдэх',
  'Яс хадах бэхэлгээтэй','Яаралтай мэс заслын дуудлага','Унтуулах /+хөдөөлүүлөх/',
  'Байрлах адуу','Байрлах сарваа','Дамжин өнгөрөх адуу','Дамжин өнгөрөх сарваа','Адуу хүргэх',
  'Шөрмөс оёх','Бусад мэс засал','Бусад үзлэг / оношилгоо','Бусад шинжилгээ','Бусад эмчилгээ',
  'Бусад дуудлага','Бусад хирургийн үйлчилгээ','Бусад'
];

// SERVICE_LIST — үйлчилгээ + үнэ (хайлтад хэрэглэнэ)
const SERVICE_LIST = SVCS.map(s => ({ name: s, price: 0 }));

// Бүх идэвхтэй үйлчилгээний нэрсийг буцаана: үндсэн SVCS + Админ нэмсэн − Админ устгасан
function getAllServices() {
  const removed = new Set((STATE.removedServices || []).map(String));
  const base = SVCS.filter(s => !removed.has(s));
  const custom = (STATE.customServices || []).filter(s => !removed.has(s) && !SVCS.includes(s));
  return [...base, ...custom];
}

// ----- DATA: MEDICATIONS (sample - representative subset) -----
const MED_LIST = [
  'Барагшун тод магнай 2.5л',
  'Скоор из 1л',
  '22 ml PRP Tube',
  '3,5 шураг',
  '4 Татагч шураг',
  '4,5 Шураг',
  '5 түгжээт ялтас',
  '6,5 Татагч шураг',
  '7 өдөр /7 days/',
  '7 өдөр 3адгай 50гр',
  '7 өдөр | 7 days, 8806-051',
  'Adult 20 кг',
  'Air max plus 100ml',
  'Aluspray цацлага',
  'Atipamezole 10ml',
  'Baytril 100 ml',
  'Calcium 500 ml',
  'Catheter',
  'Cavalor Junioix 20 кг',
  'Cavalor Raceforce 20 кг',
  'Chelted copper syrup 1L',
  'Depocillin 100ml',
  'Depocillin задгай 100мл',
  'Dexaroide 50ml',
  'Dextrolytes 1 kg',
  'Domoso roll on-100g',
  'Emjemycin задгай 100мл',
  'Enjemycin',
  'Enjemycin 100 мл задгай',
  'Equip EHV 1.4',
  'Flumethrate 1% 500 ml',
  'Forte 2 l',
  'Fortis/flunixin/',
  'Genorfcoli 100 ml',
  'Gentamycin 100 ml',
  'Gentamycin 100 ml задгай',
  'HANTOX SPRAY 300МЛ',
  'Hampiseptol 100 ml',
  'Han-Tophan 100 ml',
  'Han-Tophan 100ml задгай',
  'Hankon WS 1кг',
  'Hantox spray',
  'Hartmanh 500 ml',
  'Hemo plus задгай 100мл',
  'Hemo plus-100ml',
  'Hemo15 задгай 100мл',
  'Hepatrtion 600 mg',
  'Hepatrtion 600 mg /Хепатришн/',
  'Horse bone calcium 1.5 кг',
  'Horse electrolyten1.5 kg',
  'Horse joint protect',
  'Kanamycin inj',
  'Ketoprofen 100 ml',
  'Komivita win 1 kg',
  'Lenspec 5/10',
  'Linsmycin 10 g',
  'Medesedan 20 ml задгай',
  'Mequindoh inj',
  'Meropenem 1 g',
  'Metacam 10 ml',
  'Micro chip',
  'Micro chip scanner',
  'Milk maginizm',
  'Naproxen inj',
  'Opticure нүдний тос',
  'Orondo spray 250ml',
  'Ossotide inj',
  'Oxitetraciclina 200la 100 ml',
  'Oxytetraciclin 200 la задгай',
  'PENTORSE ЗАДГАЙ',
  'PPS Pentore 50ml',
  'PPS-OJI-Japan',
  'PRP 22ml tube',
  'PRP 30 ml tube',
  'PRP 35 ml tube',
  'PRP 45 ml tube',
  'PRP 9 ml tube',
  'Parasecte 100 ml',
  'Pentorse 6мл',
  'Pentorse 6мл задгай',
  'Phenylarthrite 100мл задгай',
  'Polydeaxyribonucaleatide',
  'Pps pentose 50ml задгай',
  'Pps rentosan equine 100мл задг',
  'Pps rentosan equine-100ml',
  'Pps-oji-japan 10мг задгай',
  'Prestop',
  'Pro CMC',
  'Recocan',
  'Salphen 100 ml задгай',
  'Salphen 100ml фенил',
  'Septofin 2 l',
  'Stepen La 100мл задгай',
  'Stepen-La',
  'Synbiovit 900g',
  'Synbiovit 900g /Синбиовет/',
  'Synvet-50 2.5 ml',
  'TIA-K,C 100 мл',
  'TNA уураг 1 л',
  'TNA- уураг 1л',
  'Taipan 100мл задгай',
  'Taipan-100ml',
  'Thermaflex 500 ml',
  'Tri-silfox 100ml задгай',
  'Viamin injection 500 ml',
  'Vislos 40',
  'Xylan 50 ml',
  'energy dex 100 ml',
  'immuno vita',
  'ioban drape 60*45',
  'kabiven Peripheral 900 ml',
  'АТФ комплекс',
  'АЦЦ 600мг',
  'Авермектин пурон 1 л',
  'Автомат шприц 50 гр',
  'Адреналин хайрцаг',
  'Адреналин ширхэг',
  'Адуу Кальци 100ширхэг',
  'Адуу кальци 200ш',
  'Адуу кальци задгай',
  'Ай Со Про 1,5кг | ISOPRO, 1911',
  'Ай Со Про 10кг',
  'Ай Со Про Задгай 10000гр',
  'Ай Со Про задгай 1500гр',
  'Айнил 100мл | Ainil',
  'Айнил 100мл задгай',
  'Айрон Эксэл 1,2л /| Iron x cel',
  'Айрон Эксэл 3.7л /| Iron x cel',
  'Айрон эксэл 3.7 задгай',
  'Айрон эксэл Задгай 1200',
  'Айрон эксэл Задгай 3750',
  'Аксамит-Нео цацлага',
  'Актив 100 25кг',
  'Актив 100 25кг задгай 25000гр',
  'Аламицин аерозол цацлага 200мл',
  'Алое тариа',
  'Алтан гагнуур',
  'Альбумин уураг',
  'Ами-виком 100 мл',
  'Амидоп-S 100 мл задгай',
  'Амидоп-Д 500мл задгай',
  'Амиковет задгай',
  'Амилайт С Задгай 500мл',
  'Амилайт-С 500мл | Amylite C',
  'Амино витал 250мл',
  'Амино комплекс 91,7%',
  'Аминовит',
  'Аминовит 96%',
  'Аминовит/Тэнүүн хишиг/',
  'Аминокапроны хүчил 5%-100 мл',
  'Амитоп S 100мл',
  'Амитоп-Д 500мл | Amitop D',
  'Аммоний хлорид 250 гр',
  'Амоксиклав 1,2',
  'Анальгин задгай',
  'Анальгин орос',
  'Анальгин орос задгай 10ш',
  'Аносол',
  'Ариун бамбар',
  'Ариун тусгаарлагч /Хятад/ 100*200',
  'Ариун хамгаалалтын комбинзон',
  'Ариун хамгаалалтын хувцас',
  'Ариутгалын бодис Triple can',
  'Ариутгалын маск',
  'Ариутгалын уут 100мм*200м',
  'Арьс үдээс',
  'Аскорбин',
  'Аскорбин задгай',
  'Бабедазол',
  'Барагшун тод магнай задгай 250',
  'Барагшуун/тод магнай 5л',
  'Барагшуун/тод мангай задг 5 МЛ',
  'Бимодайн 24',
  'Бимодайн 24 Задгай 100 мл',
  'Бимодайн болус задгай',
  'Бинт',
  'Бинт 10*10 100ширхэгтэй',
  'Бинт 10*10 задгай 100ш',
  'Бинт 8*7,5*7,5',
  'Био Актив хайрцаг | Bio active',
  'Био актив задгай 60гр*3',
  'Биовит плас',
  'Биохими кет General',
  'Биохими-Electrolytes panel',
  'Блок Gain /12366595/, 90419196',
  'Бороо Нэмнээ',
  'Бромоклин',
  'Бромоклин Задгай 100мл',
  'Бутатрон | Butatron tab',
  'Бээлий 1 удаа резин задгай 50ш',
  'Бээлий 1 удаа резин хайрцаг',
  'Бээлий мэс заслын 1 удаагийн',
  'Бүтээлч моносчууд бүгдийг тэгээс',
  'Ванкомицин 1г',
  'Вета кратин FOL.AC& VIT E 3кг',
  'Витамин E 50 мл',
  'Витамин E-SEVIL 100 ML',
  'Витамин В12 1мл | Vitamin В12',
  'Витамин Е 2000 | Vitamin E 200',
  'Витамин Е-СЕ 100 мл',
  'Витамин С 20 мл задгай',
  'Витамин С 2мл',
  'Витамин С10% 1 кг',
  'Витамин С10% 1кг',
  'Витамин С10% Задгай 1000гр',
  'Витамин комплекс 100мл',
  'Витамин комплекс Задгай 100 мл',
  'Вондерсейф 100 мг задгай',
  'Вондерсейф 100мл',
  'Вонтаксим 1,0 /тариа/',
  'Гаммавет 10мг задгай',
  'Гаммавет | Gammavit',
  'Гарлик повдер 1кг | Garlic pow',
  'Гарлик повдер Задгай 1000гр',
  'Гарлик сироп 1,4л',
  'Гарлик сироп 6л',
  'Гарлик хони гльюкоз 1.4л | Gar',
  'Гарлик хони гльюкоз задгай 140',
  'Гарлик хонигльюкоз задгай 1400гр',
  'Гасто Маг Задгай 1000',
  'Гастро Маг 1000мл задгай',
  'Гастро Маг 3,7 л задгай',
  'Гастро Маг 3,75л',
  'Гастро Маг Задгай 3750',
  'Гастро Маг1л',
  'Гастро-готе 5 л',
  'Гентавиллин форт 100ml',
  'Гентавиллин форт100мл Задгай',
  'Гепарин тариа',
  'Гепаринтай хуруу шил Гонгдонг',
  'Герман Эх барихын бээлий',
  'Гилцерин 20мл',
  'Гипс',
  'Гипс 10 см*450 см',
  'Гипс хятад',
  'Глицерон 20 мл',
  'Глюзоз задгай',
  'Глюкоз',
  'Глюкоз 40% Ампул 10мл',
  'Глюкоз 5% 500 мл',
  'Глюкоз 5%-250 мл',
  'Гордокс 10мл задгай',
  'Гордокс т/уусм 100000',
  'Гүүд Аз Голд 3ш/35гр | Good as',
  'Гүүд Аз голд 3*35гр Задгай',
  'Дамартай утас ирланд',
  'Декса-тиэм 100 мл',
  'Декса-тиэм 100мл задгай',
  'Дексадерасон 100 мл',
  'Дексадерасон 50мл | Dexadreso',
  'Дексадерасон Задгай 50 мл',
  'Дексасон 100мл | Dexason',
  'Дексасон Задгай 100 мл',
  'Дексиум 50мл',
  'Дексиум Задгай 50 мл',
  'Дексиум задгай',
  'Дексо-анти',
  'Дексосан 50 мл',
  'Дексосан 50 мл задгай',
  'Демин Задгай 100 мл',
  'Дерма аэрозол',
  'Деха спа 100мл задгай',
  'Деха-сп 100мл',
  'Дехасон 100мл задгай',
  'Дикло Денк 75 т/уусм хайрцаг',
  'Дикло Денк 75т/уусм/ Задгай',
  'Дикло денк лаа',
  'Димедрол 1% задгай',
  'Димедрол 1%-1мл орос Задгай',
  'Димедрол 1%-1мл орос хайрцаг',
  'Дитрим',
  'Дитрим Задгай 100мл',
  'Дицинон 2 мл',
  'Дицинон 250мг/2мл',
  'Долооц мимо /эрдсийн /',
  'Долооц эрдсийн',
  'Домоседан 20 мл',
  'Домоседан 5 мл',
  'Дунд чөмөгний түгжээт ялтас',
  'Дунд чөмөгний шулуун ялтас',
  'Дурангийн уут',
  'Дуслын систем жижиг',
  'Дэлэнгийн тос',
  'Дөр бярууны',
  'Жи Эн Эф 80гр | GNF paste, 1',
  'Жи эйн эф 3 кг',
  'Живое 1л',
  'Загасан тос 1л Орос',
  'Зайлазин /Гүнтэрэм/',
  'Зайлазин 50мл | Xyla',
  'Зайлазин Задгай 50 мл',
  'Залитрон т/уусмал Задгай',
  'Залтирон т/уусмал 10мл',
  'Золедро-денк 4 мл',
  'Зузаан нэмнээ /цэвэр/',
  'Зэв арилагч',
  'Зүү',
  'Зүү 20G',
  'Зөгийн бал том',
  'Иверсан 100 мл',
  'Ивомек ABC',
  'Ивомек Bimeda 500 ml',
  'Ивомек Tectin 100мл',
  'Ивомек bimectin 100ml',
  'Ивомек bimectin Задгай 100мл',
  'Ивомек bimectin Задгай 250 мл',
  'Ивомек bimectin Задгай 500 мл',
  'Ивомек АВС',
  'Ивомек Хятад',
  'Ивомек зүүтэй',
  'Ивомек класки',
  'Ивомек монгол 1%',
  'Ивомек тэнүүн 100 мл',
  'Ивомек тэнүүн 100мл задгай',
  'Ивомек/монгол/',
  'Изофлуран 250 мл',
  'Изофлуран 250 мл задгай',
  'Интерлипид 20%-250мл',
  'Иод 300мл',
  'Иод 7,5 % 300 мл',
  'Иодопен хос',
  'Ихтиолтой тосон түрхлэг 50гр',
  'Кeролин Орос',
  'Калдвет',
  'Калдвет задгай',
  'Калмапос 100 мл',
  'Калформин 10 кг',
  'Калформин 3кг |',
  'Калформин 3кг задгай',
  'Калформин задгай 3000гр',
  'Калци плас 500мг',
  'Калци плас задгай',
  'Калци хлорид задгай 10мл*10ш',
  'Калция хлорид 10мл',
  'Карран ойл 20л | Carran oil ,',
  'Карран ойл 4.5л | Carran oil',
  'Карран ойл задгай 20000мл',
  'Карран ойл задгай 4500мл',
  'Кеналог 40мг хайрцаг',
  'Кенаног задгай 1мг*5ш',
  'Керолин Орос',
  'Кетанол тариа',
  'Кетонал лаа',
  'Клоксамас',
  'Клосиа ветнет  | Clocio',
  'Клосиа ветнет 50мл задгай',
  'Коспен 100мл',
  'Коспен 100мл задгай',
  'Коттон вүүл 500гр | Cotton woo',
  'Кумданг 2 мл',
  'Кумданг 250 мл',
  'Курасин 1000мл задгай',
  'Курасин 360 | Kurasyn, 1',
  'Курасин задгай 1000гр',
  'Левофлоксацин 100мл',
  'Лив 52',
  'Лив 52 задгай 100ш',
  'Ливерсол 250 мл',
  'Ливисан 100 мл задгай',
  'Ливисан 100мл',
  'Лидокайн 2%-2мл | хайрцаг',
  'Лидокайн задгай 2мл*10ш',
  'Ликүд Прафин 4,5л | Liquid par',
  'Ликүд Прафин 4500мл задгай',
  'Ликүд парафин 1 л',
  'Лянхуа тан',
  'Магни сульфат задгай 10мл*10ш',
  'Магни сульфат хайрцаг',
  'Мазь өмхий тос',
  'Макралон ГТ 100мл задгай',
  'Малгай нэг удаа',
  'Малын савны лаа',
  'Малын савны лаа задгай',
  'Марль 90см*10 см',
  'Масаран',
  'Масаран задгай 500гр',
  'Маск нэг удаа',
  'Мебо шарх 40гр',
  'Менежмент шилдгүүдээс суралцья',
  'Метоклопрамид 0,5%',
  'Механик Автомакс',
  'Ми-нунтаг',
  'Микроскоф',
  'Миксоферон',
  'Миксоферон задгай',
  'Мултивит-форте 100 мл',
  'Мультвитамин 100мл | Multivita',
  'Мультвитамин 100мл задгай',
  'Мультвитамин 50мл задгай',
  'Мультивит 1 кг',
  'Мэс заслын зүү',
  'Мэс заслын солонгос № 0,1,2',
  'Мэс заслын утас 0,2',
  'Мэс заслын утас PDS 70 см задгай',
  'Мэс заслын утас ЖОНСОН',
  'Мэс заслын утас ирланд №6',
  'Мэс заслын утас солонгос №0,1,2',
  'Мэс заслын утас уусдаггүй солонгос',
  'Мэс заслын уусдаггүй утас 2-0',
  'НБ Фенилартирит | NB Phenylart',
  'НБ фенилартерит 100 мл задгай',
  'Нарны нэмнээ',
  'Нарны том нэмнээ',
  'Нарны цэвэр нэмнээ',
  'Натри хлорид 100мл',
  'Натри хлорид 500мг',
  'Натрийн тиосульфат',
  'Неозидин',
  'Но-шпа 2мл*5ш задгай',
  'Но-шпа 40мг хайрцаг',
  'Но-шпа задгай',
  'Нова AC XANH 100 ml',
  'Нова ADE-B complex 100 ml',
  'Нова ADE-B complex 100 ml задгай',
  'Нова ADE-B.complex 100 ml',
  'Нова В комплекс 100мл',
  'Нова В комплекс задгай',
  'Нова Женмокс | Nova Genmox',
  'Нова Пенстреп | Nova Pen strep',
  'Нова С витамин',
  'Нова С витамин задгай 100 мл',
  'Нова аминовита  100 мл',
  'Нова генто-амокс 100 мл',
  'Нова генто-амокс 100 мл задгай',
  'Нова кальци В12 100 мл',
  'Нова мектин 1% | Nova Mectin 1',
  'Нова септрил 24%',
  'Нова септрил 24% 100 мл задгай',
  'Нова төмөр В12 100 мл',
  'Нова төмөр В12 задгай 100мл',
  'Нова хефа в12 задгай',
  'Нова-АТФ комплекс',
  'Нова-АТФ комплекс задгай 100мг',
  'Нова-төмөр В12 100 мл',
  'Нова-хефа В12 100мл',
  'Новакайн амп /Зад/2мл',
  'Новоамин 8,5%-250мл',
  'Новокайн амп',
  'Ногоон тос',
  'Ногт даавуун',
  'Нордайн паст',
  'Нэмнээ бороо бөхт',
  'Нэмнээ зузаан доод нас',
  'Нэмнээ зузаан дээд нас',
  'Нэмнээ зузаан хязаалан нас',
  'Нэмнээ зузаан шүдлэн',
  'Нэмнээ унага',
  'Нэмнээ ухаа хүлэг цэвэр',
  'Нэмнээ хөлс',
  'Нэмнээ цэвэр адууны',
  'Нэмнээ цэвэр адууны өвлийн',
  'Нэмнээ цээжны',
  'Нэмнээ/Азарга борооны',
  'Нэутрагаст | Neutragast',
  'Нэутрасид 1.2л | Neutracid , 1',
  'Нүдний тос',
  'Нүүрсэн хар',
  'Оксилин 5%',
  'Окситоцин 100 мл задгай',
  'Окситоцин 100мл | Oxytocin',
  'Окситоцин 20 мл',
  'Орондо спрэй 250мл | Oronda sp',
  'Ороох боох 120*120',
  'Остео калци',
  'Офлоксацин 2мг',
  'Панангийн 10мл*5ш задгай',
  'Панангийн хайрцаг',
  'Пантопразол 40мг',
  'Пантопразол 500 мг',
  'Панфеникол цацлага',
  'Панфеникол цацлага 5 г',
  'Парацетамол 1%-100 мл',
  'Пенбекс 100 мл',
  'Пенбекс 100 мл задгай',
  'Пенбекс 100мл | Penbex',
  'Пенстреп 100мл ГТ | Penstrep',
  'Пенстреп 100мл задгай',
  'Пенстреп 400ла',
  'Пенстреп 400ла задгай',
  'Перкись 3%-25мл',
  'Пипетка хошуу',
  'Пластерь хар хөх дамартай',
  'Пластыр 3*500',
  'Пластыр 4*500',
  'Пластыр 5*500',
  'Полимер чиг 7,5-3,6 м',
  'Порокайн пенцеллин 100мл',
  'Порокайн пенцеллин 100мл-задгай',
  'Порциллин ЛА 100мл | Procillin',
  'Порциллин Ла 100 мл задгай',
  'Порциллин Ла 100мл задгай',
  'Приентал 50мг',
  'Приентал Задгай 50мл',
  'Проканазол 0,2%-100мл',
  'Пропофол 20 мл',
  'Пропофол 20 мл задгай',
  'Пулмикан',
  'Реамберин 400мл',
  'Ренонтрикал 10000',
  'Ренонтрикал тариа',
  'Реосорбилакст 400 мл',
  'Реосорбилакт 400 мл',
  'Рибоксин 20% 5мл тариа хайрцаг',
  'Рибоксин 5мл*10ш задгай',
  'Рифамицин /тариа/',
  'Рифамицин 150мг',
  'Рифамицин 150мг задгай',
  'СДБ',
  'Салхины нэмнээ',
  'Санд Экспел 4кг |хайрцаг',
  'Санд Экспел задгай 4000гр',
  'Сармисны тариа',
  'Сахууны вакцин',
  'Септоспрей 100 мл',
  'Сериал балансер Gain /12366447',
  'Сериал блансер гайн за 25000гр',
  'Си Ди Пи ТЭХ',
  'Сидентал өтны | Cidental',
  'Сингапурыг хөгжлийн нууц',
  'Синкробен',
  'Систем солонгос',
  'Системийн наалт',
  'Скоор из',
  'Скоор из 1000л задгай',
  'Со витамин С 100 мл',
  'Сойтог',
  'Солонгос цефатоксим',
  'Спийд Эксел 1,2л | Speed x cel',
  'Спийд Эксел 1200мг задгай',
  'Спийд Эксел 1200мл задгай',
  'Спийд Эксел 3.7л | Speed x cel',
  'Спийд Эксел 3750мг задгай',
  'Спийд эксел 3700 задгай',
  'Спирт 1000мл задгай',
  'Спирт 5 л',
  'Спирт 70% 1л',
  'Споонж',
  'Стераниос 2%-5 л',
  'Стопдиар 100мг',
  'Страед НА 1,182л | Stride HA,',
  'Страед НА Задгай',
  'Страед На 1182мл задгай',
  'Стэй Саунд 1,5кг | Stay sound,',
  'Стэй Саунд 5кг | Stay sound, 1',
  'Стэй саунд 1,5кг задгай',
  'Сульфасалазин 50',
  'Суперамина /Тэнүүн хишиг',
  'Суперамина 500 мл',
  'Суперамино/Тэнүүн хишиг/',
  'Суперкилл 1 кг',
  'Сэрвээ хэмжигч',
  'Таван эрдэнэ 2,5л',
  'Тамедин ам зайлах',
  'Тариа Germany',
  'Тариа герман 10мл задгай',
  'Тариаын шүүлтүүр',
  'Тариур үр шахах',
  'Тах Х/цагаан',
  'Тах америк',
  'Тах хятад',
  'Тетрокси ЛА 100мл | Tetroxy LA',
  'Тетрокси Ла 100мл задгай',
  'Тос cellius',
  'Тос zinc oxide 100 гр',
  'Тос бутапсин мазь',
  'Тос цахлай 150 гр',
  'Тос янбек',
  'Трамадол',
  'Тусгаарлагч 1 удаа бүтээлэг',
  'Тусгаарлагч ариутгасан 180*200',
  'Тусгаарлагч ариутгасан 240*240',
  'Тусгаарлагч ариутгасан 80*120',
  'Тусгаарлагч даавуу 100*220',
  'Тусгаарлагч даавуу 80*220',
  'Туулга Bimectin',
  'Туулга Cattle max 300ml',
  'Туулга IVE+PRA 300 ml',
  'Туулга IVE+PRA 300 мл задгай',
  'Туулга Албендазол 1л',
  'Туулга Албендазол 1л Малчин/М',
  'Туулга Ивермектин 1л Малчин/М,',
  'Туулга Экомектин шахмал | Ecom',
  'Туулга Экүмакс 300гр задгай',
  'Туулга экүмакс',
  'Туулга эрдэстэй 1л',
  'Туулганы хошуу ММ',
  'Туурай хутга битүү',
  'Туурай хутга битүү ирланд',
  'Туурай чангалагч',
  'Туурайн бахь ЛНХ',
  'Туурайн бахь, хумслагч',
  'Туурайн хутга',
  'Туурайн хуурай',
  'Туфоал 1000мг задгай',
  'Туфоал | Tufoal, 125',
  'Тэжээл  мимо /классик 20кг/',
  'Тэжээл elevage 25 кг',
  'Тэжээл sensation',
  'Тэжээл ажнай хүлэг',
  'Тэжээл воллкон',
  'Тэжээл гастро',
  'Тэжээл мимо /супер 20кг/',
  'Тэжээл омилойн 500',
  'Тэжээл спорт',
  'Тэжээлийн уут',
  'Түгжээт ялтас',
  'Түргэн цагаан эмийн ургамал',
  'Төлийн сүү',
  'Төмөр тах',
  'Углаа',
  'Улаан эс EPO 6000',
  'Унтуулгын бодис',
  'Уралдааны сироп 2000мл залгай',
  'Уралдааны сироп 2л | Racing sy',
  'Уралдааны сироп 2л задгай',
  'Уралдааны сироп 5000мл задгай',
  'Уралдааны сироп 5л | Racing sy',
  'Уралдааны сироп 5л задгай',
  'Урсомон 250 мл',
  'Уталгын аппарат ууршуулагч',
  'Утлагын аппарат Ирланд',
  'Утлагын шингэн 2,5мл',
  'Уутны ам наалт',
  'Уян боолт',
  'Уян боолт 15*450',
  'Уян боолт15*450',
  'Уян зүү',
  'Уян зүү 16 G',
  'Уян зүү 22G',
  'Уян зүүний наалт/Лейг/',
  'Фенилбутазон /Төрөө/',
  'Фенилбутазон Sydnie задгай',
  'Фенилбутазон sydnie',
  'Фенилбутазон герман',
  'Фенилбутазон герман 100мл задг',
  'Фенилбутазон орос 100мл задгай',
  'Фенилбутазон орос | Fenylbutaz',
  'Фенилбутазон/МГ/',
  'Фенилбутатрон /недирлант/',
  'Фенилбутатрон/недирлант/ задгай',
  'Фенилвет /Тэнүүн хишиг/',
  'Фенилвет /Тэнүүн хишиг/ задгай',
  'Фенилвет/Тэнүүн хишиг/',
  'Фламайз 500мл задгай',
  'Фламайз EQ 500гр',
  'Флуназайне 100мл',
  'Флуназайне 100мл задгай',
  'Флунекс 100 мл',
  'Флунекс 100 мл агри',
  'Флунекс 100 мл агри задгай',
  'Флунекс 100мл агри',
  'Флуниксин 10 мл',
  'Флювил 100мл',
  'Флювил 100мл задгай',
  'Фосфовет 100мл задгай',
  'Фрусомед 1%-2,0 хайрцаг',
  'Фрусомед задгай 2мл*10ш',
  'Фуровит',
  'Фуровит 100мл задгай',
  'Хадаас чангалагч',
  'Халуун боолт | Poultice',
  'Халууны уян шил',
  'Халууны шил',
  'Халууны шил уян',
  'Хамгаалалтын малгай',
  'Хамгаалалтын тохойвч',
  'Хамгаалалтын хантааз',
  'Хамгаалалтын хувьцас 1 удаагий',
  'Хамгаалалтын өвдгөвч',
  'Ханиадны вакцин ГБЛ',
  'Хефатик баланс 1л | Hepatic ba',
  'Хефатик бланс 1000мл задгай',
  'Хиймэл арьс',
  'Хлоргексидин 300 мл',
  'Холбогч 3 замт',
  'Хоросол',
  'Хуванцар микровет',
  'Хуруу шил',
  'Хутга иш ирний хамт',
  'Хуурай гел | Bottled lub powde',
  'Хуурай глюкоз 1 кг',
  'Хуурай глюкоз 5 кг',
  'Хүйтэн боолт /Улаан дунд /',
  'Хүйтэн боолт /хар жижиг /',
  'Хүйтэн боолт /цэнхэр том/',
  'Хүргэлт',
  'Хүүф Ойл 800гр | Hoof oil, 191',
  'Хүүф макер 20гр | Hoof maker,',
  'Хүүф макер 3кг | Hoof maker, 1',
  'Хүүхдийн хувцас даалимбан',
  'Хөвөн /өргөн/',
  'Хөвөн 50гр',
  'Хөлийн боолт wrap 30см',
  'Хөлийн боолт wrap 50 см',
  'Хөлийн боолт | Wrap',
  'Хөлийн гель',
  'Хөлийн тос ДМСО | DMSO',
  'Хөлийн тос Соёомго | Soyungo',
  'Хөхөлт',
  'Хөөврийн сам',
  'Цефазолин',
  'Цефатаксим задгай',
  'Цефотаксим 1,0',
  'Ципрофлоксацин 200 мг',
  'Цистон',
  'Цистон 60ш задгай',
  'Цээживч том',
  'Чээживч Нэмнээ',
  'Шарх угаагч буу',
  'Шарх угаах спонж',
  'Шархны боолтны ком',
  'Шархны наалт',
  'Шилэн трико',
  'Шингэн Метронидазол 100мл',
  'Шингэн Натри хлорид 1л | NaCL',
  'Шингэн Натри хлорид 500мл | Na',
  'Шингэн Пантоген 500 мл',
  'Шингэн Рингер лактат 1л |Renge',
  'Шингэн Рингер лактат 500мл| Re',
  'Шингэн буламин 500 мл',
  'Шингэн витаплекс 500 мл',
  'Шингэн маннитол 500 мл',
  'Шингэн натри 100 мл',
  'Шингэн натри хлорид 250 мл',
  'Шингэн натри хлорид 500 мл',
  'Шингэн үр шингэлэгч',
  'Шприц 100гр',
  'Шприц 10гр',
  'Шприц 20гр',
  'Шприц 3гр',
  'Шприц 50 гр',
  'Шприц 5гр',
  'Шприц 60гр',
  'Экюзал 400мл | Equizal, 1',
  'Экюзал 400мл задгай',
  'Экүвент 1000мл задгай',
  'Экүвент 1л | Equivent , 1',
  'Экүвент 500Мл | Equivent , 191',
  'Экүвент 500мл задгай',
  'Экүвэнт 1000гр задгай',
  'Элгэвч Нэмнээ',
  'ЭнэрЖен Q-10 | Eqnergene Q-10,',
  'Эуфиллин 24мг/мл 10мл задгай',
  'Эуфиллин 24мг/мл-10мл',
  'Эффивет Hydrogel 500МЛ Задгай',
  'Эффивет Хайдрогел/500мл/',
  'Эффивет ликүд 500мл',
  'Эффивет ликүд 500мл задгай',
  'Эффивет ликүд | effevit liquid',
  'Эффивэт Hydrogel 500ml',
  'Эх барихын бээлий',
  'Эхо гель 250мл',
  'Ээмэглэгч бахь',
  'Ялааны хор',
  'Ямлуур',
  'Ясны өрөм',
  'Ясурамин 10 мл',
  'биохими диск ГЛБ',
  'хөлийн тос Фурозоне | Furazone',
  'цээживч жижиг',
  'эуфиллин 10 мл задгай',
  'Үр суулгах гуурс',
  'Үсний машин',
  'Өмхий ногоон тос',
];

// ----- DATA: DEFAULT DOCTORS -----
const DEFAULT_DOCS = [
  {id:'d1',  name:'Наранбаатар',         role:'Ерөнхий эмч',  exams:0, rev:0},
  {id:'d2',  name:'Сайнбилэг',           role:'Ахлах эмч',    exams:0, rev:0},
  {id:'d3',  name:'Өсөхбаяр',            role:'Ахлах эмч',    exams:0, rev:0},
  {id:'d4',  name:'Даваахүү',            role:'Малын их эмч', exams:0, rev:0},
  {id:'d5',  name:'Нямпүрэв',            role:'Малын их эмч', exams:0, rev:0},
  {id:'d6',  name:'Тансагтөгөлдөр',      role:'Малын их эмч', exams:0, rev:0},
  {id:'d7',  name:'Т.Тайванбат',         role:'Малын их эмч', exams:0, rev:0},
  {id:'d8',  name:'Гончигдорж',          role:'Малын их эмч', exams:0, rev:0},
  {id:'d9',  name:'Төгөлдөр-Эрдэнэ',     role:'Малын их эмч', exams:0, rev:0}
];

// ----- STATE -----
const STATE = {
  horses: [],
  waiting: [],
  exams: [],
  fins: [],
  inps: [],
  doctors: [],
  staff: [],
  users: [],
  logs: [],
  deletedIds: new Set(),
  deletedExams: [],   // устгасан үзлэгийн архив (зөвхөн Админ харна)
  servicePrices: {},  // үйлчилгээний үндсэн үнэ { "нэр": үнэ } — Админ панелаас тохируулна
  customServices: [], // Админ нэмсэн нэмэлт үйлчилгээний нэрс
  removedServices: [],// Админ устгасан үйлчилгээний нэрс (үндсэн SVCS-ээс нуух)
  user: null,
  syncURL: '',
  // ui
  activePage: 'dashboard',
  activeETab: 'doc',
  activeFTab: 'pending',
  activeKPer: 'd',
  activeRPer: 'd',
  activeKSub: 'view',
  selectedKDoc: null,
  selectedW: null,
  selectedI: null,
  selectedF: null,
  curExam: null,
  loginPin: '',
  loginRole: 'Ерөнхий эмч',
  payTarget: null,
  editTarget: null
};

// ============================================================
// PERSISTENCE
// ============================================================
// ============================================================
// PERSISTENCE
// ============================================================
function lsGet(k, def) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : def;
  } catch(e) { return def; }
}
function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {}
}
function loadAll() {
  STATE.horses = lsGet('mt_horses', []);
  STATE.waiting = lsGet('mt_waiting', []);
  STATE.exams = lsGet('mt_exams', []);
  STATE.fins = lsGet('mt_fins', []);
  STATE.inps = lsGet('mt_inps', []);
  STATE.doctors = lsGet('mt_doctors', DEFAULT_DOCS);
  STATE.staff = lsGet('mt_staff_list', []);
  STATE.users = lsGet('mt_users', []);
  // Хэрэглэгч хоосон бол анхны seed жагсаалтаар дүүргэнэ
  if (!Array.isArray(STATE.users) || STATE.users.length === 0) {
    STATE.users = DEFAULT_USERS.map(u => ({ ...u, pages: [...u.pages] }));
    _scheduleLsSave('users');
  }
  STATE.staffSchedule = lsGet('mt_staff_schedule', {}); // { 'YYYY-MM': { docId: { 'YYYY-MM-DD': 'work'|'duty'|'off' } } }
  STATE.logs = lsGet('mt_logs', []);
  if (!Array.isArray(STATE.logs)) STATE.logs = [];
  // Устгасан бичлэгийн ID-уудыг сэргээнэ (sync үед буцаж нэмэгдэхээс сэргийлнэ)
  const delArr = lsGet('mt_deleted', []);
  STATE.deletedIds = new Set(Array.isArray(delArr) ? delArr.map(String) : []);
  // Устгасан үзлэгийн архив
  STATE.deletedExams = lsGet('mt_deleted_exams', []);
  if (!Array.isArray(STATE.deletedExams)) STATE.deletedExams = [];
  // Үйлчилгээний үнэ
  STATE.servicePrices = lsGet('mt_service_prices', {});
  if (!STATE.servicePrices || typeof STATE.servicePrices !== 'object' || Array.isArray(STATE.servicePrices)) STATE.servicePrices = {};
  // Нэмэлт / устгасан үйлчилгээ
  STATE.customServices = lsGet('mt_custom_services', []);
  if (!Array.isArray(STATE.customServices)) STATE.customServices = [];
  STATE.removedServices = lsGet('mt_removed_services', []);
  if (!Array.isArray(STATE.removedServices)) STATE.removedServices = [];
  STATE.user = lsGet('mt_user', null);
  STATE.syncURL = ''; // Apps Script sync устгагдсан — Firebase ашиглана
  if (STATE.doctors.length === 0) STATE.doctors = [...DEFAULT_DOCS];
  // Auto-upgrade old default doctors (Б.Батбаяр / Д.Сэлэнгэ / Г.Энхбат) to new real list
  const oldNames = ['Б.Батбаяр','Д.Сэлэнгэ','Г.Энхбат'];
  const isOldDefault = STATE.doctors.length <= 3 &&
    STATE.doctors.every(d => oldNames.includes(d.name)) &&
    STATE.doctors.every(d => (d.exams||0) === 0);
  if (isOldDefault) {
    STATE.doctors = [...DEFAULT_DOCS];
    lsSet('mt_doctors', STATE.doctors);
  }
}
function saveAll() {
  lsSet('mt_horses', STATE.horses);
  _scheduleLsSave('waiting');
  lsSet('mt_exams', STATE.exams);
  lsSet('mt_fins', STATE.fins);
  lsSet('mt_inps', STATE.inps);
  lsSet('mt_doctors', STATE.doctors);
  lsSet('mt_staff_list', STATE.staff);
  lsSet('mt_users', STATE.users || []);
  lsSet('mt_staff_schedule', STATE.staffSchedule || {});
  // Лог хэт томроос сэргийлж сүүлийн 1000-аар хязгаарлана
  if (Array.isArray(STATE.logs) && STATE.logs.length > 1000) {
    STATE.logs = STATE.logs.slice(-1000);
  }
  lsSet('mt_logs', STATE.logs || []);
  // Устгасан ID-уудыг хадгална (хамгийн сүүлийн 2000-аар хязгаарлана)
  if (STATE.deletedIds instanceof Set) {
    let delArr = [...STATE.deletedIds].map(String);
    if (delArr.length > 2000) delArr = delArr.slice(-2000);
    lsSet('mt_deleted', delArr);
  }
  // Устгасан үзлэгийн архив (сүүлийн 500-аар хязгаарлана)
  if (Array.isArray(STATE.deletedExams)) {
    if (STATE.deletedExams.length > 500) STATE.deletedExams = STATE.deletedExams.slice(-500);
    _scheduleLsSave('deletedExams');
  }
  // Үйлчилгээний үнэ
  if (STATE.servicePrices && typeof STATE.servicePrices === 'object') {
    lsSet('mt_service_prices', STATE.servicePrices);
  }
  // Нэмэлт / устгасан үйлчилгээ
  if (Array.isArray(STATE.customServices)) lsSet('mt_custom_services', STATE.customServices);
  if (Array.isArray(STATE.removedServices)) lsSet('mt_removed_services', STATE.removedServices);
}

// ============================================================
// UTIL
// ============================================================
function $(s) { return document.querySelector(s); }
function $$(s) { return [...document.querySelectorAll(s)]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).substr(2,5); }
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
// UTC биш local цагаар YYYY-MM-DD буцаана (UTC+8 Монгол цаг)
function localDateStr(d) {
  if (!d) return '';
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt)) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function nowMs() { return Date.now(); }

// Бичлэгийн БОДИТ хугацаа: эхлээд огноо (date)-г, байхгүй бол ms-г ашиглана.
// Импортоор нөхөж оруулсан бичлэгийн ms нь оруулсан агшны хугацаа болдог тул
// эрэмбэлэхэд огноог нь түрүүлж тооцох ёстой — эс бөгөөс "сүүлд оруулсан нь дээр" гарна.
function recTime(r) {
  if (r && r.date) {
    const t = new Date(r.date + (r.time ? 'T' + r.time : 'T12:00:00')).getTime();
    if (t > 0) return t;
  }
  if (r && r.createdAt) return parseFloat(r.createdAt) || 0;
  if (r && r.ms) return parseFloat(r.ms) || 0;
  return 0;
}
function fmt(n) { return '₮' + (n||0).toLocaleString('en-US'); }
function fmtCompact(n) {
  n = n || 0;
  if (n >= 1000000) return '₮' + (n/1000000).toFixed(1).replace(/\.0$/,'') + 'сая';
  if (n >= 1000) return '₮' + Math.round(n/1000) + 'мянга';
  return '₮' + n;
}
function fmtTime(ms) {
  const d = new Date(ms);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}
// Үргэлжлэх хугацааг (минут) хүний уншихуйц болгоно: 45 → "45 мин", 90 → "1ц 30мин"
function fmtDuration(min) {
  if (min === null || min === undefined || isNaN(min)) return '—';
  min = Math.round(min);
  if (min < 60) return min + ' мин';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? (h + 'ц ' + m + 'мин') : (h + ' цаг');
}
function fmtDate(d) {
  if (!d) return '';
  if (typeof d === 'string') d = new Date(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function ago(ms) {
  const diff = (nowMs() - ms) / 1000;
  if (diff < 60) return Math.floor(diff) + 'с';
  if (diff < 3600) return Math.floor(diff/60) + 'мин';
  if (diff < 86400) return Math.floor(diff/3600) + 'ц';
  return Math.floor(diff/86400) + 'хон';
}
function escHTML(s) {
  return (s||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// ----- TOAST -----
let toastTimer;
function toast(msg, type) {
  const t = $('#toast');
  t.className = ''; void t.offsetWidth;
  t.textContent = msg;
  if (type) t.classList.add(type);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2500);
}

// ----- MODAL -----
function openModal(id) { $('#'+id).classList.add('show'); }
function closeModal(id) { $('#'+id).classList.remove('show'); }

// ============================================================
// LOGIN
// ============================================================
function setupLogin() {
  populateLoginUsers();
  // Enter to submit
  const pwInput = document.getElementById('login-pw');
  if (pwInput) {
    pwInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doLogin(); }
    });
  }
  const userSel = document.getElementById('login-user');
  if (userSel) {
    userSel.addEventListener('change', () => {
      // Clear error when user selects
      const err = document.getElementById('login-err');
      if (err) err.textContent = '';
      if (pwInput) pwInput.focus();
    });
  }
}

// Login dropdown-ийг STATE.users-ээс дүрээр бүлэглэн динамикаар бөглөнө
function populateLoginUsers() {
  const sel = document.getElementById('login-user');
  if (!sel) return;
  const prev = sel.value;
  const users = (STATE.users && STATE.users.length) ? STATE.users : DEFAULT_USERS;
  // Дүрүүдийг ALL_ROLES-ийн дарааллаар бүлэглэнэ
  let html = '<option value="">— Нэр сонгох —</option>';
  ALL_ROLES.forEach(role => {
    const inRole = users.filter(u => u.role === role);
    if (!inRole.length) return;
    html += '<optgroup label="' + escHTML(role) + '">';
    inRole.forEach(u => {
      html += '<option value="' + escHTML(u.name) + '">' + escHTML(u.name) + '</option>';
    });
    html += '</optgroup>';
  });
  // ALL_ROLES-д ороогүй дүртэй хэрэглэгч байвал "Бусад"-д хийнэ
  const other = users.filter(u => !ALL_ROLES.includes(u.role));
  if (other.length) {
    html += '<optgroup label="Бусад">';
    other.forEach(u => {
      html += '<option value="' + escHTML(u.name) + '">' + escHTML(u.name) + '</option>';
    });
    html += '</optgroup>';
  }
  sel.innerHTML = html;
  // Өмнөх сонголтыг сэргээнэ (боломжтой бол)
  if (prev && users.some(u => u.name === prev)) sel.value = prev;
}

// ============================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================
// Хэрэглэгч бүр өөр нэр + нууц үгтэй
// ============================================================
// ХЭРЭГЛЭГЧИД — Firebase-д хадгалагдана (clinic/users document)
// Доорх жагсаалт нь ЗӨВХӨН анхны seed. Систем дотроос нэмж/засаж
// болох ба бүх өөрчлөлт Firebase-ээр бүх төхөөрөмжид тархана.
// ============================================================
// ⚠️ DEFAULT_USERS — нууц үггүй хоосон жагсаалт.
// Нууц үгийг Firestore-аас татна. Хэрэв users collection хоосон бол
// Админ Firebase Console-оос хэрэглэгч нэмнэ.
// Нууц үгийг ХЭЗЭЭ ЧИД frontend код, localStorage-д plain text хадгалах ХОРИОТОЙ.
const DEFAULT_USERS = [
  { name: 'Наранбаатар',     pw: '',  role: 'Ерөнхий эмч',        pages: ['dashboard','register','waiting','exam','inpatient','finance','kpi','history','report','admin'] },
  { name: 'Сайнбилэг',       pw: '',  role: 'Ахлах эмч',          pages: ['dashboard','register','waiting','exam','inpatient','finance','kpi','history','report'] },
  { name: 'Өсөхбаяр',        pw: '',  role: 'Ахлах эмч',          pages: ['dashboard','register','waiting','exam','inpatient','finance','kpi','history','report'] },
  { name: 'Даваахүү',        pw: '',  role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Нямпүрэв',        pw: '',  role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Тансагтөгөлдөр',  pw: '',  role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Т.Тайванбат',     pw: '',  role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Гончигдорж',      pw: '',  role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Төгөлдөр-Эрдэнэ', pw: '', role: 'Малын их эмч',       pages: ['dashboard','register','waiting','exam','inpatient','history'] },
  { name: 'Дадлагажигч',     pw: '',  role: 'Дадлагажигч',        pages: ['dashboard','waiting','exam','inpatient','history'] },
  { name: 'Бүртгэл',         pw: '',  role: 'Бүртгэлийн ажилтан', pages: ['dashboard','register','waiting','history'] },
  { name: 'Санхүү',          pw: '',  role: 'Санхүү',             pages: ['dashboard','finance','history','report'] },
  { name: 'Админ',           pw: '',  role: 'Админ',              pages: ['dashboard','register','waiting','exam','inpatient','finance','kpi','history','report','admin'] }
];

// Боломжит бүх хуудас (эрх тохируулахад ашиглана)
const ALL_PAGES = [
  { id: 'dashboard', label: 'Хяналтын самбар' },
  { id: 'register',  label: 'Адуу бүртгэл' },
  { id: 'waiting',   label: 'Хүлээж байгаа' },
  { id: 'exam',      label: 'Үзлэг / Эмчилгээ' },
  { id: 'inpatient', label: 'Хэвтэн эмчлүүлэх' },
  { id: 'finance',   label: 'Санхүү' },
  { id: 'history',   label: 'Түүх' },
  { id: 'kpi',       label: 'KPI самбар' },
  { id: 'report',    label: 'Өдрийн тайлан' },
  { id: 'admin',     label: 'Системийн тохиргоо' }
];

// Боломжит дүрүүд
const ALL_ROLES = ['Ерөнхий эмч','Ахлах эмч','Малын их эмч','Дадлагажигч','Бүртгэлийн ажилтан','Санхүү','Админ'];

// STATE.users массиваас нэрээр хайх хялбар объект (хуучин USERS[name]-тэй нийцтэй)
function getUsers() {
  const map = {};
  (STATE.users || []).forEach(u => {
    if (u && u.name) map[u.name] = u;
  });
  return map;
}

// Тухайн дүрийн эрхийг STATE.users-ээс динамикаар тооцох
function pagesForRole(role) {
  // Эхлээд тухайн дүртэй ямар нэг хэрэглэгчийн pages-ийг ашиглана
  const u = (STATE.users || []).find(x => x.role === role && Array.isArray(x.pages));
  if (u) return u.pages;
  return [];
}

// ============================================================
// LOG SYSTEM
// ============================================================
function writeLog(action, targetId, targetName, details, examId) {
  if (!STATE.user) return null;
  const log = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
    user_name: STATE.user.name || STATE.user.role,
    user_role: STATE.user.role,
    action: action,
    target_id: targetId || '',
    target_name: targetName || '',
    exam_id: examId || '',
    details: details || '',
    log_date: todayStr(),
    log_ms: nowMs()
  };
  if (!Array.isArray(STATE.logs)) STATE.logs = [];
  STATE.logs.push(log);
  _scheduleLsSave('logs');
  fbSaveRecord('logs', log);
  if (STATE.activePage === 'admin') { try { renderLogViewer(); } catch(_){} }
  return log;
}

// Жижиг туслах: засварласан талбаруудын өмнөх→дараах ялгааг текст болгоно
function diffStr(before, after, fields) {
  const parts = [];
  fields.forEach(f => {
    const b = (before && before[f.k] != null) ? String(before[f.k]) : '';
    const a = (after  && after[f.k]  != null) ? String(after[f.k])  : '';
    if (b !== a) parts.push(`${f.label}: «${b}» → «${a}»`);
  });
  return parts.join('; ');
}

// Устгах эрх — ЗӨВХӨН Админ
function canDelete() {
  return !!(STATE.user && STATE.user.role === 'Админ');
}
// Засах эрх — Ерөнхий эмч / Ахлах эмч / Админ
function canEditData() {
  return !!(STATE.user && ['Ерөнхий эмч','Ахлах эмч','Админ'].includes(STATE.user.role));
}

// Орлого / мөнгөн дүн харах эрх — зөвхөн санхүүгийн хуудас руу хандах эрхтэй хүн.
// Малын их эмч, Дадлагажигч зэрэг эмч нарт орлогын дүн харагдахгүй.
function canSeeFinance() {
  return !!(STATE.user && STATE.user.role && canAccess('finance'));
}


function canAccess(page) {
  if (!STATE.user || !STATE.user.role) return false;
  // Хэрэглэгчид өөрт нь тусгайлан pages байвал түүнийг эрхэмлэнэ
  const me = getUsers()[STATE.user.name];
  const pages = (me && Array.isArray(me.pages)) ? me.pages : pagesForRole(STATE.user.role);
  return pages.includes(page);
}

function applyRolePermissions() {
  if (!STATE.user) return;
  const me = getUsers()[STATE.user.name];
  const pages = (me && Array.isArray(me.pages)) ? me.pages : pagesForRole(STATE.user.role);
  if (!pages || !pages.length) return;
  // Hide bottom nav buttons the role can't access
  document.querySelectorAll('.bn-i[data-page]').forEach(btn => {
    const p = btn.dataset.page;
    btn.style.display = pages.includes(p) ? '' : 'none';
  });
  // Hide drawer items the role can't access
  document.querySelectorAll('.ni[data-page]').forEach(el => {
    const p = el.dataset.page;
    el.style.display = pages.includes(p) ? '' : 'none';
  });
  // "Үнэ оруулах" товчийг зөвхөн Админд харуулна
  const isAdminUser = STATE.user.role === 'Админ';
  ['ni-sync','ni-sync2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isAdminUser ? '' : 'none';
  });
}

function doLogin() {
  const userSel = document.getElementById('login-user');
  const pwInput = document.getElementById('login-pw');
  const err = document.getElementById('login-err');
  const userName = userSel ? userSel.value : '';
  const pw = pwInput ? pwInput.value : '';
  if (!userName) { if (err) err.textContent = 'Нэвтрэх нэр сонгоно уу'; return; }
  if (!pw)       { if (err) err.textContent = 'Нууц үг оруулна уу'; return; }
  const u = getUsers()[userName];
  if (!u) {
    if (err) err.textContent = 'Нэвтрэх нэр буруу байна';
    return;
  }
  // Async hash шалгалт
  _checkPassword(pw, u).then(ok => {
    if (!ok) {
      if (err) err.textContent = 'Нууц үг буруу байна';
      if (pwInput) { pwInput.value = ''; pwInput.focus(); }
      return;
    }
    STATE.user = { name: userName, role: u.role, loginAt: nowMs() };
    lsSet('mt_user', STATE.user);
    document.getElementById('login').classList.add('hide');
    document.getElementById('app').style.display = 'flex';
    $('#hdr-sub').textContent = userName + ' · ' + u.role;
    if ($('#drawer-sub')) $('#drawer-sub').textContent = u.role;
    if (err) err.textContent = '';
    if (pwInput) pwInput.value = '';
    initApp();
    applyRolePermissions();
    writeLog('Нэвтэрсэн', '', '');
    if (!canAccess(STATE.activePage || 'dashboard')) {
      nav('dashboard');
    }
  }).catch(() => {
    if (err) err.textContent = 'Нэвтрэх алдаа гарлаа. Дахин оролдоно уу.';
  });
}

function logout() {
  if (!confirm('Гарах уу? Хадгалагдсан өгөгдөл арилахгүй.')) return;
  STATE.user = null;
  try { localStorage.removeItem('mt_user'); } catch(e) {}
  // Hide app, show login
  $('#app').style.display = 'none';
  $('#login').classList.remove('hide');
  // Reset form
  const userSel = document.getElementById('login-user');
  const pwInput = document.getElementById('login-pw');
  if (userSel) userSel.value = '';
  if (pwInput) pwInput.value = '';
  toast('👋 Гарлаа', 'ok');
}

// ============================================================
// NAV
// ============================================================
function nav(p, opts) {
  opts = opts || {};
  // Role-based access check — redirect to dashboard if not allowed
  if (STATE.user && !canAccess(p)) {
    toast('Энэ хуудсанд хандах эрх алга байна', 'err');
    p = 'dashboard';
  }
  const samePage = (STATE.activePage === p);
  STATE.activePage = p;
  $$('.page').forEach(x => x.classList.remove('active'));
  const el = $('#page-' + p);
  if (el) el.classList.add('active');
  $$('.ni').forEach(n => n.classList.toggle('active', n.dataset.page === p));
  $$('.bn-i').forEach(n => n.classList.toggle('active', n.dataset.page === p));
  // close drawer
  $('#drawer').classList.remove('show');
  $('#drawer-bd').classList.remove('show');
  // page-specific renders
  if (p === 'dashboard') renderDashboard();
  if (p === 'register') initRegPage();
  if (p === 'waiting') renderWaiting();
  if (p === 'exam') initExamPage();
  if (p === 'inpatient') renderInpatient();
  if (p === 'finance') renderFinance();
  if (p === 'kpi') renderKPI();
  if (p === 'report') initReport();
  if (p === 'history') renderHistory();
  if (p === 'admin') renderAdmin();
  // Reset scroll only on real navigation (not when re-rendering current page via sync)
  if (!opts.silent && !samePage) {
    $('#main').scrollTop = 0;
  }
}

/**
 * Soft refresh — re-render current page after sync without resetting scroll
 * or disturbing user input (forms in progress, search dropdowns etc.).
 *
 * Skip re-render entirely on pages where user is actively editing,
 * because re-rendering would clobber unsaved input.
 */
function softRefresh() {
  const p = STATE.activePage;
  // Skip pages with active in-progress forms — re-rendering would wipe inputs
  const editPages = new Set(['register', 'exam']);
  if (editPages.has(p)) return;
  // Save current scroll
  const main = $('#main');
  const scroll = main ? main.scrollTop : 0;
  // Re-render but tell nav not to reset scroll
  nav(p, { silent: true });
  if (main) main.scrollTop = scroll;
}

let __navSetupDone = false;
function setupNav() {
  if (__navSetupDone) return; // logout/login дахин дуудагдахад давхар listener нэмэхгүй
  __navSetupDone = true;
  $$('.ni[data-page]').forEach(n => n.addEventListener('click', () => nav(n.dataset.page)));
  $$('.bn-i[data-page]').forEach(n => n.addEventListener('click', () => nav(n.dataset.page)));
  $('#bn-menu').addEventListener('click', () => {
    $('#drawer').classList.add('show');
    $('#drawer-bd').classList.add('show');
  });
  $('#drawer-bd').addEventListener('click', () => {
    $('#drawer').classList.remove('show');
    $('#drawer-bd').classList.remove('show');
  });
  $('#ni-sync').addEventListener('click', openServicePrices);
  if ($('#ni-sync2')) $('#ni-sync2').addEventListener('click', openServicePrices);
}

// ============================================================
// HEADER & BADGES
// ============================================================
function updateBadges() {
  const w = STATE.waiting.length;
  const i = STATE.inps.filter(x => !x.discharged).length;
  // Finance badge: pending + receivables (anything with due > 0)
  const f = STATE.fins.filter(x => {
    if (typeof getDueAmount === 'function') return getDueAmount(x) > 0;
    return !x.paid;
  }).length;
  const todayExams = STATE.exams.filter(x => {
    const d = typeof x.date === 'string' ? x.date.slice(0,10) : '';
    return d === todayStr();
  }).length;
  const total = STATE.horses.length;

  $('#hs-w').textContent = w;
  $('#hs-t').textContent = todayExams;
  $('#hs-n').textContent = total;
  $('#bdg-w').textContent = w;
  $('#bdg-i').textContent = i;
  $('#bdg-f').textContent = f;
  if ($('#bdg-w2')) $('#bdg-w2').textContent = w;
  if ($('#bdg-i2')) $('#bdg-i2').textContent = i;
  if ($('#bdg-f2')) $('#bdg-f2').textContent = f;
  // bottom-nav waiting dot
  const bnDotW = $('#bn-dot-w');
  if (bnDotW) {
    bnDotW.textContent = w > 99 ? '99+' : w;
    bnDotW.classList.toggle('show', w > 0);
  }
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const h = new Date().getHours();
  let g = 'Сайн байна уу';
  if (h < 11) g = 'Өглөөний мэнд';
  else if (h < 17) g = 'Өдрийн мэнд';
  else g = 'Оройн мэнд';
  $('#greet-t').textContent = g + ', ' + (STATE.user ? STATE.user.role : '') + '!';
  const today = new Date();
  $('#greet-d').textContent = today.toLocaleDateString('mn-MN', {year:'numeric',month:'long',day:'numeric',weekday:'long'});

  // Normalize date string for any item.date
  const dateOf = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0,10);
    try { return localDateStr(new Date(v)); } catch(e) { return ''; }
  };
  const todayKey = todayStr();
  const todayExams = STATE.exams.filter(x => dateOf(x.date) === todayKey);
  const todayRev = STATE.fins.filter(x => x.paid && dateOf(x.paidDate) === todayKey)
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const activeInps = STATE.inps.filter(x => !x.discharged).length;
  // This week's exams: Monday 00:00 → today 23:59
  const _now = new Date();
  const _day = _now.getDay() || 7; // Sunday=7
  const _monday = new Date(_now);
  _monday.setDate(_now.getDate() - (_day - 1));
  _monday.setHours(0,0,0,0);
  const weekStart = _monday.getTime();
  const weekEnd = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate(), 23,59,59).getTime();
  const examTime = (e) => {
    if (e.ms) return parseFloat(e.ms);
    if (e.date) {
      try { return new Date(e.date + (e.time?'T'+e.time:'T12:00')).getTime(); } catch(_) { return 0; }
    }
    return 0;
  };
  const weekExams = STATE.exams.filter(x => {
    const t = examTime(x);
    return t >= weekStart && t <= weekEnd;
  }).length;

  $('#d-today').textContent = todayExams.length;
  $('#d-inp').textContent   = activeInps;
  $('#d-week').textContent  = weekExams;

  // Орлогын дүн — зөвхөн санхүү харах эрхтэй хүнд харуулна.
  // Эмч нарын эрхээр орсон үед мөнгөн дүн харагдахгүй.
  const revCard = $('#d-rev-card');
  if (canSeeFinance()) {
    if (revCard) revCard.style.display = '';
    $('#d-rev').textContent = fmtCompact(todayRev);
  } else {
    if (revCard) revCard.style.display = 'none';
  }

  // Staff (HR) — render
  renderStaffSection();

  // Recent exams — сүүлийн 50 л харуулна (бүгдийг render хийхгүй)
  const rl = $('#d-r-list');
  const recent = [...STATE.exams].sort((a,b) => recTime(b) - recTime(a)).slice(0, 50);
  $('#d-r-cnt').textContent = STATE.exams.length; // нийт тоог харуулна
  if (recent.length === 0) {
    rl.innerHTML = '<div class="empty"><div class="empty-em">📝</div>Үзлэг хараахан алга</div>';
  } else {
    const showAmt = canSeeFinance();
    rl.innerHTML = recent.map(e => `
      <div class="li" data-eid="${escHTML(e.id)}" style="cursor:pointer">
        <div class="li-stripe"></div>
        <div class="li-av">🩺</div>
        <div class="li-info">
          <div class="li-name">${escHTML(e.horse)} <span class="muted" style="font-weight:600">· ${escHTML(e.owner||'')}</span></div>
          <div class="li-sub">${e.examNum?'<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(e.examNum)+'</span>':''}${escHTML(e.diagnosis||'—')}</div>
        </div>
        <div class="li-r">
          <div class="li-time">${escHTML(dateOf(e.date))}</div>
          ${showAmt ? '<span class="badge b-g">'+fmtCompact(e.amount||0)+'</span>' : ''}
        </div>
      </div>
    `).join('');
    rl.querySelectorAll('.li').forEach(el => el.addEventListener('click', () => {
      openExamDetail(el.dataset.eid);
    }));
  }
}

// ============================================================
// HR (STAFF) — daily roster of working / on-duty doctors
// ============================================================

function getStaffData() {
  // Stored as { id: 'YYYY-MM-DD', date: 'YYYY-MM-DD', active: [docId, ...], duty: [docId, ...] }
  // Эх сурвалжийн дараалал:
  //   1) Сарын ажлын хувиар (STATE.staffSchedule) — өнөөдрийн төлвүүдээс active/duty гаргана
  //   2) STATE.staff (өдрийн roster, Sheet-ээс синк)
  //   3) Хоосон
  const today = todayStr();

  // 1) Сарын хувиараас өнөөдрийн өгөгдөл
  const fromSchedule = getDayStaffFromSchedule(today);
  if (fromSchedule && (fromSchedule.active.length || fromSchedule.duty.length)) {
    return fromSchedule;
  }

  // 2) Хуучин өдрийн roster
  if (Array.isArray(STATE.staff)) {
    const found = STATE.staff.find(s => String(s.id) === today || String(s.date) === today);
    if (found) {
      return {
        date: today,
        active: parseStaffArray(found.active),
        duty: parseStaffArray(found.duty)
      };
    }
  }
  return { date: today, active: [], duty: [] };
}

// Сарын хувиараас тухайн өдрийн ажиллах / жижүүр эмчийн жагсаалт гаргана
// Төлөв: 'work' (ажиллах), 'duty' (жижүүр), 'off' (амрах)
function getDayStaffFromSchedule(dateStr) {
  const ym = (dateStr || todayStr()).slice(0, 7); // 'YYYY-MM'
  const sched = STATE.staffSchedule && STATE.staffSchedule[ym];
  if (!sched) return null;
  const active = [];
  const duty = [];
  Object.keys(sched).forEach(docId => {
    const status = sched[docId] && sched[docId][dateStr];
    if (status === 'work') active.push(String(docId));
    else if (status === 'duty') { active.push(String(docId)); duty.push(String(docId)); }
  });
  return { date: dateStr, active, duty };
}

function parseStaffArray(v) {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string' && v.trim()) {
    // Try JSON
    try { const parsed = JSON.parse(v); if (Array.isArray(parsed)) return parsed.map(String); } catch(_){}
    // Comma-separated fallback
    return v.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function saveStaffData(data) {
  // Push to STATE.staff for Oracle sync
  if (!Array.isArray(STATE.staff)) STATE.staff = [];
  const today = data.date || todayStr();
  const idx = STATE.staff.findIndex(s => String(s.id) === today);
  const record = {
    id: today,
    date: today,
    active: data.active || [],
    duty: data.duty || [],
    ms: nowMs()
  };
  if (idx >= 0) STATE.staff[idx] = record;
  else STATE.staff.push(record);
  saveAll();
  fbSaveRecord('staff', record);
}

function renderStaffSection() {
  const data = getStaffData();
  const activeWrap = $('#d-staff-active');
  const dutyWrap = $('#d-staff-duty');

  const renderChips = (ids, dutyMode) => {
    if (!ids || ids.length === 0) {
      return '<div style="font-size:12px;color:var(--muted);font-weight:600;padding:4px 0">Тохируулаагүй</div>';
    }
    return ids.map(id => {
      const d = STATE.doctors.find(x => String(x.id) === String(id));
      if (!d) return '';
      const initials = d.name.split(/[\s.\-]+/).filter(Boolean).slice(0,2).map(s => s[0]).join('');
      return `
        <span class="staff-chip${dutyMode?' duty':''}">
          <span class="staff-chip-av">${escHTML(initials.toUpperCase())}</span>
          <span>${escHTML(d.name)}</span>
        </span>`;
    }).join('');
  };

  activeWrap.innerHTML = renderChips(data.active, false);
  dutyWrap.innerHTML = renderChips(data.duty, true);
}

function openStaffModal() {
  const data = getStaffData();
  const activeSet = new Set(data.active.map(String));
  const dutySet = new Set(data.duty.map(String));

  $('#staff-mod-body').innerHTML = STATE.doctors.map(d => `
    <div class="staff-row">
      <div style="flex:1;min-width:0">
        <div class="staff-row-name">${escHTML(d.name)}</div>
        <div class="staff-row-role">${escHTML(d.role)}</div>
      </div>
      <label class="staff-cb">
        <input type="checkbox" class="staff-active" data-id="${escHTML(d.id)}" ${activeSet.has(String(d.id))?'checked':''}>
        Ажиллах
      </label>
      <label class="staff-cb">
        <input type="checkbox" class="staff-duty" data-id="${escHTML(d.id)}" ${dutySet.has(String(d.id))?'checked':''}>
        Жижүүр
      </label>
    </div>
  `).join('');
  openModal('staff-modal');
}

function saveStaff() {
  const active = [...document.querySelectorAll('.staff-active:checked')].map(c => c.dataset.id);
  const duty   = [...document.querySelectorAll('.staff-duty:checked')].map(c => c.dataset.id);
  saveStaffData({ date: todayStr(), active, duty });
  closeModal('staff-modal');
  renderStaffSection();
  toast('💾 Хадгалагдлаа', 'ok');
}

// ============================================================
// HR — САРЫН АЖЛЫН ХУВИАР (monthly work schedule)
// ============================================================
// STATE.staffSchedule = { 'YYYY-MM': { docId: { 'YYYY-MM-DD': 'work'|'duty'|'off' } } }

let SCHED_MONTH = todayStr().slice(0, 7); // одоогоор сонгогдсон сар

function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}
function ymdOf(ym, day) {
  return ym + '-' + String(day).padStart(2, '0');
}
const SCHED_DOW = ['Ня','Да','Мя','Лх','Пү','Ба','Бя'];
function dowOf(ym, day) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, day).getDay(); // 0=Sunday
}
const SCHED_STATUS_CYCLE = ['off', 'work', 'duty'];
const SCHED_STATUS_LABEL = { off: '–', work: 'А', duty: 'Ж' };
const SCHED_STATUS_TITLE = { off: 'Амрах', work: 'Ажиллах', duty: 'Жижүүр' };

function getSchedMonth() {
  if (!STATE.staffSchedule) STATE.staffSchedule = {};
  if (!STATE.staffSchedule[SCHED_MONTH]) STATE.staffSchedule[SCHED_MONTH] = {};
  return STATE.staffSchedule[SCHED_MONTH];
}

function openScheduleModal() {
  SCHED_MONTH = todayStr().slice(0, 7);
  $('#sched-month').value = SCHED_MONTH;
  renderScheduleGrid();
  openModal('schedule-modal');
}

function changeSchedMonth() {
  const v = $('#sched-month').value;
  if (v) { SCHED_MONTH = v; renderScheduleGrid(); }
}

function renderScheduleGrid() {
  const month = getSchedMonth();
  const nDays = daysInMonth(SCHED_MONTH);
  const docs = STATE.doctors || [];

  if (!docs.length) {
    $('#sched-grid-wrap').innerHTML = '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч бүртгэгдээгүй байна</div>';
    return;
  }

  // Толгойн мөр: өдрүүд
  let head = '<th class="sched-doc-h">Эмч</th>';
  for (let d = 1; d <= nDays; d++) {
    const dow = dowOf(SCHED_MONTH, d);
    const wkend = (dow === 0 || dow === 6) ? ' sched-wkend' : '';
    head += `<th class="sched-day-h${wkend}"><div>${d}</div><div class="sched-dow">${SCHED_DOW[dow]}</div></th>`;
  }

  // Эмч бүрийн мөр
  let rows = '';
  docs.forEach(doc => {
    const did = String(doc.id);
    const docMap = month[did] || {};
    let cells = `<td class="sched-doc-c"><div class="sched-doc-name">${escHTML(doc.name)}</div><div class="sched-doc-role">${escHTML(doc.role||'')}</div></td>`;
    let workCount = 0, dutyCount = 0;
    for (let d = 1; d <= nDays; d++) {
      const ymd = ymdOf(SCHED_MONTH, d);
      const st = docMap[ymd] || 'off';
      if (st === 'work') workCount++;
      if (st === 'duty') { workCount++; dutyCount++; }
      cells += `<td class="sched-cell sched-${st}" data-doc="${escHTML(did)}" data-ymd="${ymd}" onclick="cycleSchedCell(this)" title="${SCHED_STATUS_TITLE[st]}">${SCHED_STATUS_LABEL[st]}</td>`;
    }
    cells += `<td class="sched-sum">${workCount}<span class="sched-sum-duty">/${dutyCount}</span></td>`;
    rows += `<tr>${cells}</tr>`;
  });

  $('#sched-grid-wrap').innerHTML = `
    <table class="sched-table">
      <thead><tr>${head}<th class="sched-sum-h">Нийт<span class="sched-sum-duty">/Ж</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Нүд дээр дарахад төлөв солигдоно: Амрах → Ажиллах → Жижүүр → Амрах
function cycleSchedCell(td) {
  const did = td.dataset.doc;
  const ymd = td.dataset.ymd;
  const month = getSchedMonth();
  if (!month[did]) month[did] = {};
  const cur = month[did][ymd] || 'off';
  const next = SCHED_STATUS_CYCLE[(SCHED_STATUS_CYCLE.indexOf(cur) + 1) % SCHED_STATUS_CYCLE.length];
  if (next === 'off') delete month[did][ymd];
  else month[did][ymd] = next;
  // Нүдийг шинэчилнэ
  td.className = 'sched-cell sched-' + next;
  td.textContent = SCHED_STATUS_LABEL[next];
  td.title = SCHED_STATUS_TITLE[next];
  // Тухайн эмчийн нийлбэрийг шинэчилнэ
  updateSchedRowSum(td);
}

function updateSchedRowSum(td) {
  const tr = td.closest('tr');
  if (!tr) return;
  let work = 0, duty = 0;
  tr.querySelectorAll('.sched-cell').forEach(c => {
    if (c.classList.contains('sched-work')) work++;
    if (c.classList.contains('sched-duty')) { work++; duty++; }
  });
  const sum = tr.querySelector('.sched-sum');
  if (sum) sum.innerHTML = `${work}<span class="sched-sum-duty">/${duty}</span>`;
}

function saveSchedule() {
  saveAll();
  fbWriteDoc('clinic_config', 'main', { staffSchedule: STATE.staffSchedule, _updatedAt: Date.now() });
  closeModal('schedule-modal');
  renderStaffSection();
  toast('💾 Сарын хуваарь хадгалагдлаа', 'ok');
}

// ============================================================
// EXAM DETAIL MODAL (from dashboard recent exams)
// ============================================================

// Тухайн үзлэгтэй холбоотой бүх логийг (бүртгэл → үзлэг → төлбөр) хугацааны дарааллаар цуглуулна
function buildExamTimeline(e) {
  if (!Array.isArray(STATE.logs)) return [];
  const examNum = String(e.examNum || '').trim();
  const examNumDigits = (examNum.match(/\d+/) || [])[0];
  const ids = new Set([String(e.id)]);
  // Холбоотой санхүүгийн бичлэгийн id-г мөн нэмнэ
  STATE.fins.filter(f => String(f.examId) === String(e.id)).forEach(f => ids.add(String(f.id)));
  // Холбоотой морины id (бүртгэлийн лог морины id-аар холбогдоно)
  if (e.horseId) ids.add(String(e.horseId));

  const matchByExamNum = (n) => {
    if (!examNumDigits || !n) return false;
    const d = (String(n).match(/\d+/) || [])[0];
    return d && parseInt(d,10) === parseInt(examNumDigits,10);
  };

  return STATE.logs
    .filter(l => {
      if (l.exam_id && matchByExamNum(l.exam_id)) return true;
      if (l.target_id && ids.has(String(l.target_id))) return true;
      return false;
    })
    .sort((a,b) => (a.log_ms||0) - (b.log_ms||0));
}

// Үйлдлийн нэрэнд тохирох жижиг icon/өнгө
function timelineMeta(action) {
  const a = action || '';
  if (a.includes('бүртгэс'))    return { icon:'🐴', color:'var(--blue)'   || '#2a5aaa' };
  if (a.includes('эхлүүлс'))    return { icon:'▶️', color:'#2a5aaa' };
  if (a.includes('дуусгас'))    return { icon:'🩺', color:'var(--orange-dark)' };
  if (a.includes('Төлбөр') || a.includes('төлбөр')) return { icon:'💰', color:'var(--green)' };
  if (a.includes('засвар'))     return { icon:'✏️', color:'#b36b00' };
  if (a.includes('устгас'))     return { icon:'🗑️', color:'var(--red)' };
  return { icon:'•', color:'var(--muted)' };
}

function openExamDetail(eid) {
  const e = STATE.exams.find(x => String(x.id) === String(eid));
  if (!e) { toast('Үзлэг олдсонгүй', 'err'); return; }
  // Find linked finance record
  const fin = STATE.fins.find(f => String(f.examId) === String(e.id));
  const dateOf = (v) => {
    if (!v) return '—';
    if (typeof v === 'string') return v.slice(0,10);
    try { return localDateStr(new Date(v)); } catch(_) { return String(v); }
  };

  const _seeFin = canSeeFinance();

  // Services list
  let svcHTML = '<div class="muted">Үйлчилгээ алга</div>';
  if (Array.isArray(e.services) && e.services.length) {
    svcHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + e.services.map(s => `
      <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px">
        <span style="font-size:12px;font-weight:700">${escHTML(s.name||'')}</span>
        ${_seeFin ? '<span class="bold" style="font-size:12px">'+fmt(parseFloat(s.price)||0)+'</span>' : ''}
      </div>
    `).join('') + '</div>';
  }

  // Meds
  let medsHTML = '<div class="muted">Эм алга</div>';
  if (Array.isArray(e.meds) && e.meds.length) {
    medsHTML = '<div style="display:flex;flex-direction:column;gap:3px">' + e.meds.map(m => { const name=m.name||m; const note=m.note||''; return `<span class="badge b-a" style="display:inline-flex;gap:6px"><b>${escHTML(name)}</b>${note?`<span style="font-weight:400;opacity:0.85">${escHTML(note)}</span>`:''}</span>`; }).join('') + '</div>';
  } else if (typeof e.meds === 'string' && e.meds.trim()) {
    medsHTML = '<div style="font-size:12px;background:var(--input);padding:8px;border-radius:6px;white-space:pre-wrap">' + escHTML(e.meds) + '</div>';
  }

  // Payment status
  let payHTML;
  if (!fin) {
    payHTML = '<span class="badge">Нэхэмжлэхгүй</span>';
  } else if (fin.paid) {
    payHTML = `<span class="badge b-g">✅ Төлсөн · ${escHTML(fin.method||'—')}</span> <span class="muted" style="font-size:11px">${escHTML(dateOf(fin.paidDate))}</span>`;
  } else {
    payHTML = '<span class="badge b-r">⏳ Хүлээгдэж буй</span>';
  }

  $('#ex-detail-title').innerHTML = `📋 ${escHTML(e.horse)} ${e.examNum?'<span class="badge b-o" style="margin-left:6px">'+escHTML(e.examNum)+'</span>':''}`;
  $('#ex-detail-body').innerHTML = `
    <div class="fg r2" style="margin-bottom:10px">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(e.owner||'—')}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(e.phone||'—')}</div></div>
      <div class="fld"><label>Огноо</label><div>${escHTML(dateOf(e.date))} ${escHTML(e.time||'')}</div></div>
      <div class="fld"><label>Эмч</label><div>${escHTML(e.docName||'—')}${e.assistDocName?'<br><span class="muted" style="font-size:11px">Хамт: '+escHTML(e.assistDocName)+'</span>':''}</div></div>
    </div>
    <div class="fld" style="margin-bottom:10px"><label>Онош</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(e.diagnosis||'—')}</div>
    </div>
    ${e.note ? `<div class="fld" style="margin-bottom:10px"><label>Тэмдэглэл</label><div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px;white-space:pre-wrap">${escHTML(e.note)}</div></div>` : ''}
    <div class="fld" style="margin-bottom:10px"><label>Үйлчилгээ</label>${svcHTML}</div>
    <div class="fld" style="margin-bottom:10px"><label>Эмийн жор</label>${medsHTML}</div>
    <div class="fld" style="margin-bottom:10px"><label>Үзлэгийн үзүүлэлт</label>
      <div style="font-size:12px;color:var(--muted)">
        Темп: <b style="color:var(--text)">${escHTML(e.temp||'—')}</b> ·
        Зүрх: <b style="color:var(--text)">${escHTML(e.pulse||'—')}</b> ·
        Амьсгал: <b style="color:var(--text)">${escHTML(e.resp||'—')}</b> ·
        Жин: <b style="color:var(--text)">${escHTML(e.wt||'—')}</b>
      </div>
    </div>
    ${(e.durationMin!==null && e.durationMin!==undefined) ? `<div class="fld" style="margin-bottom:10px"><label>⏱️ Зарцуулсан хугацаа</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px"><b>${fmtDuration(e.durationMin)}</b>${(e.regMs&&e.doneMs)?` <span class="muted" style="font-size:11px">(${fmtTime(e.regMs)} → ${fmtTime(e.doneMs)})</span>`:''}</div>
    </div>` : ''}
    <div class="fld"><label>Төлбөр</label>
      <div class="row" style="justify-content:space-between">
        <div>${payHTML}</div>
        ${_seeFin ? '<div style="font-size:18px;font-weight:900;color:var(--orange-dark)">'+fmt(e.amount||0)+'</div>' : ''}
      </div>
    </div>
    <div class="fld" style="margin-top:10px"><label>📷 Зураг</label>
      <div id="exd-images" class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:8px"></div>
      <input type="file" id="exd-img-input" accept="image/*" multiple capture="environment" style="display:none">
      <button type="button" class="btn btn-sm" id="exd-img-add">➕ Зураг нэмэх</button>
    </div>
    <div class="fld" style="margin-top:12px"><label>🧭 Процессын түүх <span class="muted" style="font-weight:600;text-transform:none">— хэн, хэзээ хийсэн</span></label>
      <div id="exd-timeline"></div>
    </div>
  `;
  openModal('exam-detail-modal');
  renderExamTimeline(e);
  // Зураг харуулах + нэмэх (exam detail)
  if (!Array.isArray(e.images)) e.images = [];
  _lightboxImgs = e.images;
  renderExamDetailImages(e);
  const addBtn = $('#exd-img-add');
  const fileInput = $('#exd-img-input');
  if (addBtn && fileInput) {
    addBtn.onclick = () => fileInput.click();
    fileInput.onchange = async () => {
      const files = Array.from(fileInput.files || []);
      fileInput.value = '';
      if (!files.length) return;
      if (e.images.length + files.length > IMG_MAX_PER_EXAM) {
        toast('Үзлэг бүрт дээд тал нь ' + IMG_MAX_PER_EXAM + ' зураг', 'err');
        return;
      }
      if (!window.__fbReady || !window.__fbUploadImage) {
        toast('⛔ Firebase холбогдоогүй байна. Зураг хадгалах боломжгүй.', 'err');
        return;
      }
      toast('Зураг боловсруулж байна...', 'ok');
      let successCount = 0;
      for (const file of files) {
        try {
          const dataUrl = await resizeImageFile(file);
          const imgId = uid();
          const path = 'exam-images/' + e.id + '/' + imgId + '.jpg';
          try {
            const url = await window.__fbUploadImage(path, dataUrl);
            // Зөвхөн URL болон path хадгална — base64 data хадгалахгүй
            e.images.push({ id: imgId, url: url, path: path, ms: nowMs() });
            successCount++;
          } catch (upErr) {
            // base64 fallback ХОРИОТОЙ — Firestore/localStorage-г дүүргэнэ
            toast('⛔ Зураг Storage-д илгээж чадсангүй: ' + (upErr.message || 'алдаа') + '. Дахин оролдоно уу.', 'err');
          }
        } catch (err) {
          toast(err.message || 'Зураг боловсруулж чадсангүй', 'err');
        }
      }
      if (successCount > 0) {
        _lightboxImgs = e.images;
        saveAll();
        fbSaveRecord('exams', e);
        renderExamDetailImages(e);
        toast('✅ ' + successCount + ' зураг хадгалагдлаа', 'ok');
      }
    };
  }
  // Show print button if there's a linked invoice
  const printBtn = $('#ex-detail-print-btn');
  if (fin && printBtn) {
    printBtn.style.display = '';
    printBtn.onclick = () => { closeModal('exam-detail-modal'); printInvoice(fin.id); };
  } else if (printBtn) {
    printBtn.style.display = 'none';
  }
}

// Үзлэгийн процессын түүхийг (хэн, хэзээ, ямар үйлдэл) хугацааны дарааллаар зурна
function renderExamTimeline(e) {
  const wrap = document.getElementById('exd-timeline');
  if (!wrap) return;
  const items = buildExamTimeline(e);
  if (!items.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:8px 0">Бүртгэл алга (хуучин үзлэг бол түүх хадгалагдаагүй байж болно)</div>';
    return;
  }
  const fmtDT = (ms, dateStr) => {
    if (ms) { try { const d = new Date(ms); return d.toLocaleDateString('mn-MN') + ' ' + d.toTimeString().slice(0,5); } catch(_){} }
    return dateStr || '';
  };
  wrap.innerHTML = '<div style="display:flex;flex-direction:column;gap:0">' + items.map((l, idx) => {
    const meta = timelineMeta(l.action);
    const isLast = idx === items.length - 1;
    return `
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--input);display:flex;align-items:center;justify-content:center;font-size:13px;border:1.5px solid ${meta.color}">${meta.icon}</div>
          ${!isLast ? '<div style="width:2px;flex:1;min-height:18px;background:var(--border)"></div>' : ''}
        </div>
        <div style="flex:1;padding-bottom:${isLast?'0':'12px'}">
          <div style="font-size:13px;font-weight:800;color:${meta.color}">${escHTML(l.action)}</div>
          <div style="font-size:12px;color:var(--text);margin-top:1px">
            <b>${escHTML(l.user_name||'—')}</b>
            <span class="muted" style="font-weight:600"> · ${escHTML(l.user_role||'')}</span>
          </div>
          ${l.details ? `<div class="muted" style="font-size:11px;margin-top:2px">${escHTML(l.details)}</div>` : ''}
          <div class="muted" style="font-size:10.5px;margin-top:2px">${escHTML(fmtDT(l.log_ms, l.log_date))}</div>
        </div>
      </div>`;
  }).join('') + '</div>';
}

function liHTML(w, kind) {
  const stripe = w.urgency === 'red' ? 'u-r' : w.urgency === 'yellow' ? 'u-y' : '';
  return `
    <div class="li" data-id="${w.id}">
      <div class="li-stripe ${stripe}"></div>
      <div class="li-av">🐴</div>
      <div class="li-info">
        <div class="li-name">${escHTML(w.horse)} <span class="muted" style="font-weight:600">· ${escHTML(w.owner)}</span></div>
        <div class="li-sub">${escHTML(w.symptoms||w.phone||'—')}</div>
      </div>
      <div class="li-r">
        <div class="li-time">${ago(w.ms)}</div>
        ${w.urgency==='red'?'<span class="badge b-r">🔴 Яаралтай</span>':w.urgency==='yellow'?'<span class="badge b-o">🟡 Анхаарах</span>':'<span class="badge b-g">🟢 Хэвийн</span>'}
      </div>
    </div>
  `;
}

// Утасны дугаараар өмнөх үйлчлүүлэгчийг хайж, ЗӨВХӨН эзний мэдээллийн
// талбаруудыг бөглөнө. Адуу болон анамнезийн талбарт хүрэхгүй.
function autoFillOwnerByPhone() {
  const phoneInp = $('#r-phone');
  if (!phoneInp) return;
  const phone = phoneInp.value.replace(/\D/g, '');
  if (phone.length < 6) return; // дутуу дугаар бол хайхгүй
  const norm = s => String(s || '').replace(/\D/g, '');
  // Утас нь үндсэн эсвэл нэмэлт утастай тохирох адуудыг олно
  const matches = STATE.horses.filter(h => norm(h.phone) === phone || norm(h.phone2) === phone);
  if (!matches.length) return;
  // Хамгийн сүүлд бүртгэгдсэнийг сонгоно
  matches.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const prev = matches[0];
  // Зөвхөн хоосон талбаруудыг бөглөнө (хэрэглэгчийн оруулсныг дарж бичихгүй)
  const setIfEmpty = (id, val) => {
    const el = $('#' + id);
    if (el && !el.value && val) el.value = val;
  };
  setIfEmpty('r-owner', prev.owner);
  setIfEmpty('r-phone2', prev.phone2);
  setIfEmpty('r-soum', prev.soum);
  // Аймаг нь select — утга жагсаалтад байвал л сонгоно
  const provEl = $('#r-prov');
  if (provEl && !provEl.value && prev.province) {
    const opt = Array.from(provEl.options).find(o => o.value === prev.province);
    if (opt) provEl.value = prev.province;
  }
  toast('👤 ' + (prev.owner || 'Өмнөх эзэн') + '-ийн мэдээлэл бөглөгдлөө', 'ok');
}

// ============================================================
// REGISTER
// ============================================================
function initRegPage() {
  const sel = $('#r-prov');
  if (sel.options.length <= 1) {
    PROVS.forEach(p => {
      const o = document.createElement('option');
      o.value = p; o.textContent = p;
      sel.appendChild(o);
    });
  }
  if (!$('#r-date').value) $('#r-date').value = todayStr();
  // Auto-fill exam number if empty
  if (!$('#r-examnum').value) autoFillExamNum();
  // Дугаар бичих явцад давхардлыг шалгаж анхааруулна
  const examInp = $('#r-examnum');
  if (examInp && !examInp.dataset.dupBound) {
    examInp.dataset.dupBound = '1';
    examInp.addEventListener('blur', () => {
      const v = examInp.value.trim();
      if (!v) { examInp.style.borderColor = ''; return; }
      const dup = findExamNumDuplicate(v);
      if (dup) {
        examInp.style.borderColor = 'var(--red)';
        const who = dup.rec.horse || dup.rec.name || '';
        toast('⚠️ ' + v + ' дугаар аль хэдийн ашиглагдсан' + (who ? ' (' + who + ')' : ''), 'err');
      } else {
        examInp.style.borderColor = '';
      }
    });
    examInp.addEventListener('input', () => { examInp.style.borderColor = ''; });
  }
  // Утас бичээд гарахад өмнөх эзний мэдээллийг бөглөнө
  const phoneInp = $('#r-phone');
  if (phoneInp && !phoneInp.dataset.lookupBound) {
    phoneInp.dataset.lookupBound = '1';
    phoneInp.addEventListener('blur', () => autoFillOwnerByPhone());
  }
}

function autoFillExamNum() {
  // Baseline: last manually-recorded exam was 0051188 (2026-04-27 16:31)
  // So next auto number starts from 0051189 onwards
  const BASELINE = 51188;
  let max = BASELINE;
  const collect = (n) => {
    if (!n) return;
    const m = String(n).match(/(\d+)/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > max) max = num;
    }
  };
  STATE.exams.forEach(e => collect(e.examNum));
  STATE.waiting.forEach(w => collect(w.examNum));
  const next = (max + 1).toString().padStart(7, '0');
  $('#r-examnum').value = next;
}

// Үзлэгийн хуудасны дугаар давхардаж байгаа эсэхийг шалгана.
// excludeId өгвөл тухайн бичлэгийг (засварлаж байгаа үед) алгасна.
function findExamNumDuplicate(examNum, excludeId) {
  const target = String(examNum).trim();
  if (!target) return null;
  const targetNum = (target.match(/\d+/) || [])[0];
  const matches = (n) => {
    if (!n) return false;
    const s = String(n).trim();
    if (s === target) return true;
    // Тоон утгаар нь (тэгийн ялгааг үл харгалзан) харьцуулна
    const sNum = (s.match(/\d+/) || [])[0];
    return targetNum && sNum && parseInt(sNum, 10) === parseInt(targetNum, 10);
  };
  const inExams = STATE.exams.find(e => e.id !== excludeId && matches(e.examNum));
  if (inExams) return { source: 'үзлэг', rec: inExams };
  const inWaiting = STATE.waiting.find(w => w.id !== excludeId && matches(w.examNum));
  if (inWaiting) return { source: 'дараалал', rec: inWaiting };
  return null;
}

function clearReg() {
  ['r-name','r-age','r-breed','r-mark','r-owner','r-phone','r-phone2','r-soum','r-symp','r-extra'].forEach(id => $('#'+id).value = '');
  $('#r-prov').value = '';
  $('#r-urg').value = 'green';
  $('#r-date').value = todayStr();
  autoFillExamNum();
}

function submitReg() {
  const name = $('#r-name').value.trim();
  const owner = $('#r-owner').value.trim();
  const phone = $('#r-phone').value.trim();
  const symp = $('#r-symp').value.trim();
  const examNum = $('#r-examnum').value.trim();
  if (!examNum) {
    toast('Үзлэгийн хуудасны дугаар оруулна уу', 'err');
    return;
  }
  const dup = findExamNumDuplicate(examNum);
  if (dup) {
    const who = dup.rec.horse || dup.rec.name || '';
    toast('⚠️ ' + examNum + ' дугаар аль хэдийн ашиглагдсан байна' + (who ? ' (' + who + ')' : ''), 'err');
    return;
  }
  if (!name || !owner || !phone || !symp) {
    toast('Шаардлагатай талбар дутуу байна', 'err');
    return;
  }
  const horse = {
    id: uid(),
    name, owner, phone,
    phone2: $('#r-phone2').value.trim(),
    age: $('#r-age').value,
    breed: $('#r-breed').value.trim(),
    mark: $('#r-mark').value.trim(),
    province: $('#r-prov').value,
    soum: $('#r-soum').value.trim(),
    date: $('#r-date').value || todayStr(),
    extra: $('#r-extra').value.trim(),
    createdAt: nowMs()
  };
  STATE.horses.push(horse);
  const wait = {
    id: uid(),
    horseId: horse.id,
    horse: name, owner, phone,
    symptoms: symp,
    urgency: $('#r-urg').value,
    examNum: examNum,
    ms: nowMs(),
    age: horse.age, breed: horse.breed, province: horse.province, soum: horse.soum
  };
  STATE.waiting.push(wait);
  saveAll();
  // ⚡ Зөвхөн өөрчлөгдсөн record-уудыг бичнэ
  fbSaveRecord('horses', horse);
  fbSaveRecord('waiting', wait);
  writeLog('Морь бүртгэсэн', horse.id, horse.name + ' / ' + horse.owner, 'Дугаар: ' + examNum, examNum);
  toast('✅ Адуу амжилттай бүртгэгдлээ (' + examNum + ')', 'ok');
  clearReg();
  updateBadges();
  nav('waiting');
}

// ============================================================
// WAITING
// ============================================================
function renderWaiting() {
  $('#w-sub').textContent = STATE.waiting.length + ' адуу үзлэг хүлээж байна';
  $('#w-cnt').textContent = STATE.waiting.length;
  const list = $('#w-list');
  if (STATE.waiting.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-em">⏳</div>Хүлээж буй адуу алга</div>';
    STATE.selectedW = null;
    renderWDetail();
    return;
  }
  // Normalize selectedW to string for consistent comparison
  if (STATE.selectedW != null) STATE.selectedW = String(STATE.selectedW);
  // Auto-select first if no selection or stale selection
  if (!STATE.selectedW || !STATE.waiting.find(w => String(w.id) === STATE.selectedW)) {
    STATE.selectedW = String(STATE.waiting[0].id);
  }
  const waitSorted = [...STATE.waiting].sort((a,b) => recTime(b) - recTime(a));
  list.innerHTML = waitSorted.map(w => liHTML(w, 'wait')).join('');
  list.querySelectorAll('.li').forEach(el => {
    if (el.dataset.id === STATE.selectedW) el.classList.add('sel');
    el.addEventListener('click', () => {
      STATE.selectedW = String(el.dataset.id);
      list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedW));
      renderWDetail();
    });
  });
  renderWDetail();
}

function renderWDetail() {
  const w = STATE.waiting.find(x => String(x.id) === String(STATE.selectedW));
  const actions = $('#w-detail-actions');
  if (!w) {
    $('#w-detail-title').textContent = '📌 Дэлгэрэнгүй';
    $('#w-detail-body').innerHTML = `
      <div class="empty">
        <div class="empty-em">🐴</div>
        Жагсаалтаас адуу сонгоно уу
      </div>`;
    if (actions) actions.style.display = 'none';
    return;
  }
  if (actions) actions.style.display = 'flex';
  $('#w-detail-title').innerHTML = `📌 ${escHTML(w.horse)} - ${escHTML(w.owner)}` +
    (w.examNum ? ` <span class="badge b-o" style="margin-left:8px">${escHTML(w.examNum)}</span>` : '');
  $('#w-detail-body').innerHTML = `
    <div class="fg r2">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(w.owner)}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(w.phone)}</div></div>
      <div class="fld"><label>Нас</label><div>${escHTML(w.age||'—')}</div></div>
      <div class="fld"><label>Үүлдэр</label><div>${escHTML(w.breed||'—')}</div></div>
      <div class="fld"><label>Аймаг</label><div>${escHTML(w.province||'—')}</div></div>
      <div class="fld"><label>Хүлээсэн</label><div>${ago(w.ms)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Шинж тэмдэг</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(w.symptoms)}</div>
    </div>
  `;
}

function removeWaiting() {
  if (!STATE.selectedW) return;
  if (!confirm('Энэ адууг хүлээлгээс хасах уу?')) return;
  const removedId = STATE.selectedW;
  STATE.waiting = STATE.waiting.filter(x => x.id !== removedId);
  _markWaitingRemoved(removedId);
  STATE.selectedW = null;
  saveAll();
  fbDeleteDoc('waiting', String(removedId));
  updateBadges();
  renderWaiting();
  toast('Хүлээлгээс хасагдлаа', 'ok');
}

function startExamFromWaiting() {
  if (!STATE.selectedW) { toast('Адуу сонгоно уу', 'err'); return; }
  const w = STATE.waiting.find(x => String(x.id) === String(STATE.selectedW));
  if (!w) return;
  STATE.curExam = {
    id: uid(),
    waitId: w.id,
    horseId: w.horseId,
    horse: w.horse,
    owner: w.owner,
    phone: w.phone,
    symptoms: w.symptoms,
    anamnesis: w.symptoms || '',
    docId: STATE.doctors[0] ? STATE.doctors[0].id : null,
    assistDocId: '',
    date: todayStr(),
    time: new Date().toTimeString().slice(0,5),
    examNum: w.examNum || (() => {
      // Fallback: derive from existing max to avoid collision
      const BASELINE = 51188;
      let max = BASELINE;
      const collect = n => { if (!n) return; const m = String(n).match(/(\d+)/); if (m) { const v = parseInt(m[1],10); if (v > max) max = v; } };
      STATE.exams.forEach(e => collect(e.examNum));
      STATE.waiting.forEach(w2 => collect(w2.examNum));
      return (max + 1).toString().padStart(7,'0');
    })(),
    temp:'', pulse:'', resp:'', wt:'',
    diagnosis:'', symptoms2:[], note:'',
    services:[], meds:[], images:[],
    province: w.province || '',
    soum: w.soum || '',
    regMs: parseFloat(w.ms) || nowMs(), // адуу бүртгэсэн агшин — хугацаа хэмжих эхлэл
    ms: nowMs()
  };
  writeLog('Үзлэг эхлүүлсэн', STATE.curExam.id, w.horse + ' / ' + w.owner, '', STATE.curExam.examNum);
  nav('exam');
}

// ============================================================
// EXAM PAGE
// ============================================================
const SYMPTOM_LIST = ['Халуурах','Хоолны дур муудах','Тураалт','Гавлай','Хатир','Бөглөрөл','Шарх','Тахир','Гүйж буцаах','Чичрэлт','Зулгарах'];

function initExamPage() {
  if (!STATE.curExam) {
    $('#ex-empty').classList.remove('hidden');
    $('#ex-content').classList.add('hidden');
    return;
  }
  $('#ex-empty').classList.add('hidden');
  $('#ex-content').classList.remove('hidden');
  const e = STATE.curExam;
  $('#ex-title').textContent = '🩺 ' + e.horse;
  $('#ex-sub').textContent = e.owner + ' · ' + e.phone;
  $('#ex-date').value = e.date;
  $('#ex-time').value = e.time;
  $('#ex-num').value = e.examNum;
  $('#ex-temp').value = e.temp;
  $('#ex-pulse').value = e.pulse;
  $('#ex-resp').value = e.resp;
  $('#ex-wt').value = e.wt;
  $('#ex-diag').value = e.diagnosis;
  $('#ex-note').value = e.note;
  if (!Array.isArray(e.images)) e.images = [];
  renderExamImages();

  // doctors — populate two selects
  const mainSel = $('#ex-doc-main');
  const asstSel = $('#ex-doc-asst');
  const mainOptions = STATE.doctors.map(d =>
    `<option value="${escHTML(d.id)}" ${String(d.id)===String(e.docId)?'selected':''}>${escHTML(d.name)} (${escHTML(d.role)})</option>`
  ).join('');
  mainSel.innerHTML = mainOptions;
  asstSel.innerHTML = '<option value="">— Сонгох —</option>' + STATE.doctors.map(d =>
    `<option value="${escHTML(d.id)}" ${String(d.id)===String(e.assistDocId||'')?'selected':''}>${escHTML(d.name)} (${escHTML(d.role)})</option>`
  ).join('');
  // Set first doctor as default if none selected
  if (!e.docId && STATE.doctors[0]) {
    e.docId = STATE.doctors[0].id;
    mainSel.value = e.docId;
  }
  mainSel.onchange = () => { e.docId = mainSel.value; };
  asstSel.onchange = () => { e.assistDocId = asstSel.value; };

  // symptoms
  const sh = $('#ex-symptoms');
  sh.innerHTML = SYMPTOM_LIST.map(s => `
    <button type="button" class="badge ${e.symptoms2.includes(s)?'b-o':''}" data-sym="${escHTML(s)}" style="cursor:pointer;border:1.5px solid ${e.symptoms2.includes(s)?'var(--orange)':'var(--border)'};padding:6px 10px;background:${e.symptoms2.includes(s)?'var(--orange-soft)':'#fff'};font-size:11px">${escHTML(s)}</button>
  `).join('');
  sh.querySelectorAll('button[data-sym]').forEach(b => b.addEventListener('click', () => {
    const s = b.dataset.sym;
    if (e.symptoms2.includes(s)) e.symptoms2 = e.symptoms2.filter(x=>x!==s);
    else e.symptoms2.push(s);
    initExamPage();
  }));

  renderSvcList();
  renderSelectedSvcs();
  renderMedChips();

  // tabs
  $$('.tab[data-etab]').forEach(t => t.onclick = () => {
    STATE.activeETab = t.dataset.etab;
    $$('.tab[data-etab]').forEach(x => x.classList.toggle('active', x.dataset.etab === STATE.activeETab));
    $$('.etab').forEach(x => x.classList.toggle('hidden', x.dataset.etab !== STATE.activeETab));
  });
  // restore active tab
  $$('.tab[data-etab]').forEach(x => x.classList.toggle('active', x.dataset.etab === STATE.activeETab));
  $$('.etab').forEach(x => x.classList.toggle('hidden', x.dataset.etab !== STATE.activeETab));

  // input bindings
  ['ex-temp','ex-pulse','ex-resp','ex-wt','ex-diag','ex-note','ex-date','ex-time'].forEach(id => {
    const el = $('#'+id);
    el.oninput = () => {
      const map = {'ex-temp':'temp','ex-pulse':'pulse','ex-resp':'resp','ex-wt':'wt','ex-diag':'diagnosis','ex-note':'note','ex-date':'date','ex-time':'time'};
      e[map[id]] = el.value;
    };
  });

  // svc search
  $('#svc-search').oninput = renderSvcList;
  // med search
  setupMedSearch();
}

function renderSvcList() {
  const q = ($('#svc-search')?.value || '').toLowerCase().trim();
  const list = getAllServices().filter(s => !q || s.toLowerCase().includes(q));
  $('#svc-list').innerHTML = list.map(s => `
    <div class="svc-item" data-svc="${escHTML(s)}">
      <span class="svc-item-name">${escHTML(s)}</span>
      <span style="color:var(--orange);font-size:16px;font-weight:900">+</span>
    </div>
  `).join('');
  $('#svc-list').querySelectorAll('.svc-item').forEach(el => el.onclick = () => {
    const s = el.dataset.svc;
    if (!STATE.curExam.services.find(x => x.name === s)) {
      STATE.curExam.services.push({ name: s, price: getSvcPrice(s) });
      renderSelectedSvcs();
    }
  });
}

function renderSelectedSvcs() {
  const e = STATE.curExam;
  const wrap = $('#svc-selected');
  if (e.services.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:14px;font-size:12px">Үйлчилгээ сонгоогүй</div>';
  } else {
    wrap.innerHTML = e.services.map((s,i) => `
      <div class="svc-row">
        <div class="svc-row-name">${escHTML(s.name)}</div>
        <input class="inp" type="number" data-i="${i}" value="${s.price||''}" placeholder="0">
        <button class="btn btn-r btn-xs" data-rm="${i}">✕</button>
      </div>
    `).join('');
    wrap.querySelectorAll('input[type=number]').forEach(inp => inp.oninput = () => {
      e.services[+inp.dataset.i].price = parseFloat(inp.value) || 0;
      updateSvcTotal();
    });
    wrap.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => {
      e.services.splice(+b.dataset.rm, 1);
      renderSelectedSvcs();
    });
  }
  updateSvcTotal();
}

function updateSvcTotal() {
  const t = STATE.curExam.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  $('#svc-total').textContent = fmt(t);
}

function setupMedSearch() {
  const inp = $('#med-search');
  const list = $('#med-list');
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); return; }
    const matches = MED_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 50);
    if (matches.length === 0) { list.classList.remove('show'); return; }
    list.innerHTML = matches.map(m => `<div class="dd-item" data-m="${escHTML(m)}">${escHTML(m)}</div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-item').forEach(el => {
      el.onmousedown = (e) => {
        e.preventDefault();
        const name = el.dataset.m;
        if (!STATE.curExam.meds.find(x => (x.name||x) === name)) {
          STATE.curExam.meds.push({ name, note: '' });
        }
        renderMedChips();
        inp.value = '';
        list.classList.remove('show');
        inp.focus();
      };
    });
  };
  inp.onblur = () => { list.classList.remove('show'); };
}

function renderMedChips() {
  const wrap = $('#med-chips');
  const meds = STATE.curExam.meds;
  if (meds.length === 0) {
    wrap.innerHTML = '<span style="font-size:12px;color:var(--muted);font-weight:600">Эм сонгоогүй</span>';
  } else {
    wrap.innerHTML = meds.map((m, i) => {
      const name = m.name || m;
      const note = m.note || '';
      return `
        <div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;min-width:120px;flex-shrink:0">${escHTML(name)}</span>
          <input class="inp" type="text" value="${escHTML(note)}"
            placeholder="Тайлбар: өдрийн 3-р 14 хоног..."
            style="flex:1;padding:4px 8px;font-size:12px"
            oninput="STATE.curExam.meds[${i}].note=this.value">
          <button class="btn btn-r btn-xs" onclick="STATE.curExam.meds.splice(${i},1);renderMedChips()">✕</button>
        </div>`;
    }).join('');
  }
  $('#ex-meds').value = meds.map(m => (m.name||m) + (m.note ? ' — ' + m.note : '')).join('\n');
}

function cancelExam() {
  if (STATE.curExam && STATE.curExam.services.length === 0 && !STATE.curExam.diagnosis) {
    STATE.curExam = null;
  }
  nav('waiting');
}

// ============================================================
// EXAM IMAGES (resize + compress + store)
// ============================================================
// Багасгах тохиргоо: урт талыг 1000px, JPEG чанар 0.7 → ~100-200KB
const IMG_MAX_DIM = 1000;
const IMG_QUALITY = 0.7;
const IMG_MAX_PER_EXAM = 6; // үзлэг бүрт дээд тал нь 6 зураг

// Файлыг canvas ашиглан багасгаж, JPEG data URL болгож буцаана
function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error('Зураг биш файл байна'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Файл уншиж чадсангүй'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Зураг ачаалж чадсангүй'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > IMG_MAX_DIM) {
          height = Math.round(height * IMG_MAX_DIM / width);
          width = IMG_MAX_DIM;
        } else if (height > IMG_MAX_DIM) {
          width = Math.round(width * IMG_MAX_DIM / height);
          height = IMG_MAX_DIM;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', IMG_QUALITY);
          resolve(dataUrl);
        } catch (err) {
          reject(new Error('Зураг хувиргаж чадсангүй'));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Зургийн эх сурвалжийг буцаана: шинэ нь .url (Storage), хуучин нь .data (base64)
function imgSrc(im) { return (im && (im.url || im.data)) || ''; }

// curExam-д зураг нэмэх (үзлэг бичих үед). fileList = input.files
async function addExamImages(fileList) {
  const e = STATE.curExam;
  if (!e) return;
  if (!Array.isArray(e.images)) e.images = [];
  const files = Array.from(fileList || []);
  if (!files.length) return;
  if (e.images.length + files.length > IMG_MAX_PER_EXAM) {
    toast('Үзлэг бүрт дээд тал нь ' + IMG_MAX_PER_EXAM + ' зураг', 'err');
    return;
  }
  if (!window.__fbReady || !window.__fbUploadImage) {
    toast('⛔ Firebase холбогдоогүй. Зураг хадгалах боломжгүй.', 'err');
    return;
  }
  toast('Зураг боловсруулж байна...', 'ok');
  let successCount = 0;
  for (const file of files) {
    try {
      const dataUrl = await resizeImageFile(file);
      const imgId = uid();
      const path = 'exam-images/' + e.id + '/' + imgId + '.jpg';
      try {
        const url = await window.__fbUploadImage(path, dataUrl);
        // Зөвхөн URL+path хадгална — base64 data огт хадгалахгүй
        e.images.push({ id: imgId, url: url, path: path, ms: nowMs() });
        successCount++;
      } catch (upErr) {
        toast('⛔ Зураг Storage-д илгээж чадсангүй: ' + (upErr.message || 'алдаа') + '. Дахин оролдоно уу.', 'err');
      }
    } catch (err) {
      toast(err.message || 'Зураг боловсруулж чадсангүй', 'err');
    }
  }
  if (successCount > 0) {
    renderExamImages();
    saveAll();
  }
}

// curExam-аас зураг устгах
function removeExamImage(imgId) {
  const e = STATE.curExam;
  if (!e || !Array.isArray(e.images)) return;
  const im = e.images.find(x => x.id === imgId);
  if (im && im.url && window.__fbDeleteImageByUrl) window.__fbDeleteImageByUrl(im.url);
  e.images = e.images.filter(im => im.id !== imgId);
  renderExamImages();
}

// Үзлэг бичих хэсэгт зургийн thumbnail-уудыг харуулах
function renderExamImages() {
  const wrap = $('#ex-images');
  if (!wrap) return;
  const e = STATE.curExam;
  const imgs = (e && Array.isArray(e.images)) ? e.images : [];
  if (!imgs.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px">Одоогоор зураг алга</div>';
    return;
  }
  wrap.innerHTML = imgs.map(im => `
    <div style="position:relative;width:84px;height:84px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <img src="${imgSrc(im)}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="openImageLightbox('${im.id}','exam')">
      <button type="button" onclick="removeExamImage('${im.id}')" title="Устгах"
        style="position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
    </div>
  `).join('');
}

// Том зургийг харах lightbox. source='exam' (curExam) эсвэл массив шууд
let _lightboxImgs = [];
function openImageLightbox(imgId, source) {
  let imgs = [];
  if (source === 'exam' && STATE.curExam && Array.isArray(STATE.curExam.images)) {
    imgs = STATE.curExam.images;
  } else if (Array.isArray(_lightboxImgs)) {
    imgs = _lightboxImgs;
  }
  const im = imgs.find(x => x.id === imgId);
  if (!im) return;
  let lb = $('#img-lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'img-lightbox';
    lb.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:20px';
    lb.onclick = () => { lb.style.display = 'none'; };
    document.body.appendChild(lb);
  }
  lb.innerHTML = `<img src="${imgSrc(im)}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px">`;
  lb.style.display = 'flex';
}

// Exam detail modal дахь зургийг харуулах (нэмэх/устгах боломжтой)
function renderExamDetailImages(e) {
  const wrap = $('#exd-images');
  if (!wrap) return;
  const imgs = (e && Array.isArray(e.images)) ? e.images : [];
  if (!imgs.length) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px">Зураг алга</div>';
    return;
  }
  wrap.innerHTML = imgs.map(im => `
    <div style="position:relative;width:84px;height:84px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <img src="${imgSrc(im)}" style="width:100%;height:100%;object-fit:cover;cursor:pointer" onclick="openImageLightbox('${im.id}')">
      <button type="button" onclick="removeExamDetailImage('${e.id}','${im.id}')" title="Устгах"
        style="position:absolute;top:2px;right:2px;width:22px;height:22px;border:none;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;cursor:pointer;font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
    </div>
  `).join('');
}

// Exam detail modal-аас зураг устгах
function removeExamDetailImage(examId, imgId) {
  const e = STATE.exams.find(x => String(x.id) === String(examId));
  if (!e || !Array.isArray(e.images)) return;
  const im = e.images.find(x => x.id === imgId);
  if (im && im.url && window.__fbDeleteImageByUrl) window.__fbDeleteImageByUrl(im.url);
  e.images = e.images.filter(im => im.id !== imgId);
  _lightboxImgs = e.images;
  saveAll();
  fbSaveRecord('exams', e);
  renderExamDetailImages(e);
  toast('Зураг устгагдлаа', 'ok');
}

function finishExam() {
  const e = STATE.curExam;
  if (!e) return;
  if (!e.diagnosis) { toast('Онош оруулна уу', 'err'); return; }
  const total = e.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const mainDoc = STATE.doctors.find(d=>String(d.id)===String(e.docId));
  const asstDoc = e.assistDocId ? STATE.doctors.find(d=>String(d.id)===String(e.assistDocId)) : null;
  const exam = {
    id: e.id,
    horseId: e.horseId,
    horse: e.horse,
    owner: e.owner,
    phone: e.phone,
    docId: e.docId,
    docName: mainDoc ? mainDoc.name : '—',
    assistDocId: e.assistDocId || '',
    assistDocName: asstDoc ? asstDoc.name : '',
    date: e.date,
    time: e.time,
    examNum: e.examNum,
    diagnosis: e.diagnosis,
    note: e.note,
    services: e.services,
    meds: e.meds,
    symptoms: e.symptoms2,
    anamnesis: e.symptoms || '',
    temp: e.temp, pulse: e.pulse, resp: e.resp, wt: e.wt,
    province: e.province || (STATE.horses.find(h=>h.id===e.horseId)||{}).province || '',
    soum: e.soum || (STATE.horses.find(h=>h.id===e.horseId)||{}).soum || '',
    images: Array.isArray(e.images) ? e.images : [],
    amount: total,
    regMs: parseFloat(e.regMs) || null,        // адуу бүртгэсэн агшин
    doneMs: nowMs(),                            // үзлэг дуусгасан агшин
    durationMin: (parseFloat(e.regMs) ? Math.max(0, Math.round((nowMs() - parseFloat(e.regMs)) / 60000)) : null), // зарцуулсан минут
    ms: nowMs()
  };
  STATE.exams.push(exam);
  // create finance record
  const fin = {
    id: uid(),
    examId: exam.id,
    examNum: exam.examNum || (STATE.waiting.find(w=>w.id===e.waitId) && STATE.waiting.find(w=>w.id===e.waitId).examNum) || '',
    horse: exam.horse,
    owner: exam.owner,
    phone: exam.phone,
    docName: exam.docName,
    amount: total,
    services: e.services.map(s=>s.name).join(', '),
    paid: false,
    method: '',
    date: exam.date,
    paidDate: '',
    paidMs: 0,
    ms: nowMs()
  };
  STATE.fins.push(fin);
  // remove from waiting
  STATE.waiting = STATE.waiting.filter(w => w.id !== e.waitId);
  _markWaitingRemoved(e.waitId);
  // update doctor stats
  const doc = STATE.doctors.find(d => String(d.id) === String(e.docId));
  if (doc) {
    doc.exams = (doc.exams||0)+1;
    doc.rev = (doc.rev||0)+total;
    fbSaveRecord('doctors', doc);
  }
  saveAll();
  // ⚡ Зөвхөн өөрчлөгдсөн record-уудыг бичнэ
  fbSaveRecord('exams', exam);
  fbSaveRecord('fins', fin);
  fbDeleteDoc('waiting', String(e.waitId));
  writeLog('Үзлэг дуусгасан', exam.id, exam.horse + ' — ' + (exam.docName||''), exam.diagnosis ? ('Онош: ' + exam.diagnosis) : '', exam.examNum);
  STATE.curExam = null;
  STATE.selectedW = null;
  updateBadges();
  toast('✅ Үзлэг дууслаа, нэхэмжлэх үүсгэгдлээ', 'ok');
  nav('finance');
}

function moveToInpatient() {
  const e = STATE.curExam;
  if (!e) return;
  if (!e.diagnosis) { toast('Онош оруулна уу', 'err'); return; }
  // Confirm before moving — prevents accidental hospitalization
  if (!confirm('🏥 Энэ адууг хэвтэн эмчлүүлэхэд оруулах уу?\n\nАдуу: ' + e.horse + '\nЭзэн: ' + e.owner + '\n\nЗа гэвэл хэвтэгчдийн жагсаалтад орно.')) return;
  // Save exam first
  const total = e.services.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const mainDoc = STATE.doctors.find(d=>String(d.id)===String(e.docId));
  const asstDoc = e.assistDocId ? STATE.doctors.find(d=>String(d.id)===String(e.assistDocId)) : null;
  const exam = {
    id: e.id, horseId: e.horseId, horse: e.horse, owner: e.owner, phone: e.phone,
    docId: e.docId, docName: mainDoc ? mainDoc.name : '—',
    assistDocId: e.assistDocId || '', assistDocName: asstDoc ? asstDoc.name : '',
    date: e.date, time: e.time, examNum: e.examNum,
    diagnosis: e.diagnosis, note: e.note,
    services: e.services, meds: e.meds, symptoms: e.symptoms2,
    temp: e.temp, pulse: e.pulse, resp: e.resp, wt: e.wt,
    amount: total, ms: nowMs(), inpatient: true
  };
  STATE.exams.push(exam);
  // create inpatient
  const inp = {
    id: uid(),
    examId: exam.id,
    horse: e.horse, owner: e.owner, phone: e.phone,
    diagnosis: e.diagnosis,
    docName: exam.docName,
    admittedMs: nowMs(),
    admittedDate: todayStr(),
    initialAmount: total,
    services: [...e.services],
    meds: [...e.meds],
    log: [],
    discharged: false
  };
  STATE.inps.push(inp);
  STATE.waiting = STATE.waiting.filter(w => w.id !== e.waitId);
  _markWaitingRemoved(e.waitId);
  saveAll();
  fbSaveRecord('exams', exam);
  fbSaveRecord('inps', inp);
  fbDeleteDoc('waiting', String(e.waitId));
  STATE.curExam = null;
  STATE.selectedW = null;
  updateBadges();
  toast('🏥 Хэвтэн эмчлүүлэхэд оруулагдлаа', 'ok');
  nav('inpatient');
}

// ============================================================
// INPATIENT
// ============================================================
// ============================================================
// INPATIENT — days calculation
// ============================================================
// Rule: count inpatient days from admittedMs.
// - Day 1 = admission day (regardless of admit time).
// - Each new calendar day past 12:00 (noon) adds +1 day.
// - Before 12:00 on the next day, count stays the same as previous day.
// Examples (admitted on day D):
//   D 09:00 → 1 day
//   D 23:00 → 1 day
//   D+1 11:59 → 1 day
//   D+1 12:00 → 2 days
//   D+2 11:59 → 2 days
//   D+2 12:00 → 3 days
function inpatientDays(admittedMs, atMs) {
  if (!admittedMs) return 1;
  const at = atMs || nowMs();
  // Get start-of-admission-day (00:00 local time)
  const adm = new Date(admittedMs);
  const admStart = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate(), 0, 0, 0).getTime();
  // Get start-of-current-day
  const cur = new Date(at);
  const curStart = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate(), 0, 0, 0).getTime();
  // How many full calendar days passed since admission day
  const daysDiff = Math.round((curStart - admStart) / 86400000);
  // Add +1 if current time has passed noon (12:00)
  const pastNoon = cur.getHours() >= 12;
  // Day 1 = admission day; each calendar day past noon adds +1
  let days = 1 + daysDiff;
  if (!pastNoon && daysDiff > 0) days -= 1;
  return Math.max(1, days);
}

function renderInpatient() {
  const active = STATE.inps.filter(i => !i.discharged);
  $('#inp-sub').textContent = active.length + ' адуу хэвтэж байна';
  const list = $('#inp-list');
  if (active.length === 0) {
    list.innerHTML = '<div class="empty"><div class="empty-em">🏥</div>Хэвтэж буй адуу алга</div>';
    $('#inp-detail-card').classList.add('hidden');
    return;
  }
  list.innerHTML = active.map(i => {
    const days = inpatientDays(i.admittedMs);
    return `
      <div class="li" data-id="${i.id}">
        <div class="li-stripe" style="background:var(--purple)"></div>
        <div class="li-av" style="background:var(--purple-soft)">🏥</div>
        <div class="li-info">
          <div class="li-name">${escHTML(i.horse)} <span class="muted" style="font-weight:600">· ${escHTML(i.owner)}</span></div>
          <div class="li-sub">${escHTML(i.diagnosis)}</div>
        </div>
        <div class="li-r">
          <span class="badge b-p">${days} хоног</span>
          <div class="li-time">${escHTML(i.admittedDate)}</div>
        </div>
      </div>
    `;
  }).join('');
  list.querySelectorAll('.li').forEach(el => el.onclick = () => {
    STATE.selectedI = String(el.dataset.id);
    list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedI));
    renderIDetail();
  });
  if (STATE.selectedI != null) STATE.selectedI = String(STATE.selectedI);
  if (STATE.selectedI) renderIDetail();
}

// ============================================================
// INPATIENT — daily logs + prepayments helpers
// ============================================================

function getInpPrepayments(i) {
  return Array.isArray(i.prepayments) ? i.prepayments : [];
}
function getInpPrepaidTotal(i) {
  return getInpPrepayments(i).reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
}
function getInpDailyTotal(i) {
  const logs = Array.isArray(i.log) ? i.log : [];
  return logs.reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
}
function getInpGrandTotal(i) {
  // Initial exam amount + sum of daily log amounts (prepayments are subtracted at discharge)
  return (parseFloat(i.initialAmount)||0) + getInpDailyTotal(i);
}
function getInpDueAmount(i) {
  return Math.max(0, getInpGrandTotal(i) - getInpPrepaidTotal(i));
}

// Selected meds and services for the day-log entry (transient state)
let INP_DRAFT = { meds: [], services: [] };

// Default daily fee
const DEFAULT_DAILY_FEE = 80000;

function getDailyFee(i) {
  if (i && (i.dailyFee !== undefined && i.dailyFee !== null && i.dailyFee !== '')) {
    return parseFloat(i.dailyFee) || 0;
  }
  return DEFAULT_DAILY_FEE;
}

// Override grand total to include accommodation (daily fee × days)
function getInpAccommodation(i, atMs) {
  const days = inpatientDays(i.admittedMs, atMs);
  return getDailyFee(i) * days;
}
function getInpServicesTotal(i) {
  return getInpDailyTotal(i);
}
function getInpFullTotal(i, atMs) {
  return (parseFloat(i.initialAmount)||0) + getInpServicesTotal(i) + getInpAccommodation(i, atMs);
}

function updateDailyFee() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const v = parseFloat($('#inp-daily-fee').value);
  i.dailyFee = (isNaN(v) || v < 0) ? DEFAULT_DAILY_FEE : v;
  saveAll();
  fbSaveRecord('inps', i);
  renderInpFinTab(i);
}

function renderIDetail() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) { $('#inp-detail-card').classList.add('hidden'); return; }
  $('#inp-detail-card').classList.remove('hidden');
  const days = inpatientDays(i.admittedMs);

  $('#inp-detail-title').innerHTML = `📌 ${escHTML(i.horse)} <span class="muted" style="font-size:11px;font-weight:600">· ${escHTML(i.owner)} · ${days} хоног</span>`;

  // Wire up tab switcher
  $$('.tab[data-itab]').forEach(t => {
    t.onclick = () => {
      const tab = t.dataset.itab;
      $$('.tab[data-itab]').forEach(x => x.classList.toggle('active', x.dataset.itab === tab));
      $$('.itab').forEach(x => x.classList.toggle('hidden', x.dataset.itab !== tab));
    };
  });

  // === TAB 1: INFO ===
  renderInpInfoTab(i);

  // === TAB 2: TREATMENT ===
  renderInpTreatTab(i);

  // === TAB 3: FINANCE ===
  renderInpFinTab(i);
}

function renderInpInfoTab(i) {
  $('#inp-info-body').innerHTML = `
    <div class="fg r2">
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(i.owner)}</div></div>
      <div class="fld"><label>Утас</label><div class="bold">${escHTML(i.phone)}</div></div>
      <div class="fld"><label>Эмчлэгч эмч</label><div class="bold">${escHTML(i.docName)}</div></div>
      <div class="fld"><label>Орсон огноо</label><div class="bold">${escHTML(i.admittedDate)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Анхны онош</label>
      <div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(i.diagnosis)}</div>
    </div>
  `;

  // Day-by-day list (NO amounts)
  const wrap = $('#inp-summary-list');
  const logs = Array.isArray(i.log) ? i.log : [];
  if (logs.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Эмчилгээний бичлэг алга</div>';
    return;
  }
  // Group logs by date
  const byDate = {};
  logs.forEach(l => {
    const d = (l.date||'').slice(0,10);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(l);
  });
  const dates = Object.keys(byDate).sort().reverse();
  wrap.innerHTML = dates.map(d => {
    const items = byDate[d];
    return `
      <div style="padding:10px;background:var(--input);border-radius:8px;margin-bottom:6px">
        <div class="bold" style="font-size:13px;margin-bottom:6px">📅 ${escHTML(d)}</div>
        ${items.map(l => `
          <div style="padding:6px 0;border-top:1px solid var(--border);font-size:12px">
            <div style="font-weight:700;margin-bottom:2px">👨‍⚕️ ${escHTML(l.docName||'—')}</div>
            ${l.diagnosis ? `<div><b>Онош:</b> ${escHTML(l.diagnosis)}</div>` : ''}
            ${l.note ? `<div><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>` : ''}
            ${(l.temp||l.pulse||l.wt) ? `<div style="color:var(--muted);font-size:11px">T: ${escHTML(l.temp||'—')} · P: ${escHTML(l.pulse||'—')} · W: ${escHTML(l.wt||'—')}</div>` : ''}
            ${Array.isArray(l.meds) && l.meds.length ? `<div style="font-size:11px;margin-top:4px"><b>Эм:</b> ${l.meds.map(m => escHTML((m.name||m)+(m.note?' — '+m.note:''))).join(', ')}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }).join('');
}

function renderInpTreatTab(i) {
  // Populate doctor select & default date
  const docSel = $('#inp-log-doc');
  if (docSel) {
    docSel.innerHTML = STATE.doctors.map(d =>
      `<option value="${escHTML(d.id)}" ${String(d.id)===String(i.docId)?'selected':''}>${escHTML(d.name)}</option>`
    ).join('');
  }
  if ($('#inp-log-date') && !$('#inp-log-date').value) $('#inp-log-date').value = todayStr();

  // INP_DRAFT-г зөвхөн хэвтэн эмчлэх сонголт өөрчлөгдсөн үед reset хийнэ
  if (!INP_DRAFT._inpId || INP_DRAFT._inpId !== String(i.id)) {
    INP_DRAFT = { meds: [], services: [], _inpId: String(i.id) };
  }
  renderInpDraftMeds();
  renderInpDraftServices();
  recomputeInpDayAmt();
  setupInpMedSearch();
  setupInpSvcSearch();

  // Render day log history (with optional date filter)
  const filter = $('#inp-filter-date') ? $('#inp-filter-date').value : '';
  const lh = $('#inp-log');
  let logs = Array.isArray(i.log) ? i.log : [];
  if (filter) {
    logs = logs.filter(l => (l.date||'').slice(0,10) === filter);
  }
  if (logs.length === 0) {
    lh.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Бүртгэл алга</div>';
  } else {
    lh.innerHTML = logs.slice().reverse().map((l, idx) => {
      const realIdx = i.log.length - 1 - idx;
      return `
        <div style="padding:10px;background:var(--input);border-radius:8px;margin-bottom:6px">
          <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:6px">
            <span class="bold" style="font-size:13px">📅 ${escHTML(l.date||'—')} · ${escHTML(l.docName||'—')}</span>
            <span class="row" style="gap:6px">
              <span class="badge b-o">${fmt(l.amount||0)}</span>
              <button class="btn btn-r btn-xs" onclick="deleteInpLog(${realIdx})">✕</button>
            </span>
          </div>
          ${l.diagnosis ? `<div style="font-size:12px;margin-top:6px"><b>Онош:</b> ${escHTML(l.diagnosis)}</div>` : ''}
          ${l.note ? `<div style="font-size:12px;margin-top:4px"><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>` : ''}
          ${(l.temp||l.pulse||l.wt) ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">T: ${escHTML(l.temp||'—')} · P: ${escHTML(l.pulse||'—')} · W: ${escHTML(l.wt||'—')}</div>` : ''}
          ${Array.isArray(l.services) && l.services.length ? `
            <div style="font-size:11px;margin-top:4px">
              <b>Үйлчилгээ:</b> ${l.services.map(s => escHTML(s.name)+' (' + fmt(parseFloat(s.price)||0) + ')').join(', ')}
            </div>` : ''}
          ${Array.isArray(l.meds) && l.meds.length ? `
            <div style="font-size:11px;margin-top:4px">
              <b>Эм:</b> ${l.meds.map(m => escHTML((m.name||m)+(m.note?' — '+m.note:''))).join(', ')}
            </div>` : ''}
        </div>
      `;
    }).join('');
  }
}

function renderInpFinTab(i) {
  // Daily fee input
  const fee = getDailyFee(i);
  if ($('#inp-daily-fee')) $('#inp-daily-fee').value = fee;

  // Build day-by-day list with amounts
  const days = inpatientDays(i.admittedMs);
  const logs = Array.isArray(i.log) ? i.log : [];

  // Group log amounts by date
  const treatByDate = {};
  logs.forEach(l => {
    const d = (l.date||'').slice(0,10);
    if (!treatByDate[d]) treatByDate[d] = 0;
    treatByDate[d] += parseFloat(l.amount)||0;
  });

  // Build list of all days from admission to today
  const list = [];
  if (i.admittedMs) {
    const adm = new Date(i.admittedMs);
    const start = new Date(adm.getFullYear(), adm.getMonth(), adm.getDate());
    const end = i.dischargedMs ? new Date(i.dischargedMs) : new Date();
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    let cur = new Date(start);
    let dayN = 1;
    while (cur.getTime() <= endDay.getTime()) {
      const dStr = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
      list.push({
        date: dStr,
        dayN: dayN,
        accommodation: fee,
        treatment: treatByDate[dStr] || 0
      });
      cur.setDate(cur.getDate() + 1);
      dayN++;
    }
  }

  const finList = $('#inp-fin-list');
  if (list.length === 0) {
    finList.innerHTML = '<div class="empty" style="padding:16px;font-size:12px">Өгөгдөл алга</div>';
  } else {
    finList.innerHTML = `
      <div class="tbl-wrap">
        <table style="font-size:12px">
          <thead><tr>
            <th>#</th><th>Огноо</th><th>Хоног</th><th>Эмчилгээ</th><th>Дүн</th>
          </tr></thead>
          <tbody>
            ${list.map(d => `
              <tr>
                <td>${d.dayN}</td>
                <td>${escHTML(d.date)}</td>
                <td>${fmt(d.accommodation)}</td>
                <td>${fmt(d.treatment)}</td>
                <td class="bold">${fmt(d.accommodation + d.treatment)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Prepayments
  renderInpPrepaymentsList(i);

  // Summary
  const examFee = parseFloat(i.initialAmount)||0;
  const accommodation = list.reduce((a,b)=>a+b.accommodation, 0);
  const treatment = list.reduce((a,b)=>a+b.treatment, 0);
  const grandTotal = examFee + accommodation + treatment;
  const prepaid = getInpPrepaidTotal(i);
  const due = Math.max(0, grandTotal - prepaid);
  $('#inp-fin-summary').innerHTML = `
    <div style="background:var(--input);padding:14px;border-radius:8px">
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🩺 Үзлэгийн төлбөр:</span><span class="bold">${fmt(examFee)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🏨 Хоног (${list.length} × ${fmt(fee)}):</span><span class="bold">${fmt(accommodation)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>💊 Эмчилгээ:</span><span class="bold">${fmt(treatment)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:14px;font-weight:900;padding-top:6px;border-top:1px solid var(--border)">
        <span>Нийт:</span><span>${fmt(grandTotal)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-top:4px">
        <span>Урьдчилгаа:</span><span class="bold" style="color:var(--green)">−${fmt(prepaid)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:16px;font-weight:900;padding-top:6px;border-top:2px solid var(--border)">
        <span>Үлдэгдэл:</span><span style="color:${due>0?'var(--red)':'var(--green)'}">${fmt(due)}</span>
      </div>
    </div>
  `;
}

function renderInpPrepaymentsList(i) {
  const wrap = $('#inp-prepay-summary');
  if (!wrap) return;
  const ps = getInpPrepayments(i);
  if (ps.length === 0) {
    wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:6px 0">Урьдчилгаа төлбөр алга</div>';
    return;
  }
  wrap.innerHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + ps.map((p,idx) => `
    <div class="row" style="justify-content:space-between;background:var(--input);padding:8px 10px;border-radius:6px;font-size:12px">
      <span>${methodIcon(p.method)} <b>${escHTML(p.method)}</b> · ${escHTML(p.purpose||'')} <span class="muted">${escHTML(p.date||'')}</span></span>
      <span class="row" style="gap:8px">
        <span class="bold">${fmt(p.amount)}</span>
        <button class="btn btn-r btn-xs" onclick="deleteInpPrepay(${idx})">✕</button>
      </span>
    </div>
  `).join('') + '</div>';
}

function setupInpMedSearch() {
  const inp = $('#inp-med-search');
  const list = $('#inp-med-list');
  if (!inp || !list) return;
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); list.innerHTML = ''; return; }
    const matches = MED_LIST.filter(m => m.toLowerCase().includes(q)).slice(0, 12);
    if (matches.length === 0) { list.classList.remove('show'); list.innerHTML = ''; return; }
    list.innerHTML = matches.map(m => `<div class="dd-i" data-m="${escHTML(m)}">${escHTML(m)}</div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-i').forEach(el => el.onclick = () => {
      const m = el.dataset.m;
      if (!INP_DRAFT.meds.find(x => x.name === m)) INP_DRAFT.meds.push({ name: m, price: 0 });
      renderInpDraftMeds();
      inp.value = '';
      list.classList.remove('show');
      list.innerHTML = '';
    });
  };
  inp.onblur = () => setTimeout(() => list.classList.remove('show'), 150);
}

function renderInpDraftMeds() {
  const wrap = $('#inp-med-chips');
  if (!wrap) return;
  if (INP_DRAFT.meds.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = INP_DRAFT.meds.map((m, i) => `
    <div style="display:flex;align-items:center;gap:6px;background:var(--input);border-radius:8px;padding:6px 10px;margin-bottom:4px;flex-wrap:wrap">
      <span style="font-size:13px;font-weight:600;min-width:120px;flex-shrink:0">${escHTML(m.name)}</span>
      <input class="inp" type="text" value="${escHTML(m.note||'')}"
        placeholder="Тайлбар: өдрийн 3-р 14 хоног..."
        style="flex:1;min-width:140px;padding:4px 8px;font-size:12px"
        oninput="INP_DRAFT.meds[${i}].note=this.value">
      <input class="inp" type="number" value="${m.price||0}" placeholder="Үнэ ₮"
        style="width:90px;padding:4px 8px;font-size:12px"
        oninput="updateInpMedPrice(${i}, this.value)">
      <button class="btn btn-r btn-xs" onclick="removeInpDraftMed(${i})">✕</button>
    </div>
  `).join('');
}

function updateInpMedPrice(idx, val) {
  if (INP_DRAFT.meds[idx]) { INP_DRAFT.meds[idx].price = parseFloat(val) || 0; recomputeInpDayAmt(); }
}

function removeInpDraftMed(idx) {
  INP_DRAFT.meds.splice(idx, 1);
  renderInpDraftMeds();
  recomputeInpDayAmt();
}

function setupInpSvcSearch() {
  const inp = $('#inp-svc-search');
  const list = $('#inp-svc-list');
  if (!inp || !list) return;
  inp.oninput = () => {
    const q = inp.value.toLowerCase().trim();
    if (!q) { list.classList.remove('show'); list.innerHTML = ''; return; }
    // SERVICE_LIST биш getAllServices() — Админ тохируулсан үнэ, custom үйлчилгээ зөв орно
    const allSvcs = getAllServices();
    const matches = allSvcs
      .filter(name => name.toLowerCase().includes(q))
      .slice(0, 12)
      .map(name => ({ name, price: getSvcPrice(name) }));
    if (matches.length === 0) { list.classList.remove('show'); list.innerHTML = ''; return; }
    list.innerHTML = matches.map(s => `<div class="dd-i" data-name="${escHTML(s.name)}" data-price="${s.price}">${escHTML(s.name)} <span class="muted">${fmt(s.price)}</span></div>`).join('');
    list.classList.add('show');
    list.querySelectorAll('.dd-i').forEach(el => { el.onmousedown = (e) => { e.preventDefault();
      INP_DRAFT.services.push({ name: el.dataset.name, price: parseFloat(el.dataset.price)||0 });
      renderInpDraftServices();
      recomputeInpDayAmt();
      inp.value = '';
      list.classList.remove('show');
      list.innerHTML = '';
      inp.focus();
      };
    });
  };
  inp.onblur = () => { list.classList.remove('show'); list.innerHTML = ''; };
}

function renderInpDraftServices() {
  const wrap = $('#inp-svc-chips');
  if (!wrap) return;
  if (INP_DRAFT.services.length === 0) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = INP_DRAFT.services.map((s, i) => `
    <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
      <span>${escHTML(s.name)}</span>
      <span class="row" style="gap:6px">
        <input class="inp" type="number" value="${s.price}" data-svc-idx="${i}" style="width:90px;padding:4px 8px;font-size:12px" oninput="updateInpSvcPrice(${i}, this.value)">
        <button class="btn btn-r btn-xs" onclick="removeInpDraftSvc(${i})">✕</button>
      </span>
    </div>
  `).join('');
}

function removeInpDraftSvc(idx) {
  INP_DRAFT.services.splice(idx, 1);
  renderInpDraftServices();
  recomputeInpDayAmt();
}

function updateInpSvcPrice(idx, val) {
  INP_DRAFT.services[idx].price = parseFloat(val) || 0;
  recomputeInpDayAmt();
}

function recomputeInpDayAmt() {
  const svcTotal = INP_DRAFT.services.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const medTotal = INP_DRAFT.meds.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const total = svcTotal + medTotal;
  if ($('#inp-day-amt')) $('#inp-day-amt').value = fmt(total);
}

function addInpLog() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const date = $('#inp-log-date').value || todayStr();
  const docId = $('#inp-log-doc').value;
  const doc = STATE.doctors.find(d => String(d.id) === String(docId));
  const note = $('#inp-note').value.trim();
  const diag = $('#inp-diag').value.trim();
  if (!note && !diag && INP_DRAFT.services.length === 0 && INP_DRAFT.meds.length === 0) {
    toast('Эмчилгээ эсвэл онош оруулна уу', 'err'); return;
  }
  const svcAmount = INP_DRAFT.services.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const medAmount = INP_DRAFT.meds.reduce((a,b) => a + (parseFloat(b.price)||0), 0);
  const amount = svcAmount + medAmount;
  const log = {
    id: uid(),
    date: date,
    docId: docId,
    docName: doc ? doc.name : '—',
    diagnosis: diag,
    note: note,
    temp: $('#inp-temp').value,
    pulse: $('#inp-pulse').value,
    wt: $('#inp-wt').value,
    services: INP_DRAFT.services.slice(),
    meds: INP_DRAFT.meds.slice(),
    amount: amount,
    ms: nowMs()
  };
  if (!Array.isArray(i.log)) i.log = [];
  i.log.push(log);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  // Reset form fields
  $('#inp-temp').value = ''; $('#inp-pulse').value = ''; $('#inp-wt').value = '';
  $('#inp-note').value = ''; $('#inp-diag').value = '';
  if ($('#inp-log-date')) $('#inp-log-date').value = todayStr();
  INP_DRAFT = { meds: [], services: [], _inpId: String(i.id) };
  renderIDetail();
  toast('💾 Өдрийн бичлэг хадгалагдлаа', 'ok');
}

function deleteInpLog(idx) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.log) || idx < 0 || idx >= i.log.length) return;
  if (!confirm('Энэ өдрийн бичлэгийг устгах уу?')) return;
  i.log.splice(idx, 1);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
}

// Prepayment functions
function openInpPrepay() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  $('#inp-prepay-info').innerHTML = '<b>' + escHTML(i.horse) + '</b> · ' + escHTML(i.owner);
  $('#inp-prepay-amt').value = '';
  $('#inp-prepay-method').value = 'бэлэн';
  $('#inp-prepay-purpose').value = 'Үзлэгийн төлбөр';
  openModal('inp-prepay-modal');
}

function saveInpPrepay() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  const amt = parseFloat($('#inp-prepay-amt').value);
  if (!amt || amt <= 0) { toast('Зөв дүн оруулна уу', 'err'); return; }
  if (!Array.isArray(i.prepayments)) i.prepayments = [];
  i.prepayments.push({
    amount: amt,
    method: $('#inp-prepay-method').value,
    purpose: $('#inp-prepay-purpose').value,
    date: todayStr(),
    ms: nowMs()
  });
  // Bump the record's ms so applyArray treats it as fresher than Sheet
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  closeModal('inp-prepay-modal');
  renderIDetail();
  toast('💵 Урьдчилгаа хадгалагдлаа', 'ok');
}

function deleteInpPrepay(idx) {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i || !Array.isArray(i.prepayments) || idx < 0 || idx >= i.prepayments.length) return;
  if (!confirm('Энэ урьдчилгааг устгах уу?')) return;
  i.prepayments.splice(idx, 1);
  i.ms = nowMs();
  saveAll();
  fbSaveRecord('inps', i);
  renderIDetail();
}

/**
 * cancelInpatient — andуурсан бичлэгийг буцаах.
 *  - Хэвтэгчийн бичлэгийг (inps) бүрмөсөн устгана
 *  - Холбогдсон exam-г устгана (хадгалаагүй гэж тооцно)
 *  - Хэрэв доороос нь fin (нэхэмжлэх) үүссэн бол түүнийг ч устгана
 *  - Адуу/эзний мэдээллийг хүлээлт рүү буцааж шинэ waiting бичлэг үүсгэнэ
 */
function cancelInpatient() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  if (!confirm(
    'Энэ хэвтэгчийг хүлээлт рүү буцаах уу?\n\n' +
    'Хэвтэн эмчилгээний бичлэг бүрмөсөн арилна.\n' +
    'Холбогдох үзлэг болон нэхэмжлэхүүд устгагдана.'
  )) return;

  // Find related exam
  const exam = STATE.exams.find(e => String(e.id) === String(i.examId));
  // Remove related fins
  const removedFins = STATE.fins.filter(f => String(f.examId) === String(i.examId));
  STATE.fins = STATE.fins.filter(f => String(f.examId) !== String(i.examId));
  // Remove the exam
  STATE.exams = STATE.exams.filter(e => String(e.id) !== String(i.examId));
  // Remove the inpatient
  STATE.inps = STATE.inps.filter(x => String(x.id) !== String(i.id));

  // Re-create a waiting record from the exam/inpatient details
  const wait = {
    id: uid(),
    horseId: i.horseId || (exam && exam.horseId) || '',
    horse: i.horse,
    owner: i.owner,
    phone: i.phone,
    symptoms: i.diagnosis || (exam && exam.diagnosis) || '',
    urgency: 'green',
    examNum: exam && exam.examNum ? exam.examNum : '',
    ms: nowMs(),
    age: '', breed: '', province: ''
  };
  STATE.waiting.push(wait);

  saveAll();
  // Зөвхөн өөрчлөгдсөн record-уудыг бичнэ/устгана
  fbSaveRecord('waiting', wait);
  if (exam) fbDeleteDoc('exams', String(exam.id));
  removedFins.forEach(f => fbDeleteDoc('fins', String(f.id)));
  fbDeleteDoc('inps', String(i.id));

  STATE.selectedI = null;
  updateBadges();
  toast('↩ Хүлээлт рүү буцлаа', 'ok');
  nav('waiting');
}

// Discharge → opens modal showing final invoice with prepayments accounted for
function dischargeInpatient() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;
  // Compute totals with accommodation
  const days = inpatientDays(i.admittedMs);
  const dailyFee = getDailyFee(i);
  const examFee = parseFloat(i.initialAmount)||0;
  const treatmentTotal = getInpDailyTotal(i);
  const accommodation = dailyFee * days;
  const grandTotal = examFee + treatmentTotal + accommodation;
  const prepaid = getInpPrepaidTotal(i);
  const due = Math.max(0, grandTotal - prepaid);

  // Build summary
  const logs = Array.isArray(i.log) ? i.log : [];
  const prepayments = getInpPrepayments(i);

  $('#inp-discharge-body').innerHTML = `
    <div class="fg r2">
      <div class="fld"><label>Адуу / Эзэн</label><div class="bold">${escHTML(i.horse)} · ${escHTML(i.owner)}</div></div>
      <div class="fld"><label>Хоног</label><div class="bold">${days} хоног</div></div>
    </div>
    <div class="ch" style="margin-top:10px">📋 Эмчилгээний дэлгэрэнгүй</div>
    <div class="tbl-wrap" style="max-height:200px;overflow-y:auto">
      <table>
        <thead><tr><th>Огноо</th><th>Эмч</th><th>Дүн</th></tr></thead>
        <tbody>
          <tr><td>${escHTML(i.admittedDate)}</td><td>${escHTML(i.docName)}</td><td class="bold">${fmt(examFee)} <span class="muted" style="font-size:10px">үзлэг</span></td></tr>
          ${logs.map(l => `<tr><td>${escHTML(l.date)}</td><td>${escHTML(l.docName||'—')}</td><td class="bold">${fmt(l.amount||0)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="ch" style="margin-top:10px">💵 Урьдчилгаа төлбөр</div>
    ${prepayments.length === 0 ? '<div class="muted" style="font-size:12px">Урьдчилгаа төлөгдөөгүй</div>' : `
      <div style="display:flex;flex-direction:column;gap:4px">
        ${prepayments.map(p => `
          <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
            <span>${methodIcon(p.method)} ${escHTML(p.method)} · ${escHTML(p.purpose||'')} <span class="muted">${escHTML(p.date)}</span></span>
            <span class="bold">${fmt(p.amount)}</span>
          </div>
        `).join('')}
      </div>
    `}
    <div style="background:var(--input);padding:14px;border-radius:8px;margin-top:14px">
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🩺 Үзлэгийн төлбөр:</span><span class="bold">${fmt(examFee)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>🏨 Хоног (${days} × ${fmt(dailyFee)}):</span><span class="bold">${fmt(accommodation)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>💊 Эмчилгээ (${logs.length} бичлэг):</span><span class="bold">${fmt(treatmentTotal)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:14px;margin-bottom:4px;padding-top:6px;border-top:1px solid var(--border)">
        <span class="bold">Нийт дүн:</span><span class="bold">${fmt(grandTotal)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span>Төлсөн урьдчилгаа:</span><span class="bold" style="color:var(--green)">−${fmt(prepaid)}</span>
      </div>
      <div class="row" style="justify-content:space-between;font-size:18px;font-weight:900;padding-top:6px;border-top:2px solid var(--border)">
        <span>Үлдэгдэл төлөх:</span><span style="color:${due>0?'var(--red)':'var(--green)'}">${fmt(due)}</span>
      </div>
    </div>
  `;
  STATE.dischargeTarget = i.id;
  openModal('inp-discharge-modal');
}

function confirmDischarge() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.dischargeTarget));
  if (!i) return;
  i.discharged = true;
  i.dischargedMs = nowMs();
  i.dischargedDate = todayStr();
  // Recompute with discharge time
  const days = inpatientDays(i.admittedMs, i.dischargedMs);
  const dailyFee = getDailyFee(i);
  const examFee = parseFloat(i.initialAmount)||0;
  const treatmentTotal = getInpDailyTotal(i);
  const accommodation = dailyFee * days;
  const grandTotal = examFee + treatmentTotal + accommodation;
  const payments = getInpPrepayments(i).map(p => ({
    amount: parseFloat(p.amount)||0,
    method: p.method,
    date: p.date,
    ms: p.ms || nowMs()
  }));
  const prepaid = payments.reduce((a,b) => a + b.amount, 0);
  const due = Math.max(0, grandTotal - prepaid);

  // Find linked exam to pull examNum — with robust fallback chain
  const linkedExam = STATE.exams.find(e => String(e.id) === String(i.examId));
  const examNum = (linkedExam && linkedExam.examNum)
    || (i.examNum)
    || (STATE.fins.find(f => String(f.examId) === String(i.examId)) || {}).examNum
    || '';

  const fin = {
    id: uid(),
    examId: i.examId,
    examNum: examNum,
    horse: i.horse, owner: i.owner, phone: i.phone,
    docName: i.docName,
    amount: grandTotal,
    services: 'Хэвтэн эмчилгээ ' + days + ' хоног',
    paid: due === 0 && payments.length > 0,
    method: payments.length === 0 ? '' : (payments.length === 1 ? payments[0].method : 'хосолсон'),
    payments: payments,
    date: todayStr(),
    paidDate: due === 0 && payments.length > 0 ? todayStr() : '',
    paidMs: due === 0 && payments.length > 0 ? nowMs() : 0,
    ms: nowMs()
  };
  STATE.fins.push(fin);

  saveAll();
  // ⚡ Хэвтэгч гарсан мэдээллийг нөгөө компьютерт ШУУД харуулна
  fbSaveRecord('inps', i);
  fbSaveRecord('fins', fin);
  closeModal('inp-discharge-modal');
  STATE.selectedI = null;
  STATE.dischargeTarget = null;
  updateBadges();
  toast(due > 0 ? '🚪 Гарлаа · ' + fmt(due) + ' үлдэгдэлтэй' : '🚪 Гарлаа · төлбөр бүрэн', 'ok');
  renderInpatient();
}

// ============================================================
// FINANCE
// ============================================================
function renderFinance() {
  // tabs
  $$('.tab[data-ftab]').forEach(t => t.onclick = () => {
    STATE.activeFTab = t.dataset.ftab;
    $$('.tab[data-ftab]').forEach(x => x.classList.toggle('active', x.dataset.ftab === STATE.activeFTab));
    $$('.ftab').forEach(x => x.classList.toggle('hidden', x.dataset.ftab !== STATE.activeFTab));
    renderFinance();
  });
  $$('.tab[data-ftab]').forEach(x => x.classList.toggle('active', x.dataset.ftab === STATE.activeFTab));
  $$('.ftab').forEach(x => x.classList.toggle('hidden', x.dataset.ftab !== STATE.activeFTab));

  // Categorize finance records
  const pending = STATE.fins.filter(f => !isFullyPaid(f) && !isReceivable(f)).sort((a,b) => recTime(b) - recTime(a));
  const receivables = STATE.fins.filter(f => isReceivable(f)).sort((a,b) => recTime(b) - recTime(a));
  const paid = STATE.fins.filter(f => isFullyPaid(f)).sort((a,b) => (b.paidMs||recTime(b)) - (a.paidMs||recTime(a)));

  $('#ft-p').textContent = pending.length;
  $('#ft-r').textContent = receivables.length;
  $('#ft-d').textContent = paid.length;

  // pending
  if (STATE.activeFTab === 'pending') {
    const list = $('#fin-pending-list');
    if (pending.length === 0) {
      list.innerHTML = '<div class="empty"><div class="empty-em">📄</div>Хүлээгдэж буй нэхэмжлэх алга</div>';
    } else {
      list.innerHTML = pending.map(f => `
        <div class="li" data-id="${escHTML(f.id)}">
          <div class="li-stripe" style="background:var(--orange)"></div>
          <div class="li-av">📄</div>
          <div class="li-info">
            <div class="li-name">${escHTML(f.horse)} <span class="muted" style="font-weight:600">· ${escHTML(f.owner)}</span></div>
            <div class="li-sub">${f.examNum ? '<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(f.examNum)+'</span>' : ''}${escHTML(f.services||'—')}</div>
          </div>
          <div class="li-r">
            <span class="badge b-o">${fmt(f.amount)}</span>
            <div class="li-time">${escHTML(f.date)}</div>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('.li').forEach(el => el.onclick = () => {
        STATE.selectedF = String(el.dataset.id);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedF));
        renderFDetail();
      });
    }
    if (STATE.selectedF != null) STATE.selectedF = String(STATE.selectedF);
    // Only re-render detail if selected item is in this list
    if (STATE.selectedF && pending.find(p => String(p.id) === STATE.selectedF)) renderFDetail();
    else $('#fin-detail-body').innerHTML = '<div class="empty"><div class="empty-em">📄</div>Нэхэмжлэх сонгоно уу</div>';
  }

  // receivables
  if (STATE.activeFTab === 'receivable') {
    const list = $('#fin-recv-list');
    if (receivables.length === 0) {
      list.innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага алга</div>';
      $('#fin-recv-detail-body').innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага сонгоно уу</div>';
    } else {
      list.innerHTML = receivables.map(f => {
        const due = getDueAmount(f);
        return `
          <div class="li" data-id="${escHTML(f.id)}">
            <div class="li-stripe" style="background:var(--red)"></div>
            <div class="li-av" style="background:var(--red-soft);color:var(--red)">🧾</div>
            <div class="li-info">
              <div class="li-name">${escHTML(f.horse)} <span class="muted" style="font-weight:600">· ${escHTML(f.owner)}</span></div>
              <div class="li-sub">${f.examNum ? '<span class="badge b-o" style="font-size:10px;margin-right:4px">'+escHTML(f.examNum)+'</span>' : ''}Үлдэгдэл: <b style="color:var(--red)">${fmt(due)}</b> / ${fmt(f.amount)}</div>
            </div>
            <div class="li-r">
              <span class="badge b-r">${fmt(due)}</span>
              <div class="li-time">${escHTML(f.date)}</div>
            </div>
          </div>
        `;
      }).join('');
      list.querySelectorAll('.li').forEach(el => el.onclick = () => {
        STATE.selectedF = String(el.dataset.id);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', x.dataset.id === STATE.selectedF));
        renderRecvDetail();
      });
      if (STATE.selectedF && receivables.find(r => String(r.id) === STATE.selectedF)) renderRecvDetail();
      else $('#fin-recv-detail-body').innerHTML = '<div class="empty"><div class="empty-em">🧾</div>Авлага сонгоно уу</div>';
    }
  }

  // paid table
  if (STATE.activeFTab === 'paid') {
    const tb = $('#fin-paid-tb');
    if (paid.length === 0) {
      tb.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:20px;color:var(--muted)">Бүртгэл алга</td></tr>';
    } else {
      tb.innerHTML = paid.map((f,i) => `
        <tr>
          <td>${i+1}</td>
          <td>${f.examNum?'<span class="badge b-o" style="font-weight:800">'+escHTML(f.examNum)+'</span>':'—'}</td>
          <td>${escHTML(f.paidDate||f.date)}</td>
          <td>${escHTML(f.horse)}</td>
          <td>${escHTML(f.owner)}</td>
          <td class="bold">${fmt(f.amount)}</td>
          <td><span class="badge b-a">${methodIcon(f.method)} ${escHTML(f.method)}</span></td>
          <td>${f.paidMs?fmtTime(f.paidMs):'—'}</td>
          <td>
            <button class="btn btn-xs" onclick="printInvoice('${escHTML(f.id)}')">🖨</button>
            <button class="btn btn-xs" onclick="editFin('${escHTML(f.id)}')">✏️</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // summary
  if (STATE.activeFTab === 'sum') renderSummary();
}

// Үйлчилгээг тус бүрийн үнэтэй жагсаалт болгож HTML буцаана (холбоотой үзлэгээс)
function servicesPricedHTML(f) {
  const ex = STATE.exams.find(x => String(x.id) === String(f.examId));
  const svcItems = (ex && Array.isArray(ex.services)) ? ex.services : [];
  if (!svcItems.length) {
    return `<div style="background:var(--input);padding:10px;border-radius:8px;font-size:13px">${escHTML(f.services||'—')}</div>`;
  }
  const svcTotal = svcItems.reduce((a,s) => a + (parseFloat(s.price)||0), 0);
  return `
    <div style="background:var(--input);border-radius:8px;overflow:hidden">
      ${svcItems.map((s,i) => `
        <div class="row" style="justify-content:space-between;align-items:center;padding:8px 12px;font-size:13px;${i>0?'border-top:1px solid var(--border)':''}">
          <span style="font-weight:600">${escHTML(s.name||'—')}</span>
          <span style="font-weight:800;color:var(--orange-dark);white-space:nowrap">${fmt(parseFloat(s.price)||0)}</span>
        </div>
      `).join('')}
      <div class="row" style="justify-content:space-between;align-items:center;padding:8px 12px;font-size:13px;border-top:2px solid var(--border-strong);background:var(--card)">
        <span style="font-weight:800">Нийт</span>
        <span style="font-weight:900;white-space:nowrap">${fmt(svcTotal)}</span>
      </div>
    </div>`;
}

function renderRecvDetail() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.selectedF));
  if (!f) return;
  const due = getDueAmount(f);
  const paidAmt = getPaidAmount(f);
  $('#fin-recv-detail-body').innerHTML = `
    ${f.examNum ? '<div style="background:var(--orange-soft);padding:8px 12px;border-radius:8px;margin-bottom:10px;font-weight:800;color:var(--orange-dark);font-size:14px">🔢 Үзлэгийн хуудасны дугаар: ' + escHTML(f.examNum) + '</div>' : ''}
    <div class="fg r2">
      <div class="fld"><label>Адуу</label><div class="bold">${escHTML(f.horse)}</div></div>
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(f.owner)}</div></div>
      <div class="fld"><label>Утас</label><div>${escHTML(f.phone)}</div></div>
      <div class="fld"><label>Огноо</label><div>${escHTML(f.date)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Үйлчилгээ ба үнэ</label>
      ${servicesPricedHTML(f)}
    </div>
    <div class="fg r3" style="margin-top:8px">
      <div class="fld"><label>Нийт дүн</label><div style="font-size:16px;font-weight:900">${fmt(f.amount)}</div></div>
      <div class="fld"><label>Төлсөн</label><div style="font-size:16px;font-weight:900;color:var(--green)">${fmt(paidAmt)}</div></div>
      <div class="fld"><label>Үлдэгдэл</label><div style="font-size:18px;font-weight:900;color:var(--red)">${fmt(due)}</div></div>
    </div>
    ${renderPaymentsList(f)}
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button class="btn btn-g" onclick="markPaid('${escHTML(f.id)}')">💰 Төлбөр нэмэх</button>
    </div>
  `;
}

// ============================================================
// FINANCE — payments helpers
// ============================================================
// Each finance record (fin) has a `payments` array:
//   [{ amount, method, date, ms }, ...]
// `paid` is derived: total payments >= amount AND no "зээл" methods only
// `receivable` = (amount - sum(non-зээл payments)) > 0

function getPayments(f) {
  return Array.isArray(f.payments) ? f.payments : [];
}
function getPaidAmount(f) {
  // Only non-зээл payments count as actually paid
  return getPayments(f)
    .filter(p => p.method !== 'зээл')
    .reduce((a, b) => a + (parseFloat(b.amount) || 0), 0);
}
function getDueAmount(f) {
  return Math.max(0, (parseFloat(f.amount)||0) - getPaidAmount(f));
}
function isFullyPaid(f) {
  return getDueAmount(f) === 0 && getPaidAmount(f) > 0;
}
function isReceivable(f) {
  // Has some non-зээл payments OR has зээл payment, AND has remaining due
  const due = getDueAmount(f);
  const hasZeel = getPayments(f).some(p => p.method === 'зээл');
  const hasPartial = getPaidAmount(f) > 0;
  return due > 0 && (hasZeel || hasPartial);
}

function renderFDetail() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.selectedF));
  if (!f) {
    $('#fin-detail-body').innerHTML = '<div class="empty"><div class="empty-em">📄</div>Нэхэмжлэх сонгоно уу</div>';
    return;
  }
  const due = getDueAmount(f);
  const paidAmt = getPaidAmount(f);
  $('#fin-detail-body').innerHTML = `
    ${f.examNum ? '<div style="background:var(--orange-soft);padding:8px 12px;border-radius:8px;margin-bottom:10px;font-weight:800;color:var(--orange-dark);font-size:14px">🔢 Үзлэгийн хуудасны дугаар: ' + escHTML(f.examNum) + '</div>' : ''}
    <div class="fg r2">
      <div class="fld"><label>Адуу</label><div class="bold">${escHTML(f.horse)}</div></div>
      <div class="fld"><label>Эзэн</label><div class="bold">${escHTML(f.owner)}</div></div>
      <div class="fld"><label>Утас</label><div>${escHTML(f.phone)}</div></div>
      <div class="fld"><label>Эмч</label><div>${escHTML(f.docName)}</div></div>
    </div>
    <div class="fld" style="margin-top:8px"><label>Үйлчилгээ ба үнэ</label>
      ${servicesPricedHTML(f)}
    </div>
    <div class="fg r3" style="margin-top:8px">
      <div class="fld"><label>Дүн</label><div style="font-size:18px;font-weight:900">${fmt(f.amount)}</div></div>
      <div class="fld"><label>Төлсөн</label><div style="font-size:18px;font-weight:900;color:var(--green)">${fmt(paidAmt)}</div></div>
      <div class="fld"><label>Үлдэгдэл</label><div style="font-size:18px;font-weight:900;color:var(--orange-dark)">${fmt(due)}</div></div>
    </div>
    ${renderPaymentsList(f)}
    <div class="row" style="justify-content:flex-end;margin-top:14px">
      <button class="btn btn-g" onclick="markPaid('${escHTML(f.id)}')">💰 Төлбөрийн хэлбэр</button>
    </div>
  `;
}

function renderPaymentsList(f) {
  const ps = getPayments(f);
  if (ps.length === 0) return '';
  return `
    <div class="fld" style="margin-top:8px"><label>Бүртгэгдсэн төлбөр</label>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${ps.map((p,i) => `
          <div class="row" style="justify-content:space-between;background:var(--input);padding:6px 10px;border-radius:6px;font-size:12px">
            <span>${methodIcon(p.method)} ${escHTML(p.method)} <span class="muted">${escHTML(p.date||'')}</span></span>
            <span class="bold">${fmt(p.amount)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function methodIcon(m) {
  return ({
    'бэлэн':'💵','карт':'💳','QPay':'📱','дансаар':'🏦','зээл':'📝','шилжүүлэг':'🏦'
  })[m] || '💰';
}

// ============================================================
// PAYMENT MODAL — multi-method, multi-amount
// ============================================================

function markPaid(id) {
  STATE.payTarget = id;
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  // Initialize draft payments from existing
  STATE.draftPayments = getPayments(f).map(p => ({...p}));
  $('#pay-info').innerHTML = `<b>${escHTML(f.horse)}</b> · ${escHTML(f.owner)}`;
  $('#pay-amt').value = '';
  $('#pay-method').value = 'бэлэн';
  refreshPaymentModal();
  openModal('pay-modal');
}

function refreshPaymentModal() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  const total = parseFloat(f.amount) || 0;
  const paid = STATE.draftPayments
    .filter(p => p.method !== 'зээл')
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const due = Math.max(0, total - paid);
  $('#pay-total').textContent = fmt(total);
  $('#pay-paid').textContent = fmt(paid);
  $('#pay-due').textContent = fmt(due);

  const hist = $('#pay-history');
  if (STATE.draftPayments.length === 0) {
    hist.innerHTML = '<div class="muted" style="font-size:12px;padding:8px;text-align:center">Төлбөр бүртгэгдээгүй</div>';
  } else {
    hist.innerHTML = STATE.draftPayments.map((p,i) => `
      <div class="row" style="justify-content:space-between;background:var(--input);padding:8px 10px;border-radius:6px;margin-bottom:4px;font-size:12px">
        <span>${methodIcon(p.method)} ${escHTML(p.method)} <span class="muted">${escHTML(p.date||'')}</span></span>
        <span class="row" style="gap:8px">
          <span class="bold">${fmt(p.amount)}</span>
          <button class="btn btn-r btn-xs" onclick="removeDraftPayment(${i})">✕</button>
        </span>
      </div>
    `).join('');
  }
}

function setPayAmt(mode) {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  const total = parseFloat(f.amount) || 0;
  const paid = STATE.draftPayments
    .filter(p => p.method !== 'зээл')
    .reduce((a,b) => a + (parseFloat(b.amount)||0), 0);
  const due = Math.max(0, total - paid);
  if (mode === 'full') $('#pay-amt').value = due;
  else if (mode === 'half') $('#pay-amt').value = Math.round(due / 2);
}

function addPayment() {
  const amt = parseFloat($('#pay-amt').value);
  const method = $('#pay-method').value;
  if (!amt || amt <= 0) { toast('Зөв дүн оруулна уу', 'err'); return; }
  // Тухайн бичлэгийн огноог ашиглана (өнөөдрийн огноо биш)
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  const payDate = (f && f.date) ? f.date : todayStr();
  STATE.draftPayments.push({
    amount: amt,
    method: method,
    date: payDate,
    ms: nowMs()
  });
  $('#pay-amt').value = '';
  refreshPaymentModal();
}

function removeDraftPayment(i) {
  STATE.draftPayments.splice(i, 1);
  refreshPaymentModal();
}

function finalizePayment() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.payTarget));
  if (!f) return;
  // Save payments back
  f.payments = STATE.draftPayments.slice();
  // Derive paid status & method for backwards compatibility
  const paidAmt = getPaidAmount(f);
  if (isFullyPaid(f)) {
    f.paid = true;
    // Use last non-зээл method as primary
    const last = [...f.payments].reverse().find(p => p.method !== 'зээл');
    f.method = last ? last.method : (f.payments[0] && f.payments[0].method) || '';
    // Төлбөр авсан өдрийг өнөөдрийн огноо болгоно — үзлэгийн огноо биш
    // Мөнгөн урсгалын тайланд зөв тусгагдахын тулд чухал
    f.paidDate = todayStr();
    f.paidMs = nowMs();
  } else {
    f.paid = false;
    // Combined method label if partial
    if (f.payments.length === 1) f.method = f.payments[0].method;
    else if (f.payments.length > 1) f.method = 'хосолсон';
    else f.method = '';
  }
  saveAll();
  fbSaveRecord('fins', f);
  const linkedExam = STATE.exams.find(x => String(x.id) === String(f.examId));
  const examNumForLog = (linkedExam && linkedExam.examNum) || f.examNum || '';
  const paidNow = getPaidAmount(f);
  const payDetail = (isFullyPaid(f) ? 'Бүтэн төлсөн' : 'Хэсэгчлэн төлсөн') +
    ': ' + fmt(paidNow) + (f.method ? ' · ' + f.method : '');
  writeLog(isFullyPaid(f) ? 'Төлбөр авсан' : 'Хэсэгчилсэн төлбөр авсан',
    f.id, (f.horse || f.examId || ''), payDetail, examNumForLog);
  closeModal('pay-modal');
  STATE.selectedF = null;
  STATE.draftPayments = [];
  updateBadges();
  toast('💾 Хадгалагдлаа', 'ok');
  renderFinance();
}

// Legacy alias for any old caller
function confirmPay() { finalizePayment(); }

function editFin(id) {
  STATE.editTarget = id;
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  $('#ed-amt').value = f.amount;
  $('#ed-method').value = f.method;
  openModal('edit-modal');
}

function saveEditFin() {
  const f = STATE.fins.find(x => String(x.id) === String(STATE.editTarget));
  if (!f) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  const before = { ...f };
  f.amount = parseFloat($('#ed-amt').value) || 0;
  f.method = $('#ed-method').value;
  f.ms = nowMs();
  const changes = diffStr(before, f, [{k:'amount',label:'Дүн'},{k:'method',label:'Төлбөрийн хэлбэр'}]);
  saveAll();
  fbSaveRecord('fins', f);
  writeLog('Санхүү засварласан', f.id, (f.horse||f.examId||''), changes || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-modal');
  toast('💾 Хадгалагдлаа', 'ok');
  renderFinance();
  if (STATE.activePage === 'kpi') renderKPI();
}

function renderSummary() {
  const today = todayStr();
  const now = nowMs();
  const week = STATE.fins.filter(f => f.paid && (now - (f.paidMs||0)) < 7*86400000);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const month = STATE.fins.filter(f => f.paid && (f.paidMs||0) >= monthStart.getTime());
  const todayFins = STATE.fins.filter(f => f.paid && f.paidDate === today);

  $('#sm-today').textContent = fmtCompact(todayFins.reduce((a,b)=>a+b.amount,0));
  $('#sm-week').textContent = fmtCompact(week.reduce((a,b)=>a+b.amount,0));
  $('#sm-month').textContent = fmtCompact(month.reduce((a,b)=>a+b.amount,0));

  // payment method breakdown
  const methods = {'бэлэн':0,'карт':0,'QPay':0,'шилжүүлэг':0};
  month.forEach(f => { methods[f.method] = (methods[f.method]||0) + f.amount; });
  const totalM = Math.max(1, Object.values(methods).reduce((a,b)=>a+b,0));
  $('#sm-pay-bars').innerHTML = Object.entries(methods).map(([k,v]) => `
    <div style="margin-bottom:10px">
      <div class="row" style="justify-content:space-between;font-size:12px">
        <span class="bold">${escHTML(k)}</span>
        <span class="muted">${fmtCompact(v)} (${Math.round(v/totalM*100)}%)</span>
      </div>
      <div class="prog"><div class="prog-fill" style="width:${(v/totalM*100)}%"></div></div>
    </div>
  `).join('');

  $('#sm-cnt').textContent = month.length;
  $('#sm-avg').textContent = fmtCompact(month.length ? month.reduce((a,b)=>a+b.amount,0)/month.length : 0);
  const pending = STATE.fins.filter(f => !f.paid);
  $('#sm-pcnt').textContent = pending.length;
  $('#sm-pamt').textContent = fmtCompact(pending.reduce((a,b)=>a+b.amount,0));
}

function exportCSV() {
  const rows = [['#','Огноо','Адуу','Эзэн','Утас','Дүн','Хэлбэр','Статус','Үйлчилгээ']];
  STATE.fins.forEach((f,i) => {
    rows.push([i+1, f.paidDate||f.date, f.horse, f.owner, f.phone, f.amount, f.method, f.paid?'Төлсөн':'Хүлээгдэж буй', f.services]);
  });
  downloadCSV(rows, 'санхүү_' + todayStr() + '.csv');
}

function downloadCSV(rows, name) {
  const csv = rows.map(r => r.map(c => '"' + (c+'').replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  toast('⬇ Татагдлаа', 'ok');
}

function printInvoice(id) {
  const f = STATE.fins.find(x => String(x.id) === String(id));
  if (!f) return;
  const ex = STATE.exams.find(x => String(x.id) === String(f.examId));
  const services = ex && ex.services ? ex.services : [];
  const isPaid = !!f.paid;

  // Exam number (UUD) — use examNum if set, else last 7 chars of id padded
  const examNum = (f.examNum || ex && ex.examNum || '').toString().trim();
  const uudDisplay = examNum
    ? examNum.padStart(7, '0')
    : f.id.slice(-7).toUpperCase().replace(/[^0-9]/g, '0').padStart(7,'0');

  // Vitals
  const temp  = ex && ex.temp  ? ex.temp  : '...............';
  const pulse = ex && ex.pulse ? ex.pulse : '...............';
  const resp  = ex && ex.resp  ? ex.resp  : '...............';
  const wt    = ex && ex.wt    ? ex.wt    : '...............';

  // Meds string — support both {name,note} objects and plain strings
  let medsStr = '';
  if (ex && Array.isArray(ex.meds) && ex.meds.length) {
    medsStr = ex.meds.map(m => {
      if (typeof m === 'object' && m.name) return m.name + (m.note ? ' — ' + m.note : '');
      return m;
    }).join('\n');
  } else if (ex && typeof ex.meds === 'string' && ex.meds.trim()) {
    medsStr = ex.meds;
  }

  // Services as string for left panel
  const svcStr = services.map(s => s.name || '').filter(Boolean).join(', ') || '................................';

  // Үйлчилгээний жагсаалт (оношийн доор гарна) — нэр + үнэ
  const svcRowsHTML = services.length
    ? services.map(s => `<div class="uz-svc-line"><span>${escHTML(s.name||'')}</span><span class="uz-svc-price">${s.price ? fmt(s.price) : ''}</span></div>`).join('')
    : '<div class="uz-svc-line muted">................................</div>';

  // Diagnosis / note
  const diag = ex && ex.diagnosis ? ex.diagnosis : '';
  const note = ex && ex.note ? ex.note : '';

  // Payment method checkboxes
  const method = (f.method || '').toLowerCase();
  const chkPos   = method.includes('пос') || method.includes('pos')   ? '✓' : '';
  const chkDans  = method.includes('данс')                             ? '✓' : '';
  const chkBelen = method.includes('бэлэн') || method.includes('cash') ? '✓' : '';
  const chkBusad = (!chkPos && !chkDans && !chkBelen && method) ? '✓' : '';

  // Province (Аймаг) and Soum — fallback chain: exam → waiting → horse → fin
  const w = STATE.waiting.find(x => ex && String(x.id) === String(ex.waitId));
  const horse = STATE.horses.find(h => ex && (String(h.id) === String(ex.horseId) || h.name === ex.horse))
             || STATE.horses.find(h => h.name === f.horse);
  const province = (ex && ex.province) || (w && w.province) || (horse && horse.province) || (f.province) || '';
  const soum     = (ex && ex.soum)     || (w && w.soum)     || (horse && horse.soum)     || (f.soum)     || '';

  // Condition
  const cSain = '', cDund = '', cMuu = '';

  // Date display — full YYYY/MM/DD
  const dateStr = f.date || (ex && ex.date) || '';
  const dateParts = dateStr ? dateStr.split('-') : [];
  const dateFormatted = dateParts.length === 3
    ? `${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`
    : '........./......./.......'  ;

  // Анамнез — бүртгэлийн анамнезийн текст + эмчийн сонгосон шинж тэмдгүүд
  // Хуучин үзлэгт symptoms нь массив (эмчийн сонгосон), шинэ үзлэгт anamnesis нь бүртгэлийн текст
  const toArr = v => Array.isArray(v) ? v : [];
  const anamArr = [
    ...toArr(ex && ex.symptoms),
    ...toArr(ex && ex.symptoms2),
    ...toArr(w && w.symptoms)
  ].filter(Boolean);
  // давхардлыг арилгана
  const anamArrUniq = [...new Set(anamArr.map(s => String(s).trim()).filter(Boolean))];
  const anamFreeText = (ex && ex.anamnesis)
    || (ex && typeof ex.symptoms === 'string' ? ex.symptoms : '')
    || (w && typeof w.symptoms === 'string' ? w.symptoms : '')
    || '';
  const anamText = [anamFreeText, anamArrUniq.join(', ')]
    .filter(Boolean)
    .join(anamFreeText && anamArrUniq.length ? ' · ' : '');

  // Build dotted note lines for left (below-table section)
  const leftNoteLines = 4;
  const leftDots = Array(leftNoteLines).fill('<div class="uz-dotline"></div>').join('');

  // Баруун "Эмнэлэг зөвлөгөө" — эмчийн тэмдэглэл (зөвлөгөө) жагсаалтаар + эмийн жор
  // Зөвлөгөөг мөр бүрээр салгаж цэгтэй жагсаалт болгоно
  const adviceLines = (note || '')
    .split(/\r?\n/)
    .map(s => s.replace(/^[•\-\u2022\d.\)\s]+/, '').trim())
    .filter(Boolean);
  const adviceListHTML = adviceLines.length
    ? '<ul class="uz-advice-list">' + adviceLines.map(l => `<li>${escHTML(l)}</li>`).join('') + '</ul>'
    : '<div class="muted" style="font-size:8pt">&nbsp;</div>';
  // Эмийн жорыг доор тусад нь (хэрэв байвал)
  const medsAdviceHTML = medsStr
    ? `<div style="font-size:7.5pt;font-weight:700;margin-top:1.5mm">Хэрэглэх эм:</div><div style="font-size:8pt;white-space:pre-wrap">${escHTML(medsStr)}</div>`
    : '';
  const rightAdviceHTML = adviceListHTML + medsAdviceHTML;

  const printHTML = `
<div class="uz-sheet">

  <!-- ═══════════════ LEFT PANEL ═══════════════ -->
  <div class="uz-left">
    <div class="uz-title">Морьтон үндэсний адууны эмнэлэг</div>

    <!-- UUD row -->
    <div class="uz-uud-row">
      <span>Үзлэгийн хуудасны дугаар УУД:</span>
      <span class="uz-uud-num">${uudDisplay}</span>
      <span class="uz-date-row">Огноо ${dateFormatted}</span>
    </div>

    <!-- Main info grid -->
    <table class="uz-grid">
      <tr>
        <td class="lbl" style="width:22mm">Хүй-7 НАБК:</td>
        <td class="val" colspan="2">Эзний нэр: <b>${escHTML(f.owner||'')}</b></td>
        <td class="val">Утас: <b>${escHTML(f.phone||'')}</b></td>
      </tr>
      <tr>
        <td class="lbl">Дуулалдын №:</td>
        <td class="val" colspan="3">Адууны нэр: <b>${escHTML(f.horse||'')}</b></td>
      </tr>
      <tr>
        <td class="lbl">Төлөвлөгөөт үзлэг №:</td>
        <td class="val">Аймаг: <b>${escHTML(province)}</b></td>
        <td class="val" colspan="2">Сум: <b>${escHTML(soum)}</b></td>
      </tr>
      <tr>
        <td class="lbl" style="vertical-align:top;width:36mm">
          <div><b>Биеийн ерөнхий байдал:</b></div>
          <div class="uz-cond">Тохиолдол:
            <span class="uz-cb ${cSain?'checked':''}">${cSain}</span>Сайн
            <span class="uz-cb ${cDund?'checked':''}">${cDund}</span>Дунд зэрэг
            <span class="uz-cb ${cMuu?'checked':''}">${cMuu}</span>Муу
          </div>
          <div class="uz-vitals-block" style="margin-top:2mm">
            <div>Биеийн халуун: <b>${temp}</b></div>
            <div>Зүрхний цохилт: <b>${pulse}</b></div>
            <div>Амьсгалын тоо: <b>${resp}</b></div>
          </div>
        </td>
        <td class="val wide" colspan="3" style="vertical-align:top">
          <b>Анамнез:</b><br>
          <div style="margin-top:1mm;line-height:1.5;white-space:pre-wrap;font-size:8pt">${escHTML(anamText) || '&nbsp;\n&nbsp;\n&nbsp;'}</div>
        </td>
      </tr>
      <tr>
        <td colspan="4" class="lbl" style="height:12mm;vertical-align:top">
          Онош: <span style="font-weight:400;white-space:pre-wrap">${escHTML(diag||'')}</span>
        </td>
      </tr>
      <tr>
        <td colspan="4" class="lbl" style="vertical-align:top">
          Хийсэн үйлчилгээ:
          <div class="uz-svc-block">${svcRowsHTML}</div>
        </td>
      </tr>
    </table>

    <!-- Dotted note lines -->
    <div class="uz-dotlines">${leftDots}</div>

    <!-- Meds row -->
    <div class="uz-field-row">
      <span class="uz-lbl">Хэрэглэсэн эм тариа, эмчилгэ /эмийн тун/:</span>
      <span class="uz-ul">${escHTML(medsStr)}</span>
    </div>

    <!-- Payment row -->
    <div class="uz-pay-row">
      <span class="uz-lbl">Тооцооны дүн:</span>
      <span class="uz-pay-amount">${fmt(f.amount)}</span>
      <span>₮</span>
      <span class="uz-cb ${chkPos?'checked':''}">${chkPos}</span><span class="uz-lbl">Пос</span>
      <span class="uz-cb ${chkDans?'checked':''}">${chkDans}</span><span class="uz-lbl">Дансаар</span>
      <span class="uz-cb ${chkBelen?'checked':''}">${chkBelen}</span><span class="uz-lbl">Бэлэн</span>
      <span class="uz-cb ${chkBusad?'checked':''}">${chkBusad}</span><span class="uz-lbl">Бусад</span>
    </div>

    <!-- Payment note -->
    <div class="uz-field-row">
      <span class="uz-lbl">Тооцооны тайлбар:</span>
      <span class="uz-ul">${isPaid ? 'Төлсөн · ' + escHTML(f.method||'') : 'Хүлээгдэж буй'}</span>
    </div>

    <!-- Doctor rows -->
    <div class="uz-field-row">
      <span class="uz-lbl">Малын их эмчийн нэр:</span>
      <span class="uz-ul">${escHTML(f.docName||'')}</span>
      <span class="uz-lbl">Хамтран эмчийн нэр:</span>
      <span class="uz-ul">${escHTML(ex && ex.assistDocName || '')}</span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Үйлчлүүлэгчийн утас:</span>
      <span class="uz-ul">${escHTML(f.phone||'')}</span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Үйлчлүүлэгчийн нэр:</span>
      <span class="uz-ul">${escHTML(f.owner||'')}</span>
      <span class="uz-lbl">Гарын үсэг:</span>
      <span class="uz-ul"></span>
    </div>
    <div class="uz-field-row">
      <span class="uz-lbl">Хянасан менежер:</span>
      <span class="uz-ul"></span>
    </div>
    <div class="uz-decision">
      Шийдвэрлэсэн байдал:
      <span class="uz-cb"></span><span class="uz-lbl">Үзсэн</span>
      <span class="uz-cb"></span><span class="uz-lbl">Байрлуулан эмчлэх</span>
      <span class="uz-cb"></span><span class="uz-lbl">Бусад:</span>
      <span class="uz-ul" style="min-width:25mm"></span>
    </div>
  </div>

  <!-- ═══════════════ RIGHT PANEL (client copy) ═══════════════ -->
  <div class="uz-right">
    <div class="uz-title">Морьтон үндэсний адууны эмнэлэг</div>

    <!-- UUD + phone + date -->
    <div class="uz-uud-row">
      <span>УУД:</span>
      <span class="uz-uud-num">${uudDisplay}</span>
      <span>Утас: <b>77220404</b></span>
      <span class="uz-date-row">Огноо ${dateFormatted}</span>
    </div>

    <!-- Client info lines -->
    <div class="uz-field-row" style="margin-bottom:2mm">
      <span class="uz-lbl">Эзний нэр:</span>
      <span class="uz-ul"><b>${escHTML(f.owner||'')}</b></span>
    </div>
    <div class="uz-field-row" style="margin-bottom:2mm">
      <span class="uz-lbl">Адууны нэр, улс:</span>
      <span class="uz-ul"><b>${escHTML(f.horse||'')}</b></span>
    </div>

    <!-- Advice / note area -->
    <div style="font-size:8pt;font-weight:700;margin-bottom:1mm">Эмнэлэг, зөвлөгөө</div>
    <div class="uz-right-note-area">${rightAdviceHTML}</div>

    <!-- Payment summary -->
    <div class="uz-pay-row" style="margin-top:1mm">
      <span class="uz-lbl">Тооцооны дүн:</span>
      <span class="uz-pay-amount">${fmt(f.amount)}</span>
      <span>₮</span>
      <span class="uz-cb ${chkPos?'checked':''}">${chkPos}</span><span class="uz-lbl">Пос</span>
      <span class="uz-cb ${chkDans?'checked':''}">${chkDans}</span><span class="uz-lbl">Дансаар</span>
      <span class="uz-cb ${chkBelen?'checked':''}">${chkBelen}</span><span class="uz-lbl">Бэлэн</span>
      <span class="uz-cb ${chkBusad?'checked':''}">${chkBusad}</span><span class="uz-lbl">Бусад</span>
    </div>

    <!-- Doctor + signature row -->
    <div class="uz-sign-row" style="margin-top:2mm">
      <span class="uz-lbl">Малын их эмчийн нэр: <b>${escHTML(f.docName||'')}</b></span>
      <span class="uz-lbl">Гарын үсэг: <span class="uz-ul" style="min-width:22mm"></span></span>
    </div>

    <!-- Bank info only -->
    <div class="uz-stamp-row">
      <div style="flex:1">
        <div class="uz-bank-info">
          Данс: Морьтон адууны тов ХХК<br>
          Торийн банк 102030102030,<br>
          Хаан банк 5040416530
        </div>
      </div>
    </div>
  </div>

</div>`;

  $('#print-area').innerHTML = printHTML;

  // ── Build rich modal preview (unchanged from before) ──
  const isPaidBadge = isPaid
    ? `<span style="display:inline-block;background:#1f8b4d;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">✅ ТӨЛСӨН</span>`
    : `<span style="display:inline-block;background:#b8332b;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:800">⏳ ХҮЛЭЭГДЭЖ БУЙ</span>`;

  const svcRows = services.length === 0
    ? `<div style="color:var(--muted);font-size:13px;padding:10px 0">Үйлчилгээ бүртгэгдээгүй</div>`
    : services.map(s => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:var(--input);border-radius:8px;margin-bottom:6px">
        <span style="font-size:13px;font-weight:700">${escHTML(s.name||'')}</span>
        <span style="font-size:13px;font-weight:900;color:var(--orange-dark)">${fmt(parseFloat(s.price)||0)}</span>
      </div>`).join('');

  const medsDisplay = medsStr
    ? `<div style="font-size:12px;background:var(--input);padding:8px;border-radius:6px;white-space:pre-wrap">${escHTML(medsStr)}</div>`
    : `<div style="color:var(--muted);font-size:12px">Эм бүртгэгдээгүй</div>`;

  $('#receipt-body').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:2px dashed var(--border)">
      <div>
        <div style="font-size:11px;color:var(--muted);font-weight:700;letter-spacing:1px">УУД ДУГААР</div>
        <div style="font-size:22px;font-weight:900;color:var(--navy);letter-spacing:2px">${uudDisplay}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">📅 ${escHTML(f.date||'')}</div>
      </div>
      <div style="text-align:right">${isPaidBadge}
        ${f.method ? `<div style="font-size:11px;color:var(--muted);margin-top:6px">💳 ${escHTML(f.method)}</div>` : ''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
      <div style="background:var(--input);border-radius:10px;padding:12px">
        <div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">🐴 АДУУ</div>
        <div style="font-size:15px;font-weight:900">${escHTML(f.horse||'')}</div>
      </div>
      <div style="background:var(--input);border-radius:10px;padding:12px">
        <div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">👤 ЭЗЭН</div>
        <div style="font-size:15px;font-weight:900">${escHTML(f.owner||'')}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:3px">📞 ${escHTML(f.phone||'—')}</div>
      </div>
    </div>
    <div style="background:var(--input);border-radius:10px;padding:10px 14px;margin-bottom:16px;display:flex;gap:20px;flex-wrap:wrap">
      <div><span style="color:var(--muted);font-size:12px">👨‍⚕️ Эмч: </span><span style="font-weight:800;font-size:13px">${escHTML(f.docName||'—')}</span></div>
      ${examNum ? `<div><span style="color:var(--muted);font-size:12px">🔖 УУД: </span><span class="badge b-o" style="font-weight:800">${uudDisplay}</span></div>` : ''}
    </div>
    ${diag ? `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">🩺 ОНОШ</div><div style="background:var(--input);border-radius:8px;padding:10px 14px;font-size:13px;font-weight:600">${escHTML(diag)}</div></div>` : ''}
    ${note ? `<div style="margin-bottom:14px"><div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:6px">📝 ТЭМДЭГЛЭЛ</div><div style="background:var(--input);border-radius:8px;padding:10px 14px;font-size:13px;white-space:pre-wrap">${escHTML(note)}</div></div>` : ''}
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:8px">🩻 ҮЙЛЧИЛГЭЭ</div>${svcRows}
    </div>
    <div style="margin-bottom:18px">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.8px;margin-bottom:4px">💊 ЭМИЙН ЖОР</div>${medsDisplay}
    </div>
    <div style="background:linear-gradient(135deg,var(--navy),var(--navy2));color:#fff;border-radius:14px;padding:18px 20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;opacity:0.7;letter-spacing:1px">НИЙТ ДҮНГИЙН ТӨЛБӨР</div>
        <div style="font-size:28px;font-weight:900;color:var(--orange2);margin-top:4px">${fmt(f.amount)}</div>
      </div>
      <div style="text-align:right;font-size:12px;opacity:0.75"><div>Морьтон Адууны Төв</div><div>📞 77220404</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:20px;padding-top:16px;border-top:1px dashed var(--border);font-size:12px;color:var(--muted)">
      <div>Эмч: <span style="display:inline-block;width:120px;border-bottom:1px solid var(--border-strong)">&nbsp;</span></div>
      <div>Үйлчлүүлэгч: <span style="display:inline-block;width:100px;border-bottom:1px solid var(--border-strong)">&nbsp;</span></div>
    </div>
  `;
  openModal('receipt-modal');
}

function printReceiptNow() {
  window.print();
}

function printInpatientCard() {
  const i = STATE.inps.find(x => String(x.id) === String(STATE.selectedI));
  if (!i) return;

  const logs = Array.isArray(i.log) ? [...i.log].sort((a,b) => (a.date||'') > (b.date||'') ? 1 : -1) : [];
  const fee  = getDailyFee(i);
  const days = inpatientDays(i.admittedMs);
  const admDate   = i.admittedDate  || (i.admittedMs   ? localDateStr(new Date(i.admittedMs))  : '—');
  const disDate   = i.dischargedDate|| (i.discharged    ? '—' : 'Хэвтэж байна');
  const treatTotal = logs.reduce((a,l) => a + (parseFloat(l.amount)||0), 0);
  const accomTotal = fee * days;
  const prepaid    = Array.isArray(i.prepayments) ? i.prepayments.reduce((a,p) => a + (parseFloat(p.amount)||0), 0) : 0;
  const grandTotal = treatTotal + accomTotal;

  const rows = logs.map((l, idx) => {
    const svcs = Array.isArray(l.services) ? l.services.map(s => escHTML(s.name||'') + (s.price ? ` (${fmt(s.price)})` : '')).join(', ') : '';
    const meds = Array.isArray(l.meds)     ? l.meds.map(m => escHTML((m.name||m) + (m.note ? ' — '+m.note : ''))).join(', ') : '';
    const vitals = [l.temp?'T:'+l.temp:'', l.pulse?'P:'+l.pulse:'', l.wt?'W:'+l.wt+'кг':''].filter(Boolean).join(' · ');
    return `<tr>
      <td style="text-align:center">${idx+1}</td>
      <td style="text-align:center;white-space:nowrap">${escHTML(l.date||'—')}</td>
      <td style="text-align:center;font-size:8pt">${escHTML(l.docName||'—')}</td>
      <td>${l.diagnosis?`<div><b>Биеийн байдал:</b> ${escHTML(l.diagnosis)}</div>`:''}${l.note?`<div><b>Эмчилгээ:</b> ${escHTML(l.note)}</div>`:''}${vitals?`<div style="font-size:7.5pt;color:#555">${escHTML(vitals)}</div>`:''}</td>
      <td>${svcs?`<div>${svcs}</div>`:''}${meds?`<div style="font-size:7.5pt"><i>Эм:</i> ${meds}</div>`:''}</td>
      <td style="text-align:right;font-weight:700">${fmt(l.amount||0)}</td>
    </tr>`;
  }).join('');

  const accomRow = fee > 0 ? `<tr style="background:#f0f0f0"><td colspan="3" style="text-align:right;font-weight:700">Хоногийн хөлс (${days}×${fmt(fee)})</td><td colspan="2"></td><td style="text-align:right;font-weight:700">${fmt(accomTotal)}</td></tr>` : '';

  $('#print-area').innerHTML = `
<div style="width:210mm;min-height:297mm;font-family:'Times New Roman',serif;font-size:9.5pt;color:#000;padding:8mm 10mm;box-sizing:border-box">
  <div style="text-align:center;border-bottom:2pt solid #000;padding-bottom:4mm;margin-bottom:5mm">
    <div style="font-size:13pt;font-weight:900;text-transform:uppercase;letter-spacing:1px">Морьтон үндэсний адууны эмнэлэг</div>
    <div style="font-size:9pt;margin-top:2mm">Хэвтэн эмчлэх тасгийн эмчилгээний дэвтэр</div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:4mm;margin-bottom:5mm;font-size:8.5pt">
    <div style="flex:1;min-width:40mm"><b>Адуу:</b> ${escHTML(i.horse||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Эзэн:</b> ${escHTML(i.owner||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Утас:</b> ${escHTML(i.phone||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Эмч:</b> ${escHTML(i.docName||'—')}</div>
    <div style="flex:1;min-width:40mm"><b>Хэвтсэн:</b> ${escHTML(admDate)}</div>
    <div style="flex:1;min-width:40mm"><b>Гарсан:</b> ${escHTML(disDate)}</div>
    <div style="flex:1;min-width:40mm"><b>Нийт хоног:</b> ${days}</div>
    <div style="flex:1;min-width:40mm"><b>УУД:</b> ${escHTML(i.examNum||'—')}</div>
  </div>
  ${(i.diagnosis||i.note)?`<div style="margin-bottom:4mm;font-size:8.5pt;border:0.5pt solid #ccc;padding:2mm 3mm">${i.diagnosis?`<b>Оруулах онош:</b> ${escHTML(i.diagnosis)}<br>`:''}${i.note?`<b>Анхны тэмдэглэл:</b> ${escHTML(i.note)}`:''}</div>`:''}
  <table style="width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:6mm">
    <thead><tr>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:6mm">№</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:18mm">Огноо</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:22mm">Эмч</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000">Биеийн байдал / Эмчилгээ</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:42mm">Үйлчилгээ / Эм</th>
      <th style="background:#022438;color:#fff;padding:2mm;border:0.5pt solid #000;width:18mm">Дүн ₮</th>
    </tr></thead>
    <tbody>
      ${rows||'<tr><td colspan="6" style="text-align:center;color:#888;padding:4mm">Бүртгэл алга</td></tr>'}
      ${accomRow}
      <tr style="border-top:1.5pt solid #000">
        <td colspan="3" style="text-align:right;font-weight:900;font-size:10pt;padding:2mm;border:0.5pt solid #000">НИЙТ ДҮН</td>
        <td colspan="2" style="text-align:right;font-size:8pt;color:#555;padding:2mm;border:0.5pt solid #000">${prepaid>0?`Урьдчилгаа: ${fmt(prepaid)}`:''}</td>
        <td style="text-align:right;font-weight:900;font-size:11pt;padding:2mm;border:0.5pt solid #000">${fmt(grandTotal)}</td>
      </tr>
    </tbody>
  </table>
  <div style="display:flex;justify-content:space-between;margin-top:10mm;font-size:8.5pt">
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Эмч: ${escHTML(i.docName||'')}</div>
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Үйлчлүүлэгч</div>
    <div style="border-top:0.5pt solid #000;padding-top:2mm;min-width:50mm;text-align:center">Хянасан менежер</div>
  </div>
  <div style="margin-top:6mm;font-size:7.5pt;color:#666;text-align:center">Морьтон адууны тов ХХК · Торийн банк 102030102030 · Хаан банк 5040416530</div>
</div>`;
  setTimeout(() => window.print(), 150);
}

// ============================================================
// KPI
// ============================================================
function renderKPI() {
  // tabs (period only)
  $$('.tab[data-kper]').forEach(t => t.onclick = () => {
    STATE.activeKPer = t.dataset.kper;
    $$('.tab[data-kper]').forEach(x => x.classList.toggle('active', x.dataset.kper === STATE.activeKPer));
    // Show/hide custom inputs
    if (STATE.activeKPer === 'c') {
      $('#k-custom-row').classList.remove('hidden');
      // Default: this month if not set
      if (!$('#k-from').value) {
        const d = new Date(); d.setDate(1);
        $('#k-from').value = localDateStr(d);
      }
      if (!$('#k-to').value) $('#k-to').value = todayStr();
    } else {
      $('#k-custom-row').classList.add('hidden');
    }
    renderKPI();
  });
  $$('.tab[data-kper]').forEach(x => x.classList.toggle('active', x.dataset.kper === STATE.activeKPer));
  // Hide custom row if not in custom mode
  if (STATE.activeKPer !== 'c') $('#k-custom-row').classList.add('hidden');
  else $('#k-custom-row').classList.remove('hidden');

  // Compute period start/end based on calendar boundaries
  const period = STATE.activeKPer;
  const now = new Date();
  let from, to;

  if (period === 'd') {
    // Today: 00:00 → 23:59:59
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'w') {
    // This week: Monday 00:00 → today 23:59
    const day = now.getDay() || 7; // Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    monday.setHours(0,0,0,0);
    from = monday.getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'm') {
    // This month: day 1 00:00 → today 23:59
    from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'y') {
    // This year: Jan 1 → today
    from = new Date(now.getFullYear(), 0, 1, 0, 0, 0).getTime();
    to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
  } else if (period === 'c') {
    // Custom range
    const fStr = $('#k-from').value;
    const tStr = $('#k-to').value;
    if (!fStr || !tStr) {
      // Fall back to this month
      from = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      to   = now.getTime();
    } else {
      from = new Date(fStr + 'T00:00:00').getTime();
      to   = new Date(tStr + 'T23:59:59').getTime();
    }
  }

  // Show period summary
  const fmtD = (ts) => {
    const d = new Date(ts);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  };
  $('#k-period-info').textContent = '📅 ' + fmtD(from) + ' → ' + fmtD(to);

  // Normalize exam date for comparison
  // АНХААРАЛ: импортын өгөгдөлд ms нь буруу байж болно → date-г эхлэн харна
  const examTime = (e) => {
    if (e.date) {
      try {
        const t = new Date(e.date + (e.time ? 'T' + e.time : 'T12:00')).getTime();
        if (t > 0) return t;
      } catch(_) {}
    }
    if (e.ms) return parseFloat(e.ms);
    return 0;
  };

  // Collect all exams in period
  const periodExams = STATE.exams.filter(e => {
    const t = examTime(e);
    return t >= from && t <= to;
  });

  // docId хоосон үед docName-аас synthetic ID үүсгэнэ
  const docIdOf = (e, field) => {
    const id = field === 'main' ? e.docId : e.assistDocId;
    const nm = field === 'main' ? e.docName : e.assistDocName;
    if (id) return String(id);
    if (nm && nm.trim()) return 'name_' + nm.trim();
    return null;
  };

  // STATE.doctors дотор docName-тай тохирох doctor олно, байхгүй бол synthetic нэмнэ
  const ensureDocByName = (name) => {
    if (!name || !name.trim()) return null;
    const existing = STATE.doctors.find(d => d.name === name.trim());
    if (existing) return String(existing.id);
    return 'name_' + name.trim();
  };

  // Build doctor stats
  const docMap = {};
  const syntheticDocs = {};
  periodExams.forEach(e => {
    const mainId  = e.docId  ? String(e.docId)  : ensureDocByName(e.docName);
    const assistId = e.assistDocId ? String(e.assistDocId) : ensureDocByName(e.assistDocName);
    const ids = [mainId, assistId].filter(Boolean);
    ids.forEach(id => {
      if (!docMap[id]) {
        docMap[id] = { count: 0, mainCount: 0, assistCount: 0, rev: 0, services: 0, exams: [] };
        // synthetic doc нэр хадгал
        if (id.startsWith('name_')) {
          const nm = id.slice(5);
          syntheticDocs[id] = { id, name: nm, role: 'Малын их эмч' };
        }
      }
      docMap[id].count++;
      if (id === mainId) {
        docMap[id].mainCount++;
        docMap[id].rev += parseFloat(e.amount) || 0;
        docMap[id].services += Array.isArray(e.services) ? e.services.length : 0;
      }
      if (id === assistId) docMap[id].assistCount++;
      docMap[id].exams.push(e);
    });
  });

  // Rank by revenue — STATE.doctors + synthetic
  const allDocs = [
    ...STATE.doctors,
    ...Object.values(syntheticDocs).filter(s => !STATE.doctors.find(d => d.name === s.name))
  ];
  const ranked = allDocs.map(d => {
    const key = docMap[String(d.id)] ? String(d.id) : ('name_' + d.name);
    return {
      ...d,
      count:    (docMap[key]||{}).count    || 0,
      mainCount:   (docMap[key]||{}).mainCount   || 0,
      assistCount: (docMap[key]||{}).assistCount || 0,
      rev:      (docMap[key]||{}).rev      || 0,
      services: (docMap[key]||{}).services || 0,
      exams:    (docMap[key]||{}).exams    || []
    };
  }).sort((a,b) => (b.rev||0) - (a.rev||0));

  // Persistent selection
  if (!STATE.selectedKDoc || !ranked.find(d => String(d.id) === String(STATE.selectedKDoc))) {
    STATE.selectedKDoc = ranked.length > 0 ? String(ranked[0].id) : null;
  }

  const list = $('#k-rank-list');
  if (ranked.length === 0) {
    list.innerHTML = '<div class="empty">Өгөгдөл алга</div>';
  } else {
    list.innerHTML = ranked.map((d, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i+1);
      const bg = i === 0 ? '#ffd70033' : i === 1 ? '#c0c0c033' : i === 2 ? '#cd7f3233' : 'var(--input)';
      const assistTxt = d.assistCount > 0 ? ' · ' + d.assistCount + ' хамтран үзлэг' : '';
      return `
        <div class="li" data-did="${escHTML(d.id)}" style="cursor:pointer">
          <div class="li-av" style="background:${bg};font-size:16px;font-weight:900">${medal}</div>
          <div class="li-info">
            <div class="li-name">${escHTML(d.name)}</div>
            <div class="li-sub">${escHTML(d.role)} · ${d.mainCount} үзлэг · ${d.services} үйлчилгээ${assistTxt}</div>
          </div>
          <div class="li-r" style="display:none">
            <span class="badge b-g">${fmtCompact(d.rev||0)}</span>
          </div>
        </div>
      `;
    }).join('');
    list.querySelectorAll('.li').forEach(el => {
      if (String(el.dataset.did) === String(STATE.selectedKDoc)) el.classList.add('sel');
      el.addEventListener('click', () => {
        STATE.selectedKDoc = String(el.dataset.did);
        list.querySelectorAll('.li').forEach(x => x.classList.toggle('sel', String(x.dataset.did) === STATE.selectedKDoc));
        renderKPIDocDetail(ranked);
      });
    });
  }

  renderKPIDocDetail(ranked);
}

function renderKPIDocDetail(ranked) {
  const d = ranked.find(x => String(x.id) === String(STATE.selectedKDoc));
  const body = $('#k-doc-detail-body');
  const title = $('#k-doc-detail-title');
  if (!d) {
    if (title) title.textContent = '📊 Дэлгэрэнгүй';
    body.innerHTML = '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч сонгоно уу</div>';
    return;
  }
  if (title) title.innerHTML = '📊 ' + escHTML(d.name) + ' <span class="muted" style="font-size:11px;font-weight:600">· ' + escHTML(d.role) + '</span>';

  // Aggregate services this doctor performed
  const svcMap = {};
  let svcTotalRev = 0;
  d.exams.forEach(e => {
    const svcs = Array.isArray(e.services) ? e.services : [];
    svcs.forEach(s => {
      const name = (s.name || '—').toString().trim();
      if (!name) return;
      if (!svcMap[name]) svcMap[name] = { count: 0, rev: 0 };
      svcMap[name].count++;
      svcMap[name].rev += parseFloat(s.price) || 0;
      svcTotalRev += parseFloat(s.price) || 0;
    });
  });
  const svcEntries = Object.entries(svcMap)
    .map(([name, v]) => ({ name, count: v.count, rev: v.rev }))
    .sort((a,b) => b.rev - a.rev);

  // Color palette
  const palette = ['#C9A75A', '#27ae60', '#2980b9', '#8e44ad', '#E8752A', '#16a085', '#e67e22', '#c0392b', '#7f8c8d', '#d35400', '#1abc9c', '#9b59b6'];

  // Donut chart
  let chartHTML = '';
  if (svcEntries.length > 0 && svcTotalRev > 0) {
    let cumulative = 0;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const TOP = 8;
    let display = svcEntries.slice();
    if (svcEntries.length > TOP) {
      const top = svcEntries.slice(0, TOP);
      const restRev = svcEntries.slice(TOP).reduce((a,b) => a + b.rev, 0);
      const restCount = svcEntries.slice(TOP).reduce((a,b) => a + b.count, 0);
      display = [...top, { name: 'Бусад (' + (svcEntries.length - TOP) + ')', count: restCount, rev: restRev }];
    }
    const segments = display.map((s, i) => {
      const pct = s.rev / svcTotalRev;
      const dash = pct * circumference;
      const offset = -cumulative * circumference;
      cumulative += pct;
      const color = palette[i % palette.length];
      return `<circle cx="90" cy="90" r="${radius}" fill="none" stroke="${color}" stroke-width="28"
                 stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${offset}"
                 transform="rotate(-90 90 90)"/>`;
    }).join('');
    chartHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-top:6px">
        <svg width="180" height="180" viewBox="0 0 180 180" style="flex-shrink:0">
          ${segments}
          <text x="90" y="84" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="700">ҮЙЛЧИЛГЭЭ</text>
          <text x="90" y="100" text-anchor="middle" font-size="18" fill="var(--text)" font-weight="900">${svcEntries.reduce((a,b)=>a+b.count,0)}</text>
          <text x="90" y="115" text-anchor="middle" font-size="10" fill="var(--muted)" font-weight="700" style="display:none">${fmtCompact(svcTotalRev)}</text>
        </svg>
        <div style="flex:1;min-width:200px">
          ${display.map((s, i) => {
            const color = palette[i % palette.length];
            return `
              <div style="margin-bottom:8px">
                <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:3px;gap:8px">
                  <span class="bold" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">
                    <span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;margin-right:6px;vertical-align:middle"></span>${escHTML(s.name)}
                  </span>
                  <span class="bold" style="flex-shrink:0">${s.count}×<span style="display:none"> · ${fmt(s.rev)}</span></span>
                </div>
                <div class="prog"><div class="prog-fill" style="background:${color};width:${(s.rev/svcTotalRev*100).toFixed(1)}%"></div></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    chartHTML = '<div class="empty"><div class="empty-em">📋</div>Тухайн хугацаанд үйлчилгээ үзүүлээгүй</div>';
  }

  // Quick stats for the selected doctor
  const avgPerExam = d.count ? Math.round(d.rev / d.count) : 0;
  const uniqHorses = new Set(d.exams.map(e => e.horseId)).size;
  const examLabel = d.assistCount > 0
    ? `${d.mainCount} <span class="muted" style="font-size:11px;font-weight:700">+${d.assistCount} хамтран</span>`
    : `${d.mainCount}`;

  body.innerHTML = `
    <div class="fg r3" style="margin-bottom:10px">
      <div class="fld"><label>📋 Үзлэг</label><div style="font-size:18px;font-weight:900">${examLabel}</div></div>
      <div class="fld" style="display:none"><label>💰 Орлого</label><div style="font-size:18px;font-weight:900;color:var(--green)">${fmtCompact(d.rev)}</div></div>
      <div class="fld"><label>🐴 Адуу</label><div style="font-size:18px;font-weight:900">${uniqHorses}</div></div>
    </div>
    <div class="ch">📊 Үзүүлсэн үйлчилгээний бүтэц</div>
    ${chartHTML}
  `;
}

// ============================================================
// REPORT
// ============================================================
function initReport() {
  // Wire up tab switcher
  $$('.tab[data-rper]').forEach(t => {
    t.onclick = () => {
      STATE.activeRPer = t.dataset.rper;
      $$('.tab[data-rper]').forEach(x => x.classList.toggle('active', x.dataset.rper === STATE.activeRPer));
      updateReportPickers();
    };
  });
  $$('.tab[data-rper]').forEach(x => x.classList.toggle('active', x.dataset.rper === STATE.activeRPer));
  // Default values
  if (!$('#rp-date').value) $('#rp-date').value = todayStr();
  if (!$('#rp-week').value) {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    $('#rp-week').value = localDateStr(monday);
  }
  if (!$('#rp-month').value) {
    const now = new Date();
    $('#rp-month').value = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  }
  if (!$('#rp-year').value) $('#rp-year').value = new Date().getFullYear();
  if (!$('#rp-from').value) {
    const d = new Date(); d.setDate(1);
    $('#rp-from').value = localDateStr(d);
  }
  if (!$('#rp-to').value) $('#rp-to').value = todayStr();
  updateReportPickers();
}

function updateReportPickers() {
  const map = { d:'rp-day-row', w:'rp-week-row', m:'rp-month-row', y:'rp-year-row', c:'rp-custom-row' };
  Object.entries(map).forEach(([per, id]) => {
    const el = $('#' + id);
    if (el) el.classList.toggle('hidden', per !== STATE.activeRPer);
  });
}

// Compute period start/end based on selected tab
function getReportPeriod() {
  const per = STATE.activeRPer;
  if (per === 'd') {
    const d = $('#rp-date').value || todayStr();
    return { from: d, to: d, label: '📅 ' + d, kind: 'd' };
  }
  if (per === 'w') {
    const monStr = $('#rp-week').value;
    if (!monStr) return null;
    const mon = new Date(monStr + 'T00:00:00');
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const f = monStr;
    const t = sun.getFullYear() + '-' + String(sun.getMonth()+1).padStart(2,'0') + '-' + String(sun.getDate()).padStart(2,'0');
    return { from: f, to: t, label: '📅 ' + f + ' → ' + t + ' (7 хоног)', kind: 'w' };
  }
  if (per === 'm') {
    const mStr = $('#rp-month').value;
    if (!mStr) return null;
    const [y, m] = mStr.split('-').map(Number);
    const last = new Date(y, m, 0).getDate();
    const f = mStr + '-01';
    const t = mStr + '-' + String(last).padStart(2,'0');
    return { from: f, to: t, label: '📅 ' + mStr + ' (Сар)', kind: 'm' };
  }
  if (per === 'y') {
    const y = $('#rp-year').value;
    if (!y) return null;
    return { from: y + '-01-01', to: y + '-12-31', label: '📅 ' + y + ' (Жил)', kind: 'y' };
  }
  // custom
  const f = $('#rp-from').value;
  const t = $('#rp-to').value;
  if (!f || !t) return null;
  return { from: f, to: t, label: '📅 ' + f + ' → ' + t, kind: 'c' };
}

function genReport() {
  const period = getReportPeriod();
  if (!period) { toast('Хугацаа сонгоно уу', 'err'); return; }
  $('#rp-period-info').textContent = period.label;
  // Normalize an item's date to "YYYY-MM-DD" string for comparison
  const norm = (v) => {
    if (!v) return '';
    if (typeof v === 'string') return v.slice(0, 10);
    if (v instanceof Date) return localDateStr(v);
    try { return localDateStr(new Date(v)); } catch(e) { return ''; }
  };
  const inRange = (v) => {
    const n = norm(v);
    if (!n) return false;
    return n >= period.from && n <= period.to;
  };
  const exams = STATE.exams.filter(e => inRange(e.date));
  const fins = STATE.fins.filter(f => inRange(f.paidDate) || inRange(f.date));
  // Daily revenue = sum of payments made in range
  let totalRev = 0;
  const methodTotals = { 'бэлэн':0, 'карт':0, 'QPay':0, 'дансаар':0, 'зээл':0, 'шилжүүлэг':0 };
  STATE.fins.forEach(f => {
    const ps = Array.isArray(f.payments) ? f.payments : [];
    if (ps.length > 0) {
      ps.forEach(p => {
        if (inRange(p.date)) {
          const amt = parseFloat(p.amount) || 0;
          totalRev += amt;
          if (methodTotals[p.method] !== undefined) methodTotals[p.method] += amt;
          else methodTotals[p.method] = amt;
        }
      });
    } else if (f.paid && inRange(f.paidDate)) {
      // Backward compat: old records without payments[] but marked paid
      const amt = parseFloat(f.amount) || 0;
      totalRev += amt;
      const m = f.method || 'бэлэн';
      if (methodTotals[m] !== undefined) methodTotals[m] += amt;
      else methodTotals[m] = amt;
    }
  });

  // Active inpatients (currently being treated)
  const activeInps = STATE.inps.filter(x => !x.discharged).length;

  // Aggregate services from today's exams (count + revenue + duration)
  const svcMap = {};  // { serviceName: { count, rev, durSum, durN } }
  exams.forEach(e => {
    const svcs = Array.isArray(e.services) ? e.services : [];
    if (!svcs.length) return;
    // Үзлэгийн нийт хугацааг үйлчилгээнүүдэд тэнцүү хуваарилна (ойролцоо тооцоо)
    const perSvcDur = (e.durationMin !== null && e.durationMin !== undefined && !isNaN(e.durationMin))
      ? (e.durationMin / svcs.length) : null;
    svcs.forEach(s => {
      const name = (s.name || '—').toString().trim();
      if (!name) return;
      if (!svcMap[name]) svcMap[name] = { count: 0, rev: 0, durSum: 0, durN: 0 };
      svcMap[name].count++;
      svcMap[name].rev += parseFloat(s.price) || 0;
      if (perSvcDur !== null) { svcMap[name].durSum += perSvcDur; svcMap[name].durN++; }
    });
  });
  const svcEntries = Object.entries(svcMap)
    .map(([name, v]) => ({ name, count: v.count, rev: v.rev, avgDur: v.durN ? (v.durSum / v.durN) : null }))
    .sort((a,b) => b.rev - a.rev);
  const svcTotalRev = svcEntries.reduce((a,b) => a + b.rev, 0);

  // Doctor performance for the day
  const docMap = {};
  exams.forEach(e => {
    const id = e.docId || 'unknown';
    if (!docMap[id]) docMap[id] = { name: e.docName||'—', exams: 0, services: 0, rev: 0 };
    docMap[id].exams++;
    docMap[id].services += Array.isArray(e.services) ? e.services.length : 0;
    docMap[id].rev += parseFloat(e.amount) || 0;
    // Count assistant doctors too
    if (e.assistDocId) {
      const aid = e.assistDocId;
      if (!docMap[aid]) docMap[aid] = { name: e.assistDocName||'—', exams: 0, services: 0, rev: 0, assist: true };
      // Only count assist participation, not duplicate revenue
      if (!docMap[aid].assistOnly) docMap[aid].assistOnly = true;
    }
  });
  const docList = Object.values(docMap).sort((a,b) => (b.rev||0) - (a.rev||0));

  // Color palette for services (cycle through these)
  const palette = [
    '#C9A75A', '#27ae60', '#2980b9', '#8e44ad', '#E8752A',
    '#16a085', '#e67e22', '#c0392b', '#7f8c8d', '#d35400',
    '#1abc9c', '#9b59b6'
  ];

  // Build SVG donut chart for services
  let chartHTML = '';
  if (svcEntries.length > 0 && svcTotalRev > 0) {
    let cumulative = 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    // Show top 8 services individually, rest grouped as "Бусад"
    const TOP = 8;
    let display = svcEntries.slice();
    if (svcEntries.length > TOP) {
      const top = svcEntries.slice(0, TOP);
      const restRev = svcEntries.slice(TOP).reduce((a,b) => a + b.rev, 0);
      const restCount = svcEntries.slice(TOP).reduce((a,b) => a + b.count, 0);
      display = [...top, { name: 'Бусад (' + (svcEntries.length - TOP) + ')', count: restCount, rev: restRev }];
    }
    const segments = display.map((s, i) => {
      const pct = s.rev / svcTotalRev;
      const dash = pct * circumference;
      const offset = -cumulative * circumference;
      cumulative += pct;
      const color = palette[i % palette.length];
      return `<circle cx="100" cy="100" r="${radius}" fill="none"
                 stroke="${color}" stroke-width="32"
                 stroke-dasharray="${dash} ${circumference}"
                 stroke-dashoffset="${offset}"
                 transform="rotate(-90 100 100)"/>`;
    }).join('');

    chartHTML = `
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <svg width="200" height="200" viewBox="0 0 200 200" style="flex-shrink:0">
          ${segments}
          <text x="100" y="92" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="700">ҮЙЛЧИЛГЭЭ</text>
          <text x="100" y="108" text-anchor="middle" font-size="20" fill="var(--text)" font-weight="900">${svcEntries.reduce((a,b)=>a+b.count,0)}</text>
          <text x="100" y="125" text-anchor="middle" font-size="11" fill="var(--muted)" font-weight="700">${fmtCompact(svcTotalRev)}</text>
        </svg>
        <div style="flex:1;min-width:240px">
          ${display.map((s, i) => {
            const color = palette[i % palette.length];
            const durTxt = (s.avgDur !== null && s.avgDur !== undefined) ? ' · ⏱️' + fmtDuration(s.avgDur) : '';
            return `
              <div style="margin-bottom:8px">
                <div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:3px;gap:8px">
                  <span class="bold" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">
                    <span style="display:inline-block;width:10px;height:10px;background:${color};border-radius:2px;margin-right:6px;vertical-align:middle"></span>${escHTML(s.name)}
                  </span>
                  <span class="bold" style="flex-shrink:0">${s.count}× · ${fmt(s.rev)}${durTxt}</span>
                </div>
                <div class="prog"><div class="prog-fill" style="background:${color};width:${(s.rev/svcTotalRev*100).toFixed(1)}%"></div></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    chartHTML = '<div class="empty"><div class="empty-em">📋</div>Тухайн өдөр үйлчилгээ үзүүлээгүй</div>';
  }

  const html = `
    <div class="pr-h1" style="font-size:18px;font-weight:900;text-align:center">📄 Тайлан — ${escHTML(period.label.replace(/^📅 /,''))}</div>
    <div class="muted" style="text-align:center;font-size:12px;margin-bottom:14px">Морьтон Адууны Төв</div>

    <div class="stats">
      <div class="stat"><div class="stat-l">📋 Үзлэг</div><div class="snum">${exams.length}</div></div>
      <div class="stat green"><div class="stat-l">💰 Орлого</div><div class="snum">${fmtCompact(totalRev)}</div></div>
      <div class="stat purple"><div class="stat-l">🏥 Байрлан эмчлүүлж байгаа</div><div class="snum">${activeInps}</div></div>
    </div>

    <div class="ch" style="margin-top:14px">📊 Үйлчилгээний бүтэц</div>
    ${chartHTML}

    <div class="ch" style="margin-top:14px">👨‍⚕️ Тухайн өдрийн ажилласан эмч нар</div>
    ${docList.length === 0 ? '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч ажиллаагүй</div>' : `
      <div class="tbl-wrap">
        <table>
          <thead><tr><th>Эмч</th><th>Үзлэг</th><th>Үйлчилгээ</th><th>Орлого</th></tr></thead>
          <tbody>
            ${docList.map(d => `
              <tr>
                <td class="bold">${escHTML(d.name)}${d.assistOnly && !d.exams ? ' <span class="badge">хамт</span>' : ''}</td>
                <td>${d.exams || 0}</td>
                <td>${d.services || 0}</td>
                <td class="bold">${fmt(d.rev || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}

    <div style="margin-top:24px;display:flex;justify-content:space-between;font-size:12px">
      <div>Эмч: ____________________</div>
      <div>Удирдах эмч: ____________________</div>
    </div>
  `;
  $('#rp-preview').innerHTML = html;

  // build print area
  $('#print-area').innerHTML = `
    <div class="pr-h1">📄 Тайлан — ${escHTML(period.label.replace(/^📅 /,''))}</div>
    <div style="text-align:center;margin-bottom:10px">Морьтон Адууны Төв</div>
    <div class="pr-h2">📊 Тойм</div>
    <table class="pr-tbl">
      <tr><th>Үзлэг</th><th>Орлого</th><th>Байрлан эмчлүүлж байгаа</th></tr>
      <tr><td>${exams.length}</td><td>${fmt(totalRev)}</td><td>${activeInps}</td></tr>
    </table>
    <div class="pr-h2">📋 Үйлчилгээний бүтэц</div>
    <table class="pr-tbl">
      <tr><th>Үйлчилгээ</th><th>Тоо</th><th>Дүн</th><th>Дундаж хугацаа</th><th>Хувь</th></tr>
      ${svcEntries.length === 0 ? '<tr><td colspan="5" style="text-align:center">Бичлэг алга</td></tr>' :
        svcEntries.map(s => `<tr><td>${escHTML(s.name)}</td><td>${s.count}</td><td>${fmt(s.rev)}</td><td>${s.avgDur!==null?fmtDuration(s.avgDur):'—'}</td><td>${svcTotalRev>0?(s.rev/svcTotalRev*100).toFixed(1)+'%':'—'}</td></tr>`).join('')
      }
    </table>
    <div class="pr-h2">👨‍⚕️ Ажилласан эмч нар</div>
    <table class="pr-tbl">
      <tr><th>Эмч</th><th>Үзлэг</th><th>Үйлчилгээ</th><th>Орлого</th></tr>
      ${docList.length === 0 ? '<tr><td colspan="4" style="text-align:center">Бүртгэл алга</td></tr>' :
        docList.map(d => `<tr><td>${escHTML(d.name)}</td><td>${d.exams||0}</td><td>${d.services||0}</td><td>${fmt(d.rev||0)}</td></tr>`).join('')
      }
    </table>
    <div style="margin-top:30px;display:flex;justify-content:space-between;font-size:11px">
      <div>Эмч: ____________________</div>
      <div>Удирдах эмч: ____________________</div>
    </div>
  `;
  toast('✅ Тайлан үүсгэгдлээ', 'ok');
}

// ============================================================
// HISTORY
// ============================================================
// Pagination — нэг хуудсанд 50 мөр харуулна
let __histPage = 0;
const HIST_PAGE_SIZE = 50;

// Filter өөрчлөгдөхөд pagination-г эхнээс эхлэх
function clearHistFilter() {
  $('#h-q').value = ''; $('#h-from').value = ''; $('#h-to').value = '';
  if ($('#h-sort')) $('#h-sort').value = 'time_desc';
  __histPage = 0;
  renderHistory();
}

function renderHistory() {
  const q = $('#h-q').value.toLowerCase().trim();
  const from = $('#h-from').value;
  const to = $('#h-to').value;
  const sortMode = ($('#h-sort') && $('#h-sort').value) || 'time_desc';
  let list = [...STATE.exams];
  if (q) list = list.filter(e => (e.horse+' '+e.owner+' '+e.phone+' '+e.diagnosis+' '+(e.examNum||'')).toLowerCase().includes(q));
  if (from) list = list.filter(e => e.date >= from);
  if (to) list = list.filter(e => e.date <= to);

  // Үзлэгийн дугаарыг тоонд хөрвүүлэх (0051189 → 51189). Дугааргүйг хамгийн ард тавина.
  const numOf = e => {
    const n = parseInt(String(e.examNum || '').replace(/\D/g, ''), 10);
    return isNaN(n) ? null : n;
  };
  const byNum = (a, b, dir) => {
    const na = numOf(a), nb = numOf(b);
    if (na === null && nb === null) return recTime(b) - recTime(a); // хоёулаа дугааргүй → шинэ нь түрүүнд
    if (na === null) return 1;   // дугааргүйг ард
    if (nb === null) return -1;
    return dir === 'asc' ? na - nb : nb - na;
  };
  const byDate = (a, b, dir) => {
    const da = a.date || '', db = b.date || '';
    if (da === db) return recTime(b) - recTime(a); // ижил огноотой бол бүртгэсэн дарааллаар
    return dir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
  };

  if (sortMode === 'date_desc')      list.sort((a,b) => byDate(a,b,'desc'));
  else if (sortMode === 'date_asc')  list.sort((a,b) => byDate(a,b,'asc'));
  else if (sortMode === 'num_desc')  list.sort((a,b) => byNum(a,b,'desc'));
  else if (sortMode === 'num_asc')   list.sort((a,b) => byNum(a,b,'asc'));
  else                               list.sort((a,b) => recTime(b) - recTime(a)); // time_desc (анхдагч)

  // Pagination — 50 мөр харуулна, хуудас солих товч гарна
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / HIST_PAGE_SIZE));
  if (__histPage >= totalPages) __histPage = 0;
  const pageStart = __histPage * HIST_PAGE_SIZE;
  const pageList = list.slice(pageStart, pageStart + HIST_PAGE_SIZE);

  $('#h-cnt').textContent = totalCount;
  const tb = $('#h-tb');
  const seeFin = canSeeFinance();
  document.querySelectorAll('.h-amt-col').forEach(th => { th.style.display = seeFin ? '' : 'none'; });
  if (totalCount === 0) {
    tb.innerHTML = '<tr><td colspan="'+(seeFin?9:7)+'" style="text-align:center;padding:20px;color:var(--muted)">Бүртгэл алга</td></tr>';
  } else {
    tb.innerHTML = pageList.map((e, i) => {
      const fin = STATE.fins.find(f => String(f.examId) === String(e.id));
      const status = fin ? (fin.paid?'Төлсөн':'Хүлээгдэж буй') : '—';
      const cls = fin && fin.paid ? 'b-g' : 'b-o';
      const canEdit = STATE.user && (STATE.user.role === 'Ерөнхий эмч' || STATE.user.role === 'Ахлах эмч' || STATE.user.role === 'Админ');
      const rowNum = pageStart + i + 1;
      return `
        <tr data-eid="${escHTML(e.id)}" style="cursor:pointer">
          <td>${rowNum}</td>
          <td>${e.examNum?'<span class="badge b-o" style="font-weight:800">'+escHTML(e.examNum)+'</span>':'—'}</td>
          <td>${escHTML(e.date)}</td>
          <td class="h-diag" title="${escHTML(e.horse||'')}">${escHTML(e.horse)}</td>
          <td>${escHTML(e.owner)}</td>
          <td>${escHTML(e.phone)}</td>
          <td class="h-diag" title="${escHTML(e.diagnosis||'')}">${escHTML(e.diagnosis)}</td>
          ${seeFin ? '<td class="bold">'+fmt(e.amount)+'</td>' : ''}
          ${seeFin ? '<td><span class="badge '+cls+'">'+status+'</span></td>' : ''}
          ${canEdit ? `<td><button class="btn btn-xs btn-sm" onclick="event.stopPropagation();openEditExam('${e.id}')">✏️</button></td>` : '<td></td>'}
        </tr>
      `;
    }).join('');
    tb.querySelectorAll('tr[data-eid]').forEach(row => {
      row.addEventListener('click', () => openExamDetail(row.dataset.eid));
    });
  }
  // Pagination controls
  let pagEl = document.getElementById('h-pagination');
  if (!pagEl) {
    pagEl = document.createElement('div');
    pagEl.id = 'h-pagination';
    pagEl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;justify-content:center;flex-wrap:wrap';
    const tbParent = tb.parentElement;
    if (tbParent && tbParent.parentElement) tbParent.parentElement.appendChild(pagEl);
  }
  if (totalPages <= 1) {
    pagEl.innerHTML = '';
  } else {
    pagEl.innerHTML = `
      <button class="btn btn-sm" onclick="__histPage=Math.max(0,__histPage-1);renderHistory()" ${__histPage===0?'disabled':''}>← Өмнөх</button>
      <span style="font-size:13px;color:var(--muted)">${__histPage+1} / ${totalPages} · нийт ${totalCount}</span>
      <button class="btn btn-sm" onclick="__histPage=Math.min(${totalPages-1},__histPage+1);renderHistory()" ${__histPage>=totalPages-1?'disabled':''}>Дараах →</button>
    `;
  }
  updateHistArrows(sortMode);
}

// Хүснэгтийн толгойн эрэмбэлэх сум (↑↓) шинэчлэх
function updateHistArrows(sortMode) {
  const numAr = $('#h-ar-num'), dateAr = $('#h-ar-date');
  if (numAr) numAr.textContent = sortMode === 'num_desc' ? '↓' : sortMode === 'num_asc' ? '↑' : '';
  if (dateAr) dateAr.textContent = sortMode === 'date_desc' ? '↓' : sortMode === 'date_asc' ? '↑' : '';
}

// Толгой дээр дарахад тухайн баганаар эрэмбэлэх. Дахин дарахад чиглэл солино.
function histSortBy(col) {
  const sel = $('#h-sort');
  if (!sel) return;
  const cur = sel.value;
  let next;
  if (col === 'num') {
    next = (cur === 'num_desc') ? 'num_asc' : 'num_desc';
  } else {
    next = (cur === 'date_desc') ? 'date_asc' : 'date_desc';
  }
  sel.value = next;
  __histPage = 0;
  renderHistory();
}

function exportHistCSV() {
  const rows = [['#','Дугаар','Огноо','Адуу','Эзэн','Утас','Эмч','Онош','Дүн','Статус']];
  STATE.exams.forEach((e,i) => {
    const fin = STATE.fins.find(f => String(f.examId) === String(e.id));
    rows.push([i+1, e.examNum||'', e.date, e.horse, e.owner, e.phone, e.docName, e.diagnosis, e.amount, fin&&fin.paid?'Төлсөн':'Хүлээгдэж буй']);
  });
  downloadCSV(rows, 'түүх_' + todayStr() + '.csv');
}

// ============================================================
// ADMIN
// ============================================================
function renderAdmin() {
  $('#a-url').value = STATE.syncURL;
  const list = $('#a-doc-list');
  list.innerHTML = STATE.doctors.map(d => `
    <div class="li" style="cursor:default">
      <div class="li-av">👨‍⚕️</div>
      <div class="li-info">
        <div class="li-name">${escHTML(d.name)}</div>
        <div class="li-sub">${escHTML(d.role)} · ${d.exams||0} үзлэг · ${fmtCompact(d.rev||0)}</div>
      </div>
      <div class="li-r"><button class="btn btn-r btn-xs" onclick="delDoc('${d.id}')">✕</button></div>
    </div>
  `).join('') || '<div class="empty"><div class="empty-em">👨‍⚕️</div>Эмч байхгүй</div>';

  // Лог хэсэг
  renderLogViewer();
  // Хэрэглэгчийн жагсаалт
  renderUserList();
  // Устгасан үзлэгийн архив (зөвхөн Админ)
  renderDeletedExams();
}

// ============================================================
// УСТГАСАН ҮЗЛЭГИЙН АРХИВ (зөвхөн Админ — зөвхөн харах)
// ============================================================
function renderDeletedExams() {
  const wrap = document.getElementById('a-deleted-exam-list');
  const card = document.getElementById('deleted-exams-card');
  if (!wrap) return;
  // Зөвхөн Админд харагдана
  const admin = !!(STATE.user && STATE.user.role === 'Админ');
  if (card) card.style.display = admin ? '' : 'none';
  if (!admin) { wrap.innerHTML = ''; return; }

  const arr = Array.isArray(STATE.deletedExams) ? STATE.deletedExams : [];
  const cnt = document.getElementById('del-exam-count');
  if (cnt) cnt.textContent = arr.length ? '(' + arr.length + ')' : '';

  if (arr.length === 0) {
    wrap.innerHTML = '<div class="empty"><div class="empty-em">🗑️</div>Устгасан үзлэг алга</div>';
    return;
  }
  // Хамгийн сүүлд устгасан нь дээр харагдана
  const rows = arr.map((d, i) => ({ d, i })).sort((a,b) => (b.d.deletedAt||0) - (a.d.deletedAt||0));
  wrap.innerHTML = rows.map(({ d, i }) => {
    const e = d.exam || {};
    const examNum = e.examNum ? String(e.examNum) : '';
    const when = d.deletedAt ? fmtDateTime(d.deletedAt) : '';
    const sub = [
      e.date || '',
      examNum ? '№' + examNum : '',
      (e.amount ? fmt(e.amount) : '')
    ].filter(Boolean).join(' · ');
    return `
    <div class="li" style="cursor:pointer" onclick="openDeletedExamDetail(${i})">
      <div class="li-av">🗑️</div>
      <div class="li-info">
        <div class="li-name">${escHTML(e.horse || '—')} <span class="muted" style="font-weight:600">${escHTML(e.docName||'')}</span></div>
        <div class="li-sub">${escHTML(sub)}</div>
        <div class="li-sub muted" style="font-size:11px">Устгасан: ${escHTML(when)}${d.deletedBy ? ' · ' + escHTML(d.deletedBy) : ''}</div>
      </div>
      <div class="li-r"><span class="muted" style="font-size:12px">Харах →</span></div>
    </div>`;
  }).join('');
}

// Огноо+цаг форматлагч (хэрэв байхгүй бол)
function fmtDateTime(ms) {
  try {
    const dt = new Date(ms);
    const p = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}/${p(dt.getMonth()+1)}/${p(dt.getDate())} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
  } catch(e) { return ''; }
}

// Устгасан үзлэгийн дэлгэрэнгүйг харах
function openDeletedExamDetail(idx) {
  if (!(STATE.user && STATE.user.role === 'Админ')) { toast('⛔ Зөвхөн Админ харна', 'err'); return; }
  const d = (STATE.deletedExams || [])[idx];
  if (!d) { toast('Олдсонгүй', 'err'); return; }
  const e = d.exam || {};
  const fins = Array.isArray(d.fins) ? d.fins : [];
  const inps = Array.isArray(d.inps) ? d.inps : [];

  // Үйлчилгээ
  let svcHTML = '<div class="muted">Үйлчилгээ алга</div>';
  if (Array.isArray(e.services) && e.services.length) {
    svcHTML = '<div style="display:flex;flex-direction:column;gap:4px">' + e.services.map(s =>
      `<div style="display:flex;justify-content:space-between;gap:8px">
        <span>${escHTML(s.name||'')}</span>
        <span style="font-weight:700">${s.price ? fmt(s.price) : ''}</span>
      </div>`).join('') + '</div>';
  }
  // Эм
  let medsHTML = '<div class="muted">Эм тариа алга</div>';
  if (Array.isArray(e.meds) && e.meds.length) {
    medsHTML = e.meds.map(m => {
      if (typeof m === 'object' && m.name) return escHTML(m.name + (m.note ? ' — ' + m.note : ''));
      return escHTML(String(m));
    }).join('<br>');
  }
  // Холбоотой санхүү
  const finHTML = fins.length
    ? fins.map(f => `<div style="display:flex;justify-content:space-between;gap:8px">
        <span>${escHTML(f.method||'—')} · ${f.paid ? 'Төлсөн' : 'Хүлээгдэж буй'}</span>
        <span style="font-weight:700">${fmt(f.amount||0)}</span></div>`).join('')
    : '<div class="muted">Холбоотой санхүү алга</div>';
  // Холбоотой хэвтэн эмчлэх
  const inpHTML = inps.length
    ? inps.map(i => `<div>${escHTML(i.horse || i.id || '')} ${i.status ? '· ' + escHTML(i.status) : ''}</div>`).join('')
    : '<div class="muted">Холбоотой хэвтэн эмчлэх алга</div>';

  const body = document.getElementById('deleted-exam-detail-body');
  if (!body) return;
  body.innerHTML = `
    <div class="fld" style="margin-bottom:10px">
      <div style="background:var(--red-soft,#fde8e6);color:var(--red,#b8332b);padding:8px 12px;border-radius:8px;font-size:12px;font-weight:700">
        🗑️ Устгасан: ${escHTML(d.deletedAt ? fmtDateTime(d.deletedAt) : '')}${d.deletedBy ? ' · ' + escHTML(d.deletedBy) : ''}
      </div>
    </div>
    <div class="fld" style="margin-bottom:8px"><label>Үзлэгийн дугаар</label><div style="font-weight:800">${escHTML(e.examNum||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Морь</label><div>${escHTML(e.horse||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Эмч</label><div>${escHTML(e.docName||'—')}${e.assistDocName ? ' · Хамтран: ' + escHTML(e.assistDocName) : ''}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Огноо</label><div>${escHTML(e.date||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Оношилгоо</label><div style="white-space:pre-wrap">${escHTML(e.diagnosis||'—')}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>💊 Үйлчилгээ</label>${svcHTML}</div>
    <div class="fld" style="margin-bottom:8px"><label>Эм тариа</label><div>${medsHTML}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Дүн</label><div style="font-weight:800">${fmt(e.amount||0)}</div></div>
    <div class="fld" style="margin-bottom:8px"><label>Холбоотой санхүү (${fins.length})</label>${finHTML}</div>
    <div class="fld" style="margin-bottom:8px"><label>Холбоотой хэвтэн эмчлэх (${inps.length})</label>${inpHTML}</div>
  `;
  const m = document.getElementById('deleted-exam-modal');
  if (m) m.classList.add('show');
}

// ============================================================
// ҮЙЛЧИЛГЭЭНИЙ ҮНЭ (Админ панелаас тохируулна, Firebase-д синк)
// ============================================================

// Үйлчилгээ устгахад шаардах нууц код (4 оронтой)
const SVC_DELETE_CODE = '1234';

// Үйлчилгээний үнэ авах helper (хаанаас ч дуудна)
function getSvcPrice(name) {
  if (!name) return 0;
  const p = STATE.servicePrices && STATE.servicePrices[name];
  return parseFloat(p) || 0;
}

// Үнэ оруулах модал нээх
function openServicePrices() {
  // Зөвхөн Админ үнэ тохируулна
  if (!(STATE.user && STATE.user.role === 'Админ')) {
    toast('⛔ Зөвхөн Админ үнэ тохируулна', 'err');
    return;
  }
  const search = document.getElementById('sp-search');
  if (search) { search.value = ''; search.oninput = renderServicePrices; }
  renderServicePrices();
  const m = document.getElementById('service-prices-modal');
  if (m) m.classList.add('show');
}

// Үнийн жагсаалт render
function renderServicePrices() {
  const wrap = document.getElementById('sp-list');
  if (!wrap) return;
  const q = (document.getElementById('sp-search')?.value || '').toLowerCase().trim();
  const all = getAllServices();
  const list = q ? all.filter(s => s.toLowerCase().includes(q)) : all;
  if (list.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:16px">Олдсонгүй</div>';
    return;
  }
  wrap.innerHTML = list.map(s => {
    const price = getSvcPrice(s);
    const isCustom = (STATE.customServices || []).includes(s) && !SVCS.includes(s);
    return `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#eee)">
      <span style="flex:1;font-size:13px">${escHTML(s)}${isCustom ? ' <span class="muted" style="font-size:10px">(нэмэлт)</span>' : ''}</span>
      <input class="inp sp-price-inp" data-svc="${escHTML(s)}" type="number" value="${price||''}" placeholder="0"
        style="width:100px;text-align:right">
      <span class="muted" style="font-size:12px">₮</span>
      <button class="btn btn-r btn-xs" data-rmsvc="${escHTML(s)}" title="Устгах">🗑️</button>
    </div>`;
  }).join('');
  // Устгах товчуудыг холбоно (онцгой тэмдэгтээс зайлсхийхийн тулд dataset ашиглана)
  wrap.querySelectorAll('button[data-rmsvc]').forEach(b => {
    b.onclick = () => removeCustomService(b.dataset.rmsvc);
  });
}

// Шинэ үйлчилгээ нэмэх (нэр + үнэ)
function addCustomService() {
  if (!(STATE.user && STATE.user.role === 'Админ')) { toast('⛔ Зөвхөн Админ', 'err'); return; }
  const nameEl = document.getElementById('sp-new-name');
  const priceEl = document.getElementById('sp-new-price');
  const name = (nameEl?.value || '').trim();
  const price = parseFloat(priceEl?.value) || 0;
  if (!name) { toast('Нэр оруулна уу', 'err'); return; }
  if (getAllServices().some(s => s.toLowerCase() === name.toLowerCase())) {
    toast('Энэ үйлчилгээ аль хэдийн байна', 'err'); return;
  }
  if (!Array.isArray(STATE.customServices)) STATE.customServices = [];
  STATE.customServices.push(name);
  STATE.removedServices = (STATE.removedServices || []).filter(s => s !== name);
  if (price > 0) STATE.servicePrices[name] = price;
  saveAll();
  writeLog('Үйлчилгээ нэмэв', '', '', name + (price ? ' — ' + fmt(price) : ''));
  if (nameEl) nameEl.value = '';
  if (priceEl) priceEl.value = '';
  toast('✅ Үйлчилгээ нэмэгдлээ', 'ok');
  renderServicePrices();
}

// Үйлчилгээ устгах (үндсэн бол нуух, нэмэлт бол бүрэн хасах)
function removeCustomService(name) {
  if (!(STATE.user && STATE.user.role === 'Админ')) { toast('⛔ Зөвхөн Админ', 'err'); return; }
  if (!name) return;
  // Устгахад нууц код шаардана
  const code = prompt('"' + name + '" үйлчилгээг устгахын тулд нууц кодоо оруулна уу:');
  if (code === null) return;  // Болих дарсан
  if (String(code).trim() !== SVC_DELETE_CODE) {
    toast('⛔ Код буруу байна', 'err');
    return;
  }
  if (SVCS.includes(name)) {
    if (!Array.isArray(STATE.removedServices)) STATE.removedServices = [];
    if (!STATE.removedServices.includes(name)) STATE.removedServices.push(name);
  } else {
    STATE.customServices = (STATE.customServices || []).filter(s => s !== name);
  }
  delete STATE.servicePrices[name];
  saveAll();
  writeLog('Үйлчилгээ устгав', '', '', name);
  toast('🗑️ Устгагдлаа', 'ok');
  renderServicePrices();
}

// Үнэ хадгалах
function saveServicePrices() {
  if (!(STATE.user && STATE.user.role === 'Админ')) {
    toast('⛔ Зөвхөн Админ хадгална', 'err');
    return;
  }
  // Жагсаалт дахь бүх оруулсан утгыг цуглуулна (хайлтаар шүүгдсэн ч өмнөх утга хадгалагдана)
  if (!STATE.servicePrices || typeof STATE.servicePrices !== 'object') STATE.servicePrices = {};
  document.querySelectorAll('.sp-price-inp').forEach(inp => {
    const name = inp.dataset.svc;
    const val = parseFloat(inp.value) || 0;
    if (val > 0) STATE.servicePrices[name] = val;
    else delete STATE.servicePrices[name];
  });
  saveAll();
  writeLog('Үйлчилгээний үнэ шинэчлэв', '', '', Object.keys(STATE.servicePrices).length + ' үйлчилгээнд үнэ тохирууллаа');
  toast('✅ Үнэ хадгалагдлаа', 'ok');
  closeModal('service-prices-modal');
}

// ============================================================
// ХЭРЭГЛЭГЧ УДИРДАХ (нэвтрэх эрх) — Firebase-д хадгалагдана
// ============================================================
// Зөвхөн Админ ба Ерөнхий эмч хэрэглэгч удирдаж чадна
function canManageUsers() {
  return !!(STATE.user && ['Админ','Ерөнхий эмч'].includes(STATE.user.role));
}

function renderUserList() {
  const el = document.getElementById('a-user-list');
  const card = document.getElementById('user-mgmt-card');
  if (!el) return;
  // Эрхгүй бол картыг бүхэлд нь нуух
  if (card) card.style.display = canManageUsers() ? '' : 'none';
  if (!canManageUsers()) return;

  const users = STATE.users || [];
  const cnt = document.getElementById('user-count');
  if (cnt) cnt.textContent = '(' + users.length + ')';

  el.innerHTML = users.map((u, idx) => `
    <div class="li" style="cursor:pointer" onclick="openUserModal(${idx})">
      <div class="li-av">🔐</div>
      <div class="li-info">
        <div class="li-name">${escHTML(u.name)}</div>
        <div class="li-sub">${escHTML(u.role)} · ${(u.pages||[]).length} хуудас</div>
      </div>
      <div class="li-r"><button class="btn btn-xs" onclick="event.stopPropagation();openUserModal(${idx})">✏️</button></div>
    </div>
  `).join('') || '<div class="empty"><div class="empty-em">🔐</div>Хэрэглэгч байхгүй</div>';
}

let _editUserIdx = null; // null = шинэ хэрэглэгч

function openUserModal(idx) {
  if (!canManageUsers()) { toast('Танд хэрэглэгч удирдах эрх алга', 'err'); return; }
  _editUserIdx = (typeof idx === 'number') ? idx : null;

  // Дүрийн select-ийг бөглөх
  const roleSel = document.getElementById('u-role');
  if (roleSel) roleSel.innerHTML = ALL_ROLES.map(r => '<option value="'+escHTML(r)+'">'+escHTML(r)+'</option>').join('');

  const nameInp = document.getElementById('u-name');
  const pwInp = document.getElementById('u-pw');
  const delBtn = document.getElementById('u-del-btn');

  if (_editUserIdx !== null && STATE.users[_editUserIdx]) {
    const u = STATE.users[_editUserIdx];
    document.querySelector('#user-modal .mod-title').textContent = '🔐 Хэрэглэгч засах';
    nameInp.value = u.name || '';
    pwInp.value = ''; // Нууц үгийг хэзээ ч харуулахгүй — хоосон орхивол өөрчлөхгүй
    pwInp.placeholder = 'Хоосон орхивол нууц үг өөрчлөгдөхгүй';
    if (roleSel) roleSel.value = u.role || ALL_ROLES[0];
    renderUserPages(u.pages || pagesForRole(u.role));
    if (delBtn) delBtn.style.display = '';
  } else {
    document.querySelector('#user-modal .mod-title').textContent = '🔐 Хэрэглэгч нэмэх';
    nameInp.value = '';
    pwInp.value = '';
    if (roleSel) roleSel.value = ALL_ROLES[0];
    renderUserPages(pagesForRole(ALL_ROLES[0]));
    if (delBtn) delBtn.style.display = 'none';
  }
  openModal('user-modal');
}

// Хуудас бүрийг toggle хийх чекбокс товчнууд
function renderUserPages(selectedPages) {
  const wrap = document.getElementById('u-pages');
  if (!wrap) return;
  const sel = new Set(selectedPages || []);
  wrap.innerHTML = ALL_PAGES.map(p => {
    const on = sel.has(p.id);
    return '<button type="button" class="badge" data-page="'+p.id+'" data-on="'+(on?'1':'0')+'" onclick="toggleUserPage(this)" '
      + 'style="cursor:pointer;border:1.5px solid '+(on?'var(--orange)':'var(--border)')+';'
      + 'padding:6px 10px;background:'+(on?'var(--orange-soft)':'#fff')+';color:'+(on?'var(--orange-dark)':'var(--muted)')+';font-weight:700">'
      + escHTML(p.label) + '</button>';
  }).join('');
}

function toggleUserPage(btn) {
  const on = btn.dataset.on === '1';
  const next = !on;
  btn.dataset.on = next ? '1' : '0';
  btn.style.border = '1.5px solid ' + (next ? 'var(--orange)' : 'var(--border)');
  btn.style.background = next ? 'var(--orange-soft)' : '#fff';
  btn.style.color = next ? 'var(--orange-dark)' : 'var(--muted)';
}

// Дүр солиход тухайн дүрийн ердийн эрхийг автоматаар тэмдэглэнэ
function onUserRoleChange() {
  const roleSel = document.getElementById('u-role');
  if (!roleSel) return;
  renderUserPages(pagesForRole(roleSel.value));
}

// u-pages дотроос сонгосон хуудсуудыг цуглуулах
function collectUserPages() {
  const wrap = document.getElementById('u-pages');
  if (!wrap) return [];
  const out = [];
  wrap.querySelectorAll('button[data-page]').forEach(b => {
    if (b.dataset.on === '1') out.push(b.dataset.page);
  });
  return out;
}

// Нууц үгийг SHA-256 hash болгоно (Web Crypto API — browser native)
async function _hashPassword(pw) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(pw + 'moriton_salt_2026'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
// Login шалгалтыг hash-тай харьцуулах
async function _checkPassword(inputPw, user) {
  if (user.pwHash) {
    const h = await _hashPassword(inputPw);
    return h === user.pwHash;
  }
  // Шилжилтийн үе: pw (plain) талбар байвал — hash руу шилжих хүртэл
  if (user.pw) return inputPw === user.pw;
  return false;
}

function saveUser() {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  const name = (document.getElementById('u-name').value || '').trim();
  const pw = (document.getElementById('u-pw').value || '').trim();
  const role = document.getElementById('u-role').value;
  const pages = collectUserPages();

  if (!name) { toast('Нэвтрэх нэр оруулна уу', 'err'); return; }
  if (!pw && _editUserIdx === null) { toast('Нууц үг оруулна уу', 'err'); return; }
  if (!pages.length) { toast('Дор хаяж нэг хуудсын эрх сонгоно уу', 'err'); return; }

  if (!Array.isArray(STATE.users)) STATE.users = [];

  const dupIdx = STATE.users.findIndex((u, i) => u.name === name && i !== _editUserIdx);
  if (dupIdx !== -1) { toast('Энэ нэртэй хэрэглэгч аль хэдийн байна', 'err'); return; }

  const ms = nowMs();

  // Нууц үгийг hash хийж хадгална — plain text Firestore/localStorage-д орохгүй
  const doSave = async () => {
    let pwHash;
    if (pw) {
      pwHash = await _hashPassword(pw);
    } else if (_editUserIdx !== null && STATE.users[_editUserIdx]) {
      // Нууц үг оруулаагүй бол хуучин hash хэвээр үлдэнэ
      pwHash = STATE.users[_editUserIdx].pwHash || '';
    } else {
      pwHash = '';
    }

    const userObj = { name, pwHash, role, pages, ms };
    if (_editUserIdx !== null && STATE.users[_editUserIdx]) {
      STATE.users[_editUserIdx] = userObj;
      writeLog('Хэрэглэгч заслаа', name, role);
    } else {
      STATE.users.push(userObj);
      writeLog('Хэрэглэгч нэмлээ', name, role);
    }

    _scheduleLsSave('users');
    // Firestore-д pwHash хадгална — pw (plain text) хэзээ ч явахгүй
    const userRec = { name, pwHash, role, pages, ms, _updatedAt: ms, _writer: window.__fbDeviceId || 'unknown' };
    fbWriteDoc('users', name, userRec)
      .then(() => { try { flashSync(); } catch(e){} })
      .catch(err => toast('Firebase алдаа: ' + err.message, 'err'));
    populateLoginUsers();
    renderUserList();
    closeModal('user-modal');
    toast('✓ Хэрэглэгч хадгалагдлаа.', 'ok');
  };

  doSave().catch(err => toast('Алдаа: ' + err.message, 'err'));
}

function deleteUser() {
  if (!canManageUsers()) { toast('Эрх алга', 'err'); return; }
  if (_editUserIdx === null || !STATE.users[_editUserIdx]) return;
  const u = STATE.users[_editUserIdx];

  // Сүүлийн админ/ерөнхий эмчийг устгахаас сэргийлэх
  const adminLikeCount = STATE.users.filter(x => ['Админ','Ерөнхий эмч'].includes(x.role)).length;
  if (['Админ','Ерөнхий эмч'].includes(u.role) && adminLikeCount <= 1) {
    toast('Сүүлийн админ эрхтэй хэрэглэгчийг устгах боломжгүй', 'err');
    return;
  }
  // Өөрийгөө устгахаас сэргийлэх
  if (STATE.user && STATE.user.name === u.name) {
    toast('Өөрийгөө устгах боломжгүй', 'err');
    return;
  }
  if (!confirm('"' + u.name + '" хэрэглэгчийг устгах уу? Тэр цаашид нэвтэрч чадахгүй.')) return;

  STATE.users.splice(_editUserIdx, 1);
  _scheduleLsSave('users');
  fbDeleteDoc('users', u.name);
  writeLog('Хэрэглэгч устгалаа', u.name, u.role);
  populateLoginUsers();
  renderUserList();
  closeModal('user-modal');
  toast('Хэрэглэгч устгагдлаа', 'ok');
}

// ============================================================
// LOG VIEWER
// ============================================================
const LOG_DISPLAY_LIMIT = 200; // Нийт хадгалах, 200 харуулах

function renderLogViewer() {
  const el = document.getElementById('a-log-list');
  if (!el) return;
  const allLogs = (STATE.logs || []).slice().sort((a,b) => (b.log_ms||0) - (a.log_ms||0));
  const logs = allLogs.slice(0, LOG_DISPLAY_LIMIT);
  // Лог тооны мэдээлэл харуулах
  const logCountEl = document.getElementById('a-log-count');
  if (logCountEl) logCountEl.textContent = allLogs.length > LOG_DISPLAY_LIMIT
    ? `Сүүлийн ${LOG_DISPLAY_LIMIT} лог (нийт ${allLogs.length})`
    : `Нийт ${allLogs.length} лог`;
  if (!logs.length) {
    el.innerHTML = '<div class="empty"><div class="empty-em">📋</div>Лог байхгүй</div>';
    return;
  }
  el.innerHTML = logs.map(l => `
    <div class="li" style="cursor:default">
      <div class="li-av" style="font-size:18px">📝</div>
      <div class="li-info">
        <div class="li-name">${escHTML(l.user_name||'')} <span style="font-weight:400;color:var(--muted)">(${escHTML(l.user_role||'')})</span></div>
        <div class="li-sub">${escHTML(l.action||'')} ${l.target_name ? '· ' + escHTML(l.target_name) : ''}</div>
        ${l.details ? `<div class="li-sub" style="color:var(--muted);font-size:11px;margin-top:2px">${escHTML(l.details)}</div>` : ''}
      </div>
      <div class="li-r" style="font-size:11px;color:var(--muted)">${escHTML(l.log_date||'')}</div>
    </div>
  `).join('');
}

// ============================================================
// EDIT HORSE
// ============================================================
function openEditHorse(id) {
  const h = STATE.horses.find(x => x.id === id);
  if (!h) return;
  STATE._editHorse = h;
  const m = document.getElementById('edit-horse-modal');
  if (!m) return;
  document.getElementById('eh-name').value = h.name || '';
  document.getElementById('eh-owner').value = h.owner || '';
  document.getElementById('eh-phone').value = h.phone || '';
  document.getElementById('eh-breed').value = h.breed || '';
  document.getElementById('eh-age').value = h.age || '';
  document.getElementById('eh-province').value = h.province || '';
  document.getElementById('eh-soum').value = h.soum || '';
  const delBtn = document.getElementById('eh-del-btn');
  if (delBtn) delBtn.style.display = canDelete() ? '' : 'none';
  m.classList.add('show');
}

function saveEditHorse() {
  const h = STATE._editHorse;
  if (!h) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }
  const before = { ...h };
  h.name     = document.getElementById('eh-name').value.trim();
  h.owner    = document.getElementById('eh-owner').value.trim();
  h.phone    = document.getElementById('eh-phone').value.trim();
  h.breed    = document.getElementById('eh-breed').value.trim();
  h.age      = document.getElementById('eh-age').value.trim();
  h.province = document.getElementById('eh-province').value.trim();
  h.soum     = document.getElementById('eh-soum').value.trim();
  h.ms       = nowMs();
  const changes = diffStr(before, h, [
    {k:'name',label:'Нэр'},{k:'owner',label:'Эзэн'},{k:'phone',label:'Утас'},
    {k:'breed',label:'Үүлдэр'},{k:'age',label:'Нас'},{k:'province',label:'Аймаг'},{k:'soum',label:'Сум'}
  ]);
  saveAll();
  fbSaveRecord('horses', h);
  writeLog('Морь засварласан', h.id, h.name + ' / ' + h.owner, changes || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-horse-modal');
  toast('✅ Хадгалагдлаа', 'ok');
}

function deleteHorse(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Админд байна', 'err'); return; }
  const h = STATE.horses.find(x => x.id === id);
  if (!h) return;
  if (!confirm('"' + h.name + '" морийг устгах уу?\nЭнэ морийн БҮХ үзлэг, санхүүгийн бичлэг хамт устана.')) return;

  // Cascade: энэ морьтой холбоотой үзлэг → түүний санхүү
  const linkedExams = STATE.exams.filter(e => String(e.horseId) === String(id) || (e.horse && h.name && e.horse === h.name));
  const linkedExamIds = new Set(linkedExams.map(e => String(e.id)));
  const linkedFins = STATE.fins.filter(f => linkedExamIds.has(String(f.examId)));

  // deletedIds-д бүгдийг тэмдэглэж, Firestore-оос устгана
  STATE.deletedIds.add(String(id));
  linkedExams.forEach(e => { STATE.deletedIds.add(String(e.id)); fbDeleteDoc('exams', String(e.id)); });
  linkedFins.forEach(f => { STATE.deletedIds.add(String(f.id)); fbDeleteDoc('fins', String(f.id)); });

  // Локал массивуудаас хасна
  STATE.horses = STATE.horses.filter(x => x.id !== id);
  STATE.exams  = STATE.exams.filter(x => !linkedExamIds.has(String(x.id)));
  STATE.fins   = STATE.fins.filter(x => !linkedFins.some(f => f.id === x.id));

  saveAll();
  fbDeleteDoc('horses', String(id));
  writeLog('Морь устгасан', id, h.name + ' / ' + h.owner,
    `Холбоотойгоор устсан: ${linkedExams.length} үзлэг, ${linkedFins.length} санхүү`);
  closeModal('edit-horse-modal');
  toast('Устгагдлаа · холбоотой ' + linkedExams.length + ' үзлэг арилсан', 'ok');
  updateBadges();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
}

// ============================================================
// EDIT EXAM
// ============================================================
function openEditExam(id) {
  const e = STATE.exams.find(x => x.id === id);
  if (!e) return;
  STATE._editExam = e;
  const m = document.getElementById('edit-exam-modal');
  if (!m) return;
  document.getElementById('ee-examnum').value = e.examNum || '';
  document.getElementById('ee-horse').value = e.horse || '';
  document.getElementById('ee-doctor').value = e.docName || '';
  document.getElementById('ee-diagnosis').value = e.diagnosis || '';
  document.getElementById('ee-amount').value = e.amount || 0;
  document.getElementById('ee-date').value = e.date || '';
  // Үйлчилгээний жагсаалтыг бэлдэх (засварлахад зориулж хуулбар авна)
  if (!Array.isArray(e.services)) e.services = [];
  STATE._editExamSvcs = e.services.map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }));
  const eeSearch = document.getElementById('ee-svc-search');
  if (eeSearch) { eeSearch.value = ''; eeSearch.oninput = renderEEsvcList; }
  renderEEsvcList();
  renderEEselectedSvcs();
  const delBtnE = document.getElementById('ee-del-btn');
  if (delBtnE) delBtnE.style.display = canDelete() ? '' : 'none';
  m.classList.add('show');
}

// Засварлах модал дахь үйлчилгээний хайлтын жагсаалт
function renderEEsvcList() {
  const wrap = document.getElementById('ee-svc-list');
  if (!wrap) return;
  const q = (document.getElementById('ee-svc-search')?.value || '').toLowerCase().trim();
  if (!q) { wrap.innerHTML = '<div class="muted" style="font-size:12px;padding:8px">Үйлчилгээ хайхын тулд бичнэ үү</div>'; return; }
  const list = getAllServices().filter(s => s.toLowerCase().includes(q)).slice(0, 30);
  wrap.innerHTML = list.map(s => `
    <div class="svc-item" data-svc="${escHTML(s)}">
      <span class="svc-item-name">${escHTML(s)}</span>
      <span style="color:var(--orange);font-size:16px;font-weight:900">+</span>
    </div>
  `).join('') || '<div class="muted" style="font-size:12px;padding:8px">Олдсонгүй</div>';
  wrap.querySelectorAll('.svc-item').forEach(el => el.onclick = () => {
    const s = el.dataset.svc;
    if (!STATE._editExamSvcs.find(x => x.name === s)) {
      STATE._editExamSvcs.push({ name: s, price: getSvcPrice(s) });
      renderEEselectedSvcs();
    }
  });
}

// Засварлах модал дахь сонгосон үйлчилгээнүүд
function renderEEselectedSvcs() {
  const wrap = document.getElementById('ee-svc-selected');
  if (!wrap) return;
  const arr = STATE._editExamSvcs || [];
  if (arr.length === 0) {
    wrap.innerHTML = '<div class="empty" style="padding:12px;font-size:12px">Үйлчилгээ сонгоогүй</div>';
  } else {
    wrap.innerHTML = arr.map((s,i) => `
      <div class="svc-row">
        <div class="svc-row-name">${escHTML(s.name)}</div>
        <input class="inp" type="number" data-i="${i}" value="${s.price||''}" placeholder="0">
        <button class="btn btn-r btn-xs" data-rm="${i}">✕</button>
      </div>
    `).join('');
    wrap.querySelectorAll('input[type=number]').forEach(inp => inp.oninput = () => {
      arr[+inp.dataset.i].price = parseFloat(inp.value) || 0;
      ee_syncAmountFromSvcs();
    });
    wrap.querySelectorAll('button[data-rm]').forEach(b => b.onclick = () => {
      arr.splice(+b.dataset.rm, 1);
      renderEEselectedSvcs();
    });
  }
  ee_syncAmountFromSvcs();
}

// Үйлчилгээний нийлбэрийг Дүн талбарт автоматаар тавина
function ee_syncAmountFromSvcs() {
  const arr = STATE._editExamSvcs || [];
  if (arr.length === 0) return;
  const t = arr.reduce((a,b)=>a+(parseFloat(b.price)||0),0);
  const amtEl = document.getElementById('ee-amount');
  if (amtEl) amtEl.value = t;
}

function saveEditExam() {
  const e = STATE._editExam;
  if (!e) return;
  if (!canEditData()) { toast('⛔ Засах эрхгүй', 'err'); return; }

  // Үзлэгийн хуудасны дугаарыг шалгах
  const newExamNum = document.getElementById('ee-examnum').value.trim();
  if (newExamNum && newExamNum !== (e.examNum || '')) {
    const dup = findExamNumDuplicate(newExamNum, e.id);
    if (dup) {
      const r = dup.rec || {};
      const who = r.horse || r.owner || '';
      toast('⚠️ ' + newExamNum + ' дугаар ' + dup.source + '-д ашиглагдсан байна' + (who ? ' (' + who + ')' : ''), 'err');
      return;
    }
  }

  const before = { ...e };
  const beforeSvcStr = (Array.isArray(e.services)?e.services:[]).map(s=>s.name).join(', ');
  e.examNum   = newExamNum;
  e.diagnosis = document.getElementById('ee-diagnosis').value.trim();
  // Үйлчилгээг хадгална
  e.services  = (STATE._editExamSvcs || []).map(s => ({ name: s.name, price: parseFloat(s.price) || 0 }));
  e.amount    = parseFloat(document.getElementById('ee-amount').value) || 0;
  e.ms        = nowMs();
  const afterSvcStr = e.services.map(s=>s.name).join(', ');
  const changes = diffStr(before, e, [
    {k:'examNum',label:'Дугаар'},{k:'diagnosis',label:'Онош'},{k:'amount',label:'Дүн'}
  ]);
  let svcChange = '';
  if (beforeSvcStr !== afterSvcStr) svcChange = 'Үйлчилгээ: «' + (beforeSvcStr||'—') + '» → «' + (afterSvcStr||'—') + '»';
  const allChanges = [changes, svcChange].filter(Boolean).join('; ');
  // Холбоотой санхүүгийн дүнг мөн шинэчилнэ (cascade)
  if (before.amount !== e.amount || beforeSvcStr !== afterSvcStr) {
    STATE.fins.filter(f => String(f.examId) === String(e.id)).forEach(f => {
      f.amount = e.amount;
      f.services = afterSvcStr;
      f.ms = nowMs();
      fbSaveRecord('fins', f);
    });
  }
  saveAll();
  fbSaveRecord('exams', e);
  // Засварлагдсан санхүүгийн бичлэгүүдийг бичнэ
  STATE.fins.filter(f => String(f.examId) === String(e.id)).forEach(f => fbSaveRecord('fins', f));
  writeLog('Үзлэг засварласан', e.id, e.horse + ' — ' + (e.docName||''), allChanges || 'Өөрчлөлтгүй хадгалсан');
  closeModal('edit-exam-modal');
  toast('✅ Хадгалагдлаа', 'ok');
  renderHistory();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
}

function deleteExam(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Админд байна', 'err'); return; }
  const e = STATE.exams.find(x => x.id === id);
  if (!e) return;
  if (!confirm('Энэ үзлэгийг устгах уу?\nХолбоотой санхүүгийн бичлэг хамт устана.')) return;
  STATE.deletedIds.add(String(id));
  // Холбоотой санхүүгийн бичлэгүүдийг мөн deletedIds-д нэмнэ (cascade)
  const linkedFins = STATE.fins.filter(f => String(f.examId) === String(id));
  linkedFins.forEach(f => {
    STATE.deletedIds.add(String(f.id));
    fbDeleteDoc('fins', String(f.id));
  });
  const linkedInps = STATE.inps.filter(i => String(i.examId) === String(id));
  linkedInps.forEach(i => {
    STATE.deletedIds.add(String(i.id));
    fbDeleteDoc('inps', String(i.id));
  });
  const examCopy = JSON.parse(JSON.stringify(e));
  if (Array.isArray(examCopy.images)) examCopy.imageCount = examCopy.images.length;
  delete examCopy.images;
  const archRec = {
    _archId: String(e.id),
    exam: examCopy,
    fins: JSON.parse(JSON.stringify(linkedFins)),
    inps: JSON.parse(JSON.stringify(linkedInps)),
    deletedAt: nowMs(),
    deletedBy: (STATE.user && (STATE.user.name || STATE.user.role)) || ''
  };
  STATE.deletedExams.push(archRec);
  STATE.exams = STATE.exams.filter(x => x.id !== id);
  STATE.fins = STATE.fins.filter(x => String(x.examId) !== String(id));
  STATE.inps = STATE.inps.filter(x => String(x.examId) !== String(id));
  saveAll();
  fbDeleteDoc('exams', String(id));
  fbSaveRecord('deletedExams', Object.assign({ id: archRec._archId }, archRec));
  writeLog('Үзлэг устгасан', id, (e.horse||'') + ' — ' + (e.docName||''),
    `Дүн: ${e.amount||0}; холбоотой ${linkedFins.length} санхүү, ${linkedInps.length} хэвтэн эмчлэх устсан`);
  closeModal('edit-exam-modal');
  toast('Устгагдлаа', 'ok');
  renderHistory();
  if (STATE.activePage === 'kpi') renderKPI();
  if (STATE.activePage === 'finance') renderFinance();
  if (STATE.activePage === 'admin') renderAdmin();
}

function addDoc() {
  const name = $('#a-doc-name').value.trim();
  const role = $('#a-doc-role').value;
  if (!name) { toast('Нэр оруулна уу', 'err'); return; }
  const doc = { id: uid(), name, role, exams: 0, rev: 0, ms: nowMs() };
  STATE.doctors.push(doc);
  lsSet('mt_doctors', STATE.doctors);
  fbSaveRecord('doctors', doc);
  $('#a-doc-name').value = '';
  toast('✅ Эмч нэмэгдлээ', 'ok');
  renderAdmin();
}

function delDoc(id) {
  if (!canDelete()) { toast('⛔ Устгах эрх зөвхөн Админд байна', 'err'); return; }
  const d = STATE.doctors.find(x => x.id === id);
  if (!confirm('Энэ эмчийг устгах уу?')) return;
  STATE.doctors = STATE.doctors.filter(d => d.id !== id);
  saveAll();
  fbDeleteDoc('doctors', String(id));
  writeLog('Эмч устгасан', id, d ? d.name : '', '');
  renderAdmin();
  toast('Устгагдлаа', 'ok');
}

function exportAll() {
  const data = {
    horses: STATE.horses, waiting: STATE.waiting, exams: STATE.exams,
    fins: STATE.fins, inps: STATE.inps, doctors: STATE.doctors,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'morton_backup_' + todayStr() + '.json';
  a.click();
  toast('⬇ Татагдлаа', 'ok');
}

function exportExcel() {
  if (typeof XLSX === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => _doExportExcel();
    document.head.appendChild(s);
    toast('Excel бэлтгэж байна...', 'ok');
  } else {
    _doExportExcel();
  }
}

function _doExportExcel() {
  const wb = XLSX.utils.book_new();

  // Морьд
  const horsesData = STATE.horses.map(h => ({
    'ID': h.id || '',
    'Морины нэр': h.name || '',
    'Эзний нэр': h.owner || '',
    'Утас': h.phone || '',
    'Үүлдэр': h.breed || '',
    'Нас': h.age || '',
    'Аймаг': h.province || '',
    'Сум': h.soum || '',
    'Төлөв': h.status || '',
    'Огноо': h.date || ''
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(horsesData), 'Морьд');

  // Үзлэг
  const examsData = STATE.exams.map(e => ({
    'ID': e.id || '',
    'Дугаар': e.examNum || '',
    'Огноо': e.date || '',
    'Морь': e.horse || '',
    'Эзэн': e.owner || '',
    'Утас': e.phone || '',
    'Эмч': e.docName || '',
    'Оношилгоо': e.diagnosis || '',
    'Дүн': e.amount || 0,
    'Төлсөн эсэх': e.paid ? 'Тийм' : 'Үгүй'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(examsData), 'Үзлэг');

  // Санхүү
  const finsData = STATE.fins.map(f => ({
    'ID': f.id || '',
    'Үзлэг дугаар': f.examNum || '',
    'Огноо': f.paidDate || f.date || '',
    'Морь': f.horse || '',
    'Эзэн': f.owner || '',
    'Эмч': f.docName || '',
    'Дүн': f.amount || 0,
    'Төлсөн эсэх': f.paid ? 'Тийм' : 'Үгүй'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(finsData), 'Санхүү');

  // Хэвтэн эмчлүүлэгч
  const inpsData = STATE.inps.map(i => ({
    'ID': i.id || '',
    'Морь': i.horse || '',
    'Эзэн': i.owner || '',
    'Эмч': i.docName || '',
    'Оношилгоо': i.diagnosis || '',
    'Орсон огноо': i.admittedDate || '',
    'Гарсан огноо': i.dischargedDate || '',
    'Дүн': i.initialAmount || 0,
    'Гарсан эсэх': i.discharged ? 'Тийм' : 'Үгүй'
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inpsData), 'Хэвтэн');

  // Эмч нар
  const docsData = STATE.doctors.map(d => ({
    'ID': d.id || '',
    'Нэр': d.name || '',
    'Роль': d.role || '',
    'Үзлэг': d.exams || 0,
    'Орлого': d.rev || 0
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(docsData), 'Эмч нар');

  // Лог
  if (STATE.logs && STATE.logs.length) {
    const logsData = STATE.logs.map(l => ({
      'Хэрэглэгч': l.user_name || '',
      'Эрх': l.user_role || '',
      'Үйлдэл': l.action || '',
      'Объект': l.target_name || '',
      'Дэлгэрэнгүй': l.details || '',
      'Огноо': l.log_date || ''
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logsData), 'Лог');
  }

  XLSX.writeFile(wb, 'Morton_' + todayStr() + '.xlsx');
  toast('✅ Excel татагдлаа', 'ok');
}

function importJSON(ev) {
  const f = ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('Одоогийн өгөгдөл солигдоно. Үргэлжлүүлэх үү?')) return;
      if (data.horses) STATE.horses = data.horses;
      if (data.waiting) STATE.waiting = data.waiting;
      if (data.exams) STATE.exams = data.exams;
      if (data.fins) STATE.fins = data.fins;
      if (data.inps) STATE.inps = data.inps;
      if (data.doctors) STATE.doctors = data.doctors;
      saveAll();
      updateBadges();
      toast('✅ Импортлогдлоо', 'ok');
      renderAdmin();
    } catch (err) {
      toast('Файл буруу байна', 'err');
    }
  };
  r.readAsText(f);
  ev.target.value = '';
}

function resetAll() {
  if (!confirm('БҮХ өгөгдлийг устгах уу? Энэ үйлдэл буцаагдахгүй!')) return;
  if (!confirm('Үнэхээр устгах уу?')) return;
  STATE.horses = []; STATE.waiting = []; STATE.exams = []; STATE.fins = []; STATE.inps = [];
  // Oracle-д устгах хүсэлт илгээнэ — backend side delete all хийнэ
  updateBadges();
  toast('Устгагдлаа', 'ok');
  renderAdmin();
}

function saveSyncURL() {
  STATE.syncURL = $('#a-url').value.trim();
  lsSet('mt_sync_url', STATE.syncURL);
  toast('💾 URL тохируулагдлаа', 'ok');
}

function resetSyncURL() {
  if (!confirm('Default URL руу буцаах уу?')) return;
  // resetSyncURL — Apps Script устгагдсан
  toast('Apps Script sync идэвхгүй байна', 'err');
  toast('↻ Default URL руу буцлаа', 'ok');
}

// ============================================================
// SYNC
// ============================================================
let lastSyncOk = 0;
function flashSync() {
  $('#sync-dot').classList.add('live');
  setTimeout(()=> $('#sync-dot').classList.remove('live'), 1200);
  lastSyncOk = nowMs();
}



// trySync — Apps Script sync устгагдсан, Firebase ашиглана
function trySync(sheet, data) { /* no-op: Firebase fbSaveRecord ашиглана */ }

function manualSync() {
  if (!window.__fbReady) {
    toast('Firebase холбогдоогүй байна', 'err');
    return;
  }
  try { flashSync(); } catch(e){}
  toast('✅ Firebase-тэй синк хийгдсэн', 'ok');
}

// Format a Date object as local YYYY-MM-DD (NOT UTC) — backward compat alias

function normalizeDateField(v) {
  if (!v) return '';
  if (typeof v === 'string') {
    // ISO format like "2026-04-29T00:00:00.000Z" or "2026-04-29T..." → take date part
    // BUT: an ISO with Z is UTC; in Mongolia (UTC+8) "2026-04-25T00:00:00.000Z" is actually
    // 2026-04-25 08:00 local — so just slicing is safe. However, if the string has a timezone
    // offset (like "2026-04-24T16:00:00.000-08:00"), we should reparse to local.
    if (v.length >= 10 && v[4] === '-' && v[7] === '-') {
      // If just "YYYY-MM-DD" or starts with it and the time portion is 00:00:00.000Z (UTC midnight),
      // it represents a Sheet date that should be shown as that date in local time.
      if (v.length === 10) return v;
      // For ISO with time, reparse and extract local components — fixes UTC-shift bug.
      const parsed = new Date(v);
      if (!isNaN(parsed.getTime())) return localDateStr(parsed);
      return v.slice(0, 10);
    }
    return v;
  }
  if (v instanceof Date) return localDateStr(v);
  // Date-serialized number? Try parsing
  try {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return localDateStr(d);
    return String(v);
  } catch(e) { return String(v); }
}

// Convert a date string (YYYY-MM-DD) to local-midnight ms timestamp
function dateStrToMs(s) {
  if (!s) return 0;
  s = String(s).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 0;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0).getTime();
}

function normalizeRow(r) {
  // Normalize known date fields so filtering and display stays consistent
  ['date','paidDate','admittedDate','dischargedDate','time'].forEach(k => {
    if (r[k] !== undefined && r[k] !== '' && r[k] !== null) {
      if (k === 'time') {
        if (typeof r[k] === 'string' && r[k].length > 5 && r[k].includes(':')) {
          // ISO-like → take HH:MM (local)
          const parsed = new Date(r[k]);
          if (!isNaN(parsed.getTime())) {
            r[k] = String(parsed.getHours()).padStart(2,'0') + ':' + String(parsed.getMinutes()).padStart(2,'0');
          } else {
            const m = r[k].match(/(\d{2}:\d{2})/);
            if (m) r[k] = m[1];
          }
        } else if (r[k] instanceof Date) {
          r[k] = String(r[k].getHours()).padStart(2,'0') + ':' + String(r[k].getMinutes()).padStart(2,'0');
        }
      } else {
        r[k] = normalizeDateField(r[k]);
      }
    }
  });
  // Normalize id and amount
  if (r.id !== undefined) r.id = String(r.id);
  if (r.amount !== undefined && r.amount !== '') r.amount = parseFloat(r.amount) || 0;
  if (r.paid === 'true' || r.paid === 1) r.paid = true;
  if (r.paid === 'false' || r.paid === 0 || r.paid === '') r.paid = false;

  // Re-derive admittedMs/dischargedMs from corresponding date strings if they look stale.
  // Specifically: when Sheet-edited date doesn't match the ms timestamp, prefer the date string.
  if (r.admittedDate) {
    const fromDate = dateStrToMs(r.admittedDate);
    if (fromDate) {
      const existing = parseFloat(r.admittedMs) || 0;
      // If date strings don't match, the user edited Sheet — re-anchor ms to that date (noon for safety)
      if (existing) {
        const existingDateStr = localDateStr(new Date(existing));
        if (existingDateStr !== r.admittedDate) {
          // Set to noon on the admitted date
          r.admittedMs = fromDate + 12 * 3600000;
        }
      } else {
        r.admittedMs = fromDate + 12 * 3600000;
      }
    }
  }
  if (r.dischargedDate) {
    const fromDate = dateStrToMs(r.dischargedDate);
    if (fromDate) {
      const existing = parseFloat(r.dischargedMs) || 0;
      if (existing) {
        const existingDateStr = localDateStr(new Date(existing));
        if (existingDateStr !== r.dischargedDate) {
          r.dischargedMs = fromDate + 12 * 3600000;
        }
      } else {
        r.dischargedMs = fromDate + 12 * 3600000;
      }
    }
  }
  return r;
}

function applySheetData(d) {
  const stats = { added: 0, updated: 0, removed: 0 };
  const PROTECT_MS = 300000;  // Protect locally-added items for 5 minutes (was 30s — too short)
  const now = nowMs();

  function applyArray(localKey, remote) {
    if (!Array.isArray(remote)) return;
    // Normalize all incoming rows
    remote = remote.map(normalizeRow);
    // Устгасан бичлэгийг remote-оос шүүж хаяна (буцаж нэмэгдэхээс сэргийлнэ)
    if (STATE.deletedIds instanceof Set && STATE.deletedIds.size) {
      remote = remote.filter(r => !STATE.deletedIds.has(String(r.id)));
    }
    const local = STATE[localKey] || [];
    const remoteIds = new Set(remote.map(r => String(r.id)));

    // Build a map of local items for quick lookup
    const localById = {};
    local.forEach(l => { localById[String(l.id)] = l; });

    // For records that exist in BOTH Sheet and local: preserve local array fields
    // when Sheet returns missing/empty values. This protects writes that haven't
    // been synced back yet (e.g. user just added a prepayment locally — Sheet
    // hasn't picked it up yet but the next poll might overwrite with empty).
    const ARRAY_FIELDS = ['prepayments', 'payments', 'log', 'services', 'meds', 'images'];
    remote = remote.map(r => {
      const lc = localById[String(r.id)];
      if (!lc) return r;
      const lcMs = parseFloat(lc.ms) || 0;
      const rMs  = parseFloat(r.ms)  || 0;
      // If local was modified more recently than Sheet's row, prefer local for array fields
      const localFresher = lcMs > rMs && (now - lcMs) < PROTECT_MS;
      ARRAY_FIELDS.forEach(f => {
        const remoteVal = r[f];
        const localVal = lc[f];
        // If Sheet returned empty/non-array but local has data → keep local
        if (Array.isArray(localVal) && localVal.length > 0) {
          if (!Array.isArray(remoteVal) || remoteVal.length === 0) {
            r[f] = localVal;
          } else if (localFresher) {
            // Local was just edited — prefer it
            r[f] = localVal;
          }
        }
      });
      return r;
    });

    // Find local-only items (not in Sheet)
    const localOnly = local.filter(l => !remoteIds.has(String(l.id)));
    // Of those, protect ones added within last 30s
    const protectedItems = localOnly.filter(l => {
      const ts = l.ms || l.createdAt || l.paidMs || 0;
      return ts && (now - ts) < PROTECT_MS;
    });
    stats.removed += localOnly.length - protectedItems.length;

    // Count added/updated
    const localIds = new Set(local.map(l => String(l.id)));
    remote.forEach(r => {
      if (localIds.has(String(r.id))) stats.updated++;
      else stats.added++;
    });

    // Result: Sheet data (with preserved local arrays) + protected local items
    STATE[localKey] = [...remote, ...protectedItems];
  }

  if (d.horses)  applyArray('horses',  d.horses);
  if (d.waiting) applyArray('waiting', d.waiting);
  if (d.exams)   applyArray('exams',   d.exams);
  if (d.fins)    applyArray('fins',    d.fins);
  if (d.inps)    applyArray('inps',    d.inps);
  // Doctors: only replace if Sheet has doctors (otherwise keep local defaults)
  if (d.doctors && d.doctors.length) applyArray('doctors', d.doctors);
  if (d.staff)   applyArray('staff',   d.staff);

  return stats;
}



function bumpActivity() { /* no-op */ }

// ============================================================
// INIT
// ============================================================
function initApp() {
  setupNav();
  loadAll();
  updateBadges();
  renderDashboard();

  document.addEventListener('mousemove', bumpActivity, { passive: true });
  document.addEventListener('touchstart', bumpActivity, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) bumpActivity(); });
}

document.addEventListener('DOMContentLoaded', () => {
  // Disable pinch-zoom and double-tap zoom (iOS Safari)
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('gesturechange', e => e.preventDefault());
  document.addEventListener('gestureend', e => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd < 350) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  // Block ctrl+wheel zoom on desktop
  document.addEventListener('wheel', e => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
    }
  });

  try {
    loadAll();
  } catch(e) { console.error('loadAll failed', e); }
  setupLogin();
  // auto-login if user already logged in within last 8 hours
  try {
    if (STATE.user && STATE.user.loginAt && (nowMs() - STATE.user.loginAt) < 8*3600000) {
      $('#login').classList.add('hide');
      $('#app').style.display = 'flex';
      $('#hdr-sub').textContent = STATE.user.role + ' · ' + (STATE.user.phone||'');
      if ($('#drawer-sub')) $('#drawer-sub').textContent = STATE.user.role;
      initApp();
      applyRolePermissions();
      if (!canAccess(STATE.activePage || 'dashboard')) nav('dashboard');
    }
  } catch(e) { console.error('auto-login failed', e); }
});

// ============================================================
// FIREBASE FIRESTORE SYNC — Collection/Document архитектур
// Бүртгэл бүр тусдаа document — хязгааргүй өсөх боломжтой
//
// Бүтэц:
//   horses/{horseId}         — морь бүр тусдаа document
//   exams/{examId}           — үзлэг бүр тусдаа document
//   fins/{finId}             — санхүү бүр тусдаа document
//   inps/{inpId}             — хэвтэн бүр тусдаа document
//   waiting/{waitId}         — хүлээлт бүр тусдаа document
//   staff/{staffId}          — ажилтан бүр тусдаа document
//   doctors/{doctorId}       — эмч бүр тусдаа document
//   users/{userName}         — хэрэглэгч бүр тусдаа document
//   logs/{logId}             — лог бүр тусдаа document
//   deletedExams/{archId}    — устгасан үзлэг бүр тусдаа document
//   clinic_config/main       — тохиргоо (servicePrices, customServices...)
// ============================================================

// Firestore SDK функцүүд (firebase.js-ээс)
function _fbCol(name) {
  if (!window.__fbCol) return null;
  return window.__fbCol(name);
}
function _fbColDoc(colName, docId) {
  if (!window.__fbColDoc) return null;
  return window.__fbColDoc(colName, docId);
}

let __fbApplyingRemote = false;
let __fbApplyingTimer  = null;

// Waiting устгасан ID-уудын нэгдсэн бүртгэл
const __fbRemovedWaiting = new Set(
  (() => { try { return JSON.parse(localStorage.getItem('mt_removed_waiting') || '[]'); } catch(e) { return []; } })()
);
function _markWaitingRemoved(id) {
  if (!id) return;
  __fbRemovedWaiting.add(String(id));
  try { localStorage.setItem('mt_removed_waiting', JSON.stringify([...__fbRemovedWaiting])); } catch(e) {}
}

// Firestore-аас сүүлд ирсэн тооны бүртгэл (хоосон бичилтээс хамгаалах)
const __fbRemoteCount = {};

// softRefresh debounce — 500ms: анхны ачаалалд олон document ирэхэд нэг удаа render хийнэ
let __fbRefreshTimer = null;
let __fbInitialLoadDone = false; // анхны snapshot дуусах хүртэл render хийхгүй
function _fbDebouncedRefresh() {
  if (!__fbInitialLoadDone) return; // анхны ачаалал дуусаагүй бол алгасна
  clearTimeout(__fbRefreshTimer);
  __fbRefreshTimer = setTimeout(() => {
    if (STATE.user) softRefresh();
  }, 500);
}
// Анхны ачаалал — collection бүрийн эхний snapshot ирмэгц тэмдэглэнэ
// 3 секундын fixed delay биш, бодит snapshot тоолох аргыг ашиглана
const FB_COLLECTIONS_COUNT = 10; // horses, exams, fins, inps, waiting, staff, doctors, users, logs, deletedExams
let __fbSnapshotsDone = 0;
function _fbMarkInitialLoadDone() {
  // Backup: хэрэв snapshot бүх collection дээр ирэхгүй бол 5 секундын дараа нэг удаа render
  const backupTimer = setTimeout(() => {
    if (!__fbInitialLoadDone) {
      __fbInitialLoadDone = true;
      if (STATE.user) softRefresh();
    }
  }, 5000);
  // Snapshot counter — collection бүрийн эхний snapshot ирэхэд нэмэгдэнэ
  window.__fbOnFirstSnapshot = function() {
    __fbSnapshotsDone++;
    if (__fbSnapshotsDone >= FB_COLLECTIONS_COUNT && !__fbInitialLoadDone) {
      clearTimeout(backupTimer);
      __fbInitialLoadDone = true;
      if (STATE.user) softRefresh();
    }
  };
}

// ── Debounced localStorage save ────────────────────────────────
// Firestore-аас 1000 document ирэхэд 1000 удаа lsSet дуудахгүй.
// Сүүлийн document ирснээс 400ms хойш нэг удаа хадгална.
let __lsSaveTimer = null;
const __lsDirtyKeys = new Set(); // аль collection-уудыг хадгалах хэрэгтэйг тэмдэглэнэ

const LS_KEY_MAP = {
  horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
  inps: 'mt_inps', waiting: 'mt_waiting',
  staff: 'mt_staff_list', doctors: 'mt_doctors',
  users: 'mt_users', logs: 'mt_logs',
  deletedExams: 'mt_deleted_exams'
};

function _scheduleLsSave(colName) {
  if (colName) __lsDirtyKeys.add(colName);
  clearTimeout(__lsSaveTimer);
  __lsSaveTimer = setTimeout(() => {
    __lsDirtyKeys.forEach(col => {
      const lsKey = LS_KEY_MAP[col];
      if (!lsKey) return;
      if (col === 'users') lsSet(lsKey, STATE.users || []);
      else if (col === 'logs') lsSet(lsKey, STATE.logs || []);
      else if (col === 'deletedExams') lsSet(lsKey, STATE.deletedExams || []);
      else if (STATE[col] !== undefined) lsSet(lsKey, STATE[col] || []);
    });
    __lsDirtyKeys.clear();
  }, 400);
}


function fbWriteDoc(colName, docId, data) {
  if (!window.__fbSetDoc || !window.__fbColDoc) return Promise.resolve();
  const ref = window.__fbColDoc(colName, docId);
  return window.__fbSetDoc(ref, data)
    .then(() => { try { flashSync(); } catch(e){} })
    .catch(err => {
      console.error('[FB] ❌ ' + colName + '/' + docId + ' бичих алдаа:', err.message);
      try { toast('FB алдаа (' + colName + '): ' + err.message, 'err'); } catch(e){}
    });
}

// ── Нэг document устгах (deleteDoc) ──────────────────────────
function fbDeleteDoc(colName, docId) {
  if (!window.__fbDeleteDoc || !window.__fbColDoc) return Promise.resolve();
  const ref = window.__fbColDoc(colName, docId);
  return window.__fbDeleteDoc(ref)
    .catch(err => console.error('[FB] ❌ устгах алдаа ' + colName + '/' + docId + ':', err.message));
}

// ── Нэг бичлэгийг Firestore-д бичих ─────────────────────────
// colName: 'horses' | 'exams' | 'fins' | 'inps' | 'waiting' | 'staff' | 'doctors' | 'users' | 'logs' | 'deletedExams'
function fbSaveRecord(colName, record) {
  if (!record || !record.id) return Promise.resolve();
  const docId = String(record.id);
  const payload = Object.assign({}, record, {
    _updatedAt: Date.now(),
    _writer: window.__fbDeviceId || 'unknown'
  });
  return fbWriteDoc(colName, docId, payload);
}

// ── Бүх collection-г STATE-аас дахин бичих (migration/force) ─
function fbForcePush() {
  if (!window.__fbReady) { console.warn('[FB] Firebase бэлэн биш'); return; }
  console.log('[FB] Force push эхэллээ...');
  const colMap = {
    horses: STATE.horses || [],
    exams: STATE.exams || [],
    fins: STATE.fins || [],
    inps: STATE.inps || [],
    waiting: STATE.waiting || [],
    staff: STATE.staff || [],
    doctors: STATE.doctors || [],
    logs: STATE.logs || [],
    deletedExams: STATE.deletedExams || [],
  };
  const promises = [];
  for (const [col, arr] of Object.entries(colMap)) {
    for (const rec of arr) {
      if (rec && rec.id) promises.push(fbSaveRecord(col, rec));
    }
  }
  // users: name-ийг ID болгоно
  for (const u of (STATE.users || [])) {
    if (u && u.name) {
      promises.push(fbWriteDoc('users', u.name, Object.assign({}, u, {
        _updatedAt: Date.now(), _writer: window.__fbDeviceId || 'unknown'
      })));
    }
  }
  // clinic_config
  promises.push(fbWriteDoc('clinic_config', 'main', {
    servicePrices: STATE.servicePrices || {},
    customServices: STATE.customServices || [],
    removedServices: STATE.removedServices || [],
    staffSchedule: STATE.staffSchedule || {},
    _updatedAt: Date.now()
  }));
  Promise.all(promises).then(() => {
    const total = promises.length;
    console.log('[FB] Force push дууслаа. Бичсэн:', total, 'document');
    try { toast('✅ Firestore-д бичлаа: ' + total + ' document', 'ok'); } catch(e){}
  });
}
window.fbForcePush = fbForcePush;

// ── fbPushNow — тодорхой collection-уудыг STATE-аас дахин бичих ─
// Хуучин кодтой нийцтэй байлгах — ['horses','exams_h1','exams_h2','fins',...] гэж дуудагдана
// fbPushNow() — хуучин дуудлагуудтай нийцтэй байлгах no-op.
// Бичих нь call site дээр fbSaveRecord(col, record) -ээр шууд хийгдэнэ.
function fbPushNow(keys) { /* no-op: writes now happen via fbSaveRecord at call site */ }

// fbPush() — хуучин код дуудах газруудтай нийцтэй байлгах no-op.
// Firestore руу бичих нь fbSaveRecord(col, record) -ээр л хийгдэнэ.
// fbForcePush() нь зөвхөн Admin гараар дуудах тохиолдолд ажиллана.
let __fbAllTimer = null;
function fbPush() { /* no-op: use fbSaveRecord() for targeted writes */ }

// ── flashSync helper ───────────────────────────────────────────
function flashSync() {
  try {
    const el = document.getElementById('sync-dot');
    if (!el) return;
    el.classList.add('synced');
    clearTimeout(window.__flashSyncTimer);
    window.__flashSyncTimer = setTimeout(() => el.classList.remove('synced'), 1500);
  } catch(e) {}
}

// ── Firestore-ээс ирсэн document-г STATE-д нэгтгэх ───────────
function fbApplyRecord(colName, docData) {
  if (!docData) return;
  __fbApplyingRemote = true;
  try {
    if (colName === 'clinic_config') {
      if (docData.servicePrices && typeof docData.servicePrices === 'object') {
        STATE.servicePrices = docData.servicePrices;
      }
      if (Array.isArray(docData.customServices)) {
        const set = new Set([...(STATE.customServices || []), ...docData.customServices].map(String));
        STATE.customServices = [...set];
      }
      if (Array.isArray(docData.removedServices)) {
        const set = new Set([...(STATE.removedServices || []), ...docData.removedServices].map(String));
        STATE.removedServices = [...set];
      }
      if (docData.staffSchedule && typeof docData.staffSchedule === 'object') {
        STATE.staffSchedule = docData.staffSchedule;
      }
      lsSet('mt_service_prices', STATE.servicePrices);
      lsSet('mt_custom_services', STATE.customServices);
      lsSet('mt_removed_services', STATE.removedServices);
      lsSet('mt_staff_schedule', STATE.staffSchedule);
      try { if (STATE.activePage === 'admin' && typeof renderServicePrices === 'function') renderServicePrices(); } catch(e){}
      return;
    }

    if (colName === 'users') {
      // users: name-ийг ID болгосон — document data нь хэрэглэгчийн объект
      const u = docData;
      if (!u.name) return;
      const existing = (STATE.users || []).findIndex(x => x.name === u.name);
      if (existing >= 0) {
        const lc = STATE.users[existing];
        const remoteMs = parseFloat(u._updatedAt) || 0;
        const localMs  = parseFloat(lc._updatedAt) || 0;
        if (remoteMs > localMs) {
          // pwHash хадгална — pw (plain text) хэзээ ч merge хийхгүй
          STATE.users[existing] = Object.assign({}, u, { pwHash: u.pwHash || lc.pwHash || '' });
          // Шилжилтийн үе: хуучин pw талбар байвал хадгалж үлдээнэ
          if (!u.pwHash && (u.pw || lc.pw)) STATE.users[existing].pw = u.pw || lc.pw;
        }
      } else {
        if (!STATE.users) STATE.users = [];
        STATE.users.push(u);
      }
      _scheduleLsSave('users');
      try { populateLoginUsers(); } catch(e){}
      try { if (STATE.activePage === 'admin' && typeof renderUserList === 'function') renderUserList(); } catch(e){}
      return;
    }

    if (colName === 'logs') {
      const l = docData;
      if (!l.id) return;
      if (!STATE.logs) STATE.logs = [];
      const idx = STATE.logs.findIndex(x => x.id === l.id);
      if (idx < 0) STATE.logs.push(l);
      if (STATE.logs.length > LOG_DISPLAY_LIMIT) STATE.logs = STATE.logs.slice(-LOG_DISPLAY_LIMIT);
      _scheduleLsSave('logs');
      try { if (STATE.activePage === 'admin' && typeof renderLogViewer === 'function') renderLogViewer(); } catch(e){}
      return;
    }

    if (colName === 'deletedExams') {
      const a = docData;
      const key = String(a._archId || (a.exam && a.exam.id) || a.deletedAt || '');
      if (!key) return;
      if (!STATE.deletedExams) STATE.deletedExams = [];
      const idx = STATE.deletedExams.findIndex(x => {
        const k = String(x._archId || (x.exam && x.exam.id) || x.deletedAt || '');
        return k === key;
      });
      if (idx < 0) STATE.deletedExams.push(a);
      if (STATE.deletedExams.length > 500) STATE.deletedExams = STATE.deletedExams.slice(-500);
      _scheduleLsSave('deletedExams');
      try { if (STATE.activePage === 'admin' && typeof renderDeletedExams === 'function') renderDeletedExams(); } catch(e){}
      return;
    }

    if (colName === 'waiting') {
      const r = normalizeRow(docData);
      if (!r || r.id == null) return;
      // Устгасан бол алгасна
      if (__fbRemovedWaiting.has(String(r.id))) return;
      if (!STATE.waiting) STATE.waiting = [];
      const idx = STATE.waiting.findIndex(x => String(x.id) === String(r.id));
      if (idx < 0) {
        STATE.waiting.push(r);
      } else {
        const lc = STATE.waiting[idx];
        const remoteMs = parseFloat(r.ms) || 0;
        const localMs  = parseFloat(lc.ms) || 0;
        if (remoteMs >= localMs) STATE.waiting[idx] = r;
      }
      _scheduleLsSave('waiting');
      return;
    }

    // Ерөнхий тохиолдол: horses, exams, fins, inps, staff, doctors
    const lsKeyMap = {
      horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
      inps: 'mt_inps', staff: 'mt_staff_list', doctors: 'mt_doctors'
    };
    const r = normalizeRow(docData);
    if (!r || r.id == null) return;
    // Устгасан бол алгасна
    if (STATE.deletedIds instanceof Set && STATE.deletedIds.has(String(r.id))) return;
    if (!STATE[colName]) STATE[colName] = [];
    const idx = STATE[colName].findIndex(x => String(x.id) === String(r.id));
    if (idx < 0) {
      STATE[colName].push(r);
    } else {
      const lc = STATE[colName][idx];
      const remoteMs = parseFloat(r.ms) || 0;
      const localMs  = parseFloat(lc.ms) || 0;
      if (remoteMs >= localMs) {
        // Remote шинэ — array талбаруудыг хамгаалж нэгтгэнэ
        const ARRAY_FIELDS = ['prepayments','payments','log','services','meds','images'];
        ARRAY_FIELDS.forEach(f => {
          if ((!Array.isArray(r[f]) || r[f].length === 0) && Array.isArray(lc[f]) && lc[f].length) r[f] = lc[f];
        });
        STATE[colName][idx] = r;
      }
    }
    _scheduleLsSave(colName);

  } catch(e) {
    console.error('[FB] fbApplyRecord алдаа (' + colName + '):', e);
  } finally {
    clearTimeout(__fbApplyingTimer);
    __fbApplyingTimer = setTimeout(() => { __fbApplyingRemote = false; }, 200);
  }
  updateBadges();
  _fbDebouncedRefresh();
  try { flashSync(); } catch(e){}
}

// ── Устгагдсан document-г STATE-аас хасах ────────────────────
function fbRemoveRecord(colName, docId) {
  __fbApplyingRemote = true;
  try {
    if (colName === 'waiting') {
      STATE.waiting = (STATE.waiting || []).filter(x => String(x.id) !== String(docId));
      _markWaitingRemoved(docId);
      _scheduleLsSave('waiting');
    } else if (STATE[colName] && Array.isArray(STATE[colName])) {
      STATE[colName] = STATE[colName].filter(x => String(x.id) !== String(docId));
      STATE.deletedIds.add(String(docId));
      const lsKeyMap = {
        horses: 'mt_horses', exams: 'mt_exams', fins: 'mt_fins',
        inps: 'mt_inps', staff: 'mt_staff_list', doctors: 'mt_doctors'
      };
      _scheduleLsSave(colName);
    }
  } catch(e) {
    console.error('[FB] fbRemoveRecord алдаа:', e);
  } finally {
    clearTimeout(__fbApplyingTimer);
    __fbApplyingTimer = setTimeout(() => { __fbApplyingRemote = false; }, 200);
  }
  updateBadges();
  _fbDebouncedRefresh();
}

// ── onSnapshot — collection бүрийг сонсох ─────────────────────
const __fbUnsubs = {};

const FB_COLLECTIONS = [
  'horses', 'exams', 'fins', 'inps', 'waiting',
  'staff', 'doctors', 'users', 'logs', 'deletedExams'
];

function fbStartListening() {
  if (!window.__fbReady || !window.__fbColListen) return;
  _fbMarkInitialLoadDone(); // анхны ачаалал дуусах хүртэл render хийхгүй

  // clinic_config — нэг document
  if (!__fbUnsubs['clinic_config'] && window.__fbDocListen && window.__fbColDoc) {
    __fbUnsubs['clinic_config'] = window.__fbDocListen(
      window.__fbColDoc('clinic_config', 'main'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (data._writer === window.__fbDeviceId && (Date.now() - (data._updatedAt||0)) < 5000) return;
        fbApplyRecord('clinic_config', data);
      },
      (err) => console.error('[FB] clinic_config сонсох алдаа:', err)
    );
  }

  // users — нэг удаа getDoc хийж хурдан ачаалах
  if (window.__fbGetDoc && window.__fbColDoc && !(STATE.users && STATE.users.length)) {
    // users collection-г query хийж бүгдийг татна
    if (window.__fbColQuery) {
      window.__fbColQuery('users').then(docs => {
        docs.forEach(d => fbApplyRecord('users', d.data()));
      }).catch(() => {});
    }
  }

  // Collection бүрийг сонсох — эхний snapshot ирмэгц __fbOnFirstSnapshot дуудна
  FB_COLLECTIONS.forEach(colName => {
    if (__fbUnsubs[colName]) return;
    let _firstSnap = false; // энэ collection-ийн эхний snapshot ирсэн эсэх
    __fbUnsubs[colName] = window.__fbColListen(colName, (changes) => {
      // Эхний snapshot тэмдэглэх
      if (!_firstSnap) {
        _firstSnap = true;
        if (typeof window.__fbOnFirstSnapshot === 'function') window.__fbOnFirstSnapshot();
      }
      changes.forEach(({ type, docId, data }) => {
        if (type === 'removed') {
          fbRemoveRecord(colName, docId);
        } else {
          if (data._writer === window.__fbDeviceId && (Date.now() - (data._updatedAt||0)) < 5000) return;
          fbApplyRecord(colName, data);
        }
      });
    }, (err) => console.error('[FB] onSnapshot алдаа (' + colName + '):', err));
  });
}

// ── fbFlashSync helper (UI dot) ────────────────────────────────
window.fbForcePush = fbForcePush;
window.fbPushNow   = fbPushNow;
window.fbPush      = fbPush;

// saveAll() — зөвхөн localStorage cache хадгалана.
// Firebase руу бичихгүй — тэр нь fbSaveRecord(col, record) -ээр хийгдэнэ.
// fbForcePush() нь зөвхөн Admin migration/emergency-д ашиглагдана.

// Firebase бэлэн болмогц сонсож эхлэх
if (window.__fbReady) {
  fbStartListening();
} else {
  window.addEventListener('firebase-ready', fbStartListening, { once: true });
}

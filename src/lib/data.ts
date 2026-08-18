// Mock ma'lumotlar qatlami. REST API ga ulanishga tayyor struktura:
// har bir tur backend DTO bilan bir xil bo'lishi ko'zda tutilgan.

export type Rol = "mijoz" | "usta" | "admin";

export type Kategoriya = {
  id: string;
  slug: string;
  nom: string;
  emoji: string;
  tavsif: string;
  ustalarSoni: number;
};

export type BandlikHolati = "bo'sh" | "band";

export type Usta = {
  id: string;
  ism: string;
  kategoriyaSlug: string;
  reyting: number;
  sharhlarSoni: number;
  tajribaYili: number;
  viloyat: string;
  shahar: string;
  telefon: string;
  ishVaqti: string;
  narxdan: number;
  bandlik: BandlikHolati;
  vip: boolean;
  yangi: boolean;
  haqida: string;
  konikmalar: string[];
  bajarilganIshlar: number;
  rasm: string;
  portfolio: { id: string; sarlavha: string; rasm: string }[];
  sharhlar: { id: string; mijoz: string; yulduz: number; matn: string; sana: string }[];
};

export type BuyurtmaStatus =
  | "kutilmoqda"
  | "qabul qilindi"
  | "jarayonda"
  | "tugallandi"
  | "bekor qilindi";

export type Buyurtma = {
  id: string;
  xizmat: string;
  ustaId: string;
  ustaIsmi: string;
  mijoz: string;
  sana: string;
  vaqt: string;
  manzil: string;
  narx: number;
  status: BuyurtmaStatus;
};

export const VILOYATLAR = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand",
  "Buxoro",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Qashqadaryo",
  "Surxondaryo",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Xorazm",
  "Qoraqalpog'iston",
];

export const KATEGORIYALAR: Kategoriya[] = [
  { id: "1", slug: "santexnik", nom: "Santexnik", emoji: "🔧", tavsif: "Suv, kanalizatsiya va isitish tizimlari", ustalarSoni: 842 },
  { id: "2", slug: "elektrik", nom: "Elektrik", emoji: "⚡", tavsif: "Simlash, rozetka, shchit va yoritish", ustalarSoni: 731 },
  { id: "3", slug: "qurilish-ustasi", nom: "Qurilish ustasi", emoji: "🏠", tavsif: "Ta'mirlash, g'isht, gipsokarton ishlari", ustalarSoni: 1240 },
  { id: "4", slug: "boyoqchi", nom: "Bo'yoqchi", emoji: "🎨", tavsif: "Devor bo'yash, shpaklyovka, oboy", ustalarSoni: 518 },
  { id: "5", slug: "duradgor", nom: "Duradgor", emoji: "🪚", tavsif: "Mebel, eshik, yog'och ishlari", ustalarSoni: 396 },
  { id: "6", slug: "konditsioner-ustasi", nom: "Konditsioner ustasi", emoji: "❄️", tavsif: "O'rnatish, tozalash va ta'mirlash", ustalarSoni: 287 },
  { id: "7", slug: "avto-usta", nom: "Avto usta", emoji: "🚗", tavsif: "Dvigatel, xodovoy va diagnostika", ustalarSoni: 654 },
  { id: "8", slug: "telefon-tamirlash", nom: "Telefon ta'mirlash", emoji: "📱", tavsif: "Ekran, batareya va platalar", ustalarSoni: 342 },
  { id: "9", slug: "kompyuter-ustasi", nom: "Kompyuter ustasi", emoji: "💻", tavsif: "Windows, tozalash, komplektlash", ustalarSoni: 268 },
  { id: "10", slug: "tozalash-xizmati", nom: "Tozalash xizmati", emoji: "🧹", tavsif: "Kvartira, ofis va keyingi tozalash", ustalarSoni: 412 },
];

const ISMLAR = [
  "Sardor Rahimov",
  "Jasur Karimov",
  "Bekzod To'xtayev",
  "Aziz Yo'ldoshev",
  "Otabek Ergashev",
  "Dilshod Nazarov",
  "Shuhrat Qodirov",
  "Ulug'bek Sultonov",
  "Farrux Ismoilov",
  "Javohir Alimov",
  "Nodir Xolmatov",
  "Rustam Yusupov",
  "Akmal Tursunov",
  "Sanjar Mirzayev",
  "Doniyor Saidov",
  "Elyor Qosimov",
  "Temur Abdullayev",
  "Iskandar Norov",
  "Kamron Rashidov",
  "Muzaffar Hakimov",
];

const SHAHARLAR = ["Chilonzor", "Yunusobod", "Mirzo Ulug'bek", "Sergeli", "Yakkasaroy", "Olmazor"];

const SHARH_MATNLARI = [
  "Ishni juda sifatli va o'z vaqtida bajardi. Rahmat!",
  "Narxi hamyonbop, muomalasi a'lo. Tavsiya qilaman.",
  "Kelishilgan vaqtda keldi, hamma narsani tozalab ketdi.",
  "Professional yondashuv. Yana murojaat qilaman.",
  "Muammoni tez aniqladi va hal qildi.",
];

function at<T>(arr: T[], i: number): T {
  return arr[((i % arr.length) + arr.length) % arr.length] as T;
}

function rasm(seed: string) {
  return `https://i.pravatar.cc/400?u=${seed}`;
}

function ishRasmi(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

export const USTALAR: Usta[] = Array.from({ length: 40 }, (_, i) => {
  const kat = at(KATEGORIYALAR, i);
  const reyting = Number((4.1 + ((i * 7) % 9) / 10).toFixed(1));
  const ism = at(ISMLAR, i);
  return {
    id: `usta-${i + 1}`,
    ism,
    kategoriyaSlug: kat.slug,
    reyting: reyting > 5 ? 5 : reyting,
    sharhlarSoni: 12 + ((i * 17) % 240),
    tajribaYili: 2 + (i % 18),
    viloyat: at(VILOYATLAR, i % 4),
    shahar: at(SHAHARLAR, i),
    telefon: `+998 9${i % 9} ${100 + i} ${10 + i} ${20 + (i % 70)}`,
    ishVaqti: i % 3 === 0 ? "24/7" : "09:00 - 20:00",
    narxdan: 80000 + (i % 12) * 25000,
    bandlik: i % 4 === 0 ? "band" : "bo'sh",
    vip: i % 5 === 0,
    yangi: i >= 32,
    haqida: `${kat.nom} sohasida ${2 + (i % 18)} yillik tajribaga ega mutaxassis. Kafolat bilan, toza va aniq ishlayman. Toshkent bo'ylab chaqiruvga chiqaman.`,
    konikmalar: ["Kafolatli ish", "Materiallar yetkazish", "Bepul chaqiruv", "Tez xizmat"].slice(0, 2 + (i % 3)),
    bajarilganIshlar: 20 + ((i * 31) % 480),
    rasm: rasm(`usta-${i + 1}`),
    portfolio: Array.from({ length: 4 }, (_, j) => ({
      id: `p-${i}-${j}`,
      sarlavha: `${kat.nom} ishi #${j + 1}`,
      rasm: ishRasmi(`u${i}p${j}`),
    })),
    sharhlar: Array.from({ length: 3 }, (_, j) => ({
      id: `s-${i}-${j}`,
      mijoz: at(ISMLAR, i + j + 3),
      yulduz: 5 - (j % 2),
      matn: at(SHARH_MATNLARI, i + j),
      sana: `${10 + j} ${at(["yanvar", "fevral", "mart", "aprel"], i + j)} 2026`,
    })),
  } satisfies Usta;
});

export const BUYURTMALAR: Buyurtma[] = Array.from({ length: 8 }, (_, i) => {
  const usta = at(USTALAR, i * 3);
  const statuslar: BuyurtmaStatus[] = [
    "kutilmoqda",
    "qabul qilindi",
    "jarayonda",
    "tugallandi",
    "bekor qilindi",
  ];
  return {
    id: `#${2140 + i}`,
    xizmat: at(KATEGORIYALAR, i).nom,
    ustaId: usta.id,
    ustaIsmi: usta.ism,
    mijoz: at(ISMLAR, i + 5),
    sana: `${5 + i} avgust 2026`,
    vaqt: `${9 + (i % 8)}:00`,
    manzil: `Toshkent, ${at(SHAHARLAR, i)} tumani`,
    narx: 120000 + i * 45000,
    status: at(statuslar, i),
  } satisfies Buyurtma;
});

export const SUHBATLAR = [
  {
    id: "c1",
    ism: at(USTALAR, 0).ism,
    rasm: at(USTALAR, 0).rasm,
    oxirgi: "Ertaga soat 10:00 da yetib boraman.",
    vaqt: "12:40",
    oqilmagan: 2,
  },
  {
    id: "c2",
    ism: at(USTALAR, 3).ism,
    rasm: at(USTALAR, 3).rasm,
    oxirgi: "Rasmni yuboring, ko'rib chiqaman.",
    vaqt: "11:05",
    oqilmagan: 0,
  },
  {
    id: "c3",
    ism: at(USTALAR, 7).ism,
    rasm: at(USTALAR, 7).rasm,
    oxirgi: "Rahmat, ish yakunlandi ✅",
    vaqt: "Kecha",
    oqilmagan: 0,
  },
];

export const XABARLAR = [
  { id: "m1", meniki: false, matn: "Assalomu alaykum! Buyurtmangizni ko'rdim.", vaqt: "12:31" },
  { id: "m2", meniki: true, matn: "Vaalaykum assalom. Kranda suv oqmoqda.", vaqt: "12:33" },
  { id: "m3", meniki: false, matn: "Tushunarli. Rasmini yuborasizmi?", vaqt: "12:35" },
  { id: "m4", meniki: true, matn: "Ha, hozir yuboraman.", vaqt: "12:36", rasm: true },
  { id: "m5", meniki: false, matn: "Ertaga soat 10:00 da yetib boraman.", vaqt: "12:40" },
];

export const MIJOZ_FIKRLARI = [
  {
    id: "f1",
    ism: "Nilufar Ahmedova",
    shahar: "Toshkent",
    matn: "30 daqiqada santexnik topdim. Ilgari kunlab qidirardim. Endi faqat UstaTop.",
    yulduz: 5,
    rasm: rasm("mijoz-1"),
  },
  {
    id: "f2",
    ism: "Bobur Sattorov",
    shahar: "Samarqand",
    matn: "Reyting va sharhlar juda foydali. Ishonchli usta tanlash osonlashdi.",
    yulduz: 5,
    rasm: rasm("mijoz-2"),
  },
  {
    id: "f3",
    ism: "Malika Yusupova",
    shahar: "Buxoro",
    matn: "Narxlar oldindan ko'rinadi, kelishmovchilik bo'lmadi. Ajoyib platforma.",
    yulduz: 4,
    rasm: rasm("mijoz-3"),
  },
];

export const HAMKORLAR = ["Uzum", "Payme", "Click", "Artel", "Korzinka", "Beeline"];

export function ustaniOl(id: string) {
  return USTALAR.find((u) => u.id === id);
}

export function kategoriyaniOl(slug: string) {
  return KATEGORIYALAR.find((k) => k.slug === slug);
}

export function narxFormat(qiymat: number) {
  return `${qiymat.toLocaleString("uz-UZ").replace(/,/g, " ")} so'm`;
}
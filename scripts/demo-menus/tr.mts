import type { DemoMenu } from "./types.mts";

// A typical Turkish café menu, priced in TRY.
export const menu: DemoMenu = [
  {
    category: "Kahvaltı",
    items: [
      {
        name: "Serpme Kahvaltı (2 kişilik)",
        price: "650",
        description: "Peynir çeşitleri, zeytin, bal-kaymak, reçel, sucuklu yumurta, sınırsız çay",
        image: "serpme-kahvalti.webp",
      },
      { name: "Menemen", price: "180", description: "Domates, biber ve köy yumurtası; isteğe göre soğanlı", image: "menemen.webp" },
      { name: "Sucuklu Yumurta", price: "200", description: "Bakır sahanda kasap sucuk ve iki yumurta" },
      { name: "Simit Tabağı", price: "120", description: "Taze simit, beyaz peynir, domates, salatalık", image: "simit-tabagi.webp" },
    ],
  },
  {
    category: "Sıcak İçecekler",
    items: [
      { name: "Çay", price: "20", description: "İnce belli bardakta demlik çay", image: "cay.webp" },
      { name: "Türk Kahvesi", price: "70", description: "Yanında lokum ile", image: "turk-kahvesi.webp" },
      { name: "Espresso", price: "65" },
      { name: "Latte", price: "90", description: "Çift shot espresso ve buharla ısıtılmış süt", image: "latte.webp" },
      { name: "Sahlep", price: "95", description: "Tarçınlı, kış aylarına özel", soldOut: true },
    ],
  },
  {
    category: "Soğuk İçecekler",
    items: [
      { name: "Ev Yapımı Limonata", price: "85", description: "Taze sıkılmış limon ve nane", image: "limonata.webp" },
      { name: "Iced Latte", price: "100", image: "iced-latte.webp" },
      { name: "Ayran", price: "40" },
      { name: "Soda", price: "30" },
    ],
  },
  {
    category: "Tatlılar",
    items: [
      { name: "San Sebastian Cheesecake", price: "160", description: "Çikolata sosu ile servis edilir", image: "cheesecake.webp" },
      { name: "Fıstıklı Baklava (4 dilim)", price: "220", description: "Antep fıstığı ile", image: "baklava.webp" },
      { name: "Brownie", price: "120", description: "Sıcak servis, yanında dondurma", image: "brownie.webp" },
      { name: "Sütlaç", price: "95", description: "Fırında, üzeri fındıklı" },
    ],
  },
  {
    category: "Atıştırmalıklar",
    items: [
      { name: "Kaşarlı Tost", price: "110" },
      {
        name: "Patates Kızartması",
        price: "90",
        description: "Baharatlı, yanında ketçap ve mayonez",
        image: "patates-kizartmasi.webp",
      },
      { name: "Mevsim Salata", price: "130", description: "Akdeniz yeşillikleri, nar ekşili sos" },
    ],
  },
];

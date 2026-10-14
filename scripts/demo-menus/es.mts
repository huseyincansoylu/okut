import type { DemoMenu } from "./types.mts";

// A typical Madrid café menu, priced in EUR.
export const menu: DemoMenu = [
  {
    category: "Desayunos",
    items: [
      {
        name: "Churros con chocolate",
        price: "4.50",
        description: "Seis churros recién hechos con chocolate caliente",
        image: "churros.webp",
      },
      {
        name: "Tostada con tomate",
        price: "3.50",
        description: "Pan tostado con tomate rallado y aceite de oliva virgen extra",
        image: "tostada-tomate.webp",
      },
      { name: "Pincho de tortilla", price: "4.00", description: "Tortilla de patatas casera, con o sin cebolla", image: "tortilla.webp" },
      { name: "Croissant a la plancha", price: "2.50", description: "Con mantequilla y mermelada" },
    ],
  },
  {
    category: "Bebidas calientes",
    items: [
      { name: "Café con leche", price: "1.80", image: "cafe-con-leche.webp" },
      { name: "Cortado", price: "1.50" },
      { name: "Café solo", price: "1.30" },
      { name: "Chocolate a la taza", price: "2.80", description: "Espeso, como para mojar churros" },
    ],
  },
  {
    category: "Bebidas frías",
    items: [
      { name: "Zumo de naranja natural", price: "3.00", description: "Recién exprimido", image: "zumo-naranja.webp" },
      { name: "Horchata", price: "3.00", description: "Horchata de chufa de Valencia, bien fría" },
      { name: "Leche merengada", price: "3.00", description: "Especial de verano", soldOut: true },
      { name: "Agua con gas", price: "1.80" },
    ],
  },
  {
    category: "Tapas",
    items: [
      { name: "Patatas bravas", price: "5.50", description: "Con salsa brava picante y alioli", image: "patatas-bravas.webp" },
      { name: "Croquetas de jamón", price: "6.50", description: "Seis croquetas caseras de jamón ibérico", image: "croquetas.webp" },
      { name: "Calamares a la romana", price: "7.50", description: "Rebozados y crujientes, con limón y alioli", image: "calamares.webp" },
      { name: "Jamón ibérico", price: "14.00", description: "Ración cortada a cuchillo, con pan", image: "jamon-iberico.webp" },
    ],
  },
  {
    category: "Postres",
    items: [
      {
        name: "Tarta de queso",
        price: "5.00",
        description: "Al estilo de San Sebastián, cremosa por dentro",
        image: "tarta-de-queso.webp",
      },
      { name: "Crema catalana", price: "4.50", description: "Con azúcar caramelizado al momento", image: "crema-catalana.webp" },
      { name: "Flan casero", price: "3.50", description: "Con caramelo y nata" },
      { name: "Torrijas", price: "4.00", description: "Pan empapado en leche, frito y con canela" },
    ],
  },
];

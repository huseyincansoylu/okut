import type { DemoMenu } from "./types.mts";

// A typical London café menu, priced in GBP.
export const menu: DemoMenu = [
  {
    category: "Breakfast",
    items: [
      {
        name: "Full English Breakfast",
        price: "12.50",
        description: "Bacon, sausage, fried eggs, baked beans, grilled tomato, mushrooms and toast",
        image: "full-english.webp",
      },
      {
        name: "Eggs Benedict",
        price: "9.50",
        description: "Poached eggs, ham and hollandaise on a toasted English muffin",
        image: "eggs-benedict.webp",
      },
      {
        name: "Avocado Toast",
        price: "8.50",
        description: "Smashed avocado, chilli flakes and a poached egg on sourdough",
        image: "avocado-toast.webp",
      },
      { name: "Bacon Butty", price: "6.00", description: "Crispy back bacon in a soft white roll, with brown sauce or ketchup" },
    ],
  },
  {
    category: "Hot Drinks",
    items: [
      { name: "English Breakfast Tea", price: "2.80", description: "A proper brew, served with milk", image: "breakfast-tea.webp" },
      { name: "Flat White", price: "3.40", description: "Double ristretto with velvety steamed milk", image: "flat-white.webp" },
      { name: "Cappuccino", price: "3.30" },
      { name: "Hot Chocolate", price: "3.50", description: "With whipped cream and marshmallows", image: "hot-chocolate.webp" },
      { name: "Pumpkin Spice Latte", price: "4.20", description: "Autumn special", soldOut: true },
    ],
  },
  {
    category: "Cold Drinks",
    items: [
      { name: "Homemade Lemonade", price: "3.50", description: "Freshly squeezed lemons and mint" },
      { name: "Iced Latte", price: "3.80" },
      { name: "Elderflower Pressé", price: "3.20", description: "Sparkling elderflower, lightly sweet" },
    ],
  },
  {
    category: "Cakes & Bakes",
    items: [
      {
        name: "Scones with Clotted Cream & Jam",
        price: "4.50",
        description: "Two fruit scones, Cornish clotted cream and strawberry jam",
        image: "scones.webp",
      },
      { name: "Victoria Sponge", price: "4.00", description: "Layers of sponge, strawberry jam and cream", image: "victoria-sponge.webp" },
      {
        name: "Sticky Toffee Pudding",
        price: "6.50",
        description: "Served warm with toffee sauce and vanilla ice cream",
        image: "sticky-toffee-pudding.webp",
      },
      { name: "Carrot Cake", price: "4.00", description: "With cream cheese frosting and walnuts" },
    ],
  },
  {
    category: "Lunch",
    items: [
      {
        name: "Fish & Chips",
        price: "14.00",
        description: "Beer-battered cod, chips, mushy peas and tartare sauce",
        image: "fish-and-chips.webp",
      },
      {
        name: "Ploughman's Lunch",
        price: "9.50",
        description: "Mature cheddar, ham, pickle, apple and crusty bread",
        image: "ploughmans.webp",
      },
      { name: "Jacket Potato with Cheese & Beans", price: "7.50" },
      { name: "Soup of the Day", price: "6.00", description: "Served with buttered bread" },
    ],
  },
];

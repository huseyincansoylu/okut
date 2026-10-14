export type DemoItem = {
  name: string;
  /** Decimal string in the shop's currency, e.g. "3.50". */
  price: string;
  description?: string;
  soldOut?: boolean;
  /** File in scripts/demo-images/<language>/. */
  image?: string;
};

export type DemoMenu = { category: string; items: DemoItem[] }[];

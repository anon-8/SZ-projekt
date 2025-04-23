export interface BOMItem {
  name: string;
  quantity: number;
  level: number;
  children?: BOMItem[];
}

export const doorBOM: BOMItem = {
  name: "Drzwi",
  quantity: 1,
  level: 0,
  children: [
    {
      name: "Skrzydło drzwiowe",
      quantity: 1,
      level: 1,
      children: [
        { name: "Rama", quantity: 1, level: 2 },
        { name: "Wypełnienie", quantity: 1, level: 2 },
        { name: "Okleina", quantity: 1, level: 2 },
      ],
    },
    { name: "Zamek", quantity: 1, level: 1 },
    { name: "Klamka", quantity: 2, level: 1 },
  ],
};

export function expandBOM(bom: BOMItem, multiplier: number = 1): { name: string; quantity: number; level: number }[] {
  let list: { name: string; quantity: number; level: number }[] = [];
  if (bom.children) {
    bom.children.forEach((child) => {
      const totalQuantity = child.quantity * multiplier;
      list.push({ name: child.name, quantity: totalQuantity, level: child.level });
      if (child.children) {
        list = list.concat(expandBOM(child, totalQuantity));
      }
    });
  }
  return list;
}

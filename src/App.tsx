// App.tsx
import React, { useState } from "react";
import BOMDisplay from "./components/BOMDisplay";
import GHPForm from "./components/GHPForm";
import InventoryForm from "./components/InventoryForm";
import MRPTables from "./components/MRPTables";
import { calculateMRP, MRPItem } from "./utils/mrp";
import { GHPWeek } from "./utils/ghp";
import { doorBOM, expandBOM } from "./utils/bom";

const ITEM_CONFIGS = {
  "Skrzydło drzwiowe": { realizationTime: 2, leadTime: 1, lotSize: 10, qtyPerUnit: 1 },
  Rama: { realizationTime: 2, leadTime: 1, lotSize: 80, qtyPerUnit: 1 },
  Wypełnienie: { realizationTime: 2, leadTime: 1, lotSize: 10, qtyPerUnit: 1 },
  Okleina: { realizationTime: 1, leadTime: 1, lotSize: 20, qtyPerUnit: 1 },
  Zamek: { realizationTime: 3, leadTime: 0, lotSize: 40, qtyPerUnit: 1 },
  Klamka: { realizationTime: 1, leadTime: 1, lotSize: 30, qtyPerUnit: 2 },
};

const App: React.FC = () => {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [mrpItems, setMRPItems] = useState<MRPItem[]>([]);

  const handleInventoryUpdate = (newInventory: Record<string, number>) => {
    setInventory(newInventory);
  };

  const handleGHPCalculation = (results: GHPWeek[]) => {
    const bomItems = expandBOM(doorBOM).filter((item) => item.name in ITEM_CONFIGS);
    const mrpResults = bomItems.map((bomItem) => {
      const config = ITEM_CONFIGS[bomItem.name as keyof typeof ITEM_CONFIGS];

      const parentItem = bomItems.find(
        (item) =>
          item.level === bomItem.level - 1 &&
          doorBOM.children?.some(
            (child) =>
              child.name === item.name && child.children?.some((grandChild) => grandChild.name === bomItem.name)
          )
      );

      const parentRealizationTime = parentItem
        ? ITEM_CONFIGS[parentItem.name as keyof typeof ITEM_CONFIGS].realizationTime
        : 0;

      const mrpItem = calculateMRP(
        results,
        inventory[bomItem.name] || 0,
        {
          ...config,
          bomLevel: bomItem.level,
          isProductionItem: true,
        },
        parentRealizationTime
      );
      mrpItem.name = bomItem.name;
      return mrpItem;
    });

    setMRPItems(mrpResults);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MRP & GHP Simulation for Drzwi</h1>
      <BOMDisplay />
      <InventoryForm onInventoryUpdate={handleInventoryUpdate} />
      <GHPForm onCalculate={handleGHPCalculation} />
      {mrpItems.length > 0 && <MRPTables items={mrpItems} />}
    </div>
  );
};

export default App;

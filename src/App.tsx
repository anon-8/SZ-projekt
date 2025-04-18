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
  "Skrzydło drzwiowe": { realizationTime: 2, lotSize: 40, qtyPerUnit: 1 },
  Rama: { realizationTime: 2, lotSize: 80, qtyPerUnit: 1 },
  Wypełnienie: { realizationTime: 2, lotSize: 10, qtyPerUnit: 1 },
  Okleina: { realizationTime: 1, lotSize: 20, qtyPerUnit: 2 },
  Zamek: { realizationTime: 2, lotSize: 40, qtyPerUnit: 1 },
  Klamka: { realizationTime: 1, lotSize: 30, qtyPerUnit: 2 },
};

const App: React.FC = () => {
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [mrpItems, setMRPItems] = useState<MRPItem[]>([]);
  const [ghpResults, setGHPResults] = useState<GHPWeek[]>([]);
  const [ghpRealizationTime, setGHPRealizationTime] = useState<number>(1);

  const handleInventoryUpdate = (newInventory: Record<string, number>) => {
    setInventory(newInventory);
  };

  const handleGHPCalculation = (results: GHPWeek[], ghpRealizationTime: number) => {
    setGHPResults(results);
    setGHPRealizationTime(ghpRealizationTime);
    const bomItems = expandBOM(doorBOM).filter((item) => item.name in ITEM_CONFIGS);

    // First calculate level 1 items
    const level1Items = bomItems
      .filter((item) => item.level === 1)
      .map((bomItem) => {
        const config = ITEM_CONFIGS[bomItem.name as keyof typeof ITEM_CONFIGS];
        const mrpItem = calculateMRP(results, inventory[bomItem.name] || 0, {
          ...config,
          bomLevel: bomItem.level,
          leadTime: ghpRealizationTime,
          isProductionItem: true,
        });
        mrpItem.name = bomItem.name;
        return mrpItem;
      });

    // Then calculate level 2 items using parent's plannedOrderReleases
    const level2Items = bomItems
      .filter((item) => item.level === 2)
      .map((bomItem) => {
        const config = ITEM_CONFIGS[bomItem.name as keyof typeof ITEM_CONFIGS];
        const parentItem = level1Items.find((item) => item.name === "Skrzydło drzwiowe");
        const mrpItem = calculateMRP(
          results,
          inventory[bomItem.name] || 0,
          {
            ...config,
            bomLevel: bomItem.level,
            leadTime: ITEM_CONFIGS["Skrzydło drzwiowe"].realizationTime,
            isProductionItem: true,
          },
          undefined,
          parentItem?.plannedOrderReleases
        );
        mrpItem.name = bomItem.name;
        return mrpItem;
      });

    setMRPItems([...level1Items, ...level2Items]);
  };

  const handlePlannedArrivalsChange = (itemName: string, week: number, value: number) => {
    const updatedItems = mrpItems.map((item) => {
      if (item.name === itemName) {
        const newPlannedArrivals = [...item.plannedArrivals];
        newPlannedArrivals[week] = value;
        const recalculatedItem = calculateMRP(
          ghpResults,
          inventory[itemName] || 0,
          {
            ...ITEM_CONFIGS[itemName as keyof typeof ITEM_CONFIGS],
            bomLevel: item.bomLevel,
            leadTime: item.bomLevel === 1 ? ghpRealizationTime : ITEM_CONFIGS["Skrzydło drzwiowe"].realizationTime,
            isProductionItem: true,
          },
          newPlannedArrivals,
          item.bomLevel === 2 ? mrpItems.find((i) => i.name === "Skrzydło drzwiowe")?.plannedOrderReleases : undefined
        );
        recalculatedItem.name = itemName;
        return recalculatedItem;
      }
      return item;
    });
    setMRPItems(updatedItems);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">MRP & GHP Simulation for Drzwi</h1>
      <BOMDisplay />
      <InventoryForm onInventoryUpdate={handleInventoryUpdate} />
      <GHPForm onCalculate={handleGHPCalculation} />
      {mrpItems.length > 0 && <MRPTables items={mrpItems} onPlannedArrivalsChange={handlePlannedArrivalsChange} />}
    </div>
  );
};

export default App;

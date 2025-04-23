// App.tsx
import React, { useState } from "react";
import BOMDisplay from "./components/BOMDisplay";
import GHPForm from "./components/GHPForm";
import InventoryForm from "./components/InventoryForm";
import MRPTables from "./components/MRPTables";
import ItemConfigForm from "./components/ItemConfigForm";
import { calculateMRP, MRPItem } from "./utils/mrp";
import { GHPWeek } from "./utils/ghp";
import { doorBOM, expandBOM } from "./utils/bom";

interface ItemConfig {
  realizationTime: number;
  lotSize: number;
  qtyPerUnit: number;
}

type ItemConfigs = {
  [key: string]: ItemConfig;
};

const DEFAULT_ITEM_CONFIGS: ItemConfigs = {
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
  const [itemConfigs, setItemConfigs] = useState<ItemConfigs>(DEFAULT_ITEM_CONFIGS);

  const handleInventoryUpdate = (newInventory: Record<string, number>) => {
    setInventory(newInventory);
  };

  const handleConfigChange = (itemName: string, field: keyof ItemConfig, value: number) => {
    setItemConfigs(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        [field]: value
      }
    }));
  };

  const handleGHPCalculation = (results: GHPWeek[], ghpRealizationTime: number) => {
    setGHPResults(results);
    setGHPRealizationTime(ghpRealizationTime);
    const bomItems = expandBOM(doorBOM).filter((item) => item.name in itemConfigs);

    // First calculate level 1 items
    const level1Items = bomItems
      .filter((item) => item.level === 1)
      .map((bomItem) => {
        const config = itemConfigs[bomItem.name];
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
        const config = itemConfigs[bomItem.name];
        const parentItem = level1Items.find((item) => item.name === "Skrzydło drzwiowe");
        const mrpItem = calculateMRP(
          results,
          inventory[bomItem.name] || 0,
          {
            ...config,
            bomLevel: bomItem.level,
            leadTime: itemConfigs["Skrzydło drzwiowe"].realizationTime,
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
            ...itemConfigs[itemName],
            bomLevel: item.bomLevel,
            leadTime: item.bomLevel === 1 ? ghpRealizationTime : itemConfigs["Skrzydło drzwiowe"].realizationTime,
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
      <ItemConfigForm configs={itemConfigs} onConfigChange={handleConfigChange} />
      <InventoryForm onInventoryUpdate={handleInventoryUpdate} />
      <GHPForm onCalculate={handleGHPCalculation} />
      {mrpItems.length > 0 && <MRPTables items={mrpItems} onPlannedArrivalsChange={handlePlannedArrivalsChange} />}
    </div>
  );
};

export default App;

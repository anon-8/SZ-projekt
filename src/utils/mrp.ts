// utils/mrp.ts
import { GHPWeek } from "./ghp";

export interface MRPItem {
  name: string;
  totalRequirements: number[];
  plannedArrivals: number[];
  predictedOnHand: number[];
  netRequirements: number[];
  plannedOrders: number[];
  plannedOrderReleases: number[];
  leadTime: number;
  lotSize: number;
  bomLevel: number;
  onHand: number;
  qtyPerUnit: number;
  realizationTime: number;
  plannedArrival: number;
}

export interface MRPConfig {
  leadTime: number;
  lotSize: number;
  qtyPerUnit: number;
  realizationTime: number;
  plannedArrival: number;
}

const DEFAULT_WEEKS = 10;

export function calculateMRP(ghpResults: GHPWeek[], inventory: number, config: MRPConfig): MRPItem {
  const { lotSize, qtyPerUnit, realizationTime, plannedArrival } = config;

  // Initialize arrays for all weeks
  const totalRequirements = new Array(DEFAULT_WEEKS).fill(0);
  const plannedArrivals = new Array(DEFAULT_WEEKS).fill(0);
  const predictedOnHand = new Array(DEFAULT_WEEKS).fill(0);
  const netRequirements = new Array(DEFAULT_WEEKS).fill(0);
  const plannedOrders = new Array(DEFAULT_WEEKS).fill(0);
  const plannedOrderReleases = new Array(DEFAULT_WEEKS).fill(0);

  // Set initial planned arrival
  plannedArrivals[0] = plannedArrival;

  // Calculate total requirements based on GHP production
  for (let week = 0; week < DEFAULT_WEEKS; week++) {
    const production = ghpResults[week]?.production || 0;
    totalRequirements[week] = production * qtyPerUnit;
  }

  // Calculate predicted on hand starting value (inventory + planned arrival)
  predictedOnHand[0] = inventory + plannedArrival;

  // Calculate for remaining weeks
  for (let week = 1; week < DEFAULT_WEEKS; week++) {
    // Start with previous week's inventory
    predictedOnHand[week] = predictedOnHand[week - 1];

    // If there's a requirement, subtract it
    if (totalRequirements[week] !== 0) {
      predictedOnHand[week] -= totalRequirements[week];
    }

    // If we go negative, we need to plan an order
    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);
      plannedOrderReleases[week] = lotSize;
      predictedOnHand[week] += lotSize;

      // Calculate when the order will be placed (shifted back by realization time)
      const orderPlacementWeek = week - realizationTime;
      if (orderPlacementWeek >= 0) {
        plannedOrders[orderPlacementWeek] = lotSize;
      }
    }
  }

  return {
    name: "",
    totalRequirements,
    plannedArrivals,
    predictedOnHand,
    netRequirements,
    plannedOrders,
    plannedOrderReleases,
    leadTime: config.leadTime,
    lotSize,
    bomLevel: 0,
    onHand: inventory,
    qtyPerUnit,
    realizationTime,
    plannedArrival,
  };
}

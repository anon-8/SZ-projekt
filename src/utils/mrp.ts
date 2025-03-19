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
  lotSize: number;
  bomLevel: number;
  onHand: number;
  qtyPerUnit: number;
  realizationTime: number;
  leadTime: number;
  isProductionItem: boolean;
  parentRealizationTime?: number;
}

export interface MRPConfig {
  lotSize: number;
  qtyPerUnit: number;
  realizationTime: number;
  leadTime: number;
  bomLevel: number;
  isProductionItem: boolean;
  parentRealizationTime?: number;
  higherLevelRequirements?: number[];
}

const DEFAULT_WEEKS = 10;

export function calculateMRP(ghpResults: GHPWeek[], inventory: number, config: MRPConfig): MRPItem {
  const {
    lotSize,
    qtyPerUnit,
    realizationTime,
    leadTime,
    bomLevel,
    isProductionItem,
    parentRealizationTime,
    higherLevelRequirements,
  } = config;
  const weeks = DEFAULT_WEEKS;

  // Initialize arrays
  const totalRequirements = new Array(weeks).fill(0);
  const plannedArrivals = new Array(weeks).fill(0);
  const predictedOnHand = new Array(weeks).fill(0);
  const netRequirements = new Array(weeks).fill(0);
  const plannedOrders = new Array(weeks).fill(0);
  const plannedOrderReleases = new Array(weeks).fill(0);

  // Calculate gross requirements
  if (bomLevel === 0) {
    // For level 0, use GHP results
    for (let week = 0; week < weeks; week++) {
      const production = ghpResults[week]?.production || 0;
      totalRequirements[week] = production * qtyPerUnit;
    }
  } else if (higherLevelRequirements) {
    // For lower levels, shift requirements earlier by parent's realization time
    const shift = parentRealizationTime || 0;
    for (let week = 0; week < weeks; week++) {
      const sourceWeek = week + shift;
      if (sourceWeek < weeks) {
        totalRequirements[week] = higherLevelRequirements[sourceWeek] * qtyPerUnit;
      }
    }
  }

  // Week 0: initial inventory calculation
  predictedOnHand[0] = inventory - totalRequirements[0];

  // For subsequent weeks
  for (let week = 1; week < weeks; week++) {
    // Calculate receipts from orders placed realizationTime weeks ago
    const orderReceiptFromPast = week >= realizationTime ? plannedOrders[week - realizationTime] : 0;

    // Calculate predicted inventory
    predictedOnHand[week] = predictedOnHand[week - 1] + orderReceiptFromPast - totalRequirements[week];

    // If inventory goes negative, we need to place an order
    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);

      // Calculate order size in lot size multiples
      const orderQty = Math.ceil(netRequirements[week] / lotSize) * lotSize;

      // Place order considering lead time
      const orderWeek = Math.max(0, week - leadTime);
      plannedOrders[orderWeek] = orderQty;

      // Record when this order will be received (after lead time)
      const receiptWeek = orderWeek + leadTime;
      if (receiptWeek < weeks) {
        plannedOrderReleases[receiptWeek] = orderQty;
        if (receiptWeek === week) {
          predictedOnHand[week] += orderQty;
        }
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
    lotSize,
    bomLevel,
    onHand: inventory,
    qtyPerUnit,
    realizationTime,
    leadTime,
    isProductionItem,
    parentRealizationTime,
  };
}

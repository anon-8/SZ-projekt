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
}

export interface MRPConfig {
  lotSize: number;
  qtyPerUnit: number;
  realizationTime: number;
  leadTime: number;
  bomLevel: number;
  isProductionItem: boolean;
}

const DEFAULT_WEEKS = 10;

export function calculateMRP(ghpResults: GHPWeek[], inventory: number, config: MRPConfig): MRPItem {
  const { lotSize, qtyPerUnit, realizationTime, leadTime, bomLevel, isProductionItem } = config;
  const weeks = DEFAULT_WEEKS;

  // Initialize arrays
  const totalRequirements = new Array(weeks).fill(0);
  const plannedArrivals = new Array(weeks).fill(0);
  const predictedOnHand = new Array(weeks).fill(0);
  const netRequirements = new Array(weeks).fill(0);
  const plannedOrders = new Array(weeks).fill(0);
  const plannedOrderReleases = new Array(weeks).fill(0);

  for (let week = 0; week < weeks; week++) {
    const production = ghpResults[week]?.production || 0;
    totalRequirements[week] = production * qtyPerUnit;
  }

  predictedOnHand[0] = inventory - totalRequirements[0];

  for (let week = 1; week < weeks; week++) {
    const orderReceiptFromPast = week >= realizationTime ? plannedOrders[week - realizationTime] : 0;

    predictedOnHand[week] = predictedOnHand[week - 1] + orderReceiptFromPast - totalRequirements[week];

    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);

      const orderQty = Math.ceil(netRequirements[week] / lotSize) * lotSize;

      const totalDelay = leadTime + realizationTime;
      const orderWeek = Math.max(0, week - totalDelay);
      plannedOrders[orderWeek] = orderQty;

      const receiptWeek = orderWeek + totalDelay;
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
  };
}

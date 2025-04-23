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

export function calculateMRP(
  ghpResults: GHPWeek[],
  inventory: number,
  config: MRPConfig,
  userPlannedArrivals: number[] = new Array(DEFAULT_WEEKS).fill(0),
  parentPlannedOrderReleases?: number[]
): MRPItem {
  const { lotSize, qtyPerUnit, realizationTime, leadTime, bomLevel, isProductionItem } = config;
  const weeks = DEFAULT_WEEKS;

  const totalRequirements = new Array(weeks).fill(0);
  const plannedArrivals = [...userPlannedArrivals];
  const predictedOnHand = new Array(weeks).fill(0);
  const netRequirements = new Array(weeks).fill(0);
  const plannedOrders = new Array(weeks).fill(0);
  const plannedOrderReleases = new Array(weeks).fill(0);

  if (bomLevel === 1) {
    for (let week = 0; week < weeks; week++) {
      const production = ghpResults[week]?.production || 0;
      const adjustedWeek = Math.max(0, week - leadTime);
      totalRequirements[adjustedWeek] = (totalRequirements[adjustedWeek] || 0) + production * qtyPerUnit;
    }
  } else if (bomLevel === 2 && parentPlannedOrderReleases) {
    for (let week = 0; week < weeks; week++) {
      totalRequirements[week] = parentPlannedOrderReleases[week] * qtyPerUnit;
    }
  }

  predictedOnHand[0] = inventory - totalRequirements[0];

  for (let week = 1; week < weeks; week++) {
    predictedOnHand[week] =
      -totalRequirements[week] + predictedOnHand[week - 1] + plannedOrderReleases[week] + plannedArrivals[week];

    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);

      const numOrdersNeeded = Math.min(Math.ceil(netRequirements[week] / lotSize), week);

      for (let i = 0; i < numOrdersNeeded; i++) {
        const neededByWeek = week - realizationTime;

        const orderWeek = neededByWeek - i;

        if (orderWeek >= 0 && orderWeek < weeks) {
          plannedOrders[orderWeek] = lotSize;

          const receiptWeek = orderWeek + realizationTime;
          if (receiptWeek < weeks) {
            plannedOrderReleases[receiptWeek] = lotSize;
            predictedOnHand[receiptWeek] += lotSize;
          }
        }
      }

      predictedOnHand[week] =
        -totalRequirements[week] + predictedOnHand[week - 1] + plannedOrderReleases[week] + plannedArrivals[week];

      if (predictedOnHand[week] < 0) {
        netRequirements[week] = Math.abs(predictedOnHand[week]);
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

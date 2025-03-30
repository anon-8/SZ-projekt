import { GHPWeek } from "./ghp";

// Interface defining the structure of an MRP item with all its properties
export interface MRPItem {
  name: string; // Name of the item
  totalRequirements: number[]; // Total requirements for each week
  plannedArrivals: number[]; // Planned arrivals for each week
  predictedOnHand: number[]; // Predicted inventory on hand for each week
  netRequirements: number[]; // Net requirements for each week
  plannedOrders: number[]; // Planned orders for each week
  plannedOrderReleases: number[]; // Planned order releases for each week
  lotSize: number; // Fixed order quantity (both minimum and maximum)
  bomLevel: number; // Level in the Bill of Materials
  onHand: number; // Current inventory on hand
  qtyPerUnit: number; // Quantity needed per unit of parent item
  realizationTime: number; // Time from order to receipt
  leadTime: number; // Time from order release to order placement
  isProductionItem: boolean; // Whether this is a production or purchase item
}

// Configuration interface for MRP calculation
export interface MRPConfig {
  lotSize: number; // Fixed order quantity (both minimum and maximum)
  qtyPerUnit: number; // Quantity needed per unit of parent item
  realizationTime: number; // Time from order to receipt
  leadTime: number; // Time from order release to order placement
  bomLevel: number; // Level in the Bill of Materials
  isProductionItem: boolean; // Whether this is a production or purchase item
}

const DEFAULT_WEEKS = 10;

/**
 * Calculates Material Requirements Planning (MRP) for an item
 * @param ghpResults - Array of weekly production requirements
 * @param inventory - Current inventory on hand
 * @param config - MRP configuration parameters
 * @param userPlannedArrivals - Array of planned arrivals set by user
 * @param parentPlannedOrderReleases - Array of planned order releases for parent item
 * @returns MRPItem with calculated values
 */
export function calculateMRP(
  ghpResults: GHPWeek[],
  inventory: number,
  config: MRPConfig,
  userPlannedArrivals: number[] = new Array(DEFAULT_WEEKS).fill(0),
  parentPlannedOrderReleases?: number[]
): MRPItem {
  // Destructure configuration parameters
  const { lotSize, qtyPerUnit, realizationTime, leadTime, bomLevel, isProductionItem } = config;
  const weeks = DEFAULT_WEEKS;

  // Initialize arrays for all MRP calculations with zeros
  const totalRequirements = new Array(weeks).fill(0);
  const plannedArrivals = [...userPlannedArrivals];
  const predictedOnHand = new Array(weeks).fill(0);
  const netRequirements = new Array(weeks).fill(0);
  const plannedOrders = new Array(weeks).fill(0);
  const plannedOrderReleases = new Array(weeks).fill(0);

  // Calculate total requirements based on BOM level
  if (bomLevel === 1) {
    // For level 1 items, use GHP results
    for (let week = 0; week < weeks; week++) {
      const production = ghpResults[week]?.production || 0;
      const adjustedWeek = Math.max(0, week - leadTime);
      totalRequirements[adjustedWeek] = (totalRequirements[adjustedWeek] || 0) + production * qtyPerUnit;
    }
  } else if (bomLevel === 2 && parentPlannedOrderReleases) {
    // For level 2 items, use parent's plannedOrderReleases
    for (let week = 0; week < weeks; week++) {
      totalRequirements[week] = parentPlannedOrderReleases[week] * qtyPerUnit;
    }
  }

  // Find the last week with total requirements
  let lastRequirementWeek = 0;
  for (let week = weeks - 1; week >= 0; week--) {
    if (totalRequirements[week] > 0) {
      lastRequirementWeek = week;
      break;
    }
  }

  // Set initial predicted on-hand inventory
  predictedOnHand[0] = inventory - totalRequirements[0];

  // Main MRP calculation loop
  for (let week = 1; week < weeks; week++) {
    // Calculate predicted on-hand using the formula:
    // predictedOnHand = -TotalRequirements + predictedOnHand(previous) + plannedOrderReleases + plannedArrivals
    predictedOnHand[week] =
      -totalRequirements[week] + predictedOnHand[week - 1] + plannedOrderReleases[week] + plannedArrivals[week];

    // If inventory is insufficient, calculate net requirements and plan orders
    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);

      // Calculate how many orders we need to cover the net requirements
      const numOrdersNeeded = Math.ceil(netRequirements[week] / lotSize);

      // Plan orders in advance to ensure we have enough inventory
      for (let i = 0; i < numOrdersNeeded; i++) {
        // Calculate when this order needs to arrive
        const neededByWeek = week;

        // Find the last planned order week
        let lastOrderWeek = -1;
        for (let w = neededByWeek - 1; w >= 0; w--) {
          if (plannedOrders[w] > 0) {
            lastOrderWeek = w;
            break;
          }
        }

        // Calculate the next possible order week based on realization time
        const nextPossibleWeek = lastOrderWeek + realizationTime;

        // Calculate the latest possible order week to ensure delivery before last requirement
        const latestPossibleWeek = lastRequirementWeek - realizationTime;

        // Place order at the appropriate week
        const orderWeek = Math.min(Math.max(nextPossibleWeek, neededByWeek - realizationTime), latestPossibleWeek);

        if (orderWeek >= 0 && orderWeek < weeks) {
          // Place the order
          plannedOrders[orderWeek] = lotSize;

          // Calculate when the order will be received
          const receiptWeek = orderWeek + realizationTime;
          if (receiptWeek < weeks) {
            plannedOrderReleases[receiptWeek] = lotSize;
          }
        }
      }

      // Recalculate predicted on-hand after placing orders
      predictedOnHand[week] =
        -totalRequirements[week] + predictedOnHand[week - 1] + plannedOrderReleases[week] + plannedArrivals[week];

      // If we still have negative predicted on-hand after trying to place orders,
      // keep it negative to indicate unmet requirements
      if (predictedOnHand[week] < 0) {
        netRequirements[week] = Math.abs(predictedOnHand[week]);
      }
    }
  }

  // Return the complete MRP item with all calculated values
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

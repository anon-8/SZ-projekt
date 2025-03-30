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
 * @returns MRPItem with calculated values
 */
export function calculateMRP(ghpResults: GHPWeek[], inventory: number, config: MRPConfig): MRPItem {
  // Destructure configuration parameters
  const { lotSize, qtyPerUnit, realizationTime, leadTime, bomLevel, isProductionItem } = config;
  const weeks = DEFAULT_WEEKS;

  // Initialize arrays for all MRP calculations with zeros
  const totalRequirements = new Array(weeks).fill(0);
  const plannedArrivals = new Array(weeks).fill(0);
  const predictedOnHand = new Array(weeks).fill(0);
  const netRequirements = new Array(weeks).fill(0);
  const plannedOrders = new Array(weeks).fill(0);
  const plannedOrderReleases = new Array(weeks).fill(0);

  // Keep track of the last week when an order was planned
  let lastOrderWeek = -realizationTime; // Initialize to allow first order immediately

  // Calculate total requirements based on production schedule and shift by lead time
  for (let week = 0; week < weeks; week++) {
    const production = ghpResults[week]?.production || 0;
    // Shift requirements earlier by lead time
    const adjustedWeek = Math.max(0, week - leadTime);
    totalRequirements[adjustedWeek] = (totalRequirements[adjustedWeek] || 0) + production * qtyPerUnit;
  }

  // Set initial predicted on-hand inventory
  predictedOnHand[0] = inventory - totalRequirements[0];

  // Main MRP calculation loop
  for (let week = 1; week < weeks; week++) {
    // Calculate order receipts from past orders
    const orderReceiptFromPast = week >= realizationTime ? plannedOrders[week - realizationTime] : 0;

    // Calculate predicted on-hand inventory for current week
    predictedOnHand[week] = predictedOnHand[week - 1] + orderReceiptFromPast - totalRequirements[week];

    // If inventory is insufficient, calculate net requirements and plan orders
    if (predictedOnHand[week] < 0) {
      netRequirements[week] = Math.abs(predictedOnHand[week]);

      // Calculate how many orders we need to cover the net requirements
      const numOrdersNeeded = Math.ceil(netRequirements[week] / lotSize);

      // Plan orders in advance to ensure we have enough inventory
      for (let i = 0; i < numOrdersNeeded; i++) {
        // Calculate when this order needs to arrive
        const neededByWeek = week;
        // Calculate when to place the order based on realization time only (lead time already accounted for)
        // Calculate the earliest possible week for the new order
        const earliestPossibleWeek = lastOrderWeek + realizationTime;
        // Place order at the later of: earliest possible week or required week minus realization time
        const orderWeek = Math.max(earliestPossibleWeek, neededByWeek - realizationTime);

        if (orderWeek < weeks) {
          // Place the order
          plannedOrders[orderWeek] = lotSize;
          lastOrderWeek = orderWeek; // Update the last order week

          // Calculate when the order will be received
          const receiptWeek = orderWeek + realizationTime;
          if (receiptWeek < weeks) {
            plannedOrderReleases[receiptWeek] = lotSize;
            // Update predicted on-hand if order arrives in current week or earlier
            if (receiptWeek <= week) {
              predictedOnHand[week] += lotSize;
            }
          }
        }
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

// utils/ghp.ts

export interface GHPWeek {
  week: number;
  predictedDemand: number;
  production: number;
  available: number;
  onHand: number;
}

// A simple simulation function for GHP
export function simulateGHP(
  predictedDemands: number[],
  productionPlan: number[],
  startingInventory: number
): GHPWeek[] {
  let inventory = startingInventory;
  const result: GHPWeek[] = [];

  for (let i = 0; i < predictedDemands.length; i++) {
    const demand = predictedDemands[i];
    const production = productionPlan[i] || 0;

    // Calculate total available before demand
    const totalAvailable = inventory + production;
    // Calculate remaining inventory after demand (this will be shown as "available")
    const remainingInventory = Math.max(0, totalAvailable - demand);

    result.push({
      week: i + 1,
      predictedDemand: demand,
      production,
      available: remainingInventory,
      onHand: totalAvailable - demand,
    });

    // Pass the remaining inventory to next week
    inventory = remainingInventory;
  }
  return result;
}

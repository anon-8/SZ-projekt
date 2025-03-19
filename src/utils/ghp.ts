export interface GHPWeek {
  week: number;
  predictedDemand: number;
  production: number;
  available: number;
  onHand: number;
}

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

    const totalAvailable = inventory + production;
    const remainingInventory = Math.max(0, totalAvailable - demand);

    result.push({
      week: i + 1,
      predictedDemand: demand,
      production,
      available: remainingInventory,
      onHand: totalAvailable - demand,
    });

    inventory = remainingInventory;
  }
  return result;
}

export function calculateMRP(
    ghpResults: GHPWeek[], 
    inventory: number, 
    config: MRPConfig, 
    parentRealizationTime: number = 0
  ): MRPItem {
    const { lotSize, qtyPerUnit, realizationTime, leadTime, bomLevel, isProductionItem } = config;
    const weeks = DEFAULT_WEEKS;
  
    // Adjust the weeks based on parent's realization time and current item's BOM level
    const adjustedWeeks = weeks - parentRealizationTime;
  
    // Initialize arrays
    const totalRequirements = new Array(adjustedWeeks).fill(0);
    const plannedArrivals = new Array(adjustedWeeks).fill(0);
    const predictedOnHand = new Array(adjustedWeeks).fill(0);
    const netRequirements = new Array(adjustedWeeks).fill(0);
    const plannedOrders = new Array(adjustedWeeks).fill(0);
    const plannedOrderReleases = new Array(adjustedWeeks).fill(0);
  
    // Calculate total requirements based on parent's production and this item's quantity per unit
    for (let week = 0; week < adjustedWeeks; week++) {
      const parentWeek = week + parentRealizationTime;
      const production = ghpResults[parentWeek]?.production || 0;
      totalRequirements[week] = production * qtyPerUnit;
    }
  
    // Initial on-hand inventory
    predictedOnHand[0] = inventory - totalRequirements[0];
  
    for (let week = 1; week < adjustedWeeks; week++) {
      // Calculate order receipts from past planned orders
      const orderReceiptFromPast = week >= realizationTime 
        ? plannedOrders[week - realizationTime] 
        : 0;
  
      // Calculate predicted on-hand inventory
      predictedOnHand[week] = predictedOnHand[week - 1] 
        + orderReceiptFromPast 
        - totalRequirements[week];
  
      // Check if additional orders are needed
      if (predictedOnHand[week] < 0) {
        // Calculate net requirements
        netRequirements[week] = Math.abs(predictedOnHand[week]);
  
        // Determine order quantity (round up to lot size)
        const orderQty = Math.ceil(netRequirements[week] / lotSize) * lotSize;
  
        // Calculate total delay (lead time + realization time)
        const totalDelay = leadTime + realizationTime;
        
        // Determine order week
        const orderWeek = Math.max(0, week - totalDelay);
        plannedOrders[orderWeek] = orderQty;
  
        // Determine receipt week
        const receiptWeek = orderWeek + totalDelay;
        if (receiptWeek < adjustedWeeks) {
          plannedOrderReleases[receiptWeek] = orderQty;
          
          // Adjust on-hand if receipt is in the same week
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
//   To use this in a multi-level BOM scenario, you would call the function recursively, passing the parent's realization time. For example:
//   typescriptCopy// For a top-level item (BOM level 0)
//   const topLevelMRP = calculateMRP(ghpResults, topLevelInventory, topLevelConfig);
  
//   // For a lower-level item (BOM level 1)
//   const lowerLevelMRP = calculateMRP(
//     ghpResults, 
//     lowerLevelInventory, 
//     lowerLevelConfig, 
//     topLevelConfig.realizationTime
//   );
//   This approach ensures that:
  
//   Lower-level BOM items are prepared before the higher-level items need them
//   The production timing is adjusted based on the parent item's realization time
//   The MRP calculations account for the hierarchical nature of the Bill of Materials
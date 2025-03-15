// types.ts

// For the BOM (Bill of Materials)
export interface BOMItem {
  name: string;
  quantity: number;
  level: number;
  children?: BOMItem[];
}

// For each period in the MRP simulation
export interface MRPPeriod {
  period: number;
  demand: number;
  plannedReceipts: number;
  inventoryOnHand: number;
  netRequirement: number;
  plannedOrder: number;
}

export interface BOMItem {
  name: string;
  quantity: number;
  level: number;
  children?: BOMItem[];
}

export interface MRPPeriod {
  period: number;
  demand: number;
  plannedReceipts: number;
  inventoryOnHand: number;
  netRequirement: number;
  plannedOrder: number;
}

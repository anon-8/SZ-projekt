// components/MRPForm.tsx
import React, { useState } from "react";
import { calculateMRP } from "../utils/mrp";
import { MRPPeriod } from "../types";

const MRPForm: React.FC = () => {
  const [startingInventory, setStartingInventory] = useState<number>(50);
  const [lotSize, setLotSize] = useState<number>(100);
  const [leadTime, setLeadTime] = useState<number>(2);
  const [demands, setDemands] = useState<number[]>([100, 200, 150, 300, 250, 100]);
  const [mrpResult, setMrpResult] = useState<MRPPeriod[]>([]);

  const handleCalculate = () => {
    const result = calculateMRP(demands, startingInventory, lotSize, leadTime);
    setMrpResult(result);
  };

  return (
    <div className="p-4 border rounded my-4">
      <h2 className="text-xl font-bold mb-2">MRP Simulation</h2>
      <div className="mb-2">
        <label>Starting Inventory: </label>
        <input
          type="number"
          value={startingInventory}
          onChange={(e) => setStartingInventory(Number(e.target.value))}
          className="border p-1"
        />
      </div>
      <div className="mb-2">
        <label>Lot Size: </label>
        <input
          type="number"
          value={lotSize}
          onChange={(e) => setLotSize(Number(e.target.value))}
          className="border p-1"
        />
      </div>
      <div className="mb-2">
        <label>Lead Time (periods): </label>
        <input
          type="number"
          value={leadTime}
          onChange={(e) => setLeadTime(Number(e.target.value))}
          className="border p-1"
        />
      </div>
      <div className="mb-2">
        <label>Demands (comma separated): </label>
        <input
          type="text"
          value={demands.join(",")}
          onChange={(e) => setDemands(e.target.value.split(",").map(Number))}
          className="border p-1 w-full"
        />
      </div>
      <button onClick={handleCalculate} className="bg-blue-500 text-white p-2">
        Calculate MRP
      </button>

      {mrpResult.length > 0 && (
        <table className="min-w-full mt-4 border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Period</th>
              <th className="border px-2 py-1">Demand</th>
              <th className="border px-2 py-1">Planned Receipt</th>
              <th className="border px-2 py-1">Inventory</th>
              <th className="border px-2 py-1">Net Requirement</th>
              <th className="border px-2 py-1">Planned Order</th>
            </tr>
          </thead>
          <tbody>
            {mrpResult.map((row) => (
              <tr key={row.period}>
                <td className="border px-2 py-1">{row.period}</td>
                <td className="border px-2 py-1">{row.demand}</td>
                <td className="border px-2 py-1">{row.plannedOrderReceipt}</td>
                <td className="border px-2 py-1">{row.projectedOnHand}</td>
                <td className="border px-2 py-1">{row.netRequirement}</td>
                <td className="border px-2 py-1">{row.plannedOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MRPForm;

import React from "react";
import { MRPItem } from "../utils/mrp";
import "./Tables.css";

interface MRPTablesProps {
  items: MRPItem[];
  onPlannedArrivalsChange: (itemName: string, week: number, value: number) => void;
}

const MRPTables: React.FC<MRPTablesProps> = ({ items, onPlannedArrivalsChange }) => {
  const sortedItems = [...items].sort((a, b) => a.bomLevel - b.bomLevel);

  const handlePlannedArrivalsChange = (itemName: string, week: number, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      onPlannedArrivalsChange(itemName, week, numValue);
    }
  };

  return (
    <div className="space-y-8">
      {sortedItems.map((item) => (
        <div key={item.name} className="table-container bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">MRP - {item.name}</h2>
          <table className="planning-table w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Okres</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i + 1} className="py-3 px-4 text-center font-semibold text-gray-700">{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Całkowite zapotrzebowanie</td>
                {item.totalRequirements.map((value, i) => (
                  <td key={i} className="py-3 px-4 text-center text-gray-700">{value || ""}</td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Planowane przyjęcia</td>
                {item.plannedArrivals.map((value, i) => (
                  <td key={i} className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      value={value || ""}
                      onChange={(e) => handlePlannedArrivalsChange(item.name, i, e.target.value)}
                      className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Przewidywane na stanie</td>
                {item.predictedOnHand.map((value, i) => (
                  <td key={i} className="py-3 px-4 text-center text-gray-700">{value}</td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Zapotrzebowanie netto</td>
                {item.netRequirements.map((value, i) => (
                  <td key={i} className="py-3 px-4 text-center text-gray-700">{value || ""}</td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Planowane zamówienia</td>
                {item.plannedOrders.map((value, i) => (
                  <td key={i} className="py-3 px-4 text-center text-gray-700">{value || ""}</td>
                ))}
              </tr>
              <tr className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-800">Planowane przyjęcie zamówień</td>
                {item.plannedOrderReleases.map((value, i) => (
                  <td key={i} className="py-3 px-4 text-center text-gray-700">{value || ""}</td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={11} className="py-2 px-2">
                  <div className="bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Czas realizacji:</span>
                        <span className="font-semibold text-blue-600">{item.realizationTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Wielkość partii:</span>
                        <span className="font-semibold text-blue-600">{item.lotSize}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Poziom BOM:</span>
                        <span className="font-semibold text-blue-600">{item.bomLevel}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Na stanie:</span>
                        <span className="font-semibold text-blue-600">{item.onHand}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </div>
  );
};

export default MRPTables;

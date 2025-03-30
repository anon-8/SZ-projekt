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
    <div>
      {sortedItems.map((item) => (
        <div key={item.name} className="table-container">
          <h2>MRP - {item.name}</h2>
          <table className="planning-table">
            <thead>
              <tr>
                <th>Okres</th>
                {Array.from({ length: 10 }, (_, i) => (
                  <th key={i + 1}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Całkowite zapotrzebowanie</td>
                {item.totalRequirements.map((value, i) => (
                  <td key={i}>{value || ""}</td>
                ))}
              </tr>
              <tr>
                <td>Planowane przyjęcia</td>
                {item.plannedArrivals.map((value, i) => (
                  <td key={i}>
                    <input
                      type="number"
                      min="0"
                      value={value || ""}
                      onChange={(e) => handlePlannedArrivalsChange(item.name, i, e.target.value)}
                      className="planned-arrivals-input"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td>Przewidywane na stanie</td>
                {item.predictedOnHand.map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
              <tr>
                <td>Zapotrzebowanie netto</td>
                {item.netRequirements.map((value, i) => (
                  <td key={i}>{value || ""}</td>
                ))}
              </tr>
              <tr>
                <td>Planowane zamówienia</td>
                {item.plannedOrders.map((value, i) => (
                  <td key={i}>{value || ""}</td>
                ))}
              </tr>
              <tr>
                <td>Planowane przyjęcie zamówień</td>
                {item.plannedOrderReleases.map((value, i) => (
                  <td key={i}>{value || ""}</td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={11}>
                  Czas realizacji = {item.realizationTime}
                  <br />
                  Czas dostawy = {item.leadTime}
                  <br />
                  Wielkość partii = {item.lotSize}
                  <br />
                  Poziom BOM = {item.bomLevel}
                  <br />
                  Na stanie = {item.onHand}
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

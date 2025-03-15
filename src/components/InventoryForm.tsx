import React, { useState } from "react";
import { doorBOM, expandBOM } from "../utils/bom";
import "./Tables.css";

interface InventoryFormProps {
  onInventoryUpdate: (inventory: Record<string, number>) => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ onInventoryUpdate }) => {
  const bomItems = expandBOM(doorBOM);
  const [inventory, setInventory] = useState<Record<string, number>>(
    Object.fromEntries(bomItems.map((item) => [item.name, 0]))
  );

  const handleInventoryChange = (itemName: string, value: number) => {
    const newInventory = {
      ...inventory,
      [itemName]: value,
    };
    setInventory(newInventory);
    onInventoryUpdate(newInventory);
  };

  return (
    <div className="table-container">
      <h2>Stan magazynowy</h2>
      <table className="planning-table">
        <thead>
          <tr>
            <th>Element</th>
            <th>Ilość w magazynie</th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((item) => (
            <tr key={item.name}>
              <td>
                {"-".repeat(item.level)} {item.name}
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={inventory[item.name]}
                  onChange={(e) => handleInventoryChange(item.name, Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryForm;

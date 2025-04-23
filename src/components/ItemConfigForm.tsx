import React from 'react';
import "./Tables.css";

interface ItemConfig {
  realizationTime: number;
  lotSize: number;
  qtyPerUnit: number;
  inventory: number;
}

interface ItemConfigFormProps {
  configs: Record<string, ItemConfig>;
  onConfigChange: (itemName: string, field: keyof ItemConfig, value: number) => void;
}

const ItemConfigForm: React.FC<ItemConfigFormProps> = ({ configs, onConfigChange }) => {
  return (
    <div className="table-container bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Konfiguracja</h2>
      <table className="planning-table w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Element</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Czas realizacji</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Wielkość partii</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Ilość w magazynie</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(configs).map(([itemName, config]) => (
            <tr key={itemName} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-800">{itemName}</td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  min="1"
                  value={config.realizationTime}
                  onChange={(e) => onConfigChange(itemName, 'realizationTime', parseInt(e.target.value))}
                  className="w-24 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  min="1"
                  value={config.lotSize}
                  onChange={(e) => onConfigChange(itemName, 'lotSize', parseInt(e.target.value))}
                  className="w-24 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
              <td className="py-3 px-4">
                <input
                  type="number"
                  min="0"
                  value={config.inventory}
                  onChange={(e) => onConfigChange(itemName, 'inventory', Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-24 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemConfigForm;
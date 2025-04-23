import React from 'react';

interface ItemConfig {
  realizationTime: number;
  lotSize: number;
  qtyPerUnit: number;
}

interface ItemConfigFormProps {
  configs: Record<string, ItemConfig>;
  onConfigChange: (itemName: string, field: keyof ItemConfig, value: number) => void;
}

const ItemConfigForm: React.FC<ItemConfigFormProps> = ({ configs, onConfigChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Item Configurations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(configs).map(([itemName, config]) => (
          <div key={itemName} className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2">{itemName}</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Czas realizacji
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.realizationTime}
                  onChange={(e) => onConfigChange(itemName, 'realizationTime', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Wielkość partii
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.lotSize}
                  onChange={(e) => onConfigChange(itemName, 'lotSize', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Czas realizacji
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.qtyPerUnit}
                  onChange={(e) => onConfigChange(itemName, 'qtyPerUnit', parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemConfigForm; 
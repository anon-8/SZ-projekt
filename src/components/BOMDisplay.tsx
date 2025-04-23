import React from "react";
import { doorBOM, expandBOM } from "../utils/bom";
import "./Tables.css";

const BOMDisplay: React.FC = () => {
  const expanded = expandBOM(doorBOM);

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800"
    ];
    return colors[level % colors.length];
  };

  return (
    <div className="table-container bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">BOM dla Drzwi</h2>

        <table className="planning-table w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Poziom</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Element</th>
              <th className="py-3 px-4 text-center font-semibold text-gray-700">Ilość</th>
            </tr>
          </thead>
          <tbody>
            {expanded.map((item, index) => (
              <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full ${getLevelColor(item.level)} font-bold`}>
                    {item.level}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-800">{item.name}</td>
                <td className="py-3 px-4 text-center">
                  <span className="text-blue-600 font-semibold">{item.quantity} szt.</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default BOMDisplay;

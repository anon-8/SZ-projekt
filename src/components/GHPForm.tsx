import React, { useState } from "react";
import { simulateGHP, GHPWeek } from "../utils/ghp";
import "./Tables.css";

interface GHPFormProps {
  onCalculate: (results: GHPWeek[], realizationTime: number) => void;
}

const GHPForm: React.FC<GHPFormProps> = ({ onCalculate }) => {
  const [startingInventory, setStartingInventory] = useState<number>(0);
  const [realizationTime, setRealizationTime] = useState<number>(1);
  const [predictedDemands, setPredictedDemands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [productionPlan, setProductionPlan] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [ghpResult, setGhpResult] = useState<GHPWeek[]>([]);

  const handleCalculate = () => {
    const result = simulateGHP(predictedDemands, productionPlan, startingInventory);
    setGhpResult(result);
    onCalculate(result, realizationTime);
  };

  return (
    <div className="table-container bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">GHP</h2>
      <table className="planning-table w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left font-semibold text-gray-700">tydzień:</th>
            {[...Array(10)].map((_, i) => (
              <th key={i + 1} className="py-3 px-4 text-center font-semibold text-gray-700">{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-gray-800">Przewidywany popyt</td>
            {predictedDemands.map((demand, i) => (
              <td key={i} className="py-3 px-4">
                <input
                  type="number"
                  value={demand}
                  onChange={(e) => {
                    const newDemands = [...predictedDemands];
                    newDemands[i] = Number(e.target.value);
                    setPredictedDemands(newDemands);
                  }}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
            ))}
          </tr>
          <tr className="border-t border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-gray-800">Produkcja</td>
            {productionPlan.map((production, i) => (
              <td key={i} className="py-3 px-4">
                <input
                  type="number"
                  value={production}
                  onChange={(e) => {
                    const newProduction = [...productionPlan];
                    newProduction[i] = Number(e.target.value);
                    setProductionPlan(newProduction);
                  }}
                  className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </td>
            ))}
          </tr>
          <tr className="border-t border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-gray-800">Dostępne</td>
            {ghpResult.map((row, i) => (
              <td key={i} className="py-3 px-4 text-center text-gray-700">{row.available}</td>
            ))}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={11} className="py-4 px-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">Czas realizacji =</span>
                  <input
                    type="number"
                    min="1"
                    value={realizationTime}
                    onChange={(e) => setRealizationTime(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-gray-700 mr-2">Na stanie =</span>
                  <input
                    type="number"
                    value={startingInventory}
                    onChange={(e) => setStartingInventory(Number(e.target.value))}
                    className="w-20 text-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={handleCalculate}
                  className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Oblicz
                </button>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default GHPForm;

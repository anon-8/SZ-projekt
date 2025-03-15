// components/GHPForm.tsx
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
    <div className="table-container">
      <h2>GHP</h2>
      <table className="planning-table">
        <thead>
          <tr>
            <th>tydzień:</th>
            {[...Array(10)].map((_, i) => (
              <th key={i + 1}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Przewidywany popyt</td>
            {predictedDemands.map((demand, i) => (
              <td key={i}>
                <input
                  type="number"
                  value={demand}
                  onChange={(e) => {
                    const newDemands = [...predictedDemands];
                    newDemands[i] = Number(e.target.value);
                    setPredictedDemands(newDemands);
                  }}
                  className="w-16 text-center"
                />
              </td>
            ))}
          </tr>
          <tr>
            <td>Produkcja</td>
            {productionPlan.map((production, i) => (
              <td key={i}>
                <input
                  type="number"
                  value={production}
                  onChange={(e) => {
                    const newProduction = [...productionPlan];
                    newProduction[i] = Number(e.target.value);
                    setProductionPlan(newProduction);
                  }}
                  className="w-16 text-center"
                />
              </td>
            ))}
          </tr>
          <tr>
            <td>Dostępne</td>
            {ghpResult.map((row, i) => (
              <td key={i}>{row.available}</td>
            ))}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={11}>
              Czas realizacji =
              <input
                type="number"
                min="1"
                value={realizationTime}
                onChange={(e) => setRealizationTime(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 ml-2"
              />
              <br />
              Na stanie =
              <input
                type="number"
                value={startingInventory}
                onChange={(e) => setStartingInventory(Number(e.target.value))}
                className="w-16 ml-2"
              />
              <button onClick={handleCalculate} className="ml-4 px-4 py-1 bg-blue-500 text-white rounded">
                Oblicz
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default GHPForm;

import React from "react";
import "./Tables.css";

const MRPTable: React.FC = () => {
  return (
    <div className="table-container">
      <h2>MRP</h2>
      <table className="planning-table">
        <thead>
          <tr>
            <th>Okres</th>
            {[...Array(6)].map((_, i) => (
              <th key={i + 1}>{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dane produkcyjne</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Całkowite zapotrzebowanie</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Planowane przyjęcia</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Przewidywane na stanie</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Zapotrzebowanie netto</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Planowane zamówienia</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Planowane przyjęcie zamówień</td>
            {[...Array(6)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7}>
              Czas realizacji = <br />
              Wielkość partii = <br />
              Poziom BOM = <br />
              Na stanie =
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default MRPTable;

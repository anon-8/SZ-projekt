import React from "react";
import "./Tables.css";

const GHPTable: React.FC = () => {
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
            {[...Array(10)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Produkcja</td>
            {[...Array(10)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
          <tr>
            <td>Dostępne</td>
            {[...Array(10)].map((_, i) => (
              <td key={i}></td>
            ))}
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={11}>
              Czas realizacji = <br />
              Na stanie =
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default GHPTable;

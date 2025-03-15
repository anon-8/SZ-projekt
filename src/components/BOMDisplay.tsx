// components/BOMDisplay.tsx
import React from "react";
import { doorBOM, expandBOM } from "../utils/bom";

const BOMDisplay: React.FC = () => {
  const expanded = expandBOM(doorBOM);

  return (
    <div className="p-4 border rounded my-4">
      <h2 className="text-xl font-bold mb-2">Bill of Materials for Drzwi</h2>
      <p>
        <strong>Product:</strong> {doorBOM.name}
      </p>
      <ul className="list-disc pl-5">
        {expanded.map((item, index) => (
          <li key={index}>
            {item.level > 0 && "-".repeat(item.level - 1)} BOM level: {item.level} {item.name}: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BOMDisplay;

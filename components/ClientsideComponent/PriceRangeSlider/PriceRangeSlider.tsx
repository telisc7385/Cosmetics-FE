"use client";

import { Range } from "react-range";

type Props = {
  min: number;
  max: number;
  values: [number, number];
  onChange: (values: [number, number]) => void;
};

const PriceRangeSlider = ({ min, max, values, onChange }: Props) => {
  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Price Range</h3>

      <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
        <span>₹{values[0]}</span>
        <span>₹{values[1]}</span>
      </div>

      <Range
        values={values}
        step={10}
        min={min}
        max={max}
        onChange={(vals) => onChange([vals[0], vals[1]])}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className="w-full h-[6px] rounded bg-gray-200"
            style={{
              ...props.style,
              background: `linear-gradient(to right, #e0d4f7 ${
                ((values[0] - min) / (max - min)) * 100
              }%, #966ad7 ${((values[0] - min) / (max - min)) * 100}% ${
                ((values[1] - min) / (max - min)) * 100
              }%, #e0d4f7 ${((values[1] - min) / (max - min)) * 100}%)`,
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            className="h-4 w-4 rounded-full bg-[#966ad7] border-2 border-white shadow"
          />
        )}
      />
    </div>
  );
};

export default PriceRangeSlider;

// PriceRangeSlider.tsx (renamed from PriceFilter in the original snippet, assuming it's the component for the slider)
"use client";

import { Range } from "react-range";
import { useState, useEffect } from "react";

interface Props {
  min: number;
  max: number;
  setMin: (val: number) => void;
  setMax: (val: number) => void;
  initialMin: number,
  initialMax: number
}

const STEP = 10;
const MIN = 0;
const MAX = 4000; // This max value might need to be adjusted based on your actual product prices

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};


const PriceRangeSlider = ({ min, max, setMin, setMax, initialMin, initialMax }: Props) => {

  const clampedMin = clamp(min, initialMin, initialMax);
  const clampedMax = clamp(max, initialMin, initialMax);

  const [values, setValues] = useState([clampedMin, clampedMax]);

  useEffect(() => {
    // Only update internal state if min/max from props actually change
    // and are within the allowed range to prevent infinite loops or unnecessary re-renders
    const newClampedMin = clamp(min, initialMin, initialMax);
    const newClampedMax = clamp(max, initialMin, initialMax);
    if (values[0] !== newClampedMin || values[1] !== newClampedMax) {
      setValues([newClampedMin, newClampedMax]);
    }
  }, [min, max, initialMin, initialMax]); // Depend on min and max props

  const handleChange = (vals: number[]) => {
    setValues(vals);
    setMin(vals[0]);
    setMax(vals[1]);
  };

  return (
    <div className="px-3 py-4">
      <div className="flex justify-between text-xs text-gray-700 mb-2 font-semibold">
        <span>₹{values[0]}</span>
        <span>₹{values[1]}</span>
      </div>
      <div className="relative">
        <Range
          values={values}
          step={STEP}
          min={initialMin}
          max={initialMax}
          onChange={handleChange}
          renderTrack={({ props, children }) => {
            const [minVal, maxVal] = values;
            const left = `${((minVal - initialMin) / (initialMax - initialMin)) * 100}%`;
            const right = `${100 - ((maxVal - initialMin) / (initialMax - initialMin)) * 100}%`;

            return (
              <div
                {...props}
                className="w-full h-2 rounded-full bg-purple-200 relative"
              >
                <div
                  className="absolute h-2 bg-[#22365D] rounded-full"
                  style={{
                    left: left,
                    right: right,
                  }}
                />
                {children}
              </div>
            );
          }}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="w-4 h-4 bg-white rounded-full border-2 border-black shadow-md cursor-pointer"
            />
          )}
        />
      </div>

    </div>
  );
};

export default PriceRangeSlider;

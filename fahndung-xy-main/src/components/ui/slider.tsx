"use client"

import * as React from "react"

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, onValueChange, min = 0, max = 100, step = 1, className = "" }, ref) => {
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || 0}
        onChange={(e) => onValueChange([parseInt(e.target.value) || 0])}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${className}`}
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value[0] || 0) - min) / (max - min) * 100}%, #e5e7eb ${((value[0] || 0) - min) / (max - min) * 100}%, #e5e7eb 100%)`
        }}
      />
    )
  }
)

Slider.displayName = "Slider"

export { Slider } 
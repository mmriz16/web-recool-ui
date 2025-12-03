"use client";

import React from "react";

interface SliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
}

export function Slider({
  label = "",
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = "#191DFA", // default biru Tailwind: bg-blue-600
}: SliderProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        <span className="text-sm text-[var(--text-tertiary)]">{value}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
        style={
          {
            "--value": `${((value - min) / (max - min)) * 100}%`,
            "--color": color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

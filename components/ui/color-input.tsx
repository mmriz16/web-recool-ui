"use client";

import { RefreshCcw } from "lucide-react"; // icon from lucide-react

interface ColorInputProps {
  color: string;
  onChangeColor: (newColor: string) => void;
  onRefresh?: () => void;
}

export function ColorInput({ color, onChangeColor, onRefresh }: ColorInputProps) {
  return (
    <div className="flex items-center gap-3 h-[52px] border border-black/10 rounded-xl px-4 py-4 w-full max-w-sm bg-white">
      {/* Color Preview */}
      <div
        className="w-[34px] h-[24px] rounded-[8px] border border-black/10 bg-white cursor-pointer"
        style={{ backgroundColor: color }}
        onClick={() => {
          const input = prompt("Enter HEX color:", color);
          if (input) onChangeColor(input);
        }}
      />

      {/* HEX Text */}
      <input
        type="text"
        value={color}
        placeholder="e.g. #191DFA"
        onChange={(e) => onChangeColor(e.target.value)}
        className="w-full bg-transparent outline-none text-sm font-medium text-gray-800"
      />

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition"
      >
        <RefreshCcw size={18} />
      </button>
    </div>
  );
}

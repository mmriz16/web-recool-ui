"use client";

import { RefreshCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface ColorInputProps {
  color: string;
  onChangeColor: (newColor: string) => void;
  onRefresh?: () => void;
  enablePicker?: boolean;
}

export function ColorInput({ color, onChangeColor, onRefresh, enablePicker = false }: ColorInputProps) {
  const previewColor = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color) ? color.toUpperCase() : "#FFFFFF";
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        buttonRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }

    if (isPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isPickerOpen]);

  const handleManualInput = () => {
    const input = prompt("Enter HEX color:", previewColor);
    if (input) {
      const next = normalizeHex(input);
      if (next) onChangeColor(next);
    }
  };

  const handleColorChange = (colorResult: ColorResult) => {
    const hex = colorResult.hex.toUpperCase();
    onChangeColor(hex);
  };

  return (
    <div className="flex items-center gap-3 h-[52px] border border-[var(--border-color)] rounded-xl px-4 py-4 w-full max-w-sm bg-[var(--bg-secondary)] relative">
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => enablePicker && setIsPickerOpen(!isPickerOpen)}
          className="relative w-[34px] h-[24px] rounded-[8px] border border-[var(--border-color)] cursor-pointer"
          style={{ backgroundColor: previewColor }}
          aria-label={enablePicker ? "Open color picker" : "Edit base color"}
        >
          {!enablePicker && (
            <div
              className="absolute inset-0 w-full rounded-[8px]"
              onClick={handleManualInput}
            />
          )}
        </button>

        {enablePicker && isPickerOpen && (
          <div
            ref={pickerRef}
            className="absolute top-full left-0 mt-2 z-50"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <ChromePicker
              color={previewColor}
              onChange={handleColorChange}
              disableAlpha
            />
          </div>
        )}
      </div>

      <input
        type="text"
        value={color.toUpperCase()}
        placeholder="e.g. #191DFA"
        onChange={(e) => {
          const next = normalizeHex(e.target.value);
          onChangeColor(next ?? e.target.value.toUpperCase());
        }}
        className="w-full bg-transparent outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
      />
      <button
        type="button"
        onClick={onRefresh}
        className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition"
      >
        <RefreshCcw size={18} />
      </button>
    </div>
  );
}

function normalizeHex(value: string) {
  let hex = value.trim().toUpperCase();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (/^#[0-9A-F]{6}$/.test(hex)) return hex;
  if (/^#[0-9A-F]{3}$/.test(hex)) {
    return (
      "#" +
      hex
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("")
    );
  }
  return null;
}

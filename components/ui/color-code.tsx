"use client";

import { useState } from "react";

type ColorCodeProps = {
    label: string;
    hex: string;
    isBase?: boolean;
};

export default function ColorCode({ label, hex, isBase = false }: ColorCodeProps) {
    const [copied, setCopied] = useState(false);

    const textColor = getContrastingColor(hex);
    const hoverBgColor = hexToRgba(hex, 1);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(hex);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore
        }
    };

    const badgeTone =
        textColor === "#0F172A"
            ? "border-black/10 bg-black/5 text-gray-900"
            : "border-white/30 bg-white/15 text-white/90";

    return (
        <div className="group relative h-[120px] w-full">
            <div
                className="absolute inset-0 flex flex-col justify-between p-4 transition-opacity group-hover:opacity-0"
                style={{ backgroundColor: hex, color: textColor }}
            >
                <div className="flex w-full items-start justify-between">
                    {isBase ? (
                        <span
                            className={`rounded-full px-2 py-[2px] text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm ${badgeTone}`}
                        >
                            Base
                        </span>
                    ) : (
                        <span />
                    )}
                    <h1 className="font-medium text-base">{label}</h1>
                </div>
                <p className="font-medium text-sm self-end">{hex}</p>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                <button
                    type="button"
                    className="color-code-copy-btn cursor-pointer w-full h-full px-3 py-1 text-sm font-medium transition-all border-0 outline-none"
                    style={{ 
                        color: textColor
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.setProperty('background-color', hoverBgColor, 'important');
                        e.currentTarget.style.setProperty('background', hoverBgColor, 'important');
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.setProperty('background-color', 'transparent', 'important');
                        e.currentTarget.style.setProperty('background', 'transparent', 'important');
                    }}
                    onClick={handleCopy}
                >
                    {copied ? "Copied!" : "Copy HEX"}
                </button>
            </div>
        </div>
    );
}

function getContrastingColor(hex: string) {
    let sanitized = hex.replace("#", "");
    if (sanitized.length === 3) {
        sanitized = sanitized
            .split("")
            .map((char) => char + char)
            .join("");
    }
    const r = parseInt(sanitized.slice(0, 2), 16) / 255;
    const g = parseInt(sanitized.slice(2, 4), 16) / 255;
    const b = parseInt(sanitized.slice(4, 6), 16) / 255;

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.6 ? "#0F172A" : "#FFFFFF";
}

function hexToRgba(hex: string, alpha: number): string {
    let sanitized = hex.replace("#", "");
    if (sanitized.length === 3) {
        sanitized = sanitized
            .split("")
            .map((char) => char + char)
            .join("");
    }
    const r = parseInt(sanitized.slice(0, 2), 16);
    const g = parseInt(sanitized.slice(2, 4), 16);
    const b = parseInt(sanitized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
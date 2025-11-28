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

            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                <button
                    type="button"
                    className="cursor-pointer rounded-xl bg-white/80 px-3 py-1 text-sm font-medium text-black hover:bg-white"
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
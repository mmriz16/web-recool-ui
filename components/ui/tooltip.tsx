"use client";

import React, { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface TooltipColorInfo {
    label: string;
    hex: string;
}

export interface ContrastTooltipProps {
    children: React.ReactNode;
    apcaContrast: number;
    wcagRatio: number;
    guidelineMode: "apca" | "wcag2";
    backgroundColor: TooltipColorInfo;
    textColor: TooltipColorInfo;
}

export default function ContrastTooltip({
    children,
    apcaContrast,
    wcagRatio,
    guidelineMode,
    backgroundColor,
    textColor,
}: ContrastTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const tooltipWidth = 172;
            const tooltipHeight = 170;

            // Calculate position - center horizontally above the element
            let top = rect.top - tooltipHeight;
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

            // If tooltip would go above viewport, show below instead
            if (top < 4) {
                top = rect.bottom + 4;
            }

            // Ensure tooltip stays within horizontal viewport bounds
            if (left < 4) {
                left = 4;
            }
            if (left + tooltipWidth > window.innerWidth - 4) {
                left = window.innerWidth - tooltipWidth - 4;
            }

            // Ensure tooltip doesn't go below viewport
            if (top + tooltipHeight > window.innerHeight - 4) {
                top = rect.top - tooltipHeight - 4;
            }

            setTooltipPosition({ top, left });
            setIsVisible(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
        setTooltipPosition(null);
    }, []);

    // Determine contrast label and value based on guideline mode
    const contrastLabel = guidelineMode === "apca" ? "APCA Contrast" : "WCAG Contrast";
    const formatWcagRatio = (ratio: number) => {
        const rounded = Math.round(ratio * 10) / 10;
        return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    };
    const contrastValue = guidelineMode === "apca" ? Math.round(apcaContrast) : formatWcagRatio(wcagRatio);

    // Create tooltip content
    const tooltipContent = isVisible && tooltipPosition && (
        <div
            className="fixed z-9999 pointer-events-none"
            style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
            }}
        >
            <div className="flex flex-col w-[172px] border border-(--border-color) bg-(--bg-secondary) text-(--text-primary) rounded-lg shadow-lg">
                {/* Header - Contrast */}
                <div className="flex flex-row w-full items-center justify-between border-b border-(--border-color) px-4 py-2.5">
                    <h1 className="font-semibold text-xs">{contrastLabel}</h1>
                    <h1 className="font-semibold text-sm">{contrastValue}</h1>
                </div>

                {/* Body - Color Info */}
                <div className="flex flex-col w-full justify-between px-4 py-2.5 gap-2">
                    {/* Background Color */}
                    <div className="flex flex-col gap-2">
                        <h1 className="font-semibold text-xs">Background</h1>
                        <div className="flex flex-row items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex w-[20px] h-[20px] rounded-[4px] border border-(--border-color)"
                                    style={{ backgroundColor: backgroundColor.hex }}
                                />
                                <h1 className="font-semibold text-xs">{backgroundColor.label}</h1>
                            </div>
                            <h1 className="font-semibold text-[11px]">{backgroundColor.hex.toUpperCase()}</h1>
                        </div>
                    </div>

                    {/* Text Color */}
                    <div className="flex flex-col gap-2">
                        <h1 className="font-semibold text-xs">Text</h1>
                        <div className="flex flex-row items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex w-[20px] h-[20px] rounded-[4px] border border-(--border-color)"
                                    style={{ backgroundColor: textColor.hex }}
                                />
                                <h1 className="font-semibold text-xs">{textColor.label}</h1>
                            </div>
                            <h1 className="font-semibold text-[11px]">{textColor.hex.toUpperCase()}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div
                ref={containerRef}
                className="inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {typeof document !== "undefined" && tooltipContent && createPortal(tooltipContent, document.body)}
        </>
    );
}
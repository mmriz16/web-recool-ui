"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type PaletteContextValue = {
    baseHex: string;
    hueShift: number;
    saturationBoost: number;
    setBaseHex: (value: string) => void;
    setHueShift: (value: number) => void;
    setSaturationBoost: (value: number) => void;
};

const DEFAULT_BASE = "#191DFA";
const DEFAULT_SHIFT = 50;

const PaletteContext = createContext<PaletteContextValue | undefined>(undefined);

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export function PaletteProvider({ children }: { children: ReactNode }) {
    const [baseHex, setBaseHexState] = useState<string>(DEFAULT_BASE);
    const [hueShift, setHueShiftState] = useState<number>(DEFAULT_SHIFT);
    const [saturationBoost, setSaturationBoostState] =
        useState<number>(DEFAULT_SHIFT);

    const setBaseHex = (value: string) => {
        const normalized = normalizeHex(value);
        if (normalized) {
            setBaseHexState(normalized);
        }
    };

    const value = useMemo<PaletteContextValue>(
        () => ({
            baseHex,
            hueShift,
            saturationBoost,
            setBaseHex,
            setHueShift: (val: number) =>
                setHueShiftState(clamp(Math.round(val), 0, 100)),
            setSaturationBoost: (val: number) =>
                setSaturationBoostState(clamp(Math.round(val), 0, 100)),
        }),
        [baseHex, hueShift, saturationBoost],
    );

    return (
        <PaletteContext.Provider value={value}>
            {children}
        </PaletteContext.Provider>
    );
}

export function usePaletteContext() {
    const context = useContext(PaletteContext);
    if (!context) {
        throw new Error(
            "usePaletteContext must be used within a PaletteProvider",
        );
    }
    return context;
}

function normalizeHex(value: string): string | null {
    if (!value) return null;
    let hex = value.trim().toUpperCase();
    if (!hex.startsWith("#")) {
        hex = `#${hex}`;
    }

    if (/^#[0-9A-F]{6}$/.test(hex)) {
        return hex;
    }

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


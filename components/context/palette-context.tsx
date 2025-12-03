"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type ColorPalette = {
    id: string;
    name: string;
    description: string;
    hex: string;
    hueShift: number;
    saturationBoost: number;
};

type PaletteContextValue = {
    baseHex: string;
    hueShift: number;
    saturationBoost: number;
    selectedPaletteId: string | null;
    palettes: ColorPalette[];
    setBaseHex: (value: string) => void;
    setHueShift: (value: number) => void;
    setSaturationBoost: (value: number) => void;
    addPalette: (palette: Omit<ColorPalette, "id">) => void;
    selectPalette: (id: string) => void;
    deletePalette: (id: string) => void;
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
    const [palettes, setPalettes] = useState<ColorPalette[]>([]);
    const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

    const setBaseHex = (value: string) => {
        const normalized = normalizeHex(value);
        if (normalized) {
            setBaseHexState(normalized);
        }
    };

    const addPalette = (palette: Omit<ColorPalette, "id">) => {
        const newPalette: ColorPalette = {
            ...palette,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        setPalettes((prev) => [...prev, newPalette]);
        setSelectedPaletteId(newPalette.id);
        setBaseHex(newPalette.hex);
        setHueShiftState(newPalette.hueShift);
        setSaturationBoostState(newPalette.saturationBoost);
    };

    const selectPalette = (id: string) => {
        const palette = palettes.find((p) => p.id === id);
        if (palette) {
            setSelectedPaletteId(id);
            setBaseHex(palette.hex);
            setHueShiftState(palette.hueShift);
            setSaturationBoostState(palette.saturationBoost);
        }
    };

    const deletePalette = (id: string) => {
        setPalettes((prev) => prev.filter((p) => p.id !== id));
        if (selectedPaletteId === id) {
            setSelectedPaletteId(null);
            setBaseHex(DEFAULT_BASE);
            setHueShiftState(DEFAULT_SHIFT);
            setSaturationBoostState(DEFAULT_SHIFT);
        }
    };

    const value = useMemo<PaletteContextValue>(
        () => ({
            baseHex,
            hueShift,
            saturationBoost,
            selectedPaletteId,
            palettes,
            setBaseHex,
            setHueShift: (val: number) =>
                setHueShiftState(clamp(Math.round(val), 0, 100)),
            setSaturationBoost: (val: number) =>
                setSaturationBoostState(clamp(Math.round(val), 0, 100)),
            addPalette,
            selectPalette,
            deletePalette,
        }),
        [baseHex, hueShift, saturationBoost, selectedPaletteId, palettes],
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


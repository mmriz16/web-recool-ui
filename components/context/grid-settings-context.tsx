"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

type GridSettingsContextValue = {
    columns: number;
    rows: number;
    gap: number;
    setColumns: (value: number) => void;
    setRows: (value: number) => void;
    setGap: (value: number) => void;
    reset: () => void;
};

const GridSettingsContext = createContext<GridSettingsContextValue | null>(null);

const DEFAULT_COLUMNS = 6;
const DEFAULT_ROWS = 5;
const DEFAULT_GAP = 10;

const clampNumber = (value: number, min: number, max: number) => {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
};

export function GridSettingsProvider({ children }: { children: ReactNode }) {
    const [columns, setColumnsState] = useState(DEFAULT_COLUMNS);
    const [rows, setRowsState] = useState(DEFAULT_ROWS);
    const [gap, setGapState] = useState(DEFAULT_GAP);

    const setColumns = useCallback(
        (value: number) => setColumnsState(clampNumber(value, 1, 36)),
        [],
    );

    const setRows = useCallback(
        (value: number) => setRowsState(clampNumber(value, 1, 36)),
        [],
    );

    const setGap = useCallback(
        (value: number) => {
            const allowed = new Set([
                0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 288, 320, 384
            ]);
            const clamped = clampNumber(value, 0, 384);
            setGapState(allowed.has(clamped) ? clamped : DEFAULT_GAP);
        },
        [],
    );

    const reset = useCallback(() => {
        setColumnsState(DEFAULT_COLUMNS);
        setRowsState(DEFAULT_ROWS);
        setGapState(DEFAULT_GAP);
    }, []);

    const value = useMemo<GridSettingsContextValue>(
        () => ({
            columns,
            rows,
            gap,
            setColumns,
            setRows,
            setGap,
            reset,
        }),
        [columns, gap, reset, rows, setColumns, setGap, setRows],
    );

    return (
        <GridSettingsContext.Provider value={value}>
            {children}
        </GridSettingsContext.Provider>
    );
}

export function useGridSettings() {
    const context = useContext(GridSettingsContext);
    if (!context) {
        throw new Error("useGridSettings must be used within GridSettingsProvider");
    }
    return context;
}


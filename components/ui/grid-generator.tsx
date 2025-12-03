"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent,
} from "react";
import { MoveDiagonal2 } from "lucide-react";

export type GridLayoutItem = {
    id: string;
    label: string;
    colSpan: number;
    rowSpan: number;
    position: { col: number; row: number };
};

export type GridLayoutSnapshot = {
    columns: number;
    rows: number;
    gap: number;
    items: GridLayoutItem[];
};

type GridGeneratorProps = {
    columns: number;
    rows: number;
    gap?: number;
    onLayoutChange?: (snapshot: GridLayoutSnapshot) => void;
};

type GridItemData = GridLayoutItem;

type ResizeState = {
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    startColSpan: number;
    startRowSpan: number;
    col: number;
    row: number;
    snapshot: GridItemData[];
};

type GridSnapshot = GridItemData[];

const MAX_ITEMS = 12;

const COL_SPAN_CLASSES: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
};

const ROW_SPAN_CLASSES: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
    7: "row-span-7",
    8: "row-span-8",
    9: "row-span-9",
    10: "row-span-10",
    11: "row-span-11",
    12: "row-span-12",
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const formatLabel = (value: number) => value.toString().padStart(2, "0");

const cloneItems = (items: GridItemData[]): GridItemData[] =>
    items.map((item) => ({
        ...item,
        position: { ...item.position },
    }));

const areItemsEqual = (a: GridItemData[], b: GridItemData[]) => {
    if (a.length !== b.length) return false;
    return a.every((item, index) => {
        const other = b[index];
        return (
            item.id === other.id &&
            item.label === other.label &&
            item.colSpan === other.colSpan &&
            item.rowSpan === other.rowSpan &&
            item.position.col === other.position.col &&
            item.position.row === other.position.row
        );
    });
};

const createId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

const createInitialItems = (columns: number, rows: number): GridItemData[] => {
    const totalCells = columns * rows;
    if (!totalCells) return [];

    const items: GridItemData[] = [
        {
            id: createId(),
            label: "01",
            colSpan: 1,
            rowSpan: 1,
            position: { col: 1, row: 1 },
        },
    ];

    if (totalCells > 1) {
        const secondPosition =
            columns > 1 ? { col: 2, row: 1 } : { col: 1, row: 2 };
        items.push({
            id: createId(),
            label: "02",
            colSpan: 1,
            rowSpan: 1,
            position: secondPosition,
        });
    }

    return items;
};

const getNextAvailableNumber = (items: GridItemData[], limit: number) => {
    const maxAllowed = Math.min(MAX_ITEMS, limit);
    const used = new Set(items.map((item) => Number(item.label)));
    for (let i = 1; i <= maxAllowed; i++) {
        if (!used.has(i)) {
            return i;
        }
    }
    return maxAllowed + 1;
};

export default function GridGenerator({
    columns,
    rows,
    gap = 16,
    onLayoutChange,
}: GridGeneratorProps) {
    return (
        <GridContainer
            columns={columns}
            rows={rows}
            gap={gap}
            onLayoutChange={onLayoutChange}
        />
    );
}

function GridContainer({
    columns,
    rows,
    gap = 16,
    onLayoutChange,
}: GridGeneratorProps) {
    const totalCells = Math.max(columns * rows, 0);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [items, setItems] = useState<GridItemData[]>(() =>
        createInitialItems(columns, rows),
    );
    const [undoStack, setUndoStack] = useState<GridSnapshot[]>([]);
    const [redoStack, setRedoStack] = useState<GridSnapshot[]>([]);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);

    const nextNumber = getNextAvailableNumber(items, totalCells);
    const canAddMore = nextNumber <= Math.min(MAX_ITEMS, totalCells);

    const occupancy = useMemo(() => {
        const map = new Map<string, GridItemData>();
        items.forEach((item) => {
            for (let r = 0; r < item.rowSpan; r++) {
                for (let c = 0; c < item.colSpan; c++) {
                    const key = `${item.position.row + r}-${item.position.col + c}`;
                    map.set(key, item);
                }
            }
        });
        return map;
    }, [items]);

    const placeholders = useMemo(() => {
        const cells: { row: number; col: number }[] = [];
        for (let row = 1; row <= rows; row++) {
            for (let col = 1; col <= columns; col++) {
                if (!occupancy.has(`${row}-${col}`)) {
                    cells.push({ row, col });
                }
            }
        }
        return cells;
    }, [columns, rows, occupancy]);

    const isAreaFree = useCallback(
        (col: number, row: number, colSpan: number, rowSpan: number, ignoreId?: string) => {
            if (col < 1 || row < 1) return false;
            if (col + colSpan - 1 > columns) return false;
            if (row + rowSpan - 1 > rows) return false;

            return items.every((item) => {
                if (item.id === ignoreId) return true;
                const left = item.position.col;
                const right = item.position.col + item.colSpan - 1;
                const top = item.position.row;
                const bottom = item.position.row + item.rowSpan - 1;

                const newLeft = col;
                const newRight = col + colSpan - 1;
                const newTop = row;
                const newBottom = row + rowSpan - 1;

                const overlaps =
                    left <= newRight &&
                    right >= newLeft &&
                    top <= newBottom &&
                    bottom >= newTop;

                return !overlaps;
            });
        },
        [columns, rows, items],
    );

    const pushUndoSnapshot = useCallback(
        (snapshot?: GridSnapshot) => {
            const safeSnapshot = snapshot ?? cloneItems(items);
            setUndoStack((prev) => [...prev, safeSnapshot]);
            setRedoStack([]);
        },
        [items],
    );

    const handleUndo = useCallback(() => {
        setUndoStack((prev) => {
            if (!prev.length) return prev;
            const nextUndo = [...prev];
            const snapshot = nextUndo.pop()!;
            setRedoStack((redoPrev) => [...redoPrev, cloneItems(items)]);
            setItems(cloneItems(snapshot));
            return nextUndo;
        });
    }, [items]);

    const handleRedo = useCallback(() => {
        setRedoStack((prev) => {
            if (!prev.length) return prev;
            const nextRedo = [...prev];
            const snapshot = nextRedo.pop()!;
            setUndoStack((undoPrev) => [...undoPrev, cloneItems(items)]);
            setItems(cloneItems(snapshot));
            return nextRedo;
        });
    }, [items]);

    const canUndo = undoStack.length > 0;
    const canRedo = redoStack.length > 0;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isMeta = event.metaKey || event.ctrlKey;
            if (!isMeta) return;
            const key = event.key.toLowerCase();
            if (key === "z" && !event.shiftKey && canUndo) {
                event.preventDefault();
                handleUndo();
                return;
            }
            if (((key === "z" && event.shiftKey) || key === "y") && canRedo) {
                event.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleUndo, handleRedo, canUndo, canRedo]);

    const handleAdd = (row: number, col: number) => {
        if (!canAddMore) return;
        if (!isAreaFree(col, row, 1, 1)) return;

        pushUndoSnapshot();
        setItems((prev) => [
            ...prev,
            {
                id: createId(),
                label: formatLabel(nextNumber),
                colSpan: 1,
                rowSpan: 1,
                position: { col, row },
            },
        ]);
    };

    const handleRemove = (id: string) => {
        pushUndoSnapshot();
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateItemSpan = (id: string, colSpan: number, rowSpan: number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, colSpan, rowSpan } : item,
            ),
        );
    };

    const handleResizeStart = (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => {
        event.preventDefault();
        event.stopPropagation();
        const snapshot = cloneItems(items);
        setResizeState({
            id: item.id,
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startColSpan: item.colSpan,
            startRowSpan: item.rowSpan,
            col: item.position.col,
            row: item.position.row,
            snapshot,
        });
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleResizeMove = (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => {
        if (!resizeState || resizeState.id !== item.id) return;
        if (resizeState.pointerId !== event.pointerId) return;
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const cellWidth = rect.width / columns || 1;
        const cellHeight = rect.height / rows || 1;

        const deltaX = event.clientX - resizeState.startX;
        const deltaY = event.clientY - resizeState.startY;

        const deltaCols = Math.round(deltaX / cellWidth);
        const deltaRows = Math.round(deltaY / cellHeight);

        let newColSpan = clamp(
            resizeState.startColSpan + deltaCols,
            1,
            columns - resizeState.col + 1,
        );
        let newRowSpan = clamp(
            resizeState.startRowSpan + deltaRows,
            1,
            rows - resizeState.row + 1,
        );

        while (
            newColSpan > 0 &&
            newRowSpan > 0 &&
            !isAreaFree(
                resizeState.col,
                resizeState.row,
                newColSpan,
                newRowSpan,
                resizeState.id,
            )
        ) {
            if (newColSpan > resizeState.startColSpan) {
                newColSpan -= 1;
                continue;
            }
            if (newRowSpan > resizeState.startRowSpan) {
                newRowSpan -= 1;
                continue;
            }
            newColSpan = resizeState.startColSpan;
            newRowSpan = resizeState.startRowSpan;
            break;
        }

        updateItemSpan(resizeState.id, newColSpan, newRowSpan);
    };

    const handleResizeEnd = (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => {
        if (!resizeState || resizeState.id !== item.id) return;
        if (resizeState.pointerId !== event.pointerId) return;
        event.stopPropagation();
        event.preventDefault();
        event.currentTarget.releasePointerCapture(event.pointerId);

        const hasChanged = !areItemsEqual(resizeState.snapshot, items);
        if (hasChanged) {
            setUndoStack((prev) => [...prev, resizeState.snapshot]);
            setRedoStack([]);
        }

        setResizeState(null);
    };

    const gridStyle = useMemo(
        () => ({
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gap: `${gap}px`,
        }),
        [columns, rows, gap],
    );

    useEffect(() => {
        if (!onLayoutChange) return;
        const normalizedItems: GridLayoutItem[] = [...items]
            .map((item) => ({
                id: item.id,
                label: item.label,
                colSpan: item.colSpan,
                rowSpan: item.rowSpan,
                position: { ...item.position },
            }))
            .sort((a, b) => Number(a.label) - Number(b.label));
        onLayoutChange({
            columns,
            rows,
            gap,
            items: normalizedItems,
        });
    }, [items, columns, rows, gap, onLayoutChange]);

    return (
        <div className="flex h-full w-full flex-col">
            <div
                ref={containerRef}
                className="grid flex-1 rounded-2xl bg-muted/30"
                style={gridStyle}
            >
                {items.map((item) => (
                    <GridItem
                        key={item.id}
                        item={item}
                        onRemove={handleRemove}
                        onResizeStart={handleResizeStart}
                        onResizeMove={handleResizeMove}
                        onResizeEnd={handleResizeEnd}
                    />
                ))}
                {placeholders.map(({ row, col }) => (
                    <button
                        key={`placeholder-${row}-${col}`}
                        type="button"
                        onClick={() => handleAdd(row, col)}
                        disabled={!canAddMore}
                        style={{
                            gridColumn: `${col} / span 1`,
                            gridRow: `${row} / span 1`,
                        }}
                        className="flex items-center justify-center rounded-2xl bg-[var(--bg-tertiary)] text-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30"
                    >
                        +
                    </button>
                ))}
            </div>
        </div>
    );
}

type GridItemProps = {
    item: GridItemData;
    onRemove: (id: string) => void;
    onResizeStart: (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => void;
    onResizeMove: (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => void;
    onResizeEnd: (
        event: PointerEvent<HTMLButtonElement>,
        item: GridItemData,
    ) => void;
};

function GridItem({
    item,
    onRemove,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
}: GridItemProps) {
    const colSpanClass = COL_SPAN_CLASSES[item.colSpan] ?? "";
    const rowSpanClass = ROW_SPAN_CLASSES[item.rowSpan] ?? "";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onRemove(item.id)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRemove(item.id);
                }
            }}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border border-[var(--bg-grid-stroke)]/10 bg-[var(--bg-grid-item)] text-[var(--bg-grid-stroke)] ${colSpanClass} ${rowSpanClass}`}
            style={{
                gridColumn: `${item.position.col} / span ${item.colSpan}`,
                gridRow: `${item.position.row} / span ${item.rowSpan}`,
            }}
        >
            <span className="text-xl font-semibold">{item.label}</span>
            <span className="text-[11px] text-[var(--bg-grid-stroke)]">
                {COL_SPAN_CLASSES[item.colSpan]} · {ROW_SPAN_CLASSES[item.rowSpan]}
            </span>
            <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => onResizeStart(event, item)}
                onPointerMove={(event) => onResizeMove(event, item)}
                onPointerUp={(event) => onResizeEnd(event, item)}
                onPointerCancel={(event) => onResizeEnd(event, item)}
                className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg border border-black/10 bg-[var(--bg-secondary)] text-black/60 cursor-nwse-resize"
                aria-label="Resize grid item"
            >
                <MoveDiagonal2 className="h-3.5 w-3.5 rotate-180 text-[var(--text-secondary)]" />
            </button>
        </div>
    );
}


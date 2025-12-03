"use client";

import { useGridSettings } from "@/components/context/grid-settings-context";

export default function Grid() {
    const { columns, rows, gap, setColumns, setRows, setGap } = useGridSettings();
    const gapScale = Math.round(gap / 4);

    return (
        <div className="flex flex-col space-y-6 h-full">
            <div className="flex flex-col space-y-6">
                <h1 className="font-medium uppercase text-[var(--text-primary)]">Settings</h1>
                <div className="flex flex-col space-y-2.5 font-medium text-sm gap">
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm text-[var(--text-primary)]">Columns</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <span className="text-sm font-medium whitespace-nowrap text-[var(--text-secondary)]">grid - cols -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-[var(--text-primary)]"
                                type="number"
                                min={1}
                                max={12}
                                value={columns}
                                onChange={(event) => setColumns(Number(event.target.value) || 0)}
                            />
                        </div>
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm text-[var(--text-primary)]">Rows</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <span className="text-sm font-medium whitespace-nowrap text-[var(--text-secondary)]">grid - rows -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-[var(--text-primary)]"
                                type="number"
                                min={1}
                                max={12}
                                value={rows}
                                onChange={(event) => setRows(Number(event.target.value) || 0)}
                            />
                        </div>
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm text-[var(--text-primary)]">Gap</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
                            <span className="text-sm font-medium whitespace-nowrap text-[var(--text-secondary)]">gap -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-[var(--text-primary)]"
                                type="number"
                                min={0}
                                max={12}
                                value={gapScale}
                                onChange={(event) => {
                                    const nextValue = Math.min(
                                        12,
                                        Math.max(0, Number(event.target.value) || 0),
                                    );
                                    setGap(nextValue * 4);
                                }}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}


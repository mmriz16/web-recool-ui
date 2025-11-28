"use client";

import { useState } from "react";
import { useGridSettings } from "@/components/context/grid-settings-context";

export default function Grid() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const { columns, rows, gap, setColumns, setRows, setGap } = useGridSettings();
    const gapScale = Math.round(gap / 4);

    return (
        <div className="flex flex-col space-y-6 h-full justify-between">
            <div className="flex flex-col space-y-6">
                <h1 className="font-medium uppercase">Settings</h1>
                <div className="flex flex-col space-y-2.5 font-medium text-sm gap">
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm">Columns</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-black/10">
                            <span className="text-sm font-medium whitespace-nowrap">grid - cols -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-gray-800"
                                type="number"
                                min={1}
                                max={12}
                                value={columns}
                                onChange={(event) => setColumns(Number(event.target.value) || 0)}
                            />
                        </div>
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm">Rows</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-black/10">
                            <span className="text-sm font-medium whitespace-nowrap">grid - rows -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-gray-800"
                                type="number"
                                min={1}
                                max={12}
                                value={rows}
                                onChange={(event) => setRows(Number(event.target.value) || 0)}
                            />
                        </div>
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="font-medium text-sm">Gap</p>
                        <div className="flex items-center gap-1 w-full p-4 rounded-xl border border-black/10">
                            <span className="text-sm font-medium whitespace-nowrap">gap -</span>
                            <input
                                className="w-full bg-transparent outline-none text-sm font-medium text-gray-800"
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
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2.5 font-medium text-sm">
                    <div className="w-full p-4 rounded-2xl border border-black/10 flex items-center justify-between bg-white">
                        <div>
                            <p className="font-medium text-base">Dark Mode</p>
                        </div>
                        <button
                            type="button"
                            aria-pressed={isDarkMode}
                            onClick={() => setIsDarkMode((prev) => !prev)}
                            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${isDarkMode ? "bg-[#191DFA]" : "bg-black/10"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? "translate-x-4" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


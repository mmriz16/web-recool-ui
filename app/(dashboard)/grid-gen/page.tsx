"use client";

import Navbar from "@/components/layout/navbar";
import Sidemenu from "@/components/layout/sidemenu";
import { useCallback, useState } from "react";
import Card from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import {
    GridSettingsProvider,
    useGridSettings,
} from "@/components/context/grid-settings-context";
import GridGenerator, {
    type GridLayoutSnapshot,
} from "@/components/ui/grid-generator";
import GeneratedCode from "@/components/ui/generated-code";
import Guide from "@/components/ui/guide";

export default function GridGen() {
    return (
        <GridSettingsProvider>
            <GridContent />
        </GridSettingsProvider>
    );
}

type TabKey = "editor" | "code" | "guide";

type GeneratedCodeState = {
    html: string;
    jsx: string;
};

const INITIAL_CODE: GeneratedCodeState = {
    html: "",
    jsx: "",
};

function GridContent() {
    const { reset } = useGridSettings();
    const [activeTab, setActiveTab] = useState<TabKey>("editor");
    const [generatedCode, setGeneratedCode] =
        useState<GeneratedCodeState>(INITIAL_CODE);

    const handleLayoutChange = useCallback((snapshot: GridLayoutSnapshot) => {
        setGeneratedCode(generateCodeStrings(snapshot));
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-row h-full">
                <Sidemenu />
                <div className="flex flex-col h-full w-full items-center justify-between p-6 gap-[10px]">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex-1 h-full">
                            <h1 className="font-bold text-2xl">Grid Generator</h1>
                            <p className="text-sm text-foreground/50">
                                Generate a grid of elements based on a given number of columns and rows.
                            </p>
                        </div>
                        <div className="flex flex-row gap-2">
                            <div className="flex bg-white p-[2px] rounded-2xl w-fit">
                                <button
                                    className={`px-4 py-3.5 rounded-[14px] font-medium transition ${
                                        activeTab === "editor"
                                            ? "bg-[#f7f7f7] text-black"
                                            : "text-gray-500 hover:text-black"
                                    }`}
                                    onClick={() => setActiveTab("editor")}
                                >
                                    Editor
                                </button>
                                <button
                                    className={`px-4 py-3.5 rounded-[14px] font-medium transition ${
                                        activeTab === "code"
                                            ? "bg-[#f7f7f7] text-black"
                                            : "text-gray-500 hover:text-black"
                                    }`}
                                    onClick={() => setActiveTab("code")}
                                >
                                    Generated Code
                                </button>
                                <button
                                    className={`px-4 py-3.5 rounded-[14px] font-medium transition ${
                                        activeTab === "guide"
                                            ? "bg-[#f7f7f7] text-black"
                                            : "text-gray-500 hover:text-black"
                                    }`}
                                    onClick={() => setActiveTab("guide")}
                                >
                                    Guide
                                </button>
                            </div>
                            <button
                                className="px-4 py-3.5 rounded-xl bg-white font-medium text-black cursor-pointer"
                                title="Reset Grid"
                                onClick={reset}
                            >
                                <RefreshCw size={20} className="text-black" />
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-full">
                        <section className={`${activeTab === "editor" ? "block" : "hidden"} h-full`}>
                            <Card>
                                <GridCanvas onLayoutChange={handleLayoutChange} />
                            </Card>
                        </section>
                        <section className={`${activeTab === "code" ? "block" : "hidden"} h-full`}>
                            <Card>
                                <GeneratedCode code={generatedCode} />
                            </Card>
                        </section>
                        <section className={`${activeTab === "guide" ? "block" : "hidden"} h-full`}>
                            <Card>
                                <Guide />
                            </Card>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GridCanvas({
    onLayoutChange,
}: {
    onLayoutChange?: (snapshot: GridLayoutSnapshot) => void;
}) {
    const { columns, rows, gap } = useGridSettings();
    return (
        <GridGenerator
            columns={columns}
            rows={rows}
            gap={gap}
            onLayoutChange={onLayoutChange}
        />
    );
}

function generateCodeStrings(snapshot: GridLayoutSnapshot): GeneratedCodeState {
    const { columns, rows, gap, items } = snapshot;
    if (!items.length) {
        return { html: "", jsx: "" };
    }

    const gapClass =
        gap % 4 === 0 && gap / 4 <= 64
            ? `gap-${gap / 4}`
            : `gap-[${gap}px]`;
    const wrapperClass = `grid grid-cols-${columns} grid-rows-${rows} ${gapClass}`;

    const lines = items
        .slice()
        .sort((a, b) => Number(a.label) - Number(b.label))
        .map((item) => {
            const classes: string[] = [];
            if (item.colSpan > 1) classes.push(`col-span-${item.colSpan}`);
            if (item.rowSpan > 1) classes.push(`row-span-${item.rowSpan}`);
            if (item.position.col > 1)
                classes.push(`col-start-${item.position.col}`);
            if (item.position.row > 1)
                classes.push(`row-start-${item.position.row}`);
            const classHTML = classes.length
                ? ` class="${classes.join(" ")}"`
                : "";
            const classJSX = classes.length
                ? ` className="${classes.join(" ")}"`
                : "";
            return {
                html: `  <div${classHTML}>${Number(item.label)}</div>`,
                jsx: `  <div${classJSX}>${Number(item.label)}</div>`,
            };
        });

    const html = [
        `<div class="${wrapperClass}">`,
        ...lines.map((line) => line.html),
        `</div>`,
    ].join("\n");

    const jsx = [
        `<div className="${wrapperClass}">`,
        ...lines.map((line) => line.jsx),
        `</div>`,
    ].join("\n");

    return { html, jsx };
}
"use client";

import Navbar from "@/components/layout/navbar";
import Sidemenu from "@/components/layout/sidemenu";
import { useState } from "react";
import Card from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import {
    GridSettingsProvider,
    useGridSettings,
} from "@/components/context/grid-settings-context";
import GridGenerator from "@/components/ui/grid-generator";
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

function GridContent() {
    const { reset } = useGridSettings();
    const [activeTab, setActiveTab] = useState<TabKey>("editor");

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
                        <div className={`${activeTab === "editor" ? "block" : "hidden"} h-full`}>
                            <GridCanvas />
                        </div>
                        <div className={`${activeTab === "code" ? "block" : "hidden"} h-full`}>
                            <GeneratedCode />
                        </div>
                        <div className={`${activeTab === "guide" ? "block" : "hidden"} h-full`}>
                            <Guide />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GridCanvas() {
    const { columns, rows, gap } = useGridSettings();
    return (
        <Card>
            <GridGenerator columns={columns} rows={rows} gap={gap} />
        </Card>
    );
}
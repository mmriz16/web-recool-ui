"use client";

import { BookmarkIcon } from "lucide-react";
import ColorCode from "../ui/color-code";
import Modal from "@/components/ui/modal";
import { useMemo, useState } from "react";
import { usePaletteContext } from "../context/palette-context";
import { generatePalette, getBaseStopIndex } from "@/utils/generatePalette";

export default function Pallete() {
    const [openContrastGrid, setOpenContrastGrid] = useState(false);
    const [openExportCode, setOpenExportCode] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const { baseHex, hueShift, saturationBoost, palettes, selectedPaletteId } = usePaletteContext();
    
    const selectedPalette = useMemo(
        () => palettes.find((p) => p.id === selectedPaletteId),
        [palettes, selectedPaletteId]
    );

    const palette = useMemo(
        () => generatePalette(baseHex, hueShift, saturationBoost),
        [baseHex, hueShift, saturationBoost],
    );
    const baseStopIndex = useMemo(
        () => getBaseStopIndex(baseHex),
        [baseHex],
    );

    const stops = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

    return (
        <div className="flex flex-col space-y-4 h-full justify-between">
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center justify-between text-base">
                    <h1 className="font-bold text-xl">
                        {selectedPalette?.name || "Electrict Violet"}
                    </h1>
                </div>
                <div className="flex gap-5 items-center justify-end p-[2px] rounded-2xl w-fit">
                    <button type="button" onClick={() => setOpenContrastGrid(true)} className="cursor-pointer">Contrast Grid</button>
                    <button type="button" onClick={() => setOpenExportCode(true)} className="cursor-pointer">Export Code</button>
                    <button type="button" onClick={() => setOpenEdit(true)} className="cursor-pointer">Edit</button>
                    <BookmarkIcon size={20} />
                </div>
            </div>

            <div className="flex flex-row rounded-2xl overflow-hidden">
                {stops.map((stop, index) => {
                    const swatchHex = (palette[index] ?? baseHex).toUpperCase();
                    const isBase = index === baseStopIndex;
                    return (
                        <ColorCode
                            key={stop}
                            label={stop}
                            hex={swatchHex}
                            isBase={isBase}
                        />
                    );
                })}
            </div>

            <Modal open={openContrastGrid} onClose={() => setOpenContrastGrid(false)}>
                <h2 className="font-semibold text-xl">Contrast Grid</h2>
                <p className="text-sm">This is the contrast grid for the pallete.</p>
            </Modal>
            <Modal open={openExportCode} onClose={() => setOpenExportCode(false)}>
                <h2 className="font-semibold text-xl">Export Palette</h2>
                <p className="text-sm">Export options will be available soon.</p>
            </Modal>
            <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
                <h2 className="font-semibold text-xl">Edit Palette</h2>
                <p className="text-sm">Palette editing modal placeholder.</p>
            </Modal>
        </div>
    );
}
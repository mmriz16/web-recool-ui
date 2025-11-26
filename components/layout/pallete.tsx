"use client";

import { BookmarkIcon } from "lucide-react";
import ColorCode from "../ui/color-code";
import Modal from "@/components/ui/modal";
import { useState } from "react";

export default function Pallete() {
    const [open, setOpen] = useState(false);
    const [openContrastGrid, setOpenContrastGrid] = useState(false);
    const [openExportCode, setOpenExportCode] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    return (
        <div className="flex flex-col space-y-4 h-full justify-between">
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center justify-between text-base">
                    <h1 className="font-bold text-xl">Electrict Violet</h1>
                </div>
                <div className="flex gap-5 items-center bg-white p-[2px] rounded-2xl w-fit">
                    <button type="button" onClick={() => setOpenContrastGrid(true)} className="cursor-pointer">Contrast Grid</button>
                    <button type="button" onClick={() => setOpenExportCode(true)} className="cursor-pointer">Export Code</button>
                    <button type="button" onClick={() => setOpenEdit(true)} className="cursor-pointer">Edit</button>
                    <BookmarkIcon size={20} />
                </div>
            </div>

            <div className="flex flex-row rounded-2xl overflow-hidden">
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
                <ColorCode />
            </div>

            <Modal open={openContrastGrid} onClose={() => setOpenContrastGrid(false)}>
                <h2 className="font-semibold text-xl">Contrast Grid</h2>
                <p className="text-sm">This is the contrast grid for the pallete.</p>
            </Modal>
        </div>
    );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { Slider } from "../ui/slider";
import { ColorInput } from "../ui/color-input";
import { usePaletteContext } from "../context/palette-context";

export default function Color() {
    const {
        baseHex,
        setBaseHex,
        hueShift,
        setHueShift,
        saturationBoost,
        setSaturationBoost,
        palettes,
        selectedPaletteId,
        addPalette,
        selectPalette,
    } = usePaletteContext();

    const [inputHex, setInputHex] = useState(baseHex);
    const [localHue, setLocalHue] = useState(hueShift);
    const [localSaturation, setLocalSaturation] = useState(saturationBoost);
    const [colorName, setColorName] = useState("");
    const [description, setDescription] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateColorName = useCallback(async (hex: string) => {
        if (!hex || hex === "#" || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex)) {
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/color-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ hex }),
            });

            if (response.ok) {
                const data = await response.json();
                setColorName(data.name || "");
                setDescription(data.description || "");
            } else {
                console.error("Failed to generate color name");
            }
        } catch (error) {
            console.error("Error generating color name:", error);
        } finally {
            setIsGenerating(false);
        }
    }, []);

    function randomColor() {
        const c = Math.floor(Math.random() * 16777215).toString(16);
        const randomHex = `#${c.padStart(6, "0").toUpperCase()}`;
        setInputHex(randomHex);
        setBaseHex(randomHex);
        generateColorName(randomHex);
    }

    useEffect(() => {
        setInputHex(baseHex);
    }, [baseHex]);

    useEffect(() => {
        setLocalHue(hueShift);
    }, [hueShift]);

    useEffect(() => {
        setLocalSaturation(saturationBoost);
    }, [saturationBoost]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setHueShift(localHue);
        }, 150);

        return () => clearTimeout(debounce);
    }, [localHue, setHueShift]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            setSaturationBoost(localSaturation);
        }, 150);

        return () => clearTimeout(debounce);
    }, [localSaturation, setSaturationBoost]);

    const handleHexChange = (value: string) => {
        const formatted = formatHexInput(value);
        setInputHex(formatted);
        setBaseHex(formatted);

        // Generate color name when hex is complete (6 characters)
        if (formatted.length === 7 && /^#([0-9A-F]{6})$/i.test(formatted)) {
            generateColorName(formatted);
        }
    };

    // Generate color name on mount if baseHex is valid
    useEffect(() => {
        if (baseHex && /^#([0-9A-F]{6})$/i.test(baseHex)) {
            generateColorName(baseHex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update form when palette is selected
    useEffect(() => {
        if (selectedPaletteId) {
            const palette = palettes.find((p) => p.id === selectedPaletteId);
            if (palette) {
                setInputHex(palette.hex);
                setColorName(palette.name);
                setDescription(palette.description);
                setLocalHue(palette.hueShift);
                setLocalSaturation(palette.saturationBoost);
            }
        }
    }, [selectedPaletteId, palettes]);

    const handleAddColor = () => {
        if (!inputHex || !/^#([0-9A-F]{6})$/i.test(inputHex)) {
            return;
        }

        addPalette({
            name: colorName || "Unnamed Color",
            description: description || "A beautiful color for your design.",
            hex: inputHex.toUpperCase(),
            hueShift: localHue,
            saturationBoost: localSaturation,
        });

        // Reset form
        setColorName("");
        setDescription("");
    };

    return (
        <div className="flex flex-col space-y-6 h-full justify-between">
            <div className="flex flex-col space-y-4 items-center justify-between text-base">
                <div className="flex flex-row gap-2 items-center justify-between w-full">
                    <h1 className="font-medium uppercase text-[var(--text-primary)]">Palletes</h1>
                    <button
                        type="button"
                        onClick={handleAddColor}
                        disabled={!inputHex || !/^#([0-9A-F]{6})$/i.test(inputHex)}
                        className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-col gap-2.5 items-center justify-between w-full max-h-[300px] overflow-y-auto scrollbar-hide">
                    {palettes.length === 0 ? (
                        <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                            No palettes yet. Add your first color!
                        </p>
                    ) : (
                        palettes.map((palette) => (
                            <button
                                key={palette.id}
                                type="button"
                                onClick={() => selectPalette(palette.id)}
                                className={`flex flex-row gap-2.5 items-center px-4 py-3.5 rounded-xl border w-full transition-all ${
                                    selectedPaletteId === palette.id
                                        ? "border-[var(--primary-blue)] bg-[var(--bg-tertiary)]"
                                        : "border-[var(--border-color)] hover:border-[var(--primary-blue)]/50"
                                }`}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl"
                                    style={{ backgroundColor: palette.hex }}
                                />
                                <div className="flex flex-col gap-1 flex-1 text-left">
                                    <h1 className="text-sm text-[var(--text-primary)] font-medium">
                                        {palette.name}
                                    </h1>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {palette.hex}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2.5 font-medium text-sm">
                    <h1 className="font-medium uppercase text-base text-[var(--text-primary)]">Base Color</h1>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="text-[var(--text-primary)]">Color Name</p>
                        <div className="relative">
                            <input
                                className="w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] active:outline-none focus:outline-none font-normal pr-10"
                                type="text"
                                placeholder={isGenerating ? "Generating..." : "e.g. Ransom Red"}
                                value={colorName}
                                onChange={(e) => setColorName(e.target.value)}
                                disabled={isGenerating}
                            />
                            {isGenerating && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-[var(--primary-blue)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="text-[var(--text-primary)]">Description</p>
                        <textarea
                            className="scrollbar-hide w-full p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] active:outline-none focus:outline-none font-normal resize-none overflow-y-auto"
                            rows={2}
                            placeholder={isGenerating ? "Generating..." : "e.g. used for primary actions and high-priority elements"}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isGenerating}
                        />
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p className="text-[var(--text-primary)]">Base Color</p>
                        <ColorInput
                            color={inputHex}
                            onChangeColor={handleHexChange}
                            onRefresh={randomColor}
                            enablePicker
                        />
                    </form>
                </div>
                <div className="flex flex-col space-y-2.5 font-medium text-sm">
                    <h1 className="font-medium uppercase text-base text-[var(--text-primary)]">Easing & Adjustments</h1>
                    <form className="flex flex-col justify-between gap-1.5">
                        <Slider
                            label="Hue Shift"
                            value={localHue}
                            onChange={setLocalHue}
                            min={0}
                            max={100}
                            color="var(--primary-blue)"
                        />
                        <Slider
                            label="Saturation Boost"
                            value={localSaturation}
                            onChange={setLocalSaturation}
                            min={0}
                            max={100}
                            color="var(--primary-blue)"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

function formatHexInput(value: string) {
    if (!value) return "#";
    let sanitized = value.toUpperCase().replace(/[^0-9A-F]/g, "");
    sanitized = sanitized.slice(0, 6);
    return `#${sanitized}`;
}
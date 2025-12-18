"use client";

import ColorCode from "../ui/color-code";
import Modal from "@/components/ui/modal";
import ContrastTooltip from "@/components/ui/tooltip";
import { Fragment, useMemo, useState, useCallback } from "react";
import { usePaletteContext } from "../context/palette-context";
import { generatePalette, getBaseStopIndex } from "@/utils/generatePalette";
import { generateExportCode, getAPCAContrast, getContrastRatio, type Framework, type ColorFormat } from "@/utils/colorConversions";


type FrameworkOption = {
    id: Framework;
    label: string;
};

type FormatOption = {
    id: ColorFormat;
    label: string;
};

const frameworks: FrameworkOption[] = [
    { id: "tailwind3", label: "Tailwind 3" },
    { id: "tailwind4", label: "Tailwind 4" },
    { id: "css", label: "CSS" },
    { id: "scss", label: "SCSS" },
    { id: "svg", label: "SVG / Figma" },
];

const formats: FormatOption[] = [
    { id: "hex", label: "Hex Code" },
    { id: "oklch", label: "OKLCH" },
    { id: "hsl", label: "HSL" },
    { id: "rgb", label: "RGB" },
];

// Syntax highlighting colors
const COLORS = {
    keyword: "#C678DD",
    property: "#E06C75",
    string: "#98C379",
    number: "#D19A66",
    bracket: "#ABB2BF",
    punctuation: "#56B6C2",
    variable: "#E5C07B",
    text: "#ABB2BF",
};

type HighlightToken = {
    text: string;
    color: string;
};

function highlightExportCode(code: string): HighlightToken[][] {
    const lines = code.split("\n");
    return lines.map((line) => highlightLine(line));
}

function highlightLine(line: string): HighlightToken[] {
    const tokens: HighlightToken[] = [];
    const patterns = [
        { regex: /@theme|:root/g, color: COLORS.keyword },
        { regex: /--[\w-]+/g, color: COLORS.property },
        { regex: /\$[\w-]+/g, color: COLORS.variable },
        { regex: /'[^']*'/g, color: COLORS.string },
        { regex: /"[^"]*"/g, color: COLORS.string },
        { regex: /#[0-9a-fA-F]{3,6}/g, color: COLORS.string },
        { regex: /\b\d+(\.\d+)?%?/g, color: COLORS.number },
        { regex: /[{}[\]()]/g, color: COLORS.bracket },
        { regex: /[:;,]/g, color: COLORS.punctuation },
        { regex: /\b(rgb|hsl|oklch)\b/g, color: COLORS.keyword },
        { regex: /<\/?[\w]+|\/?>|[\w-]+(?==)/g, color: COLORS.property },
    ];

    let lastIndex = 0;
    const allMatches: { start: number; end: number; text: string; color: string }[] = [];

    for (const { regex, color } of patterns) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(line)) !== null) {
            allMatches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0],
                color,
            });
        }
    }

    allMatches.sort((a, b) => a.start - b.start);

    const filtered: typeof allMatches = [];
    let lastEnd = 0;
    for (const m of allMatches) {
        if (m.start >= lastEnd) {
            filtered.push(m);
            lastEnd = m.end;
        }
    }

    for (const m of filtered) {
        if (m.start > lastIndex) {
            tokens.push({ text: line.slice(lastIndex, m.start), color: COLORS.text });
        }
        tokens.push({ text: m.text, color: m.color });
        lastIndex = m.end;
    }

    if (lastIndex < line.length) {
        tokens.push({ text: line.slice(lastIndex), color: COLORS.text });
    }

    return tokens;
}

// Contrast grid color cell component
function ContrastCell({
    bgColor,
    textColor,
    bgLabel,
    textLabel,
    minContrast,
    guidelineMode
}: {
    bgColor: string;
    textColor: string;
    bgLabel: string;
    textLabel: string;
    minContrast: number;
    guidelineMode: "apca" | "wcag2";
}) {
    const apcaContrast = getAPCAContrast(textColor, bgColor);
    const wcagRatio = getContrastRatio(bgColor, textColor);

    const contrastValue = guidelineMode === "apca" ? Math.abs(apcaContrast) : wcagRatio;
    const formatWcagRatio = (ratio: number) => {
        const rounded = Math.round(ratio * 10) / 10;
        return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    };
    const displayValue = guidelineMode === "apca" ? Math.round(apcaContrast) : formatWcagRatio(wcagRatio);
    const meetsThreshold = minContrast === 0 || contrastValue >= minContrast;

    if (!meetsThreshold) {
        return (
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium bg-(--bg-tertiary) text-(--text-secondary)"
            >
                <span className="text-[12px]">—</span>
            </div>
        );
    }

    return (
        <ContrastTooltip
            apcaContrast={apcaContrast}
            wcagRatio={wcagRatio}
            guidelineMode={guidelineMode}
            backgroundColor={{ label: bgLabel, hex: bgColor }}
            textColor={{ label: textLabel, hex: textColor }}
        >
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium cursor-pointer"
                style={{ backgroundColor: bgColor, color: textColor }}
            >
                <span className="text-[12px]">{displayValue}</span>
            </div>
        </ContrastTooltip>
    );
}

export default function Pallete() {
    const [openContrastGrid, setOpenContrastGrid] = useState(false);
    const [openExportCode, setOpenExportCode] = useState(false);
    const [selectedFramework, setSelectedFramework] = useState<Framework>("tailwind3");
    const [selectedFormat, setSelectedFormat] = useState<ColorFormat>("hex");
    const [copied, setCopied] = useState(false);
    const [guidelineMode, setGuidelineMode] = useState<"apca" | "wcag2">("apca");
    const [contrastFilter, setContrastFilter] = useState<number>(0); // 0 = All
    const { baseHex, hueShift, saturationBoost, palettes, selectedPaletteId, colorName } = usePaletteContext();

    // Filter options based on guideline mode
    const filterOptions = guidelineMode === "apca"
        ? [15, 30, 45, 60, 75, 0]
        : [3, 4.5, 7, 0];

    // Reset filter when changing guideline mode
    const handleGuidelineChange = (mode: "apca" | "wcag2") => {
        setGuidelineMode(mode);
        setContrastFilter(0); // Reset to "All" when switching
    };

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

    const stops = useMemo(() => ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"], []);

    // Create contrast grid colors
    const contrastColors = useMemo(() => {
        const colors = [
            { label: "White", hex: "#FFFFFF" },
            ...stops.map((stop, index) => ({ label: stop, hex: palette[index] || baseHex })),
            { label: "Black", hex: "#000000" },
        ];
        return colors;
    }, [stops, palette, baseHex]);

    const exportCode = useMemo(() => {
        const colors = stops.map((stop, index) => ({ stop, hex: palette[index] || baseHex }));
        return generateExportCode(colorName || selectedPalette?.name || "primary", colors, selectedFramework, selectedFormat);
    }, [palette, stops, selectedFramework, selectedFormat, colorName, selectedPalette?.name, baseHex]);

    const highlightedCode = useMemo(
        () => highlightExportCode(exportCode),
        [exportCode]
    );

    const handleCopyCode = useCallback(() => {
        navigator.clipboard.writeText(exportCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [exportCode]);

    return (
        <div className="flex flex-col space-y-4 h-full justify-between">
            <div className="flex flex-row justify-between items-center">
                <div className="flex items-center justify-between text-base">
                    <h1 className="font-bold text-xl">
                        {selectedPalette?.name || colorName || "Electric Violet"}
                    </h1>
                </div>
                <div className="flex gap-5 items-center justify-end p-[2px] rounded-2xl w-fit">
                    <button type="button" onClick={() => setOpenContrastGrid(true)} className="cursor-pointer">Contrast Grid</button>
                    <button type="button" onClick={() => setOpenExportCode(true)} className="cursor-pointer">Export Code</button>
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

            {/* Contrast Grid Modal */}
            <Modal open={openContrastGrid} onClose={() => setOpenContrastGrid(false)}>
                <h2 className="font-bold text-lg mb-4">Contrast Grid</h2>
                <div className="flex">
                    {/* Filter Sidebar */}
                    <div className="w-[200px] border border-(--border-color) rounded-l-2xl p-4 flex flex-col gap-6">
                        {/* Guidelines Section */}
                        <div className="flex flex-col gap-2.5">
                            <h3 className="font-medium uppercase text-xs text-(--text-secondary)">Guidelines</h3>
                            <button
                                type="button"
                                onClick={() => handleGuidelineChange("apca")}
                                className={`text-left py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors ${guidelineMode === "apca"
                                    ? "bg-(--bg-tertiary) font-semibold"
                                    : "text-(--text-secondary) hover:bg-(--bg-secondary)"
                                    }`}
                            >
                                WCAG 3 (APCA)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleGuidelineChange("wcag2")}
                                className={`text-left py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors ${guidelineMode === "wcag2"
                                    ? "bg-(--bg-tertiary) font-semibold"
                                    : "text-(--text-secondary) hover:bg-(--bg-secondary)"
                                    }`}
                            >
                                WCAG 2
                            </button>
                        </div>

                        {/* Filter Section */}
                        <div className="flex flex-col gap-2.5">
                            <h3 className="font-medium uppercase text-xs text-(--text-secondary)">Filter</h3>
                            {filterOptions.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setContrastFilter(value)}
                                    className={`text-left py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors ${contrastFilter === value
                                        ? "bg-(--bg-tertiary) font-semibold"
                                        : "text-(--text-secondary) hover:bg-(--bg-secondary)"
                                        }`}
                                >
                                    {value === 0 ? "All" : guidelineMode === "wcag2" ? `${value}+` : `${value}+`}
                                </button>
                            ))}
                        </div>

                        {/* Info Note */}
                        <div className="border-t border-(--border-color) pt-4 text-xs text-(--text-secondary)">
                            {guidelineMode === "apca" ? (
                                <div className="flex flex-col gap-1">
                                    {contrastFilter === 15 && <p>15+ = Minimum for decorative and non-text elements</p>}
                                    {contrastFilter === 30 && <p>30+ = Absolute minimum for any text</p>}
                                    {contrastFilter === 45 && <p>45+ = Minimum for headings and titles</p>}
                                    {contrastFilter === 60 && <p>60+ = Minimum for body text (16px) and buttons</p>}
                                    {contrastFilter === 75 && <p>75+ = Minimum for small text and preferred level for body text (16px)</p>}
                                    {contrastFilter === 0 && <p>Showing all contrast values</p>}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {contrastFilter === 3 && <p>3+ = Minimum for headings and titles</p>}
                                    {contrastFilter === 4.5 && <p>4.5+ = Minimum for body text and preferred for headings and titles</p>}
                                    {contrastFilter === 7 && <p>7+ = Preferred level for body text</p>}
                                    {contrastFilter === 0 && <p>Showing all contrast values</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contrast Grid */}
                    <div className="flex flex-col items-center justify-center pb-4 w-[728px] border border-[var(--border-color)] rounded-r-2xl">
                        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${contrastColors.length + 1}, 48px)` }}>
                            {/* Header row - inside grid */}
                            <div className="w-12 h-12" /> {/* Empty corner cell */}
                            {contrastColors.map((color) => (
                                <div
                                    key={`header-${color.label}`}
                                    className="w-12 h-12 flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]"
                                >
                                    {color.label}
                                </div>
                            ))}

                            {/* Grid rows */}
                            {contrastColors.map((rowColor) => (
                                <Fragment key={`row-${rowColor.label}`}>
                                    {/* Row label */}
                                    <div className="w-12 h-12 flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                                        {rowColor.label}
                                    </div>

                                    {/* Cells */}
                                    {contrastColors.map((colColor) => (
                                        <ContrastCell
                                            key={`${rowColor.label}-${colColor.label}`}
                                            bgColor={colColor.hex}
                                            textColor={rowColor.hex}
                                            bgLabel={colColor.label}
                                            textLabel={rowColor.label}
                                            minContrast={contrastFilter}
                                            guidelineMode={guidelineMode}
                                        />
                                    ))}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Export Code Modal */}
            <Modal open={openExportCode} onClose={() => setOpenExportCode(false)}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-base">Export Code</h2>
                    <button
                        type="button"
                        onClick={handleCopyCode}
                        className={`text-base font-regular px-4 py-2 rounded-full transition-colors cursor-pointer ${copied
                            ? "bg-[var(--primary-blue)] text-[var(--bg-secondary)]"
                            : "bg-[var(--primary-blue)] text-[var(--bg-secondary)] hover:bg-[var(--primary-blue-hover)]"
                            }`}
                    >
                        {copied ? "✓ Copied!" : "Copy to Clipboard"}
                    </button>
                </div>
                <div className="grid grid-cols-8 grid-rows-1">
                    {/* Framework Tabs */}
                    <div className="flex flex-col col-span-2 border p-4 border-[var(--border-color)] rounded-l-lg overflow-hidden">
                        {frameworks.map((framework) => (
                            <button
                                key={framework.id}
                                type="button"
                                onClick={() => setSelectedFramework(framework.id)}
                                className={`text-left py-2 px-3 rounded-lg transition-colors cursor-pointer ${selectedFramework === framework.id
                                    ? "bg-[var(--bg-tertiary)] font-semibold"
                                    : "hover:bg-[var(--bg-secondary)]"
                                    }`}
                            >
                                {framework.label}
                            </button>
                        ))}
                    </div>

                    {/* Format Tabs - Hidden when SVG is selected */}
                    {selectedFramework !== "svg" && (
                        <div className="flex flex-col col-span-2 col-start-3 border p-4 border-[var(--border-color)] overflow-hidden">
                            {formats.map((format) => (
                                <button
                                    key={format.id}
                                    type="button"
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={`text-left py-2 px-3 rounded-lg transition-colors cursor-pointer ${selectedFormat === format.id
                                        ? "bg-[var(--bg-tertiary)] font-semibold"
                                        : "hover:bg-[var(--bg-secondary)]"
                                        }`}
                                >
                                    {format.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Code Output */}
                    <div className={`border border-[var(--border-color)] rounded-r-lg overflow-hidden p-4 ${selectedFramework === "svg" ? "col-span-6 col-start-3" : "col-span-4 col-start-5"
                        }`}>
                        <pre
                            className="h-full overflow-auto pr-4 max-h-[500px] scrollbar-hide"
                            style={{
                                fontFamily: "Consolas, 'Courier New', monospace",
                                fontSize: "14px",
                                lineHeight: 1.6,
                            }}
                        >
                            {highlightedCode.map((line, lineIndex) => (
                                <div key={lineIndex} className="whitespace-pre">
                                    {line.map((token, tokenIndex) => (
                                        <Fragment key={`${lineIndex}-${tokenIndex}`}>
                                            <span style={{ color: token.color }}>{token.text}</span>
                                        </Fragment>
                                    ))}
                                </div>
                            ))}
                        </pre>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
// Color conversion utilities

export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number };
export type OKLCH = { l: number; c: number; h: number };

// Hex to RGB
export function hexToRgb(hex: string): RGB {
    let sanitized = hex.replace("#", "");
    if (sanitized.length === 3) {
        sanitized = sanitized
            .split("")
            .map((char) => char + char)
            .join("");
    }
    return {
        r: parseInt(sanitized.slice(0, 2), 16),
        g: parseInt(sanitized.slice(2, 4), 16),
        b: parseInt(sanitized.slice(4, 6), 16),
    };
}

// Hex to HSL
export function hexToHsl(hex: string): HSL {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case rNorm:
                h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
                break;
            case gNorm:
                h = (bNorm - rNorm) / d + 2;
                break;
            case bNorm:
                h = (rNorm - gNorm) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

// Hex to OKLCH (simplified approximation)
export function hexToOklch(hex: string): OKLCH {
    const { r, g, b } = hexToRgb(hex);

    // Convert to linear RGB
    const toLinear = (c: number) => {
        const v = c / 255;
        return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const rLin = toLinear(r);
    const gLin = toLinear(g);
    const bLin = toLinear(b);

    // Convert to OKLab
    const l_ = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
    const m_ = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
    const s_ = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

    const l_cbrt = Math.cbrt(l_);
    const m_cbrt = Math.cbrt(m_);
    const s_cbrt = Math.cbrt(s_);

    const L = 0.2104542553 * l_cbrt + 0.7936177850 * m_cbrt - 0.0040720468 * s_cbrt;
    const a = 1.9779984951 * l_cbrt - 2.4285922050 * m_cbrt + 0.4505937099 * s_cbrt;
    const bOk = 0.0259040371 * l_cbrt + 0.7827717662 * m_cbrt - 0.8086757660 * s_cbrt;

    // Convert OKLab to OKLCH
    const C = Math.sqrt(a * a + bOk * bOk);
    let H = Math.atan2(bOk, a) * (180 / Math.PI);
    if (H < 0) H += 360;

    return {
        l: Math.round(L * 100 * 100) / 100,
        c: Math.round(C * 100) / 100,
        h: Math.round(H * 100) / 100,
    };
}

// Format functions for different output types
export function formatHex(hex: string): string {
    return hex.toLowerCase();
}

// Calculate relative luminance for a color
function getLuminance(hex: string): number {
    const { r, g, b } = hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const sRGB = c / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate WCAG contrast ratio between two colors
export function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

// Get WCAG compliance level for a contrast ratio
export function getWCAGLevel(ratio: number): { level: string; passes: { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } } {
    return {
        level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail",
        passes: {
            aa: ratio >= 4.5,
            aaLarge: ratio >= 3,
            aaa: ratio >= 7,
            aaaLarge: ratio >= 4.5,
        },
    };
}

// Calculate APCA (Accessible Perceptual Contrast Algorithm) contrast
// Returns a value between -108 and 106, where:
// - Positive values: dark text on light background
// - Negative values: light text on dark background
// - |Lc| >= 75: Preferred for body text
// - |Lc| >= 60: Minimum for body text
// - |Lc| >= 45: Minimum for large text (24px+ or 18.7px+ bold)
export function getAPCAContrast(textHex: string, bgHex: string): number {
    const { r: tR, g: tG, b: tB } = hexToRgb(textHex);
    const { r: bR, g: bG, b: bB } = hexToRgb(bgHex);

    // APCA constants
    const Strc = 0.022;
    const Ntx = 0.57;
    const Nbg = 0.56;
    const Rtx = 0.62;
    const Rbg = 0.65;

    // Convert to linear luminance (sRGB to Y)
    const sRGBtoY = (r: number, g: number, b: number): number => {
        const toLinear = (c: number): number => {
            const v = c / 255;
            return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        return 0.2126729 * toLinear(r) + 0.7151522 * toLinear(g) + 0.0721750 * toLinear(b);
    };

    const Ytxt = sRGBtoY(tR, tG, tB);
    const Ybg = sRGBtoY(bR, bG, bB);

    // Soft clamp Y to prevent divide by zero
    const Ytxt_sc = Ytxt > 0.022 ? Ytxt : Ytxt + Math.pow(0.022 - Ytxt, 1.414);
    const Ybg_sc = Ybg > 0.022 ? Ybg : Ybg + Math.pow(0.022 - Ybg, 1.414);

    // Calculate SAPC (Simple Accessibility Perceptual Contrast)
    let SAPC: number;
    if (Ybg_sc > Ytxt_sc) {
        // Light background, dark text (positive contrast)
        SAPC = (Math.pow(Ybg_sc, Nbg) - Math.pow(Ytxt_sc, Ntx)) * 1.14;
    } else {
        // Dark background, light text (negative contrast)
        SAPC = (Math.pow(Ybg_sc, Rbg) - Math.pow(Ytxt_sc, Rtx)) * 1.14;
    }

    // Apply soft clamp and scale to Lc (Lightness Contrast)
    let Lc: number;
    if (Math.abs(SAPC) < Strc) {
        Lc = 0;
    } else if (SAPC > 0) {
        Lc = (SAPC - Strc) * 100;
    } else {
        Lc = (SAPC + Strc) * 100;
    }

    return Math.round(Lc * 10) / 10;
}

export function formatRgb(hex: string): string {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl(hex: string): string {
    const { h, s, l } = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function formatOklch(hex: string): string {
    const { l, c, h } = hexToOklch(hex);
    return `oklch(${l}% ${c} ${h})`;
}

// Generate code for different frameworks and formats
export type Framework = "tailwind3" | "tailwind4" | "css" | "scss" | "svg";
export type ColorFormat = "hex" | "oklch" | "hsl" | "rgb";

export function generateExportCode(
    paletteName: string,
    colors: { stop: string; hex: string }[],
    framework: Framework,
    format: ColorFormat
): string {
    const formatColor = (hex: string): string => {
        switch (format) {
            case "hex":
                return formatHex(hex);
            case "rgb":
                return formatRgb(hex);
            case "hsl":
                return formatHsl(hex);
            case "oklch":
                return formatOklch(hex);
            default:
                return formatHex(hex);
        }
    };

    const safeName = paletteName.toLowerCase().replace(/\s+/g, "-");

    switch (framework) {
        case "tailwind3":
            return generateTailwind3(safeName, colors, formatColor);
        case "tailwind4":
            return generateTailwind4(safeName, colors, formatColor);
        case "css":
            return generateCSS(safeName, colors, formatColor);
        case "scss":
            return generateSCSS(safeName, colors, formatColor);
        case "svg":
            return generateSVG(safeName, colors, formatColor);
        default:
            return "";
    }
}

function generateTailwind3(
    name: string,
    colors: { stop: string; hex: string }[],
    formatColor: (hex: string) => string
): string {
    const colorObj = colors
        .map(({ stop, hex }) => `    '${stop}': '${formatColor(hex)}',`)
        .join("\n");
    return `'${name}': {\n${colorObj}\n},`;
}

function generateTailwind4(
    name: string,
    colors: { stop: string; hex: string }[],
    formatColor: (hex: string) => string
): string {
    const cssVars = colors
        .map(({ stop, hex }) => `  --color-${name}-${stop}: ${formatColor(hex)};`)
        .join("\n");
    return `@theme {\n${cssVars}\n}`;
}

function generateCSS(
    name: string,
    colors: { stop: string; hex: string }[],
    formatColor: (hex: string) => string
): string {
    const cssVars = colors
        .map(({ stop, hex }) => `  --${name}-${stop}: ${formatColor(hex)};`)
        .join("\n");
    return `:root {\n${cssVars}\n}`;
}

function generateSCSS(
    name: string,
    colors: { stop: string; hex: string }[],
    formatColor: (hex: string) => string
): string {
    const scssVars = colors
        .map(({ stop, hex }) => `$${name}-${stop}: ${formatColor(hex)};`)
        .join("\n");
    return scssVars;
}

function generateSVG(
    name: string,
    colors: { stop: string; hex: string }[],
    formatColor: (hex: string) => string
): string {
    const swatchWidth = 130;
    const swatchHeight = 120;
    const canvasHeight = 219;

    const paddingX = 24;
    const startX = paddingX;
    const startY = 75;

    const totalWidth = colors.length * swatchWidth + paddingX * 2;
    const clipId = `clip0_${Math.random().toString(36).slice(2, 8)}`;

    // Format title
    const displayName = name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // Text color based on luminance
    const getTextColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    };

    const swatches = colors
        .map(({ stop, hex }, index) => {
            const x = startX + index * swatchWidth;
            const textColor = getTextColor(hex);

            return `
            
    <rect width="${swatchWidth}" height="${swatchHeight}" transform="translate(${x} ${startY})" fill="${hex}"/>
    <text x="${x + 114}" y="${startY + 32}" fill="${textColor}" font-family="Manrope, system-ui, sans-serif" font-size="16" font-weight="500" text-anchor="end" dominant-baseline="text-after-edge">${stop}</text>
    <text width="80" x="${x + 114}" y="${startY + swatchHeight - 22}" fill="${textColor}" font-family="Manrope, system-ui, sans-serif" font-size="16" font-weight="500" text-anchor="end" dominant-baseline="text-after-edge">${formatColor(hex).toUpperCase()}</text>
            `;
        })
        .join("");

    return `
<svg width="${totalWidth}" height="${canvasHeight}" viewBox="0 0 ${totalWidth} ${canvasHeight}" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="${totalWidth}" height="${canvasHeight}" rx="16" fill="white"/>
<rect x="0.5" y="0.5" width="${totalWidth - 1}" height="${canvasHeight - 1}" rx="15.5" stroke="black" stroke-opacity="0.1"/>
<text x="${paddingX}" y="44" fill="black" font-family="Manrope, system-ui, sans-serif" font-size="20" font-weight="600" dominant-baseline="hanging">${displayName}</text>
<g clip-path="url(#${clipId})"><rect x="${startX}" y="${startY}" width="${colors.length * swatchWidth}" height="${swatchHeight}" rx="16" fill="white"/>${swatches}
</g>
<defs><clipPath id="${clipId}"><rect x="${startX}" y="${startY}" width="${colors.length * swatchWidth}" height="${swatchHeight}" rx="16"/></clipPath></defs>
</svg>
    `;
}

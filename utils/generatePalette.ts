type HSL = {
    h: number;
    s: number;
    l: number;
};

type PaletteStop = {
    h: number;
    s: number;
    l: number;
};

const STOPS = [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
    "950",
] as const;

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

const MIN_SATURATION = 6; // Batas bawah umum agar gradasi tidak mati total

export function getBaseStopIndex(baseHex: string): number {
    const base = hexToHsl(baseHex);
    if (base.s < 2) {
        const lightness = clamp(base.l, 0, 100);
        if (lightness >= 99) return 0;
        if (lightness <= 1) return 10;
        return determineBaseIndex(lightness);
    }
    const safeLightness = clamp(base.l, 4, 96);
    return determineBaseIndex(safeLightness);
}

export function generatePalette(
    baseHex: string,
    hueShift: number,
    saturationBoost: number,
): string[] {
    const base = hexToHsl(baseHex);
    
    // Deteksi warna netral (putih/hitam/abu-abu) - saturasi < 2%
    const isNeutral = base.s < 2;
    
    // Untuk warna netral, generate grayscale palette
    if (isNeutral) {
        return generateGrayscalePalette(base.l);
    }
    
    // Untuk warna berwarna, gunakan logika normal dengan saturasi minimum
    const safeBase: HSL = {
        h: base.h,
        s: Math.max(base.s, MIN_SATURATION),
        l: clamp(base.l, 4, 96),
    };
    
    const baseIndex = determineBaseIndex(safeBase.l);
    const normalizedStops = buildStops(
        safeBase,
        baseIndex,
        hueShift,
        saturationBoost,
    );
    return normalizedStops.map(({ h, s, l }) => hslToHex(h, s, l));
}

function generateGrayscalePalette(baseLightness: number): string[] {
    // Generate 11-step grayscale palette dari putih ke hitam
    // Base color akan ditempatkan di stop yang sesuai berdasarkan lightness
    const clampedLightness = clamp(baseLightness, 0, 100);
    
    // Untuk putih murni (#FFFFFF, lightness 100%), muncul di stop 50 (index 0)
    // Untuk hitam murni (#000000, lightness 0%), muncul di stop 950 (index 10)
    let baseIndex = determineBaseIndex(clampedLightness);
    if (clampedLightness >= 99) baseIndex = 0; // #FFFFFF -> stop 50
    if (clampedLightness <= 1) baseIndex = 10; // #000000 -> stop 950
    
    // Generate grayscale standar dari putih (100%) ke hitam (0%)
    // Distribusi mirip dengan Tailwind: smooth progression
    const defaultGrayscale = [
        100, // 50 - putih murni untuk #FFFFFF
        94,  // 100
        88,  // 200
        80,  // 300
        70,  // 400
        58,  // 500
        45,  // 600
        35,  // 700
        25,  // 800
        15,  // 900
        0,   // 950 - hitam murni untuk #000000
    ];
    
    // Pastikan base color muncul di stop yang sesuai
    const grayscaleLightness = [...defaultGrayscale];
    grayscaleLightness[baseIndex] = clampedLightness;
    
    // Generate palette dengan saturasi 0 (grayscale)
    // Hue tidak penting untuk grayscale, bisa 0
    return grayscaleLightness.map((l) => hslToHex(0, 0, l));
}

function buildStops(
    base: HSL,
    baseIndex: number,
    hueShift: number,
    saturationBoost: number,
): PaletteStop[] {
    const stops: PaletteStop[] = Array(STOPS.length)
        .fill(null)
        .map(() => ({
            h: base.h,
            s: base.s,
            l: base.l,
        }));

    const hueBias = ((hueShift - 50) / 50) * 14;
    const satBias = ((saturationBoost - 50) / 50) * 12;

    stops[baseIndex] = {
        h: (base.h + hueBias + 360) % 360,
        s: clamp(base.s + satBias, 5, 98),
        l: clamp(base.l, 4, 96),
    };

    const maxLight = 98;
    const minLight = 6;
    const maxSat = 97;
    const minSat = 5;
    const lighterCount = baseIndex;
    const darkerCount = STOPS.length - baseIndex - 1;
    const lightenSpan = Math.max(maxLight - stops[baseIndex].l, lighterCount * 3.5);
    const darkenSpan = Math.max(stops[baseIndex].l - minLight, darkerCount * 3.5);
    const lightenSatSpan = Math.min(stops[baseIndex].s - minSat, 28);
    const darkenSatSpan = Math.min(maxSat - stops[baseIndex].s, 34);

    for (let i = baseIndex - 1; i >= 0; i--) {
        const relative = baseIndex - i;
        const previous = stops[i + 1];
        const t = relative / (lighterCount + 1);
        const targetLightness = stops[baseIndex].l + easeOut(t) * lightenSpan;
        const targetSaturation = stops[baseIndex].s - easeOut(t) * lightenSatSpan;
        const hueDelta = hueOffset(t, "lighter");

        let l = clamp(targetLightness, previous.l + 3, maxLight);
        let s = clamp(targetSaturation, minSat, previous.s - 2);

        stops[i] = {
            h: (previous.h + hueDelta + 360) % 360,
            s,
            l,
        };
    }

    for (let i = baseIndex + 1; i < STOPS.length; i++) {
        const relative = i - baseIndex;
        const previous = stops[i - 1];
        const t = relative / (darkerCount + 1);
        const targetLightness = stops[baseIndex].l - easeOut(t) * darkenSpan;
        const targetSaturation = stops[baseIndex].s + easeOut(t) * darkenSatSpan;
        const hueDelta = hueOffset(t, "darker");

        let l = clamp(targetLightness, minLight, previous.l - 3);
        let s = clamp(targetSaturation, previous.s + 2, maxSat);

        stops[i] = {
            h: (previous.h + hueDelta + 360) % 360,
            s,
            l,
        };
    }

    return enforceMinimumDifference(stops);
}

function determineBaseIndex(lightness: number): number {
    if (lightness >= 88) return 1;
    if (lightness >= 80) return 2;
    if (lightness >= 72) return 3;
    if (lightness >= 60) return 4;
    if (lightness >= 48) return 5;
    if (lightness >= 38) return 6;
    if (lightness >= 30) return 7;
    if (lightness >= 22) return 8;
    if (lightness >= 14) return 9;
    return 10;
}

function enforceMinimumDifference(stops: PaletteStop[]): PaletteStop[] {
    const minLightness = 6;
    const minSaturation = 3;

    for (let i = 1; i < stops.length; i++) {
        const prev = stops[i - 1];
        const curr = stops[i];

        if (Math.abs(prev.l - curr.l) < minLightness) {
            const delta = minLightness - Math.abs(prev.l - curr.l);
            curr.l = clamp(curr.l + (curr.l > prev.l ? delta : -delta), 3, 97);
        }

        if (Math.abs(prev.s - curr.s) < minSaturation) {
            const delta = minSaturation - Math.abs(prev.s - curr.s);
            curr.s = clamp(curr.s + (curr.s > prev.s ? delta : -delta), 5, 99);
        }
    }

    return stops;
}

function easeOut(t: number) {
    return 1 - Math.pow(1 - t, 1.35);
}

function hueOffset(t: number, direction: "lighter" | "darker") {
    const maxShift = direction === "lighter" ? 2.2 : -2.4;
    return maxShift * t;
}

function hexToHsl(hex: string): HSL {
    let sanitized = hex.replace("#", "");
    if (sanitized.length === 3) {
        sanitized = sanitized
            .split("")
            .map((char) => char + char)
            .join("");
    }
    const r = parseInt(sanitized.slice(0, 2), 16) / 255;
    const g = parseInt(sanitized.slice(2, 4), 16) / 255;
    const b = parseInt(sanitized.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: h * 360,
        s: s * 100,
        l: l * 100,
    };
}

function hslToHex(h: number, s: number, l: number): string {
    const sNorm = s / 100;
    const lNorm = l / 100;

    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const hh = h / 60;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    let r = 0;
    let g = 0;
    let b = 0;

    if (hh >= 0 && hh < 1) {
        r = c;
        g = x;
    } else if (hh >= 1 && hh < 2) {
        r = x;
        g = c;
    } else if (hh >= 2 && hh < 3) {
        g = c;
        b = x;
    } else if (hh >= 3 && hh < 4) {
        g = x;
        b = c;
    } else if (hh >= 4 && hh < 5) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }

    const m = lNorm - c / 2;
    const r255 = Math.round((r + m) * 255);
    const g255 = Math.round((g + m) * 255);
    const b255 = Math.round((b + m) * 255);

    return (
        "#" +
        [r255, g255, b255]
            .map((value) => value.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()
    );
}


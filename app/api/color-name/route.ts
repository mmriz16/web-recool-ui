import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { hex } = await request.json();

        if (!hex || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex)) {
            return NextResponse.json(
                { error: "Invalid hex color" },
                { status: 400 }
            );
        }

        // Convert hex to RGB for better context
        const rgb = hexToRgb(hex);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional color naming expert for digital products and design systems.

                Your task is to create a UNIQUE, BRAND-READY color name that:
                - MUST be EXACTLY 2 words (Adjective + Noun pattern)
                - Is NEVER generic or literal (no "Light Blue", "Dark Red", etc.)
                - Uses NO direct color words (blue, red, green, purple, cyan, navy, emerald, violet, pink, orange, yellow, etc.)
                - Feels suitable for a modern UI / design system
                - Is evocative, elegant, and memorable
                - Matches the emotional and visual characteristics of the color

                Good examples (Adjective + Noun pattern):
                - "Midnight Velvet" (for deep dark blue)
                - "Arctic Frost" (for icy light blue)
                - "Solar Flare" (for vibrant orange)
                - "Rosewood Dusk" (for muted pink-brown)
                - "Electric Surge" (for bright neon)
                - "Forest Whisper" (for muted green)
                - "Coral Sunset" (for warm orange-pink)
                - "Storm Cloud" (for dark gray-blue)
                - "Honey Glow" (for warm yellow)
                - "Lavender Mist" (for soft purple)
                - "Cherry Blossom" (for soft pink)
                - "Ocean Depth" (for deep teal)

                The name MUST reflect:
                - Lightness (light / soft / airy vs deep / dark / dense)
                - Temperature (warm vs cool)
                - Saturation (vibrant / muted / neutral)
                - Mood (calm, bold, mystical, elegant, playful, energetic, etc.)

                Avoid:
                - Single words
                - Technical terms or codes
                - Obvious color synonyms
                - Overly fantasy or RPG-style names
                - Generic combinations like "Pretty Color" or "Nice Shade"

                Respond ONLY with valid JSON:
                {
                "name": string,
                "description": string
}`,
                },
                {
                    role: "user",
                    content: `Create a unique 2-word brand-ready name for hex color ${hex} (RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}). The name should follow the Adjective + Noun pattern.`,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.85,
            max_tokens: 150,
            response_format: { type: "json_object" },
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error("No response from Groq");
        }

        const colorInfo = JSON.parse(response);

        return NextResponse.json({
            name: colorInfo.name || "Unnamed Color",
        });
    } catch (error) {
        console.error("Error generating color name:", error);
        return NextResponse.json(
            { error: "Failed to generate color name" },
            { status: 500 }
        );
    }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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




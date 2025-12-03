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
                    content: "You are a color naming expert. Given a hex color code, provide a creative and descriptive color name and a brief description of its usage. Respond in JSON format with 'name' and 'description' fields. The name should be creative, memorable, and reflect the color's appearance. The description should be one sentence about when to use this color in UI design.",
                },
                {
                    role: "user",
                    content: `Generate a color name and description for hex color ${hex} (RGB: ${rgb.r}, ${rgb.g}, ${rgb.b}). Return only valid JSON with "name" and "description" fields.`,
                },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
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
            description: colorInfo.description || "A beautiful color for your design.",
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



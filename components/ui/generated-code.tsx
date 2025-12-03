import { Fragment, useMemo, useState } from "react";

type GeneratedCodeProps = {
    code: {
        html: string;
        jsx: string;
    };
};

type Format = "html" | "jsx";

export default function GeneratedCode({ code }: GeneratedCodeProps) {
    const [format, setFormat] = useState<Format>("html");
    const displayCode = format === "html" ? code.html : code.jsx;
    const highlighted = useMemo(() => highlightCode(displayCode), [displayCode]);

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!displayCode) return;
        try {
            await navigator.clipboard.writeText(displayCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore clipboard errors
        }
    };

    return (
        <div className="flex h-full w-full flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center rounded-[16px] bg-[var(--bg-tertiary)] p-[2px] text-sm font-medium">
                    <button
                        type="button"
                        onClick={() => setFormat("html")}
                        className={`rounded-[14px] px-4 py-2 transition ${
                            format === "html"
                                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                : "text-[var(--text-secondary)]"
                        }`}
                    >
                        HTML
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormat("jsx")}
                        className={`rounded-[14px] px-4 py-2 transition ${
                            format === "jsx"
                                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                : "text-[var(--text-secondary)]"
                        }`}
                    >
                        JSX
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!displayCode}
                    className="rounded-xl border border-black/10 bg-[var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-black/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Copy
                </button>
            </div>
            <div className="relative h-full rounded-2xl border border-black/10 bg-[#282828] p-5 text-[#e2e8f0]" style={{ fontFamily: "Consolas, 'Courier New', monospace" }}>
                {copied && (
                    <div className="absolute right-2 top-2 flex items-center rounded-[10px] bg-white/10 px-3 py-2 text-sm font-medium text-teal-300 backdrop-blur">
                        Copied!
                    </div>
                )}
                {displayCode ? (
                    <pre
                        className="h-full overflow-auto pr-4"
                        style={{
                            fontFamily: "Consolas, 'Courier New', monospace",
                            fontSize: "14px",
                            lineHeight: 1.4,
                            scrollbarColor: "#3b3b3b #282828",
                        }}
                    >
                        {highlighted.map((line, lineIndex) => (
                            <div key={lineIndex} className="relative whitespace-pre">
                                {Array.from({ length: line.indentLevel }).map((_, guideIndex) => (
                                    <span
                                        key={`guide-${lineIndex}-${guideIndex}`}
                                        className="absolute top-0 bottom-0"
                                        style={{
                                            left: `calc(${(guideIndex + 1) * 1}ch)`,
                                            borderLeft: "1px solid rgba(255,255,255,0.09)",
                                        }}
                                    />
                                ))}
                                <span>
                                    {line.tokens.map((token, tokenIndex) => (
                                        <Fragment key={`${lineIndex}-${tokenIndex}`}>
                                            <span style={{ color: token.color }}>{token.text}</span>
                                        </Fragment>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </pre>
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/50">
                        No layout generated yet. Build a grid in the editor to see code.
                    </div>
                )}
            </div>
        </div>
    );
}

type HighlightToken = {
    text: string;
    color: string;
};

type HighlightLine = {
    indentLevel: number;
    tokens: HighlightToken[];
};

const COLORS = {
    tag: "#8EC064",
    bracket: "#84835E",
    attr: "#FABD2D",
    string: "#B8BB26",
    number: "#EBCD81",
    text: "#FFFFFF",
};

function highlightCode(code: string): HighlightLine[] {
    const lines = code.split("\n");
    return lines.map((line) => highlightLine(line));
}

function highlightLine(line: string): HighlightLine {
    const tokens: HighlightToken[] = [];
    const leadingSpacesMatch = line.match(/^(\s*)/);
    const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[1].length : 0;
    const indentLevel = Math.floor(leadingSpaces / 2);

    const pattern =
        /<\/?[A-Za-z][\w-]*|\/?>|[A-Za-z_][\w:-]*(?==)|"[^"]*"|\b\d+\b/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({
                text: line.slice(lastIndex, match.index),
                color: COLORS.text,
            });
        }

        const tokenValue = match[0];
        if (tokenValue.startsWith("<")) {
            const bracket = tokenValue.startsWith("</") ? "</" : "<";
            const name = tokenValue.slice(bracket.length);
            tokens.push({ text: bracket, color: COLORS.bracket });
            if (name) {
                tokens.push({ text: name, color: COLORS.tag });
            }
        } else if (tokenValue === ">" || tokenValue === "/>") {
            tokens.push({ text: tokenValue, color: COLORS.bracket });
        } else if (tokenValue.startsWith('"')) {
            tokens.push({ text: tokenValue, color: COLORS.string });
        } else if (/^\d+$/.test(tokenValue)) {
            tokens.push({ text: tokenValue, color: COLORS.number });
        } else {
            tokens.push({ text: tokenValue, color: COLORS.attr });
        }

        lastIndex = pattern.lastIndex;
    }

    if (lastIndex < line.length) {
        tokens.push({
            text: line.slice(lastIndex),
            color: COLORS.text,
        });
    }

    return { indentLevel, tokens };
}
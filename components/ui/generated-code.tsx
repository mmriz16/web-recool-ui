import { useMemo, useState } from "react";
import Card from "./card";
import { useGridLayoutSnapshot } from "./grid-generator";

const OPTIONS: Array<"html" | "jsx"> = ["html", "jsx"];

export default function GeneratedCode() {
    const [mode, setMode] = useState<"html" | "jsx">("html");
    const [copied, setCopied] = useState(false);
    const snapshot = useGridLayoutSnapshot();

    const code = useMemo(() => {
        if (!snapshot.items.length) {
            return "// Configure your grid in the Editor tab to see the generated code.";
        }
        return mode === "html" ? snapshot.code.html : snapshot.code.jsx;
    }, [mode, snapshot]);

    const highlighted = useMemo(() => highlightCode(code), [code]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore copy failures silently
        }
    };

    return (
        <Card className="flex h-full flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex rounded-2xl border border-black/10 bg-white p-1 text-sm font-medium">
                    {OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setMode(option)}
                            className={`px-4 py-1.5 rounded-xl transition ${
                                mode === option
                                    ? "bg-[#f4f4f5] text-black"
                                    : "text-black/50 hover:text-black"
                            }`}
                        >
                            {option.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {copied && (
                        <span className="text-xs font-medium text-emerald-600">
                            Copied!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-[#f5f5f5]"
                    >
                        Copy
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl border border-black/10 bg-[#0f172a] p-4">
                <div className="mb-2 flex justify-between text-[11px] uppercase tracking-wide text-white/60">
                    <span>{mode === "html" ? "HTML" : "React JSX"}</span>
                    <span>
                        {snapshot.columns} cols · {snapshot.rows} rows · gap {snapshot.gap}px
                    </span>
                </div>
                <pre
                    className="whitespace-pre text-xs leading-5 font-mono text-[#e2e8f0]"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                />
            </div>
        </Card>
    );
}

const highlightCode = (value: string) => {
    const escaped = value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const highlightedTags = escaped.replace(
        /(&lt;\/?)([\w-]+)/g,
        '$1<span class="text-sky-300">$2</span>',
    );

    const highlightedAttrs = highlightedTags.replace(
        /([\w-]+)=(&quot;.*?&quot;)/g,
        '<span class="text-amber-200">$1</span>=<span class="text-emerald-300">$2</span>',
    );

    return highlightedAttrs;
};
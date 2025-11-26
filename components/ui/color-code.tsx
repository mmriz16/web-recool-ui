"use client";

export default function ColorCode() {
    return (
        <div className="group relative h-[120px] w-full">
            <div className="absolute inset-0 flex flex-col items-end justify-between text-base p-4 bg-[#F3F1FF] transition-opacity group-hover:opacity-0">
                <h1 className="font-medium text-base">50</h1>
                <p className="font-medium text-sm">#191DFA</p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100">
                <button type="button" className="cursor-pointer font-medium text-sm">Copy</button>
            </div>
        </div>

    );
}
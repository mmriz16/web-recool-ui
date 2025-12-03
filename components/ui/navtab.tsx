"use client";

import { useState } from "react";

type TabItem = {
    label: string;
    value: string;
};

type NavtabProps = {
    tabs: TabItem[];
    defaultValue?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
};

export default function Navtab({ 
    tabs, 
    defaultValue, 
    value: controlledValue,
    onChange,
    className = ""
}: NavtabProps) {
    const [internalValue, setInternalValue] = useState(defaultValue || tabs[0]?.value || "");
    
    // Use controlled value if provided, otherwise use internal state
    const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

    const handleTabClick = (tabValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(tabValue);
        }
        onChange?.(tabValue);
    };

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <div className={`flex flex-row gap-2 ${className}`}>
            <div className="flex flex-row bg-[var(--bg-tertiary)] rounded-2xl p-0.5 h-fit items-center justify-center">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => handleTabClick(tab.value)}
                        className={`text-base font-medium px-4 py-3.5 rounded-[14px] transition-all ${
                            activeValue === tab.value
                                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
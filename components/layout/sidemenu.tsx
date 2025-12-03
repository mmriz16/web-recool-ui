"use client";

import { usePathname } from "next/navigation";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../context/theme-context";
import Color from "./color";
import Grid from "./grid";

export default function Sidemenu() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    function renderContent() {
        if (pathname === "/grid-gen") {
            return <Grid />;
        }

        return <Color />;
    }

    return (
        <div className="bg-[var(--bg-secondary)] p-6 max-h-screen min-w-80 border-r border-[var(--border-color)] flex flex-col">
            <div className="flex-1">
                {renderContent()}
            </div>
            
            {/* Dark Mode Toggle */}
            <div>
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between py-3 rounded-xl cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        {theme === "dark" ? (
                            <MoonIcon className="w-5 h-5 text-[var(--primary-blue)]" />
                        ) : (
                            <SunIcon className="w-5 h-5 text-[var(--orange-warning)]" />
                        )}
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                        theme === "dark" ? "bg-[var(--primary-blue)]" : "bg-[var(--bg-tertiary)]"
                    }`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--bg-secondary)] transition-transform duration-300 ${
                            theme === "dark" ? "translate-x-6" : "translate-x-1"
                        }`} />
                    </div>
                </button>
            </div>
        </div>
    );
}
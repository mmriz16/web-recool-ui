"use client";

import { usePathname } from "next/navigation";
import Color from "./color";
import Grid from "./grid";

export default function Sidemenu() {
    const pathname = usePathname();

    function renderContent() {
        if (pathname === "/grid-gen") {
            return <Grid />;
        }

        return <Color />;
    }

    return (
        <div className="bg-white p-6 h-full w-80 border-r border-black/10">
            {renderContent()}
        </div>
    );
}
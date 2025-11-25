import { useState } from "react";
import { Slider } from "../ui/slider";
import { ColorInput } from "../ui/color-input";

export default function Color() {
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(0);
    const [color, setColor] = useState("#191DFA");
    const [isDarkMode, setIsDarkMode] = useState(false);

    function randomColor() {
        const c = Math.floor(Math.random() * 16777215).toString(16);
        setColor("#" + c.padStart(6, "0"));
    }

    return (
        <div className="flex flex-col space-y-6 h-full justify-between">
            <div className="flex items-center justify-between text-base">
                <h1 className="font-medium uppercase">Palletes</h1>
                <p className="text-sm text-foreground/50">Add</p>
            </div>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col space-y-2.5 font-medium text-sm">
                    <h1 className="font-medium uppercase text-base">Base Color</h1>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p>Color Name</p>
                        <input className="w-full p-4 rounded-xl border border-black/10 active:outline-none focus:outline-none font-normal" type="text" placeholder="e.g. Ransom Red" />
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p>Description</p>
                        <textarea className="w-full p-4 rounded-xl border border-black/10 active:outline-none focus:outline-none font-normal resize-none" rows={2} placeholder="e.g. used for primary actions and high-priority elements" />
                    </form>
                    <form className="flex flex-col justify-between gap-1.5">
                        <p>Base Color</p>
                        <ColorInput color={color} onChangeColor={setColor} onRefresh={randomColor} />
                    </form>
                    <div className="w-full p-4 rounded-2xl border border-black/10 flex items-center justify-between bg-white">
                        <div>
                            <p className="font-medium text-base">Dark Mode</p>
                        </div>
                        <button
                            type="button"
                            aria-pressed={isDarkMode}
                            onClick={() => setIsDarkMode((prev) => !prev)}
                            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${isDarkMode ? "bg-[#191DFA]" : "bg-black/10"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? "translate-x-4" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col space-y-2.5 font-medium text-sm">
                    <h1 className="font-medium uppercase text-base">Easing & Adjustments</h1>
                    <form className="flex flex-col justify-between gap-1.5">
                        <Slider label="Hue Shift" value={hue} onChange={setHue} min={0} max={100} color="#191DFA" />
                        <Slider label="Saturation Boost" value={saturation} onChange={setSaturation} min={0} max={100} color="#191DFA" />
                    </form>
                </div>
            </div>
        </div>
    );
}
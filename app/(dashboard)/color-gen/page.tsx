import Navbar from "@/components/layout/navbar";
import Sidemenu from "@/components/layout/sidemenu";
import Card from "../../../components/ui/card";
import Pallete from "@/components/layout/pallete";

export default function ColorGen() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-row h-full">
                <Sidemenu />
                <div className="flex flex-col h-full w-full items-center justify-between p-6 gap-[10px]">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex-1 h-full">
                            <h1 className="font-bold text-2xl">Pallete Generator</h1>
                            <p className="text-sm text-foreground/50">Generate a pallete of colors based on a base color.</p>
                        </div>
                        <div className="flex bg-white p-[2px] rounded-2xl w-fit">
                            <button className="px-4 py-3.5 rounded-[14px] bg-[#f7f7f7] font-medium text-black">
                                Editor
                            </button>
                            <button className="px-4 py-3.5 rounded-[14px] text-gray-500 hover:text-black">
                                Documentation
                            </button>
                            <button className="px-4 py-3.5 rounded-[14px] text-gray-500 hover:text-black">
                                Preview
                            </button>
                        </div>
                    </div>
                    <Card>
                        <div className="flex flex-col space-y-6">
                            <Pallete />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
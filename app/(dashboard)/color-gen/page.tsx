import Navbar from "@/components/layout/navbar";
import Sidemenu from "@/components/layout/sidemenu";
import Card from "@/components/ui/card";
import Pallete from "@/components/layout/pallete";
import Navtab from "@/components/ui/navtab";
import UiTemplate from "@/components/layout/ui-template";

export default function ColorGen() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-row h-full">
                <Sidemenu />
                <div className="flex flex-col h-full w-full items-center p-6 gap-[10px]">
                    <div className="flex flex-row justify-between w-full">
                        <div className="flex-1 h-full">
                            <h1 className="font-bold text-2xl">Pallete Generator</h1>
                            <p className="text-sm text-foreground/50">Generate a pallete of colors based on a base color.</p>
                        </div>
                        <Navtab
                            tabs={[
                                { label: "Editor", value: "editor" },
                                { label: "Documentation", value: "documentation" },
                            ]}
                            defaultValue="editor"
                        />
                    </div>
                    <Card>
                        <div className="flex flex-col space-y-6">
                            <Pallete />
                        </div>
                    </Card>
                    <Card>
                        <div className="flex flex-col space-y-6">
                            <UiTemplate />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
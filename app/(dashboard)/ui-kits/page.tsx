import Navbar from "@/components/layout/navbar"
import Product from "@/components/layout/product";
import Navtab from "@/components/ui/navtab"
import Card from "@/components/ui/card";

export default function UiKits() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex h-full p-6 flex-col items-center">
                <div className="w-full max-w-[744px] my-[50px] space-y-2.5">
                    <h1 className="text-[44px] text-center font-bold">12,246 curated design resources to speed up your creative workflow.</h1>
                    <p className="text-[20px] text-center text-foreground/50">Join a growing family of 900k+ designers and makers from around the world.</p>
                </div>
                <div className="flex flex-col gap-2.5 max-w-7xl items-center">
                    <Navtab 
                        tabs={[
                            { label: "Featured", value: "featured" },
                            { label: "Trending", value: "trending" },
                            { label: "Latest", value: "latest" }
                        ]}
                        defaultValue="featured"
                    />
                    <Card>
                        <div className="grid grid-cols-4 w-full gap-4">
                            <Product>
                                <div className="flex flex-row gap-2 w-full items-center justify-between text-[var(--text-primary)]">
                                    <h1 className="truncate">ExploreMore : Interactive Travel Map hasdagshdjgasjdh asdhakshdkjahsdkj</h1>
                                    <p>$20</p>
                                </div>
                                <div className="flex flex-row w-full items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <p>Mapify Technologies</p>
                                    <p>•</p>
                                    <p>UI Kits</p>
                                </div>
                            </Product>
                            <Product>
                                <div className="flex flex-row gap-2 w-full items-center justify-between text-[var(--text-primary)]">
                                    <h1 className="truncate">ExploreMore : Interactive Travel Map</h1>
                                    <p>$20</p>
                                </div>
                                <div className="flex flex-row w-full items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <p>Mapify Technologies</p>
                                    <p>•</p>
                                    <p>UI Kits</p>
                                </div>
                            </Product>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
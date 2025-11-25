import Navbar from "@/components/layout/navbar"

export default function UiKits() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex h-full p-6 justify-center">
                <div className="w-full max-w-[744px] my-[50px] space-y-2.5">
                    <h1 className="text-[44px] text-center font-bold">12,246 curated design resources to speed up your creative workflow.</h1>
                    <p className="text-[20px] text-center text-foreground/50">Join a growing family of 900k+ designers and makers from around the world.</p>
                </div>
            </div>
        </div>
    );
}
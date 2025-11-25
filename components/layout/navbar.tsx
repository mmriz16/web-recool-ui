import Link from "next/link";
import Button from "../ui/button";
import Image from "next/image";
import { BellIcon } from "lucide-react";

export default function Navbar() {
  return (
    <div className="text-foreground px-6 py-3.5 flex justify-between items-center bg-white rounded-xl border-b-[1px] border-black/10">
      <div className="flex items-center space-x-[10px]">
        <Image src="../svg/logo.svg" alt="Recool UI" width={42} height={42} />
        <div className="flex flex-col space-x-4">
          <h1 className="text-xl font-bold">Recool UI</h1>
          <p className="text-xs text-foreground/50">Design Tools for Developers & Designers</p>
        </div>
      </div>
      <div className="flex items-center text-base">
        <Link href="/" className="text-black/50 hover:text-black transition-colors px-4">Home</Link>
        <Link href="/ui-kits" className="text-black/50 hover:text-black transition-colors px-4">UI Kits</Link>
        <Link href="/color-gen" className="text-black/50 hover:text-black transition-colors px-4">Color Generator</Link>
        <Link href="/grid-gen" className="text-black/50 hover:text-black transition-colors px-4">Grid Generator</Link>
      </div>
      <div className="flex items-center space-x-3 text-base">
        <Button variant="primary">Feedback</Button>
        <div className="flex items-center relative cursor-pointer w-[45px] h-[45px] justify-center border border-black/10 rounded-xl">
          <div className="absolute top-3 right-3 w-2.5 h-2.5 border-2 border-white bg-red-500 rounded-full" />
          <BellIcon className="w-5 h-5 text-black transition-colors" />
        </div>
        <div className="bg-[#f7f7f7] rounded-xl w-[45px] h-[45px]" />
      </div>
    </div>
  );
}
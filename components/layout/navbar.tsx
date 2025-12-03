"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "../ui/button";
import Image from "next/image";
import { BellIcon } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) => {
    const baseClass = "transition-colors px-4";
    const activeClass = isActive(href)
      ? "text-[var(--text-primary)] font-semibold"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
    return `${baseClass} ${activeClass}`;
  };

  return (
    <div className="text-[var(--text-primary)] px-6 py-3.5 flex justify-between items-center bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      <div className="flex items-center space-x-[10px]">
        <Image src="../svg/logo.svg" alt="Recool UI" width={42} height={42} />
        <div className="flex flex-col space-x-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Recool UI</h1>
          <p className="text-xs text-[var(--text-tertiary)]">Design Tools for Developers & Designers</p>
        </div>
      </div>
      <div className="flex items-center text-base">
        <Link href="/" className={linkClass("/")}>Home</Link>
        <Link href="/ui-kits" className={linkClass("/ui-kits")}>UI Kits</Link>
        <Link href="/color-gen" className={linkClass("/color-gen")}>Color Generator</Link>
        <Link href="/grid-gen" className={linkClass("/grid-gen")}>Grid Generator</Link>
      </div>
      <div className="flex items-center space-x-3 text-base">
        <Button variant="primary">Feedback</Button>
        <div className="flex items-center relative cursor-pointer w-[45px] h-[45px] justify-center border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)]">
          <div className="absolute top-3 right-3 w-2.5 h-2.5 border-2 border-[var(--bg-secondary)] bg-[var(--red-danger)] rounded-full" />
          <BellIcon className="w-5 h-5 text-[var(--text-primary)] transition-colors" />
        </div>
        <div className="bg-[var(--bg-tertiary)] rounded-xl w-[45px] h-[45px]" />
      </div>
    </div>
  );
}
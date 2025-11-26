"use client";
import { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    const closeOnEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity 
        ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/10 backdrop-blur-xs"
      />

      {/* modal box */}
      <div
        className={`relative bg-white rounded-2xl p-6 w-[976px] max-w-[90%] transition 
          ${open ? "scale-100" : "scale-95"}`}
      >
        {children}
      </div>
    </div>
  );
}

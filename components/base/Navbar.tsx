import React from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./ModeToogle";

export default function Navbar() {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-white/80 backdrop-blur-md border-b border-gray-200/50",
        "px-4 py-3 md:px-6 lg:px-8"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">ChangeNetwork</h1>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}

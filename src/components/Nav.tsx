"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-dark/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl italic tracking-tight text-paper">
          Sublime
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link
            href="/#catalogo"
            className="link-underline hidden text-paper/70 transition-colors hover:text-paper sm:inline"
          >
            Catálogo
          </Link>
          <Link
            href="/pedido"
            className="group inline-flex items-center gap-1.5 rounded-full bg-lime px-5 py-2.5 font-medium text-dark transition-transform hover:-translate-y-0.5"
          >
            Crear mi diseño
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}

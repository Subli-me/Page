import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="grain bg-dark text-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-4xl italic sm:text-5xl">
              Hagamos algo
              <br />
              <span className="text-lime">estampado.</span>
            </p>
          </div>
          <Link
            href="/pedido"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-paper/30 px-6 py-3.5 text-sm transition-colors hover:border-lime hover:text-lime"
          >
            Crear mi diseño
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-paper/10 pt-8 text-sm text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sublime — DTF Studio</p>
          <p>Remeras · Buzos · Chombas, prenda por prenda.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-56 shrink-0 border-r border-line/70 p-6 sm:block">
        <p className="mb-10 font-display text-xl">Sublime</p>
        <nav className="space-y-1 text-sm">
          <Link href="/admin" className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-panel hover:text-ink">
            Pedidos
          </Link>
          <Link href="/admin/productos" className="block rounded-lg px-3 py-2 text-ink-soft hover:bg-panel hover:text-ink">
            Productos y precios
          </Link>
        </nav>
        <div className="mt-10">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}

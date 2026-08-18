"use client";

import { useState } from "react";

export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Aquí podrías conectar con tu proveedor de email marketing
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <form onSubmit={handleSubmit} className="flex overflow-hidden rounded border border-white/20">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={sent ? "¡Gracias! 🎉" : "Tu email"}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none"
        aria-label="Email para newsletter"
      />
      <button
        type="submit"
        className="shrink-0 bg-white px-4 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-white/80"
      >
        {sent ? "✓" : "Enviar"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import clsx from "clsx";

export function EditableNumber({
  value,
  onSave,
}: {
  value: number;
  onSave: (value: number) => void | Promise<void>;
}) {
  const [local, setLocal] = useState(String(value));
  const [saved, setSaved] = useState(false);

  async function commit() {
    const num = Number(local);
    if (Number.isNaN(num) || num === value) return;
    await onSave(num);
    setSaved(true);
    setTimeout(() => setSaved(false), 900);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-ink-soft">$</span>
      <input
        type="number"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className={clsx(
          "w-24 rounded-lg border border-transparent bg-transparent px-2 py-1 transition-colors hover:border-line focus:border-accent focus:bg-paper focus:outline-none",
          saved && "border-green-400"
        )}
      />
    </div>
  );
}

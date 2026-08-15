"use client";

import { useState } from "react";
import clsx from "clsx";

export function EditableText({
  label,
  value,
  onSave,
  multiline,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void | Promise<void>;
  multiline?: boolean;
}) {
  const [local, setLocal] = useState(value);
  const [saved, setSaved] = useState(false);

  async function commit() {
    if (local === value) return;
    await onSave(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 900);
  }

  const Comp = multiline ? "textarea" : "input";

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <Comp
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        rows={multiline ? 3 : undefined}
        className={clsx("input", saved && "border-green-400")}
      />
    </label>
  );
}

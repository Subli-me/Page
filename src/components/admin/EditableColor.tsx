"use client";

import { useState } from "react";

export function EditableColor({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void | Promise<void>;
}) {
  const [local, setLocal] = useState(value);

  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={local}
          onChange={(e) => {
            setLocal(e.target.value);
            onSave(e.target.value);
          }}
          className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-transparent p-1"
        />
        <span className="font-mono text-xs text-ink-soft">{local}</span>
      </div>
    </label>
  );
}

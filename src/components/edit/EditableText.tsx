"use client";

import { useRef, useState, type ElementType } from "react";
import clsx from "clsx";
import { useEditMode } from "@/contexts/EditModeContext";
import type { SiteSettings } from "@/lib/types";

export function EditableText({
  field,
  value,
  as: As = "span",
  className,
  multiline,
}: {
  field: keyof SiteSettings;
  value: string;
  as?: ElementType;
  className?: string;
  multiline?: boolean;
}) {
  const editing = useEditMode();
  const [current, setCurrent] = useState(value);
  const [saved, setSaved] = useState(false);
  const startValue = useRef(value);

  if (!editing) {
    return <As className={className}>{current}</As>;
  }

  async function commit(el: HTMLElement) {
    const next = (el.innerText ?? "").trim();
    if (next === startValue.current) return;
    setCurrent(next);
    startValue.current = next;
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1000);
  }

  return (
    <As
      contentEditable
      suppressContentEditableWarning
      onFocus={(e: React.FocusEvent<HTMLElement>) => {
        startValue.current = e.currentTarget.innerText.trim();
      }}
      onBlur={(e: React.FocusEvent<HTMLElement>) => commit(e.currentTarget)}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      className={clsx(
        className,
        "cursor-text rounded-sm outline-2 outline-dashed outline-offset-4 outline-accent/40 transition-colors hover:outline-accent focus:bg-accent/10 focus:outline-accent",
        saved && "bg-lime/20"
      )}
    >
      {current}
    </As>
  );
}

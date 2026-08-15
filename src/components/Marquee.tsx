export function Marquee({ text }: { text: string }) {
  const items = Array.from({ length: 8 }, () => text);
  return (
    <div className="grain overflow-hidden border-y border-white/10 bg-dark py-4 text-paper">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="mx-4 flex items-center gap-4 font-display text-2xl italic">
            {t}
            <span className="text-lime">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

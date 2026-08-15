import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { getSiteSettings } from "@/lib/settings";

export default async function ComoEstampamosPage() {
  const s = await getSiteSettings();

  const steps = [
    { n: "01", title: s.process_step1_title, text: s.process_step1_text },
    { n: "02", title: s.process_step2_title, text: s.process_step2_text },
    { n: "03", title: s.process_step3_title, text: s.process_step3_text },
    { n: "04", title: s.process_step4_title, text: s.process_step4_text },
  ];

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="grain bg-dark text-paper">
          <div className="mx-auto max-w-4xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-lime">
              El proceso
            </p>
            <h1 className="font-display text-5xl italic tracking-tight sm:text-6xl">
              {s.process_title}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-paper/60">{s.process_subtitle}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <div className="space-y-14">
            {steps.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.08}>
                <div className="flex gap-6">
                  <span className="font-display text-5xl italic text-accent/30">{step.n}</span>
                  <div>
                    <h2 className="font-display text-2xl">{step.title}</h2>
                    <p className="mt-2 max-w-md text-ink-soft">{step.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="border-t border-line/70 bg-panel">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <Reveal>
              <h2 className="font-display text-3xl italic">{s.care_title}</h2>
              <p className="mt-4 max-w-lg text-ink-soft">{s.care_text}</p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

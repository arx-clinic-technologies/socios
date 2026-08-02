import Link from "next/link";
import { KindocLogo } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { getBitacora, monthOf, shortRange, type Week } from "@/lib/updates";

export const metadata = { title: "Kindoc · Todas las entregas" };

/** Agrupa las entregas por mes conservando el orden de la más reciente a la más vieja. */
function groupByMonth(weeks: Week[]) {
  const months: { month: string; weeks: Week[] }[] = [];
  for (const week of weeks) {
    const month = monthOf(week.start);
    const last = months[months.length - 1];
    if (last && last.month === month) last.weeks.push(week);
    else months.push({ month, weeks: [week] });
  }
  return months;
}

export default function HistorialPage() {
  const { weeks, totals } = getBitacora();
  const months = groupByMonth(weeks);

  return (
    <main>
      <header className="border-b border-kd-line bg-white px-6 pt-8 pb-9 sm:px-9">
        <KindocLogo />
        <p className="mt-6 text-[11px] font-bold tracking-[0.18em] text-kd-cyan-ink uppercase">
          Entrega semanal para socios
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.15] font-extrabold text-kd-ink">
          Todas las entregas
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-kd-gray">
          {totals.changes} mejoras en {totals.weeks} entregas semanales desde el{" "}
          {totals.sinceLabel}.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full border border-kd-line bg-kd-paper px-4 py-2 text-sm font-bold text-kd-ink transition-colors hover:border-kd-cyan"
        >
          ← Volver a la última
        </Link>
      </header>

      <div className="space-y-8 px-4 py-8 sm:px-8">
        {months.map(({ month, weeks: monthWeeks }) => (
          <section key={month}>
            <h2 className="mb-3 px-1 text-[11px] font-bold tracking-[0.16em] text-kd-muted uppercase">
              {month}
            </h2>
            <ul className="space-y-2.5">
              {monthWeeks.map((week) => (
                <li key={week.start}>
                  <Link
                    href={`/s/${week.start}`}
                    className="block rounded-xl bg-white px-5 py-4 shadow-[0_2px_10px_rgba(47,52,57,0.05)] transition-colors hover:bg-kd-cyan/5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-kd-ink">
                        Semana del {shortRange(week.start, week.end)}
                      </span>
                      <span className="shrink-0 text-[12.5px] font-semibold text-kd-cyan-ink">
                        {week.changes} {week.changes === 1 ? "mejora" : "mejoras"}
                      </span>
                    </div>
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-kd-muted">
                      {week.sections.map((section) => (
                        <span key={section.title}>
                          <span aria-hidden>{section.emoji}</span> {section.title}
                        </span>
                      ))}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <SiteFooter />
    </main>
  );
}

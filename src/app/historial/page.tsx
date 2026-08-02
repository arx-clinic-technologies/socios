import Link from "next/link";
import { KindocMark } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { getBitacora, monthOf, type Day } from "@/lib/updates";

export const metadata = { title: "Kindoc · Todas las entregas" };

/** Agrupa las entregas por mes conservando el orden del más reciente al más viejo. */
function groupByMonth(days: Day[]) {
  const months: { month: string; days: Day[] }[] = [];
  for (const day of days) {
    const month = monthOf(day.date);
    const last = months[months.length - 1];
    if (last && last.month === month) last.days.push(day);
    else months.push({ month, days: [day] });
  }
  return months;
}

export default function HistorialPage() {
  const { days, totals } = getBitacora();
  const months = groupByMonth(days);

  return (
    <main>
      <header className="bg-kd-ink px-6 pt-9 pb-10 sm:px-9">
        <KindocMark />
        <p className="mt-6 text-[11px] font-bold tracking-[0.18em] text-kd-cyan uppercase">
          Resumen para socios
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.15] font-extrabold text-white">
          Todas las entregas
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          {totals.changes} mejoras en {totals.days} entregas desde el {totals.sinceLabel}.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
        >
          ← Volver a la última
        </Link>
      </header>

      <div className="space-y-8 px-4 py-8 sm:px-8">
        {months.map(({ month, days: monthDays }) => (
          <section key={month}>
            <h2 className="mb-3 px-1 text-[11px] font-bold tracking-[0.16em] text-kd-muted uppercase">
              {month}
            </h2>
            <ul className="space-y-2.5">
              {monthDays.map((day) => (
                <li key={day.date}>
                  <Link
                    href={`/d/${day.date}`}
                    className="block rounded-xl bg-white px-5 py-4 shadow-[0_2px_10px_rgba(29,58,66,0.05)] transition-colors hover:bg-kd-cyan/5"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-kd-ink">{day.label}</span>
                      <span className="shrink-0 text-[12.5px] font-semibold text-kd-cyan-deep">
                        {day.changes} {day.changes === 1 ? "mejora" : "mejoras"}
                      </span>
                    </div>
                    <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-kd-muted">
                      {day.sections.map((section) => (
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

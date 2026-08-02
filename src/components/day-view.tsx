import Link from "next/link";
import { KindocLogo } from "@/components/brand";
import { RichText } from "@/components/rich-text";
import type { Day, Kind } from "@/lib/updates";
import { shortLabel } from "@/lib/updates";

/** Cada tipo de cambio tiene el color de una de las píldoras del logo. */
const DOT_BY_KIND: Record<Kind, string> = {
  nuevo: "bg-kd-cyan",
  arreglo: "bg-kd-pink",
  mejora: "bg-kd-lime",
};

function Item({
  text,
  details,
  kind,
}: {
  text: string;
  details: string[];
  kind: Kind;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className={`mt-2 h-2 w-2 shrink-0 rounded-full ${DOT_BY_KIND[kind]}`}
      />
      <div className="min-w-0">
        <p className="text-[15px] leading-relaxed text-kd-gray [&_strong]:text-kd-ink">
          <RichText>{text}</RichText>
        </p>
        {details.length > 0 && (
          <ul className="mt-2 space-y-1">
            {details.map((detail) => (
              <li
                key={detail}
                className="text-[13.5px] leading-relaxed text-kd-muted [&_strong]:text-kd-gray"
              >
                <RichText>{detail}</RichText>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function DayView({
  day,
  older,
  newer,
  isLatest,
}: {
  day: Day;
  older?: Day;
  newer?: Day;
  isLatest: boolean;
}) {
  return (
    <article>
      <header className="border-b border-kd-line bg-white px-6 pt-8 pb-9 sm:px-9">
        <KindocLogo />
        <p className="mt-6 text-[11px] font-bold tracking-[0.18em] text-kd-cyan-ink uppercase">
          Resumen para socios
        </p>
        <h1 className="mt-2 text-[2rem] leading-[1.15] font-extrabold text-kd-ink sm:text-[2.4rem]">
          {isLatest ? "Lo que hicimos" : day.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-kd-line bg-kd-paper px-4 py-2 text-sm font-bold text-kd-ink">
            {day.label}
          </span>
          {isLatest && (
            <span className="rounded-full bg-kd-lime px-3 py-2 text-xs font-bold text-kd-ink">
              Última entrega
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6 px-4 pt-8 pb-2 sm:px-8">
        {day.sections.map((section, index) => (
          <section key={section.title} className="relative">
            <span className="absolute -top-2 left-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-kd-cyan-ink text-sm font-bold text-white shadow-md">
              {index + 1}
            </span>
            <div className="rounded-2xl bg-white px-5 pt-7 pb-6 shadow-[0_2px_14px_rgba(29,58,66,0.07)] sm:px-7">
              <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold text-kd-ink">
                <span aria-hidden className="text-2xl">
                  {section.emoji}
                </span>
                {section.title}
              </h2>
              <ul className="space-y-3.5">
                {section.items.map((item) => (
                  <Item
                    key={item.hash}
                    text={item.text}
                    details={item.details}
                    kind={item.kind}
                  />
                ))}
              </ul>
            </div>
          </section>
        ))}

        {day.stat && (
          <div className="rounded-2xl bg-kd-ink px-6 py-8 text-center">
            <p className="text-5xl font-extrabold text-kd-lime">{day.stat.value}</p>
            <p className="mt-3 text-[15px] leading-relaxed font-medium text-white/85">
              <RichText>{day.stat.text}</RichText>
            </p>
          </div>
        )}

        {day.internal > 0 && (
          <p className="px-1 text-[13px] leading-relaxed text-kd-muted">
            Además, {day.internal}{" "}
            {day.internal === 1 ? "ajuste interno" : "ajustes internos"} de
            mantenimiento que no cambian lo que ve el paciente.
          </p>
        )}

        {day.note && (
          <p className="rounded-xl border border-kd-line bg-white/60 px-5 py-4 text-[13.5px] leading-relaxed text-kd-gray [&_strong]:text-kd-ink">
            <RichText>{day.note}</RichText>
          </p>
        )}
      </div>

      <nav className="no-print flex items-stretch gap-3 px-4 py-8 sm:px-8">
        {older ? (
          <Link
            href={`/d/${older.date}`}
            className="flex-1 rounded-xl border border-kd-line bg-white px-4 py-3 transition-colors hover:border-kd-cyan"
          >
            <span className="block text-[11px] font-bold tracking-wider text-kd-muted uppercase">
              ← Entrega anterior
            </span>
            <span className="mt-0.5 block text-sm font-bold text-kd-ink">
              {shortLabel(older.date)}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {newer ? (
          <Link
            href={`/d/${newer.date}`}
            className="flex-1 rounded-xl border border-kd-line bg-white px-4 py-3 text-right transition-colors hover:border-kd-cyan"
          >
            <span className="block text-[11px] font-bold tracking-wider text-kd-muted uppercase">
              Entrega siguiente →
            </span>
            <span className="mt-0.5 block text-sm font-bold text-kd-ink">
              {shortLabel(newer.date)}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  );
}

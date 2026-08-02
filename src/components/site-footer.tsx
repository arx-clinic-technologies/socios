import Link from "next/link";
import { getBitacora } from "@/lib/updates";

export function SiteFooter() {
  const { totals, sinceNote } = getBitacora();

  return (
    <footer className="border-t border-kd-line bg-white/70 px-6 py-8 sm:px-9">
      <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-kd-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-kd-cyan" />
          Algo nuevo
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-kd-pink" />
          Algo que arreglamos
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-2 w-2 rounded-full bg-kd-lime" />
          Algo más rápido
        </li>
      </ul>

      <p className="text-[13px] leading-relaxed text-kd-muted">
        Kindoc · bitácora para socios · {totals.changes} mejoras publicadas en{" "}
        {totals.days} entregas desde el {totals.sinceLabel}.{" "}
        <Link href="/historial" className="font-semibold text-kd-cyan-ink underline">
          Ver todas las entregas
        </Link>
      </p>

      {sinceNote && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-kd-muted">{sinceNote}</p>
      )}
    </footer>
  );
}

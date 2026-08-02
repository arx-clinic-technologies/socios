import Link from "next/link";
import { KindocMark } from "@/components/brand";

export default function NotFound() {
  return (
    <main>
      <header className="bg-kd-ink px-6 pt-9 pb-10 sm:px-9">
        <KindocMark />
        <h1 className="mt-6 text-[1.8rem] leading-tight font-extrabold text-white">
          Esa entrega no existe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Puede que el enlace esté mal escrito o que esa fecha no tenga entrega.
        </p>
      </header>
      <div className="flex flex-wrap gap-3 px-6 py-8 sm:px-9">
        <Link
          href="/"
          className="rounded-xl bg-kd-cyan-deep px-5 py-3 text-sm font-bold text-white"
        >
          Ver la última entrega
        </Link>
        <Link
          href="/historial"
          className="rounded-xl border border-kd-line bg-white px-5 py-3 text-sm font-bold text-kd-ink"
        >
          Ver todas
        </Link>
      </div>
    </main>
  );
}

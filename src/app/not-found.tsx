import Link from "next/link";
import { KindocLogo } from "@/components/brand";

export default function NotFound() {
  return (
    <main>
      <header className="border-b border-kd-line bg-white px-6 pt-8 pb-9 sm:px-9">
        <KindocLogo />
        <h1 className="mt-6 text-[1.8rem] leading-tight font-extrabold text-kd-ink">
          Esa entrega no existe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-kd-gray">
          Puede que el enlace esté mal escrito o que esa semana no tenga entrega.
        </p>
      </header>
      <div className="flex flex-wrap gap-3 px-6 py-8 sm:px-9">
        <Link
          href="/"
          className="rounded-xl bg-kd-cyan-ink px-5 py-3 text-sm font-bold text-white"
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

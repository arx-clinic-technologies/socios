/**
 * Marca Kindoc: las tres píldoras del logo (cyan, rosa, lima) y el wordmark.
 * Se dibuja en lugar de usar el PNG porque el encabezado es oscuro y el
 * wordmark original viene en gris, que ahí no se lee.
 */
export function KindocMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span aria-hidden className="flex items-center gap-1">
        <span className="block h-5 w-4 rounded-full bg-kd-cyan" />
        <span className="block h-5 w-4 rounded-full bg-kd-pink" />
        <span className="block h-5 w-4 rounded-full bg-kd-lime" />
      </span>
      <span
        className={`font-extrabold tracking-[0.14em] text-white ${
          compact ? "text-base" : "text-lg"
        }`}
      >
        KINDOC
      </span>
    </div>
  );
}

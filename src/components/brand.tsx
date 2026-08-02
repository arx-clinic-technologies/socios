import Image from "next/image";
import logo from "../../public/kindoc.png";

/**
 * Logo oficial de Kindoc. Se sirve tal cual (sin pasar por el optimizador de
 * imágenes) porque son 5 KB y aparece en todas las páginas.
 */
export function KindocLogo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <Image src={logo} alt="Kindoc" priority unoptimized className={className} />
  );
}

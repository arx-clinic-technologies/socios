import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Este proyecto vive dentro de un directorio que tiene otro package-lock.json
  // más arriba; sin esto Next avisa que no sabe cuál es la raíz.
  turbopack: { root: path.resolve(".") },
  // La bitácora es contenido estático generado en build: no hay API ni datos
  // de usuario, así que todo puede servirse desde el CDN de Vercel.
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // El sitio es privado "por URL": sin contraseña, pero fuera de buscadores.
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

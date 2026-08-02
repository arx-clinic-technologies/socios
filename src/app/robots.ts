import type { MetadataRoute } from "next";

/**
 * El acceso es "privado por URL": quien tenga el enlace entra, pero el sitio no
 * debe aparecer en buscadores. Esto se refuerza con la cabecera X-Robots-Tag
 * declarada en next.config.ts.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}

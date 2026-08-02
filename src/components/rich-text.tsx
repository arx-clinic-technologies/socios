import { Fragment } from "react";

/**
 * El contenido admite **negritas** para resaltar lo importante de cada mejora.
 * Se parte el texto y se arman nodos de React: nada de HTML crudo, así que un
 * texto mal escrito no puede inyectar marcado.
 */
export function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index}>{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

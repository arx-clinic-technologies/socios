@README.md

# Notas para agentes

`README.md` (importado arriba) explica el producto y el flujo semanal. Acá va lo que hay que tener
presente al tocar código.

## Qué es

Bitácora **para socios, no para desarrolladores**. Repo independiente, solo local (sin remote), se
publica en Vercel. Next.js 16 + React 19 + Tailwind 4.

## La regla que gobierna todo

El texto que sale acá lo leen socios sin background técnico. **Nada de jerga**: ni nombres de archivos,
ni "refactor", ni "endpoint", ni "migración". Si al escribir un titular te sale una palabra que un socio
no usaría, está mal escrito. El comando `npm run bitacora` avisa cuáles quedaron sonando técnicos; se
corrigen a mano en `content/overrides.json`.

La unidad es **la semana** (lunes), no el día del commit.

## Dependencia entre repos

`npm run bitacora` lee el historial de git de `Back`, `Dashboard`, `agente-arx` y `observatory`, que
**deben estar como carpetas hermanas de esta**. Si no están, el comando no tiene de dónde sacar contenido.

Vercel **no** tiene acceso a esos repos: el sitio se construye solo con `src/data/updates.json` ya
generado. Por eso **ese JSON se commitea**. Si lo regenerás, revisalo antes de pushear — se publica solo.

## Privacidad

El acceso es privado por URL: `robots.txt` + cabecera `X-Robots-Tag` piden no indexar. No publiques la
URL en ningún lado indexable, y no quites esas protecciones.

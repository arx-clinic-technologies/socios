# Kindoc · Bitácora para socios

Sitio donde los socios ven, en lenguaje de producto y sin tecnicismos, cada
entrega que se sube a Kindoc. Se publica en Vercel.

- **Portada** (`/`): la última entrega, con el resumen del día.
- **Entrega** (`/d/2026-08-01`): cualquier día anterior, navegable hacia atrás y
  hacia adelante.
- **Historial** (`/historial`): todas las entregas agrupadas por mes.

El acceso es **privado por URL**: quien tenga el enlace entra, pero el sitio pide
a los buscadores que no lo indexen (`robots.txt` + cabecera `X-Robots-Tag`). No
publiques la URL en ningún lado indexable.

## Cómo se arma el contenido

El contenido sale de los commits de los cuatro repos de Kindoc (`Back`,
`Dashboard`, `agente-arx`, `observatory`), que deben estar como carpetas
hermanas de esta.

```
npm run bitacora
```

Ese comando lee el historial de git, descarta el trabajo interno (pruebas,
formato, reorganizaciones), traduce lo que queda a lenguaje de producto, lo
agrupa por día y por área, y escribe `src/data/updates.json`.

**Ese JSON se commitea.** Vercel no tiene acceso a los otros repos, así que el
sitio se construye únicamente con el archivo ya generado. El flujo es:

1. Trabajas y commiteas normal en `Back` / `Dashboard` / `agente-arx`.
2. Aquí corres `npm run bitacora`.
3. Revisas lo que salió y pules lo que haga falta (ver abajo).
4. Commiteas y haces push: Vercel republica solo.

### Cuando el traductor automático no alcanza

Los mensajes de commit están escritos para desarrolladores; muchos vienen en
inglés o llenos de jerga. Al terminar, el comando avisa qué titulares siguen
sonando técnicos y hay que reescribir a mano en `content/overrides.json`:

```json
{
  "commits": {
    "428604a": {
      "text": "Una cita se puede mover de un médico a otro **arrastrándola** en la agenda",
      "area": "citas",
      "kind": "arreglo",
      "details": ["Un sub-punto opcional, más chico y en gris"]
    },
    "d7d3dba": { "hide": true }
  }
}
```

- `text` — el titular como lo lee un socio. Admite `**negritas**`.
- `hide` — saca ese commit de la bitácora (plomería que a nadie le importa).
- `area` — mueve la mejora de sección (ids al inicio de `scripts/generate-updates.mjs`).
- `kind` — `nuevo` (punto cyan), `arreglo` (rosa) o `mejora` (lima).
- `details` — sub-puntos. **Solo salen de aquí**: el cuerpo del commit son notas
  internas con nombres de archivo y banderas, no sirve publicarlo tal cual.

También se puede personalizar un día completo:

```json
{
  "days": {
    "2026-08-01": {
      "title": "Lo que hicimos hoy",
      "stat": { "value": "0", "text": "**Cero interrupciones.** …" },
      "note": "Nota al pie de esa entrega."
    }
  }
}
```

`since` marca desde qué fecha arranca la bitácora, y `sinceNote` explica por qué
en el pie del sitio.

## Desarrollo

```
npm install
npm run dev      # http://localhost:3000
npm run build
npm run bitacora:check   # falla si updates.json quedó desactualizado
```

## Publicar en Vercel

1. Sube esta carpeta como repo propio en GitHub.
2. En Vercel: **Add New… → Project** e impórtalo.
3. Framework Next.js, todo por defecto. No hay variables de entorno ni base de
   datos: el sitio es estático.
4. Cada push a `main` republica.

## Marca

Paleta Kindoc tomada del Dashboard: cyan `#59C5D9`, rosa `#D95BA0`, lima
`#DDF026` y gris `#596066`. Tipografía Plus Jakarta Sans, la misma del panel.

La cabecera es blanca con el logo oficial (`public/kindoc.png`), y el color lo
ponen solo las píldoras del logo y los puntos de cada mejora. Los grises salen
de la familia del wordmark (`#2F3439`) para no desviarse al azul. Para texto
pequeño sobre blanco se usa `#0E7490` en lugar del cyan de marca, que no da
contraste suficiente.

## Nota sobre `npm audit`

Reporta 3 avisos de severidad alta en `postcss` y `sharp`, ambos dependencias
internas de Next que solo se usan al construir el sitio, sin entrada de usuario.
`npm audit fix --force` los "arregla" bajando Next a la versión 9, lo cual no
tiene sentido. Se dejan como están.

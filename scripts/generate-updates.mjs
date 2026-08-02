#!/usr/bin/env node
/**
 * Genera la bitácora para socios a partir de los commits de los repos de Kindoc.
 *
 * Lee el historial de cada repo, descarta el ruido interno (pruebas, formato,
 * reorganizaciones), traduce lo que queda a lenguaje de producto y lo agrupa por
 * día y por área. Lo que el traductor automático no logra dejar bien redactado
 * se corrige a mano en content/overrides.json, que siempre gana.
 *
 *   node scripts/generate-updates.mjs           # regenera src/data/updates.json
 *   node scripts/generate-updates.mjs --check   # falla si el archivo está desactualizado
 *
 * El resultado se commitea: Vercel no tiene acceso a los otros repos, así que
 * el sitio se construye solo con el JSON ya generado.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKSPACE = resolve(ROOT, "..");
const OUTPUT = resolve(ROOT, "src/data/updates.json");
const OVERRIDES = resolve(ROOT, "content/overrides.json");

/** Repos que alimentan la bitácora, con el nombre que ven los socios. */
const REPOS = [
  { dir: "Back", product: "Sistema" },
  { dir: "Dashboard", product: "Panel web" },
  { dir: "agente-arx", product: "Asistente de WhatsApp" },
  { dir: "observatory", product: "Monitoreo" },
];

/**
 * Áreas de producto. Se evalúan en orden: la primera que coincide gana, por eso
 * "Agenda de Google" va antes que "Citas" (ambas mencionan calendario).
 */
const AREAS = [
  {
    id: "agenda-google",
    title: "Agenda de Google",
    emoji: "📅",
    match: [/google[\s-]?calendar/i, /workspace/i, /\bdwd\b/i, /service account/i],
  },
  {
    id: "recordatorios",
    title: "Recordatorios a pacientes",
    emoji: "🔔",
    match: [/recordatorio/i, /reminder/i, /confirmaci/i, /confirmation/i, /holaia/i],
  },
  {
    id: "citas",
    title: "Citas y agenda",
    emoji: "🗓️",
    match: [/\bcitas?\b/i, /appointment/i, /booking/i, /agenda/i, /calendar/i, /horario/i, /schedule/i, /slot/i, /disponibilidad/i],
  },
  {
    id: "whatsapp",
    title: "WhatsApp y el asistente",
    emoji: "💬",
    match: [/whatsapp/i, /kapso/i, /mensaje/i, /message/i, /emoji/i, /conversation/i, /conversacion/i, /chat/i, /twilio/i, /media/i],
  },
  {
    id: "pacientes",
    title: "Pacientes",
    emoji: "🧸",
    match: [/paciente/i, /patient/i, /tutor/i, /vacun/i, /vaccin/i, /menor/i],
  },
  {
    id: "medicos",
    title: "Médicos y consultorios",
    emoji: "🩺",
    match: [/doctor/i, /medico/i, /médico/i, /consultorio/i, /branch/i, /\bsede/i, /\broom/i, /especialidad/i],
  },
  {
    id: "seguridad",
    title: "Seguridad y accesos",
    emoji: "🔒",
    match: [/security/i, /seguridad/i, /permission/i, /permiso/i, /\brole?s?\b/i, /\brol\b/i, /auth/i, /password/i, /contrase/i, /login/i, /jwt/i, /rate[\s-]?limit/i, /xss/i, /impersonation/i],
  },
  {
    id: "facturacion",
    title: "Facturación y pagos",
    emoji: "💳",
    match: [/billing/i, /invoice/i, /factur/i, /payment/i, /\bpagos?\b/i, /cfdi/i, /\bsat\b/i, /stripe/i],
  },
  {
    id: "expediente",
    title: "Expediente clínico",
    emoji: "📋",
    match: [/clinical/i, /\bnotas?\b/i, /\bnotes?\b/i, /recipe/i, /receta/i, /treatment/i, /document/i, /\bpdf\b/i, /historia/i],
  },
  {
    id: "organizacion",
    title: "Organización y equipo",
    emoji: "🏥",
    match: [/organization/i, /organizacion/i, /organización/i, /\borgs?\b/i, /\busers?\b/i, /usuario/i, /assistant/i, /recepcion/i, /equipo/i],
  },
  {
    id: "faq",
    title: "Preguntas frecuentes",
    emoji: "📚",
    match: [/\bfaqs?\b/i, /pregunta/i, /estacionamiento/i, /kinsmile/i],
  },
  {
    id: "monitoreo",
    title: "Monitoreo y estabilidad",
    emoji: "📈",
    match: [/observab/i, /metric/i, /métrica/i, /\btrace/i, /monitor/i, /health/i, /\blogs?\b/i, /socket/i, /realtime/i, /tiempo real/i],
  },
  {
    id: "reportes",
    title: "Reportes y tableros",
    emoji: "📊",
    match: [/report/i, /\bchart/i, /gráfic/i, /grafic/i, /estadist/i, /estadíst/i, /\bkpi/i],
  },
  { id: "producto", title: "Mejoras al producto", emoji: "✨", match: [] },
];

/** Tipos de commit que son trabajo interno: se cuentan, no se listan. */
const INTERNAL_TYPES = new Set([
  "chore", "test", "tests", "docs", "doc", "style", "build", "ci", "refactor", "revert",
]);

/** Ámbitos que siempre son plomería, aunque el commit venga marcado como `feat`. */
const INTERNAL_SCOPES = new Set(["ci", "deps", "dependencies", "build", "package", "lint"]);

const KIND_BY_TYPE = {
  feat: "nuevo",
  feature: "nuevo",
  fix: "arreglo",
  bugfix: "arreglo",
  hotfix: "arreglo",
  perf: "mejora",
};

/** Commits que nunca deben aparecer (ruido de andamiaje). */
const ALWAYS_HIDE = [
  /^initial commit/i,
  /^merge\b/i,
  /^wip\b/i,
  /^bump\b/i,
  /add missing newline/i,
];

/**
 * Glosario técnico → lenguaje de producto. Se aplica sobre el texto completo,
 * respetando límites de palabra. El orden importa: las frases largas primero,
 * si no "rate" se traduciría antes que "rate limit".
 */
const GLOSSARY = [
  [/\bdomain[- ]wide delegation\b/gi, "permiso de toda la organización"],
  [/\bservice accounts?\b/gi, "cuenta de servicio"],
  [/\brate[- ]?limits?\b/gi, "límite de peticiones"],
  [/\bfast[- ]?path\b/gi, "respuesta rápida"],
  [/\blocal ?storage\b/gi, "memoria del navegador"],
  [/\bfeature flags?\b/gi, "interruptor de función"],
  [/\bpull requests?\b/gi, "propuesta de cambio"],
  [/\bmigrations?\b/gi, "actualización de la base de datos"],
  [/\bseeders?\b/gi, "carga inicial de datos"],
  [/\bwebhooks?\b/gi, "aviso automático"],
  [/\bendpoints?\b/gi, "servicio"],
  [/\bbackend\b/gi, "el sistema"],
  [/\bfrontend\b/gi, "el panel"],
  [/\bdashboards?\b/gi, "panel"],
  [/\bsettings\b/gi, "configuración"],
  [/\bonboarding\b/gi, "alta"],
  [/\bhand[- ]?offs?\b/gi, "pase a una persona"],
  [/\bescalations?\b/gi, "pase a una persona"],
  [/\binbound\b/gi, "mensajes que entran"],
  [/\boutbound\b/gi, "mensajes que salen"],
  [/\bfallbacks?\b/gi, "respuesta alterna"],
  [/\bguards?\b/gi, "protección"],
  [/\bpayloads?\b/gi, "datos enviados"],
  [/\bschemas?\b/gi, "estructura de datos"],
  [/\bhandlers?\b/gi, "manejo"],
  [/\btimezones?\b/gi, "zona horaria"],
  [/\bprompts?\b/gi, "instrucciones del asistente"],
  [/\bLLM\b/g, "la inteligencia artificial"],
  [/\btokens?\b/gi, "código"],
  [/\bbundles?\b/gi, "conjunto"],
  [/\bdebounce\b/gi, "agrupación de mensajes"],
  [/\bhelpers?\b/gi, "utilidad"],
  [/\blegacy\b/gi, "antiguo"],
  [/\bscopes?\b/gi, "alcance"],
  [/\brouting\b/gi, "derivación"],
  [/\btimestamps?\b/gi, "marca de tiempo"],
  [/\bidle\b/gi, "inactividad"],
  [/\bchannels?\b/gi, "canal"],
  [/\bby default\b/gi, "por defecto"],
  [/\bcach[eé]\b/gi, "memoria temporal"],
  [/\bdeploys?\b/gi, "publicación"],
  [/\bcoverage\b/gi, "cobertura de pruebas"],
  [/\btests?\b/gi, "pruebas automáticas"],
  [/\brefactor(ing)?\b/gi, "reorganización interna"],
  [/\boverflow\b/gi, "desbordamiento"],
  [/\bsidebars?\b/gi, "panel lateral"],
  [/\bdrag(ging)?\b/gi, "arrastrar"],
  [/\bgrid\b/gi, "cuadrícula"],
  [/\bmodals?\b/gi, "ventana"],
  [/\bdropdowns?\b/gi, "menú"],
  [/\btoggle\b/gi, "interruptor"],
  [/\bsync(ing)?\b/gi, "sincronización"],
  [/\bflows?\b/gi, "flujo"],
  [/\bUI\b/g, "la interfaz"],
  [/\bUX\b/g, "la experiencia de uso"],
  [/\bbugs?\b/gi, "falla"],
];

/** Verbos en inglés al inicio del mensaje → forma en primera persona del plural. */
const LEAD_VERBS = [
  [/^adds?\b|^added\b/i, "Agregamos"],
  [/^implements?\b|^implemented\b/i, "Implementamos"],
  [/^enforces?\b|^enforced\b/i, "Aseguramos"],
  [/^handles?\b|^handled\b/i, "Ahora manejamos"],
  [/^detects?\b|^detected\b/i, "Ahora detectamos"],
  [/^improves?\b|^improved\b/i, "Mejoramos"],
  [/^updates?\b|^updated\b/i, "Actualizamos"],
  [/^removes?\b|^removed\b/i, "Quitamos"],
  [/^redesigns?\b|^redesigned\b/i, "Rediseñamos"],
  [/^unif(y|ies|ied)\b/i, "Unificamos"],
  [/^migrates?\b|^migrated\b/i, "Migramos"],
  [/^allows?\b|^allowed\b/i, "Ahora se puede"],
  [/^prevents?\b|^prevented\b/i, "Evitamos"],
  [/^ensures?\b|^ensured\b/i, "Garantizamos"],
  [/^(shows?|displays?)\b/i, "Ahora se muestra"],
  [/^enables?\b|^enabled\b/i, "Activamos"],
  [/^changes?\b|^changed\b/i, "Cambiamos"],
  [/^wide(n|ns|ned)?\b/i, "Ampliamos"],
  [/^supports?\b/i, "Soporte para"],
  [/^fix(es|ed)?\b/i, "Corregimos"],
  [/^guards? against\b/i, "Protegimos contra"],
];

/**
 * Nombres propios que sí pueden aparecer en el texto: se ignoran al decidir si
 * una frase "suena a código", porque WhatsApp o Google Calendar son mayúsculas
 * legítimas y no jerga técnica.
 */
const BRAND_NAMES =
  /\b(WhatsApp|Kindoc|Google Calendar|Google|Workspace|Kapso|Vercel|Railway|Meta|HOLAIA|OAuth|Resend|Excel)\b/g;

/** Señales de que una frase es para desarrolladores y no para socios. */
const TECHNICAL_SIGNS = [
  /[`_/\\<>{}]/, // rutas, identificadores, plantillas
  /\.(js|ts|tsx|jsx|mjs|json|css|sql|sh|yml|env)\b/i,
  /\b[a-záéíóúñ]+[A-Z][a-zA-Z]*\b/, // camelCase
  /\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/, // PascalCase
  /\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/, // VARIABLES_DE_ENTORNO
  /\(\)/,
  /\b\d+\s?(px|ms|chars)\b/i,
];

/** Palabras funcionales en inglés: si aparecen, la frase quedó sin traducir. */
const ENGLISH_SIGNS =
  /\b(the|with|when|without|from|into|and|for|that|this|will|should|before|after|which|there|their|been|being|does|not|have|has|its|per)\b/i;

/** ¿La frase se puede publicar tal cual a un socio no técnico? */
function isReadable(text) {
  if (!text || text.length < 12 || text.length > 200) return false;
  const stripped = text.replace(BRAND_NAMES, "");
  if (TECHNICAL_SIGNS.some((sign) => sign.test(stripped))) return false;
  if (ENGLISH_SIGNS.test(stripped)) return false;
  return true;
}

function git(dir, args) {
  return execFileSync("git", args, { cwd: dir, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
}

/** Lee los commits de un repo como registros estructurados. */
function readCommits(repo) {
  const dir = resolve(WORKSPACE, repo.dir);
  if (!existsSync(resolve(dir, ".git"))) {
    console.warn(`  ! ${repo.dir}: no es un repo git, se omite`);
    return [];
  }
  const raw = git(dir, [
    "log",
    "--no-merges",
    "--date=short",
    "--pretty=format:%H%x1f%ad%x1f%s%x1f%b%x1e",
  ]);

  return raw
    .split("\x1e")
    .map((record) => record.replace(/^\n/, "").trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, date, subject, body = ""] = record.split("\x1f");
      return {
        hash: hash.slice(0, 7),
        date,
        subject: subject.trim(),
        body: body.trim(),
        product: repo.product,
        repo: repo.dir,
      };
    });
}

/** Separa `feat(scope): asunto` en sus partes; si no es convencional, adivina. */
function parseConventional(subject) {
  const match = subject.match(/^(\w+)(?:\(([^)]*)\))?(!?):\s*(.+)$/);
  if (match) {
    return { type: match[1].toLowerCase(), scope: match[2] || "", text: match[4] };
  }
  if (/^(fix|corrige|corregir|arregla)\b/i.test(subject)) {
    return { type: "fix", scope: "", text: subject };
  }
  return { type: "feat", scope: "", text: subject };
}

const FALLBACK_AREA = AREAS[AREAS.length - 1];

function pickArea(haystack) {
  for (const area of AREAS) {
    if (area.match.some((re) => re.test(haystack))) return area;
  }
  return null;
}

/**
 * El asunto manda: solo si no dice nada del área se mira el cuerpo, que suele
 * mencionar de pasada media docena de temas y confunde la clasificación.
 */
function resolveArea(scope, text, body) {
  return pickArea(`${scope} ${text}`) || pickArea(body) || FALLBACK_AREA;
}

/** Aplica el glosario y arregla mayúsculas para que se lea como una frase. */
function toProductLanguage(input) {
  let text = String(input || "").trim().replace(/\s+/g, " ").replace(/\.$/, "");
  if (!text) return "";

  for (const [pattern, verb] of LEAD_VERBS) {
    if (pattern.test(text)) {
      text = text.replace(pattern, verb);
      break;
    }
  }
  for (const [pattern, replacement] of GLOSSARY) {
    text = text.replace(pattern, replacement);
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Los sub-puntos de cada mejora salen SOLO de content/overrides.json, nunca del
 * cuerpo del commit: ahí los desarrolladores anotan nombres de archivo, banderas
 * y decisiones internas que no le dicen nada a un socio. El titular sí se
 * traduce automáticamente; el detalle fino se escribe a mano o no va.
 */
function curatedDetails(override) {
  return Array.isArray(override.details) ? override.details.slice(0, 3) : [];
}

function formatLabel(date) {
  const formatted = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
  // "1 de agosto de 2026" -> "1 de agosto, 2026"
  return formatted.replace(/ de (\d{4})$/, ", $1");
}

function loadOverrides() {
  if (!existsSync(OVERRIDES)) return { days: {}, commits: {}, since: null, sinceNote: "" };
  const parsed = JSON.parse(readFileSync(OVERRIDES, "utf8"));
  return {
    days: parsed.days || {},
    commits: parsed.commits || {},
    since: parsed.since || null,
    sinceNote: parsed.sinceNote || "",
  };
}

/** Titulares que el traductor automático no dejó presentables. */
const needsReview = [];

function build() {
  const overrides = loadOverrides();
  const commits = [];

  for (const repo of REPOS) {
    const found = readCommits(repo);
    console.log(`  · ${repo.dir}: ${found.length} commits`);
    commits.push(...found);
  }

  /** @type {Map<string, {items: Map<string, any>, internal: number, products: Set<string>}>} */
  const byDate = new Map();

  for (const commit of commits) {
    const override = overrides.commits[commit.hash] || {};
    if (override.hide) continue;
    if (overrides.since && commit.date < overrides.since) continue;
    if (ALWAYS_HIDE.some((pattern) => pattern.test(commit.subject))) continue;

    const { type, scope, text } = parseConventional(commit.subject);

    if (!byDate.has(commit.date)) {
      byDate.set(commit.date, { items: new Map(), internal: 0, products: new Set() });
    }
    const day = byDate.get(commit.date);
    day.products.add(commit.product);

    // El trabajo interno se resume en un contador, no se enumera.
    const isInternal = INTERNAL_TYPES.has(type) || INTERNAL_SCOPES.has(scope.toLowerCase());
    if (isInternal && !override.text) {
      day.internal += 1;
      continue;
    }

    const kind = override.kind || KIND_BY_TYPE[type] || "nuevo";
    const area =
      (override.area && AREAS.find((a) => a.id === override.area)) ||
      resolveArea(scope, text, commit.body);

    if (!day.items.has(area.id)) {
      day.items.set(area.id, { emoji: area.emoji, title: area.title, items: [] });
    }

    const headline = override.text || toProductLanguage(text);
    if (!override.text && !isReadable(headline)) {
      needsReview.push({ hash: commit.hash, date: commit.date, headline });
    }

    day.items.get(area.id).items.push({
      hash: commit.hash,
      kind,
      text: headline,
      details: curatedDetails(override),
      product: commit.product,
    });
  }

  const days = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, day]) => {
      const dayOverride = overrides.days[date] || {};
      const sections = dayOverride.sections
        ? dayOverride.sections
        : [...day.items.values()].filter((section) => section.items.length > 0);
      const changes = sections.reduce((total, section) => total + section.items.length, 0);

      return {
        date,
        label: formatLabel(date),
        title: dayOverride.title || "Lo que hicimos",
        sections,
        changes,
        internal: day.internal,
        products: [...day.products],
        ...(dayOverride.stat ? { stat: dayOverride.stat } : {}),
        ...(dayOverride.note ? { note: dayOverride.note } : {}),
      };
    })
    .filter((day) => day.sections.length > 0);

  return {
    days,
    sinceNote: overrides.sinceNote || "",
    totals: {
      days: days.length,
      changes: days.reduce((total, day) => total + day.changes, 0),
      since: days.length ? days[days.length - 1].date : null,
      sinceLabel: days.length ? formatLabel(days[days.length - 1].date) : null,
    },
  };
}

const isCheck = process.argv.includes("--check");
console.log(isCheck ? "Verificando la bitácora…" : "Generando la bitácora…");

const data = build();
const serialized = `${JSON.stringify(data, null, 2)}\n`;

if (isCheck) {
  const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, "utf8") : "";
  if (current !== serialized) {
    console.error("\n✗ src/data/updates.json está desactualizado. Corre: npm run bitacora");
    process.exit(1);
  }
  console.log("\n✓ La bitácora está al día.");
} else {
  writeFileSync(OUTPUT, serialized);
  console.log(`\n✓ ${data.totals.days} días · ${data.totals.changes} mejoras → src/data/updates.json`);

  if (needsReview.length) {
    console.log(
      `\n⚠ ${needsReview.length} titulares siguen sonando técnicos. Reescríbelos en content/overrides.json:\n`,
    );
    for (const item of needsReview.slice(0, 15)) {
      console.log(`   "${item.hash}": { "text": "…" }   ← ${item.date} · ${item.headline}`);
    }
    if (needsReview.length > 15) console.log(`   … y ${needsReview.length - 15} más`);
  }
}

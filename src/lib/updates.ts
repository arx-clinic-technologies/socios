import data from "@/data/updates.json";

export type Kind = "nuevo" | "arreglo" | "mejora";

export interface Item {
  hash: string;
  kind: Kind;
  text: string;
  details: string[];
  product: string;
}

export interface Section {
  emoji: string;
  title: string;
  items: Item[];
}

export interface Stat {
  value: string;
  text: string;
}

/** Una entrega semanal: las entregas de Kindoc se publican cada semana. */
export interface Week {
  /** Lunes de la semana, en formato YYYY-MM-DD. Es la llave de la entrega. */
  start: string;
  /** Domingo de la semana. */
  end: string;
  label: string;
  title: string;
  sections: Section[];
  changes: number;
  internal: number;
  products: string[];
  /** Días de esa semana en que efectivamente se subió algo. */
  dates: string[];
  /** Frase grande de la semana, arriba de las secciones (admite **negritas**). */
  mission?: string;
  stat?: Stat;
  note?: string;
}

export interface Bitacora {
  weeks: Week[];
  sinceNote: string;
  totals: {
    weeks: number;
    changes: number;
    since: string | null;
    sinceLabel: string | null;
  };
}

const bitacora = data as Bitacora;

export function getBitacora(): Bitacora {
  return bitacora;
}

/** Las semanas vienen del generador de la más reciente a la más antigua. */
export function getWeeks(): Week[] {
  return bitacora.weeks;
}

export function getLatestWeek(): Week | undefined {
  return bitacora.weeks[0];
}

export function getWeek(start: string): Week | undefined {
  return bitacora.weeks.find((week) => week.start === start);
}

/** Entrega anterior y siguiente, para navegar sin volver al índice. */
export function getNeighbours(start: string): { older?: Week; newer?: Week } {
  const index = bitacora.weeks.findIndex((week) => week.start === start);
  if (index === -1) return {};
  return {
    newer: index > 0 ? bitacora.weeks[index - 1] : undefined,
    older: bitacora.weeks[index + 1],
  };
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-08-01" -> "agosto 2026", para agrupar el historial. */
export function monthOf(date: string): string {
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** "2026-07-27" + "2026-08-02" -> "27 jul – 2 ago", para la navegación. */
export function shortRange(start: string, end: string): string {
  const [, startMonth, startDay] = start.split("-");
  const [, endMonth, endDay] = end.split("-");
  const from = `${Number(startDay)} ${MONTHS[Number(startMonth) - 1].slice(0, 3)}`;
  const to = `${Number(endDay)} ${MONTHS[Number(endMonth) - 1].slice(0, 3)}`;
  return `${from} – ${to}`;
}

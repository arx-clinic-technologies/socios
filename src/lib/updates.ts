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

export interface Day {
  date: string;
  label: string;
  title: string;
  sections: Section[];
  changes: number;
  internal: number;
  products: string[];
  stat?: Stat;
  note?: string;
}

export interface Bitacora {
  days: Day[];
  sinceNote: string;
  totals: {
    days: number;
    changes: number;
    since: string | null;
    sinceLabel: string | null;
  };
}

const bitacora = data as Bitacora;

export function getBitacora(): Bitacora {
  return bitacora;
}

/** Los días vienen del generador ordenados del más reciente al más antiguo. */
export function getDays(): Day[] {
  return bitacora.days;
}

export function getLatestDay(): Day | undefined {
  return bitacora.days[0];
}

export function getDay(date: string): Day | undefined {
  return bitacora.days.find((day) => day.date === date);
}

/** Día anterior y siguiente en la bitácora, para navegar sin volver al índice. */
export function getNeighbours(date: string): { older?: Day; newer?: Day } {
  const index = bitacora.days.findIndex((day) => day.date === date);
  if (index === -1) return {};
  return {
    newer: index > 0 ? bitacora.days[index - 1] : undefined,
    older: bitacora.days[index + 1],
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

/** "2026-08-01" -> "1 ago", para las etiquetas compactas de la línea de tiempo. */
export function shortLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1].slice(0, 3)}`;
}

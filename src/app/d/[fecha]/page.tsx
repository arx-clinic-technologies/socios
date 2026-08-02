import { notFound } from "next/navigation";
import { DayView } from "@/components/day-view";
import { SiteFooter } from "@/components/site-footer";
import { getDay, getDays, getLatestDay, getNeighbours } from "@/lib/updates";

/** Una página estática por entrega: Vercel las sirve todas desde el CDN. */
export function generateStaticParams() {
  return getDays().map((day) => ({ fecha: day.date }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fecha: string }>;
}) {
  const { fecha } = await params;
  const day = getDay(fecha);
  return { title: day ? `Kindoc · ${day.label}` : "Kindoc" };
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ fecha: string }>;
}) {
  const { fecha } = await params;
  const day = getDay(fecha);
  if (!day) notFound();

  const { older, newer } = getNeighbours(day.date);

  return (
    <main>
      <DayView
        day={day}
        older={older}
        newer={newer}
        isLatest={getLatestDay()?.date === day.date}
      />
      <SiteFooter />
    </main>
  );
}

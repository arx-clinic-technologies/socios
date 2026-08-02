import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { WeekView } from "@/components/week-view";
import { getLatestWeek, getNeighbours, getWeek, getWeeks } from "@/lib/updates";

/** Una página estática por entrega: Vercel las sirve todas desde el CDN. */
export function generateStaticParams() {
  return getWeeks().map((week) => ({ semana: week.start }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ semana: string }>;
}) {
  const { semana } = await params;
  const week = getWeek(semana);
  return { title: week ? `Kindoc · ${week.label}` : "Kindoc" };
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ semana: string }>;
}) {
  const { semana } = await params;
  const week = getWeek(semana);
  if (!week) notFound();

  const { older, newer } = getNeighbours(week.start);

  return (
    <main>
      <WeekView
        week={week}
        older={older}
        newer={newer}
        isLatest={getLatestWeek()?.start === week.start}
      />
      <SiteFooter />
    </main>
  );
}

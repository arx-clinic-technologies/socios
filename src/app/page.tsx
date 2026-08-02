import { SiteFooter } from "@/components/site-footer";
import { WeekView } from "@/components/week-view";
import { getLatestWeek, getNeighbours } from "@/lib/updates";

export default function HomePage() {
  const week = getLatestWeek();

  if (!week) {
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-kd-muted">Todavía no hay entregas publicadas.</p>
      </main>
    );
  }

  const { older, newer } = getNeighbours(week.start);

  return (
    <main>
      <WeekView week={week} older={older} newer={newer} isLatest />
      <SiteFooter />
    </main>
  );
}

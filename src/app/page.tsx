import { DayView } from "@/components/day-view";
import { SiteFooter } from "@/components/site-footer";
import { getLatestDay, getNeighbours } from "@/lib/updates";

export default function HomePage() {
  const day = getLatestDay();

  if (!day) {
    return (
      <main className="px-6 py-20 text-center">
        <p className="text-kd-muted">Todavía no hay entregas publicadas.</p>
      </main>
    );
  }

  const { older, newer } = getNeighbours(day.date);

  return (
    <main>
      <DayView day={day} older={older} newer={newer} isLatest />
      <SiteFooter />
    </main>
  );
}

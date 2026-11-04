/**
 * Today: the day's lessons, CodeArena task, system design and DSA, in order.
 */
import Link from "next/link";
import { TodayPlan } from "@/components/courses/HubWidgets";

export const metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <main className="course-main">
      <nav className="crumbs">
        <Link href="/courses">Courses</Link>
        <span>›</span>
        <span>Today</span>
      </nav>
      <TodayPlan />
    </main>
  );
}

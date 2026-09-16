import { redirect } from "next/navigation";

export default function CoursesPage() {
  // Redirect /courses directly to the flagship System Design course
  redirect("/courses/system-design");
}

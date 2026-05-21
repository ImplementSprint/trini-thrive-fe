import { redirect } from "next/navigation";

export default function RootPage() {
  // The moment someone visits localhost:3000, redirect them to /login
  redirect("/admin/login");
}
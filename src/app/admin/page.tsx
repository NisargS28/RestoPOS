import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard – RestoPos",
  description: "Sales, profit, branch reports and analytics for RestoPos restaurant management.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}

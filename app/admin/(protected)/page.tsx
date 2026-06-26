import { getCategories, getSections, getItems } from "@/lib/firestore";
import { AdminDashboard } from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [categories, sections, items] = await Promise.all([
    getCategories(),
    getSections(),
    getItems(),
  ]);

  return <AdminDashboard categories={categories} sections={sections} items={items} />;
}

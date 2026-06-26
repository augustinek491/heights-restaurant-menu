import { getCategories, getSections, getItems } from "@/lib/firestore";
import { AdminItemRow } from "@/components/AdminItemRow";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [categories, sections, items] = await Promise.all([
    getCategories(),
    getSections(),
    getItems(),
  ]);

  const sectionsByCategory = new Map<string, typeof sections>();
  for (const section of sections) {
    const list = sectionsByCategory.get(section.categoryId) || [];
    list.push(section);
    sectionsByCategory.set(section.categoryId, list);
  }

  const itemsBySection = new Map<string, typeof items>();
  for (const item of items) {
    const list = itemsBySection.get(item.sectionId) || [];
    list.push(item);
    itemsBySection.set(item.sectionId, list);
  }

  return (
    <div className="admin-shell">
      <h1>Heights Restaurant — Menu CMS</h1>
      <p>
        {categories.length === 0
          ? "No categories found yet — run the seed script against a provisioned Firestore project."
          : `${categories.length} categories, ${sections.length} sections, ${items.length} items.`}
      </p>

      {categories.map((category) => (
        <section key={category.id}>
          <h2>{category.name}</h2>
          {(sectionsByCategory.get(category.id) || []).map((section) => (
            <div key={section.id}>
              <h3>
                {section.name}
                {section.scope ? ` (${section.scope})` : ""}
              </h3>
              {(itemsBySection.get(section.id) || []).map((item) => (
                <AdminItemRow key={item.id} item={item} />
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

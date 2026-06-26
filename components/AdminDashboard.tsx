"use client";

import { useState } from "react";
import { AdminItemRow } from "@/components/AdminItemRow";
import type { MenuCategory, MenuSection, MenuItem } from "@/types/menu";

interface Props {
  categories: MenuCategory[];
  sections: MenuSection[];
  items: MenuItem[];
}

// Sections default open on first load (53 of them, but most categories have
// only a handful) — staff can collapse ones they're not working on. State is
// per-section so expanding one doesn't affect others.
export function AdminDashboard({ categories, sections, items }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(sectionId: string) {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }

  const sectionsByCategory = new Map<string, MenuSection[]>();
  for (const section of sections) {
    const list = sectionsByCategory.get(section.categoryId) || [];
    list.push(section);
    sectionsByCategory.set(section.categoryId, list);
  }

  const itemsBySection = new Map<string, MenuItem[]>();
  for (const item of items) {
    const list = itemsBySection.get(item.sectionId) || [];
    list.push(item);
    itemsBySection.set(item.sectionId, list);
  }

  return (
    <div className="admin-shell">
      <h1>Heights Restaurant — Menu CMS</h1>
      <p className="admin-summary">
        {categories.length === 0
          ? "No categories found yet — run the seed script against a provisioned Firestore project."
          : `${categories.length} categories, ${sections.length} sections, ${items.length} items.`}
      </p>

      {categories.map((category) => (
        <section className="admin-category" key={category.id}>
          <h2>{category.name}</h2>
          {(sectionsByCategory.get(category.id) || []).map((section) => {
            const sectionItems = itemsBySection.get(section.id) || [];
            const isCollapsed = !!collapsed[section.id];
            return (
              <div className="admin-section" key={section.id}>
                <button
                  type="button"
                  className="admin-section-header"
                  aria-expanded={!isCollapsed}
                  onClick={() => toggle(section.id)}
                >
                  <span className="admin-section-title">
                    {section.name}
                    {section.scope ? ` (${section.scope})` : ""}
                  </span>
                  <span className="admin-section-meta">
                    <span className="admin-section-count">{sectionItems.length}</span>
                    <span className={`admin-chevron${isCollapsed ? " is-collapsed" : ""}`} aria-hidden="true">
                      ▾
                    </span>
                  </span>
                </button>
                {isCollapsed ? null : (
                  <div className="admin-section-body">
                    {sectionItems.map((item) => (
                      <AdminItemRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

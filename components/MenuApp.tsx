"use client";

import { useMemo, useState } from "react";
import { CoverSkyline, SectionDivider } from "@/components/Skyline";
import { MenuRow } from "@/components/MenuRow";
import { ImageBand } from "@/components/ImageBand";
import { CONFIGS } from "@/lib/menuConfig";
import {
  CATEGORY_SLUGS,
  CATEGORY_LABELS,
  type CategorySlug,
  type MenuData,
  type MenuItem,
  type MenuSection,
  type ConfigBlock,
} from "@/types/menu";

// Maps each *Config() block's `source` key to the categoryId/slug stored in
// Firestore (and used by the seed script) so live data can be located.
const SOURCE_TO_CATEGORY_SLUG: Record<ConfigBlock extends never ? never : string, CategorySlug> = {
  breakfastLunch: "breakfast-lunch",
  dinner: "dinner",
  dessertsJuices: "desserts-juices",
  bar: "bar",
};

function findSection(
  sections: MenuSection[],
  categorySlug: CategorySlug,
  categoryIdBySlug: Record<string, string>,
  name: string,
  scope?: "breakfast" | "lunch"
): MenuSection | undefined {
  const categoryId = categoryIdBySlug[categorySlug];
  return sections.find(
    (s) => s.categoryId === categoryId && s.name === name && (!scope || s.scope === scope)
  );
}

function buildImageSrc(storageUrl: string | undefined, fallbackId: string): string {
  if (storageUrl) return storageUrl;
  // Local fallback: serve straight from assets/menu/ via the route handler,
  // for when Firestore/Storage haven't been seeded yet.
  return `/menu-images/${fallbackId}.jpg`;
}

export function MenuApp({ data }: { data: MenuData }) {
  const [activeTab, setActiveTab] = useState<CategorySlug>("breakfast-lunch");

  const categoryIdBySlug = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of data.categories) map[cat.slug] = cat.id;
    return map;
  }, [data.categories]);

  const itemsBySectionId = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const item of data.items) {
      (map[item.sectionId] ??= []).push(item);
    }
    return map;
  }, [data.items]);

  const imageByConfigId = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    for (const img of data.images) map[img.id] = img.storageUrl;
    return map;
  }, [data.images]);

  return (
    <>
      <header className="cover" id="cover">
        <CoverSkyline />
        <p className="cover-eyebrow">{data.settings.eyebrow || "Glass Heights Apartments"}</p>
        <h1 className="cover-title">
          {data.settings.title || "Heights"}
          <span className="cover-title-sub">{data.settings.titleSub || "Restaurant"}</span>
        </h1>
        <p className="cover-welcome">{data.settings.welcome}</p>
        <a href="#menu" className="cover-cta">
          View the menu <span aria-hidden="true">↓</span>
        </a>
      </header>

      <nav className="catnav" id="catnav" aria-label="Menu categories">
        <div className="catnav-inner" role="tablist">
          {CATEGORY_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              role="tab"
              className="catnav-pill"
              aria-selected={activeTab === slug}
              onClick={() => {
                setActiveTab(slug);
                document
                  .getElementById("section-" + slug)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {CATEGORY_LABELS[slug]}
            </button>
          ))}
        </div>
      </nav>

      <main id="menu">
        {CATEGORY_SLUGS.map((slug) => (
          <section
            className="menu-section"
            id={`section-${slug}`}
            key={slug}
            data-section={slug}
            hidden={activeTab !== slug}
          >
            <h2 className="sr-only">{CATEGORY_LABELS[slug]}</h2>
            <div className="menu-section-content">
              {activeTab === slug ? (
                <CategoryBlocks
                  slug={slug}
                  data={data}
                  categoryIdBySlug={categoryIdBySlug}
                  itemsBySectionId={itemsBySectionId}
                  imageByConfigId={imageByConfigId}
                />
              ) : null}
            </div>
          </section>
        ))}
      </main>

      <footer className="site-footer">
        <p>{data.settings.name} · Glass Heights Apartments</p>
        <p className="site-footer-contact">
          {data.settings.contact.email} &nbsp;·&nbsp; {data.settings.contact.phone}
        </p>
      </footer>
    </>
  );
}

function CategoryBlocks({
  slug,
  data,
  categoryIdBySlug,
  itemsBySectionId,
  imageByConfigId,
}: {
  slug: CategorySlug;
  data: MenuData;
  categoryIdBySlug: Record<string, string>;
  itemsBySectionId: Record<string, MenuItem[]>;
  imageByConfigId: Record<string, string | undefined>;
}) {
  const blocks = CONFIGS[slug]();

  // Precompute each block's starting delay index in a single pass, before
  // rendering, so the render closure below never mutates a variable.
  const blockDelays: number[] = [];
  {
    let rowDelay = 0;
    for (const block of blocks) {
      blockDelays.push(rowDelay);
      if (block.type === "divider") {
        continue;
      }
      if (block.type === "image") {
        rowDelay += 1;
        continue;
      }
      const categorySlugForSource = SOURCE_TO_CATEGORY_SLUG[block.source];
      const section = findSection(
        data.sections,
        categorySlugForSource,
        categoryIdBySlug,
        block.name,
        block.scope
      );
      const items = section ? itemsBySectionId[section.id] || [] : [];
      rowDelay += items.length;
    }
  }

  return (
    <>
      {blocks.map((block, idx) => {
        if (block.type === "divider") {
          return <SectionDivider key={`divider-${idx}`} />;
        }

        if (block.type === "image") {
          const delay = blockDelays[idx];
          return (
            <ImageBand
              key={`image-${block.id}`}
              block={block}
              src={buildImageSrc(imageByConfigId[block.id], block.id)}
              delayIndex={delay}
            />
          );
        }

        // section block
        const categorySlugForSource = SOURCE_TO_CATEGORY_SLUG[block.source];
        const section = findSection(
          data.sections,
          categorySlugForSource,
          categoryIdBySlug,
          block.name,
          block.scope
        );
        if (!section) return null;
        const items = itemsBySectionId[section.id] || [];
        const startDelay = blockDelays[idx];

        return (
          <div className="menu-subsection" key={`section-${section.id}`}>
            <h3 className="menu-subsection-title">{section.name}</h3>
            {section.note || block.note ? (
              <p className="menu-subsection-note">{section.note || block.note}</p>
            ) : null}
            {items.map((item, i) => (
              <MenuRow
                key={item.id}
                item={item}
                featured={!!block.featured || item.featured}
                delayIndex={startDelay + i}
              />
            ))}
          </div>
        );
      })}
    </>
  );
}

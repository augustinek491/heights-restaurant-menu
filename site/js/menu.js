(function () {
  "use strict";

  const DATA_PATHS = {
    breakfastLunch: "../data/breakfast-lunch.json",
    dinner: "../data/dinner.json",
    dessertsJuices: "../data/desserts-juices.json",
    bar: "../data/bar.json",
  };

  const IMG_BASE = "../assets/menu/";

  const DIVIDER_SVG = `<svg viewBox="0 0 140 28" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <path d="M0,26 L10,26 L10,18 L16,18 L16,26 L26,26 L26,12 L31,9 L36,12 L36,26 L48,26 L48,6 L51,6 L51,26 L62,26 L62,16 L68,11 L74,16 L74,26 L88,26 L88,3 L92,3 L92,26 L104,26 L104,18 L110,14 L116,18 L116,26 L140,26" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`;

  function fmt(n) {
    if (n === undefined || n === null) return "";
    return "UGX " + n.toLocaleString("en-US");
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function findSection(data, name, scope) {
    return (data.sections || []).find((s) => s.name === name && (!scope || s.scope === scope));
  }

  function renderRow(item, featured) {
    const desc = item.description ? `<p class="menu-row-desc">${item.description}</p>` : "";
    let priceHtml;
    if (item.priceByTot !== undefined || item.priceByBottle !== undefined) {
      priceHtml = `<div class="menu-row-price-dual">
        ${item.priceByTot !== undefined ? `<span><span class="label">Tot</span> ${fmt(item.priceByTot)}</span>` : ""}
        ${item.priceByBottle !== undefined ? `<span><span class="label">Bottle</span> ${fmt(item.priceByBottle)}</span>` : ""}
      </div>`;
    } else {
      const unit = item.unit ? ` <span style="opacity:.6">/${item.unit}</span>` : "";
      priceHtml = `<span class="menu-row-price">${fmt(item.price)}${unit}</span>`;
    }
    return `<div class="menu-row${featured ? " featured" : ""}">
      <div class="menu-row-main">
        <p class="menu-row-name">${item.name}</p>
        ${desc}
      </div>
      ${priceHtml}
    </div>`;
  }

  function renderSubsection(section, opts) {
    opts = opts || {};
    if (!section) return "";
    const note = opts.note ? `<p class="menu-subsection-note">${opts.note}</p>` : "";
    const rows = section.items.map((it) => renderRow(it, !!opts.featured)).join("");
    return `<div class="menu-subsection">
      <h3 class="menu-subsection-title">${section.name}</h3>
      ${note}
      ${rows}
    </div>`;
  }

  function renderImageBand(shot) {
    const src = IMG_BASE + shot.id + ".jpg";
    const caption = shot.caption || "";
    return `<figure class="image-band" data-aspect="${shot.aspect}">
      <img data-src="${src}" alt="${caption}" />
      ${caption ? `<figcaption class="image-band-caption">${caption}</figcaption>` : ""}
    </figure>`;
  }

  function handleImageError(img) {
    const aspect = img.closest(".image-band")?.dataset.aspect || "4:5";
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.style.aspectRatio = aspect.replace(":", "/");
    placeholder.textContent = "image coming soon";
    img.replaceWith(placeholder);
  }

  // Each menu category is small (<2MB of images post-compression) and only one
  // category is visible at a time, so we load a section's images as soon as it
  // becomes the active tab rather than relying on viewport-based lazy loading —
  // native `loading="lazy"` and IntersectionObserver both proved unreliable when
  // a section flips from display:none to visible (no repaint signal to key off).
  function loadSectionImages(container) {
    container.querySelectorAll("img[data-src]").forEach((img) => {
      img.addEventListener("error", () => handleImageError(img), { once: true });
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  function renderDivider() {
    return `<div class="section-divider">${DIVIDER_SVG}</div>`;
  }

  function buildBlocks(blocks, dataMap) {
    return blocks
      .map((block) => {
        if (block.type === "section") {
          const data = dataMap[block.source];
          const section = findSection(data, block.name, block.scope);
          return renderSubsection(section, { featured: block.featured, note: block.note });
        }
        if (block.type === "image") return renderImageBand(block);
        if (block.type === "divider") return renderDivider();
        return "";
      })
      .join("");
  }

  async function loadData() {
    const entries = await Promise.all(
      Object.entries(DATA_PATHS).map(async ([key, path]) => {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return [key, await res.json()];
      })
    );
    return Object.fromEntries(entries);
  }

  function renderLoadError() {
    document.querySelectorAll(".menu-section").forEach((sec) => {
      sec.hidden = false;
      sec.innerHTML = `<div class="menu-subsection">
        <p class="menu-row-desc">The menu couldn't be loaded right now. Please refresh the page, or ask a member of staff for today's printed menu.</p>
      </div>`;
    });
  }

  function breakfastLunchConfig() {
    const bl = "breakfastLunch";
    return [
      { type: "section", source: bl, name: "Breakfast Sandwiches", scope: "breakfast" },
      { type: "image", id: "breakfast-01-hero", aspect: "16:9", caption: "Egg & Cheese Sandwich" },
      { type: "section", source: bl, name: "Pancakes & Waffles", scope: "breakfast" },
      { type: "image", id: "breakfast-02-waffles", aspect: "4:5", caption: "Belgian Waffles" },
      { type: "section", source: bl, name: "Breakfast Sides", scope: "breakfast" },
      { type: "section", source: bl, name: "Breakfast Combos", scope: "breakfast" },
      { type: "image", id: "breakfast-04-bigbreakfast", aspect: "16:9", caption: "Combo 3 — Big Breakfast" },
      { type: "section", source: bl, name: "Hot Drinks", scope: "breakfast" },
      { type: "section", source: bl, name: "Cold Drinks", scope: "breakfast" },
      { type: "divider" },
      { type: "section", source: bl, name: "Burgers & Sandwiches", scope: "lunch" },
      { type: "image", id: "lunch-05-beefburger", aspect: "4:5", caption: "Classic Beef Burger" },
      { type: "section", source: bl, name: "Rice & Chicken Meals", scope: "lunch" },
      { type: "image", id: "lunch-08-pilau", aspect: "4:5", caption: "Chicken Pilau" },
      { type: "section", source: bl, name: "Pizza & Snacks", scope: "lunch" },
      { type: "image", id: "lunch-07-pizza", aspect: "4:5", caption: "Mini Pepperoni Pizza" },
      { type: "section", source: bl, name: "Lunch Combos", scope: "lunch" },
      { type: "section", source: bl, name: "Hot Drinks", scope: "lunch" },
      { type: "section", source: bl, name: "Cold Drinks", scope: "lunch" },
    ];
  }

  function dinnerConfig() {
    return [
      { type: "section", source: "dinner", name: "Chicken", featured: false },
      { type: "image", id: "dinner-01-kukuwanazzi", aspect: "16:9", caption: "Kuku wa Nazzi" },
      { type: "section", source: "dinner", name: "Goat" },
      { type: "image", id: "dinner-03-goatribs", aspect: "16:9", caption: "BBQ Goat Ribs" },
      { type: "section", source: "dinner", name: "Fish" },
      { type: "image", id: "dinner-04-wholefish", aspect: "4:5", caption: "Wet/Crisp Whole Fish" },
      { type: "section", source: "dinner", name: "Pasta" },
      { type: "section", source: "dinner", name: "Beef" },
      { type: "image", id: "dinner-06-beefsteak", aspect: "4:5", caption: "Beef Steak" },
      { type: "section", source: "dinner", name: "Pork" },
      { type: "image", id: "dinner-07-porkchops", aspect: "4:5", caption: "Grilled Pork Chops" },
      { type: "section", source: "dinner", name: "Curries" },
      { type: "image", id: "dinner-08-chickentikka", aspect: "4:5", caption: "Chicken Tikka" },
      { type: "section", source: "dinner", name: "Pizza" },
      { type: "section", source: "dinner", name: "Burgers" },
      { type: "section", source: "dinner", name: "Sandwiches" },
      { type: "image", id: "dinner-10-clubsandwich", aspect: "4:5", caption: "Club Sandwich" },
      { type: "section", source: "dinner", name: "Local Food" },
      { type: "image", id: "dinner-11-luwombo", aspect: "16:9", caption: "Chicken Luwombo" },
      { type: "divider" },
      { type: "section", source: "dinner", name: "Hot Drinks" },
      { type: "section", source: "dinner", name: "Iced Drinks" },
      { type: "section", source: "dinner", name: "Flavoured Teas" },
      { type: "section", source: "dinner", name: "Milk Shake" },
      { type: "section", source: "dinner", name: "Smoothies" },
    ];
  }

  function dessertsJuicesConfig() {
    const dj = "dessertsJuices";
    return [
      { type: "section", source: dj, name: "Fresh Cut Fruits" },
      { type: "image", id: "dessert-01-fruitcup", aspect: "4:5", caption: "Tropical Fruit Cup" },
      { type: "section", source: dj, name: "Classic Juices" },
      { type: "section", source: dj, name: "Special Juice Mixes" },
      { type: "image", id: "dessert-07-juices", aspect: "4:5", caption: "Fresh Juices" },
      { type: "section", source: dj, name: "Ice Cream Cups" },
      { type: "section", source: dj, name: "Sundaes" },
      { type: "image", id: "dessert-04-sundae", aspect: "4:5", caption: "Chocolate Sundae" },
      { type: "section", source: dj, name: "Classic Smoothies" },
      { type: "image", id: "dessert-05-mangosmoothie", aspect: "4:5", caption: "Mango Smoothie" },
      { type: "section", source: dj, name: "Special Smoothies" },
      { type: "section", source: dj, name: "Combo Offers" },
      { type: "image", id: "dessert-02-fruitplatter", aspect: "16:9", caption: "Fruit Platter" },
    ];
  }

  function barConfig() {
    return [
      { type: "section", source: "bar", name: "Classic Cocktails" },
      { type: "image", id: "bar-03-margarita", aspect: "4:5", caption: "Margarita" },
      { type: "section", source: "bar", name: "Signature Cocktails", featured: true },
      { type: "image", id: "bar-01-ugandanmule", aspect: "16:9", caption: "Ugandan Mule" },
      { type: "image", id: "bar-02-naughtypassion", aspect: "16:9", caption: "Naughty Passion" },
      { type: "divider" },
      { type: "section", source: "bar", name: "Brandy / Cognac" },
      { type: "image", id: "bar-10-cognac", aspect: "4:5", caption: "Cognac" },
      { type: "section", source: "bar", name: "Single Malt" },
      { type: "image", id: "bar-06-singlemalt", aspect: "4:5", caption: "Single Malt Whisky" },
      { type: "section", source: "bar", name: "Scotch Whiskey" },
      { type: "section", source: "bar", name: "Irish Whiskey" },
      { type: "section", source: "bar", name: "Bourbon & Tennessee" },
      { type: "section", source: "bar", name: "Vodka" },
      { type: "section", source: "bar", name: "Gin" },
      { type: "image", id: "bar-07-gin", aspect: "4:5", caption: "Gin & Tonic" },
      { type: "section", source: "bar", name: "Rum" },
      { type: "section", source: "bar", name: "Tequila" },
      { type: "section", source: "bar", name: "Uganda Waragi" },
      { type: "section", source: "bar", name: "Liqueur" },
      { type: "section", source: "bar", name: "Minis (200ml)" },
      { type: "divider" },
      { type: "section", source: "bar", name: "Local & Foreign Beers" },
      { type: "image", id: "bar-09-beers", aspect: "4:5", caption: "Local Lagers" },
      { type: "section", source: "bar", name: "Wine" },
      { type: "image", id: "bar-08-wine", aspect: "4:5", caption: "Wine" },
      { type: "section", source: "bar", name: "Mixers & Soft Drinks" },
    ];
  }

  function setupNav() {
    const pills = document.querySelectorAll(".catnav-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const target = pill.dataset.target;
        pills.forEach((p) => p.setAttribute("aria-selected", p === pill ? "true" : "false"));
        document.querySelectorAll(".menu-section").forEach((sec) => {
          sec.hidden = sec.dataset.section !== target;
        });
        const targetSection = document.getElementById("section-" + target);
        loadSectionImages(targetSection);
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function staggerRows(container) {
    const rows = container.querySelectorAll(".menu-row, .image-band");
    rows.forEach((row, i) => {
      row.style.animationDelay = Math.min(i, 6) * 0.03 + "s";
    });
  }

  async function init() {
    setupNav();
    let data;
    try {
      data = await loadData();
    } catch (err) {
      console.error("Menu data failed to load", err);
      renderLoadError();
      return;
    }

    const tagScope = (sections, scope) => sections.map((s) => ({ ...s, scope }));
    const dataMap = {
      breakfastLunch: {
        sections: [
          ...tagScope(data.breakfastLunch.breakfast.sections, "breakfast"),
          ...tagScope(data.breakfastLunch.lunch.sections, "lunch"),
        ],
      },
      dinner: data.dinner,
      dessertsJuices: data.dessertsJuices,
      bar: data.bar,
    };

    const configs = {
      "breakfast-lunch": breakfastLunchConfig(),
      dinner: dinnerConfig(),
      "desserts-juices": dessertsJuicesConfig(),
      bar: barConfig(),
    };

    Object.entries(configs).forEach(([key, blocks]) => {
      const container = document.querySelector("#section-" + key + " .menu-section-content");
      container.innerHTML = buildBlocks(blocks, dataMap);
      staggerRows(container);
    });

    // Load images for the initially active tab; other tabs load on first switch.
    loadSectionImages(document.getElementById("section-breakfast-lunch"));
  }

  init();
})();

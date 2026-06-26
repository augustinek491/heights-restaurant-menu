"use client";

import { useState } from "react";
import { updateMenuItem } from "@/app/admin/actions";
import type { MenuItem } from "@/types/menu";

export function AdminItemRow({ item }: { item: MenuItem }) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price?.toString() ?? "");
  const [priceByTot, setPriceByTot] = useState(item.priceByTot?.toString() ?? "");
  const [priceByBottle, setPriceByBottle] = useState(item.priceByBottle?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const isDual = item.priceByTot !== undefined || item.priceByBottle !== undefined;

  async function handleSave() {
    setSaving(true);
    try {
      await updateMenuItem({
        id: item.id,
        name,
        description: description || undefined,
        price: isDual ? undefined : price ? Number(price) : undefined,
        priceByTot: isDual && priceByTot ? Number(priceByTot) : undefined,
        priceByBottle: isDual && priceByBottle ? Number(priceByBottle) : undefined,
        unit: item.unit,
      });
      setSavedAt(Date.now());
    } catch (err) {
      console.error("Failed to save item", err);
      alert("Failed to save — see console for details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-item-row">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{ flex: 1 }}
      />
      {isDual ? (
        <>
          <input
            value={priceByTot}
            onChange={(e) => setPriceByTot(e.target.value)}
            placeholder="Tot"
            style={{ width: 90 }}
          />
          <input
            value={priceByBottle}
            onChange={(e) => setPriceByBottle(e.target.value)}
            placeholder="Bottle"
            style={{ width: 90 }}
          />
        </>
      ) : (
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          style={{ width: 90 }}
        />
      )}
      <button className="admin-button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : savedAt ? "Saved" : "Save"}
      </button>
    </div>
  );
}

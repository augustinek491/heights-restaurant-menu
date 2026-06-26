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
    <div className="admin-item-card">
      <label className="admin-field-label">
        Name
        <input
          className="admin-item-input admin-item-input-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
      </label>
      <label className="admin-field-label">
        Description
        <input
          className="admin-item-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </label>
      <div className="admin-price-row">
        {isDual ? (
          <>
            <label className="admin-field-label admin-field-label-price">
              Tot
              <input
                className="admin-item-input admin-item-input-price"
                value={priceByTot}
                onChange={(e) => setPriceByTot(e.target.value)}
                placeholder="Tot"
                inputMode="numeric"
              />
            </label>
            <label className="admin-field-label admin-field-label-price">
              Bottle
              <input
                className="admin-item-input admin-item-input-price"
                value={priceByBottle}
                onChange={(e) => setPriceByBottle(e.target.value)}
                placeholder="Bottle"
                inputMode="numeric"
              />
            </label>
          </>
        ) : (
          <label className="admin-field-label admin-field-label-price">
            Price
            <input
              className="admin-item-input admin-item-input-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              inputMode="numeric"
            />
          </label>
        )}
      </div>
      <button className="admin-button admin-save-button" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : savedAt ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

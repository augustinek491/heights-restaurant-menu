import { fmt } from "@/lib/menuConfig";
import type { MenuItem } from "@/types/menu";

export function MenuRow({
  item,
  featured,
  delayIndex,
}: {
  item: MenuItem;
  featured: boolean;
  delayIndex: number;
}) {
  const isDual = item.priceByTot !== undefined || item.priceByBottle !== undefined;
  const style = { animationDelay: `${Math.min(delayIndex, 6) * 0.03}s` };

  return (
    <div className={`menu-row${featured ? " featured" : ""}`} style={style}>
      <div className="menu-row-main">
        <p className="menu-row-name">{item.name}</p>
        {item.description ? <p className="menu-row-desc">{item.description}</p> : null}
      </div>
      {isDual ? (
        <div className="menu-row-price-dual">
          {item.priceByTot !== undefined ? (
            <span>
              <span className="label">Tot</span> {fmt(item.priceByTot)}
            </span>
          ) : null}
          {item.priceByBottle !== undefined ? (
            <span>
              <span className="label">Bottle</span> {fmt(item.priceByBottle)}
            </span>
          ) : null}
        </div>
      ) : (
        <span className="menu-row-price">
          {fmt(item.price)}
          {item.unit ? <span className="menu-row-price-unit"> /{item.unit}</span> : null}
        </span>
      )}
    </div>
  );
}

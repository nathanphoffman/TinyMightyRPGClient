import type { InventoryItem } from "@tmrpg/schemas";

/** Carried items with quantity and equipped state. */
export function CharacterInventory({ inventory }: { inventory: InventoryItem[] }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Inventory</p>
      {inventory.length === 0 && <p className="text-sm text-muted-foreground">No items yet.</p>}
      <div className="flex flex-col gap-2">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
          >
            <span>
              {item.name} {item.equipped && <span className="text-xs">(equipped)</span>}
            </span>
            <span className="text-muted-foreground">×{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

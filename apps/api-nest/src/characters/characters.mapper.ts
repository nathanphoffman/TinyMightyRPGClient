import type { Character as PrismaCharacter } from "@tmrpg/db";
import type { Character, InventoryItem } from "@tmrpg/schemas";

// Prisma stores skills as flat columns and inventory as JSON;
// the domain schema nests skills under `skills`. This
// mapper is the one place that translation happens.
export function toDomainCharacter(row: PrismaCharacter): Character {
  return {
    id: row.id as Character["id"],
    ownerId: row.ownerId as Character["ownerId"],
    name: row.name,
    level: row.level,
    skills: {
      physique: row.physique,
      wits: row.wits,
      charm: row.charm,
      senses: row.senses,
    },
    hitPoints: { current: row.hpCurrent, max: row.hpMax },
    inventory: row.inventory as InventoryItem[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

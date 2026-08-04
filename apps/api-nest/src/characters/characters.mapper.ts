import type { Character as PrismaCharacter } from "@tmrpg/db";
import type { Character, InventoryItem } from "@tmrpg/schemas";

// Prisma stores ability scores as flat columns and inventory as JSON;
// the domain schema nests ability scores under `abilityScores`. This
// mapper is the one place that translation happens.
export function toDomainCharacter(row: PrismaCharacter): Character {
  return {
    id: row.id as Character["id"],
    ownerId: row.ownerId as Character["ownerId"],
    name: row.name,
    class: row.class as Character["class"],
    level: row.level,
    abilityScores: {
      strength: row.strength,
      dexterity: row.dexterity,
      constitution: row.constitution,
      intelligence: row.intelligence,
      wisdom: row.wisdom,
      charisma: row.charisma,
    },
    hitPoints: { current: row.hpCurrent, max: row.hpMax },
    inventory: row.inventory as InventoryItem[],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

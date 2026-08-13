import { CreateCharacterInput, type NewInventoryItem, type SkillName } from "@tmrpg/schemas";
import type { Control, FieldErrors, Resolver } from "react-hook-form";

export const POWER_OPTION_TYPES = [
  { value: "attackBonus", label: "+2 attack bonus (max +4)" },
  { value: "defenseBonus", label: "+2 defense (max 7)" },
  { value: "specialPower", label: "A one-use special power" },
  { value: "extraPowerUse", label: "+1 more power use" },
] as const;

export type PowerOptionType = (typeof POWER_OPTION_TYPES)[number]["value"];

export const POWER_CATEGORIES = [
  { value: "attack", label: "Attack" },
  { value: "heal", label: "Heal" },
  { value: "nonAttack", label: "Non-Attack" },
] as const;

export type PowerCategory = (typeof POWER_CATEGORIES)[number]["value"];

// Damage Guide: healing "uses the same dice as damage," so attack and
// heal powers share the same three dice patterns.
export const POWER_DICE_TYPES = [
  { value: "multiTarget", label: "Multi-Target — 3d6, one die per target" },
  { value: "directTarget", label: "Direct-Target — 2d6 to one target" },
  { value: "areaOfEffect", label: "Area of Effect — 1d6, 6s explode" },
] as const;

export type PowerDiceType = (typeof POWER_DICE_TYPES)[number]["value"];

export const POWER_NAME_PLACEHOLDERS: Record<PowerCategory, string> = {
  attack: "Power name (eg. Holy Fire Blade)",
  heal: "Power name (eg. Healing Touch)",
  nonAttack: "Power name (eg. Sticky Climb)",
};

export type PowerOptionFormValue = {
  type: PowerOptionType;
  name: string;
  description: string;
  category: PowerCategory;
  diceType: PowerDiceType | "";
  hasRestriction: boolean;
  restriction: string;
  targetPowerName: string;
};

export type CharacterFormValues = {
  name: string;
  skills: Record<SkillName, number | undefined>;
  backstory: string;
  powerOptions: [PowerOptionFormValue, PowerOptionFormValue, PowerOptionFormValue];
  inventory: NewInventoryItem[];
};

// useForm's resolver transforms CharacterFormValues into a CreateCharacterInput
// on submit (see characterFormResolver below), so Control carries that third
// generic — every component that takes `control` needs this exact alias.
export type CharacterFormControl = Control<CharacterFormValues, unknown, CreateCharacterInput>;

const emptyPowerOption = (type: PowerOptionType): PowerOptionFormValue => ({
  type,
  name: "",
  description: "",
  category: "nonAttack",
  diceType: "",
  hasRestriction: false,
  restriction: "",
  targetPowerName: "",
});

// A self-consistent starting combo (two attack picks + one defense pick)
// so the caps aren't already violated before the player touches anything.
export const DEFAULT_FORM_VALUES: CharacterFormValues = {
  name: "",
  skills: {
    physique: undefined,
    wits: undefined,
    charm: undefined,
    senses: undefined,
  },
  backstory: "",
  powerOptions: [
    emptyPowerOption("attackBonus"),
    emptyPowerOption("attackBonus"),
    emptyPowerOption("defenseBonus"),
  ],
  inventory: [],
};

function buildCreateCharacterInput(values: CharacterFormValues): unknown {
  return {
    ...values,
    powerOptions: values.powerOptions.map((option) => {
      if (option.type === "specialPower") {
        return {
          type: option.type,
          name: option.name,
          description: option.description,
          category: option.category,
          ...(option.category !== "nonAttack" && option.diceType
            ? { diceType: option.diceType }
            : {}),
          ...(option.category !== "nonAttack" && option.hasRestriction && option.restriction.trim()
            ? { restriction: option.restriction.trim() }
            : {}),
        };
      }
      if (option.type === "extraPowerUse") {
        return { type: option.type, targetPowerName: option.targetPowerName };
      }
      return { type: option.type };
    }),
  };
}

// react-hook-form's zodResolver validates the raw form state, which always
// carries placeholder fields (eg. restriction: "" on every slot, even ones
// that aren't a specialPower) — those trip up the wire schema's stricter
// constraints (min(1), enums). So instead we transform to the wire shape
// first and validate that, handing the already-clean payload back as the
// resolver's "values" so onSubmit gets a ready-to-send CreateCharacterInput.
export const characterFormResolver: Resolver<CharacterFormValues, unknown, CreateCharacterInput> = (
  values,
) => {
  const result = CreateCharacterInput.safeParse(buildCreateCharacterInput(values));
  if (result.success) {
    return { values: result.data, errors: {} };
  }

  const errors: FieldErrors<CharacterFormValues> = {};
  for (const issue of result.error.issues) {
    const root = issue.path[0];
    if (typeof root === "string" && !(root in errors)) {
      Object.assign(errors, { [root]: { type: "validation", message: issue.message } });
    }
  }
  return { values: {}, errors };
};

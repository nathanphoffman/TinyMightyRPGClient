"use client";

import { Controller, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type CharacterFormControl,
  type CharacterFormValues,
  POWER_CATEGORIES,
  POWER_DICE_TYPES,
  POWER_NAME_PLACEHOLDERS,
  POWER_OPTION_TYPES,
  type PowerOptionFormValue,
} from "./types";

export function PowerOptionSlot({
  index,
  control,
  register,
  powerOptions,
}: {
  index: 0 | 1 | 2;
  control: CharacterFormControl;
  register: UseFormRegister<CharacterFormValues>;
  powerOptions: PowerOptionFormValue[] | undefined;
}) {
  const attackBonusPicks = powerOptions?.filter((o) => o.type === "attackBonus").length ?? 0;
  const defenseBonusPicks = powerOptions?.filter((o) => o.type === "defenseBonus").length ?? 0;
  const selectedType = powerOptions?.[index]?.type;
  const selectedCategory = powerOptions?.[index]?.category;
  const needsDiceType = selectedCategory === "attack" || selectedCategory === "heal";
  const availablePowerNames = [
    ...new Set(
      (powerOptions ?? [])
        .filter((o, i) => i !== index && o.type === "specialPower" && o.name.trim())
        .map((o) => o.name.trim()),
    ),
  ];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted p-3">
      <Controller
        control={control}
        name={`powerOptions.${index}.type`}
        render={({ field }) => (
          <Select
            className="bg-card"
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
          >
            {POWER_OPTION_TYPES.map((option) => {
              const isAttackCapped =
                option.value === "attackBonus" &&
                selectedType !== "attackBonus" &&
                attackBonusPicks >= 2;
              const isDefenseCapped =
                option.value === "defenseBonus" &&
                selectedType !== "defenseBonus" &&
                defenseBonusPicks >= 1;
              const isExtraPowerUseBlocked =
                option.value === "extraPowerUse" &&
                selectedType !== "extraPowerUse" &&
                availablePowerNames.length === 0;
              return (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={isAttackCapped || isDefenseCapped || isExtraPowerUseBlocked}
                >
                  {option.label}
                </option>
              );
            })}
          </Select>
        )}
      />

      {selectedType === "extraPowerUse" && (
        <Controller
          control={control}
          name={`powerOptions.${index}.targetPowerName`}
          render={({ field }) => (
            <Select
              className="bg-card"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            >
              <option value="">
                {availablePowerNames.length === 0
                  ? "Name a special power in another slot first"
                  : "Which power gets the extra use?"}
              </option>
              {availablePowerNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          )}
        />
      )}

      {selectedType === "specialPower" && (
        <div className="flex flex-col gap-2">
          <Input
            placeholder={POWER_NAME_PLACEHOLDERS[selectedCategory ?? "nonAttack"]}
            className="bg-card"
            {...register(`powerOptions.${index}.name`)}
          />
          <Controller
            control={control}
            name={`powerOptions.${index}.category`}
            render={({ field }) => (
              <Select
                className="bg-card"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {POWER_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            )}
          />
          {needsDiceType && (
            <Controller
              control={control}
              name={`powerOptions.${index}.diceType`}
              render={({ field }) => (
                <Select
                  className="bg-card"
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                >
                  <option value="">Choose dice…</option>
                  {POWER_DICE_TYPES.map((dice) => (
                    <option key={dice.value} value={dice.value}>
                      {dice.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          )}
          {needsDiceType && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input type="checkbox" {...register(`powerOptions.${index}.hasRestriction`)} />
                Add restriction
              </label>
              {powerOptions?.[index]?.hasRestriction && (
                <div className="flex flex-col gap-1">
                  <Input
                    placeholder="e.g. only works in melee"
                    className="bg-card"
                    {...register(`powerOptions.${index}.restriction`)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Because of this restriction
                    {powerOptions[index]?.restriction
                      ? ` — "${powerOptions[index].restriction}"`
                      : ""}
                    , I can optionally reroll a single die (if the GM approves).
                  </p>
                </div>
              )}
            </div>
          )}
          {!needsDiceType && (
            <Textarea
              placeholder="What does it do? (optional)"
              className="bg-card"
              {...register(`powerOptions.${index}.description`)}
            />
          )}
        </div>
      )}
    </div>
  );
}

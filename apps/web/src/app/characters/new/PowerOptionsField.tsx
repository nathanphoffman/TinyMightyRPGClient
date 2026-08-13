"use client";

import { type UseFormRegister, useWatch } from "react-hook-form";
import { PowerOptionSlot } from "./PowerOptionSlot";
import type { CharacterFormControl, CharacterFormValues } from "./types";

export function PowerOptionsField({
  control,
  register,
  hasError,
}: {
  control: CharacterFormControl;
  register: UseFormRegister<CharacterFormValues>;
  hasError: boolean;
}) {
  const powerOptions = useWatch({ control, name: "powerOptions" });

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Power options</p>
      <p className="mb-2 text-xs text-muted-foreground">
        Choose 3 (repeats allowed): +2 attack (max +4 total), +2 defense (max 7 total), a one-use
        special power, or +1 more power use.
      </p>
      <div className="flex flex-col gap-3">
        {([0, 1, 2] as const).map((index) => (
          <PowerOptionSlot
            key={index}
            index={index}
            control={control}
            register={register}
            powerOptions={powerOptions}
          />
        ))}
      </div>
      {hasError && (
        <p className="mt-2 text-sm text-destructive">
          Check your power option picks — attack/defense bonuses have caps, and attack or heal
          powers need a dice type.
        </p>
      )}
    </div>
  );
}

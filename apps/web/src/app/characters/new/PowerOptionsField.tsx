"use client";

import { type UseFormRegister, useWatch } from "react-hook-form";
import { FormSection } from "./FormSection";
import { PowerOptionSlot } from "./PowerOptionSlot";
import type { CharacterFormControl, CharacterFormValues } from "./types";

export function PowerOptionsField({
  control,
  register,
  error,
}: {
  control: CharacterFormControl;
  register: UseFormRegister<CharacterFormValues>;
  error?: string;
}) {
  const powerOptions = useWatch({ control, name: "powerOptions" });

  return (
    <FormSection
      title="Power options"
      description="Choose 3 (repeats allowed): +2 attack (max +4 total), +2 defense (max 7 total), a one-use special power, or +1 more power use."
      error={error}
    >
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
    </FormSection>
  );
}

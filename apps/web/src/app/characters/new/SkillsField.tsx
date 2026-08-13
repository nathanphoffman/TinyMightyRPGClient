"use client";

import { SkillName } from "@tmrpg/schemas";
import { Controller, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { CharacterFormControl } from "./types";

const SCORE_OPTIONS = [0, 1, 2, 3] as const;

export function SkillsField({
  control,
  hasError,
}: {
  control: CharacterFormControl;
  hasError: boolean;
}) {
  const skillValues = useWatch({ control, name: "skills" });
  const assignedScores = Object.values(skillValues ?? {}).filter(
    (value): value is number => value !== undefined,
  );

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Skills</p>
      <p className="mb-2 text-xs text-muted-foreground">
        Assign +0, +1, +2, and +3 across the four skills — each bonus can only be used once.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SkillName.options.map((skill) => {
          const currentValue = skillValues?.[skill];
          const takenByOthers = assignedScores.filter((value) => value !== currentValue);

          return (
            <div
              key={skill}
              className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted p-2"
            >
              <Label htmlFor={skill} className="text-xs capitalize text-muted-foreground">
                {skill}
              </Label>
              <Controller
                control={control}
                name={`skills.${skill}`}
                render={({ field }) => (
                  <Select
                    id={skill}
                    className="bg-card"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === "" ? undefined : Number(event.target.value),
                      )
                    }
                  >
                    <option value="">—</option>
                    {SCORE_OPTIONS.filter((option) => !takenByOthers.includes(option)).map(
                      (option) => (
                        <option key={option} value={option}>
                          +{option}
                        </option>
                      ),
                    )}
                  </Select>
                )}
              />
            </div>
          );
        })}
      </div>
      {hasError && (
        <p className="mt-2 text-sm text-destructive">
          Assign a bonus to every skill before creating your character.
        </p>
      )}
    </div>
  );
}

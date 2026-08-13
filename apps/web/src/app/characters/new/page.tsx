"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreateCharacterInput, type NewInventoryItem, SkillName } from "@tmrpg/schemas";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

const SCORE_OPTIONS = [0, 1, 2, 3] as const;

type CharacterFormValues = {
  name: string;
  skills: Record<SkillName, number | undefined>;
  backstory: string;
  inventory: NewInventoryItem[];
};

export default function NewCharacterPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CharacterFormValues>({
    resolver: zodResolver(CreateCharacterInput) as never,
    defaultValues: {
      name: "",
      skills: {
        physique: undefined,
        wits: undefined,
        charm: undefined,
        senses: undefined,
      },
      backstory: "",
      inventory: [],
    },
  });

  const skillValues = useWatch({ control, name: "skills" });
  const assignedScores = Object.values(skillValues ?? {}).filter(
    (value): value is number => value !== undefined,
  );

  const inventoryFields = useFieldArray({ control, name: "inventory" });

  const createCharacter = useMutation({
    mutationFn: (input: CreateCharacterInput) =>
      nestApi.createCharacter(input, accessToken as string),
    onSuccess: () => router.push("/characters"),
  });

  const hasSkillsError = Boolean(errors.skills);

  if (!accessToken) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-muted-foreground">Log in before creating a character.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <Card className="w-full max-w-lg animate-in fade-in duration-700">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-2xl">Create your character</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit((values) =>
              createCharacter.mutate(values as CreateCharacterInput),
            )}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

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
              {hasSkillsError && (
                <p className="mt-2 text-sm text-destructive">
                  Assign a bonus to every skill before creating your character.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="backstory">Backstory</Label>
              <Textarea
                id="backstory"
                placeholder="Where did your character come from?"
                {...register("backstory")}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Starting items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inventoryFields.append({ name: "", quantity: 1 })}
                >
                  Add item
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {inventoryFields.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Item name"
                      className="flex-1"
                      {...register(`inventory.${index}.name`)}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      {...register(`inventory.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Remove item"
                      onClick={() => inventoryFields.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {inventoryFields.fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No starting items yet.</p>
                )}
              </div>
            </div>

            {createCharacter.isError && (
              <p className="text-sm text-destructive">Couldn&apos;t create character.</p>
            )}

            <Button type="submit" disabled={createCharacter.isPending}>
              {createCharacter.isPending ? "Creating…" : "Create character"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

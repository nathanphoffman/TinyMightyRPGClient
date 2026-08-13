"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem, UpdateCharacterInput } from "@tmrpg/schemas";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

type EditFormValues = {
  name: string;
  level: number;
  backstory: string;
  hpCurrent: number;
  hpMax: number;
  inventory: InventoryItem[];
};

export default function EditCharacterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", id, accessToken],
    queryFn: () => nestApi.getCharacter(id, accessToken as string),
    enabled: !!accessToken,
  });

  const { register, control, handleSubmit, reset } = useForm<EditFormValues>({
    defaultValues: {
      name: "",
      level: 1,
      backstory: "",
      hpCurrent: 0,
      hpMax: 1,
      inventory: [],
    },
  });

  const inventoryFields = useFieldArray({ control, name: "inventory" });

  useEffect(() => {
    if (!character) return;
    reset({
      name: character.name,
      level: character.level,
      backstory: character.backstory,
      hpCurrent: character.hitPoints.current,
      hpMax: character.hitPoints.max,
      inventory: character.inventory,
    });
  }, [character, reset]);

  const updateCharacter = useMutation({
    mutationFn: (input: UpdateCharacterInput) =>
      nestApi.updateCharacter(id, input, accessToken as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", id] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      router.push(`/characters/${id}`);
    },
  });

  if (!accessToken) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-muted-foreground">Log in before editing a character.</p>
      </main>
    );
  }

  if (isLoading || !character) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-2xl">Edit {character.name}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit((values) =>
              updateCharacter.mutate({
                name: values.name,
                level: Number(values.level),
                backstory: values.backstory,
                hitPoints: {
                  current: Number(values.hpCurrent),
                  max: Number(values.hpMax),
                },
                inventory: values.inventory.map((item) => ({
                  ...item,
                  quantity: Number(item.quantity),
                })),
              }),
            )}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="level">Level</Label>
                <Input id="level" type="number" min={1} max={20} {...register("level")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hpCurrent">HP current / max</Label>
                <div className="flex items-center gap-2">
                  <Input id="hpCurrent" type="number" min={0} {...register("hpCurrent")} />
                  <span className="text-muted-foreground">/</span>
                  <Input id="hpMax" type="number" min={1} {...register("hpMax")} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="backstory">Backstory</Label>
              <Textarea id="backstory" {...register("backstory")} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Inventory</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    inventoryFields.append({
                      id: crypto.randomUUID(),
                      name: "",
                      quantity: 1,
                      weight: 0,
                      equipped: false,
                    })
                  }
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
                      {...register(`inventory.${index}.quantity`)}
                    />
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <input type="checkbox" {...register(`inventory.${index}.equipped`)} />
                      Equipped
                    </label>
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
                  <p className="text-sm text-muted-foreground">No items yet.</p>
                )}
              </div>
            </div>

            {updateCharacter.isError && (
              <p className="text-sm text-destructive">Couldn&apos;t save changes.</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={updateCharacter.isPending}>
                {updateCharacter.isPending ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/characters/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

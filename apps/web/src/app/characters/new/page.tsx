"use client";

import { useMutation } from "@tanstack/react-query";
import type { CreateCharacterInput } from "@tmrpg/schemas";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { InventoryField } from "./InventoryField";
import { PowerOptionsField } from "./PowerOptionsField";
import { PowerStatsSummary } from "./PowerStatsSummary";
import { SkillsField } from "./SkillsField";
import { type CharacterFormValues, characterFormResolver, DEFAULT_FORM_VALUES } from "./types";

export default function NewCharacterPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CharacterFormValues, unknown, CreateCharacterInput>({
    resolver: characterFormResolver,
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const createCharacter = useMutation({
    mutationFn: (input: CreateCharacterInput) =>
      nestApi.createCharacter(input, accessToken as string),
    onSuccess: () => router.push("/characters"),
  });

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
            onSubmit={handleSubmit((values) => createCharacter.mutate(values))}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <SkillsField control={control} hasError={Boolean(errors.skills)} />

            <PowerStatsSummary control={control} />

            <PowerOptionsField
              control={control}
              register={register}
              hasError={Boolean(errors.powerOptions)}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="backstory">Backstory</Label>
              <Textarea
                id="backstory"
                placeholder="Where did your character come from?"
                {...register("backstory")}
              />
            </div>

            <InventoryField control={control} register={register} />

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

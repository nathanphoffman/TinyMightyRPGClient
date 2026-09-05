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
import { useAuth } from "@/lib/stores/use-auth";
import { FormSection } from "./FormSection";
import { InventoryField } from "./InventoryField";
import { PowerOptionsField } from "./PowerOptionsField";
import { PowerStatsSummary } from "./PowerStatsSummary";
import { SkillsField } from "./SkillsField";
import { type CharacterFormValues, characterFormResolver, DEFAULT_FORM_VALUES } from "./types";

export default function NewCharacterPage() {
  const router = useRouter();
  const { token, ready } = useAuth();

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
      nestApi.createCharacter(input, token as string),
    onSuccess: () => router.push("/characters"),
  });

  if (!ready) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-lg text-muted-foreground">Log in before creating a character.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <Card className="w-full max-w-lg animate-in fade-in duration-700 lg:max-w-5xl">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-3xl">Create your character</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* The shared Input/Select/Textarea/Button primitives hardcode text-sm.
              Bump them one step for this sheet only, rather than changing the
              primitives and resizing every other screen. */}
          <form
            className="flex flex-col gap-5 text-base [&_button]:text-base [&_input]:text-base [&_select]:text-base [&_textarea]:text-base"
            onSubmit={handleSubmit((values) => createCharacter.mutate(values))}
          >
            <FormSection title="Name">
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="mt-2 text-base text-destructive">{errors.name.message}</p>
              )}
            </FormSection>

            {/* Sections stack on narrow screens and split into two independent
                columns once there is room, so a tall block (power options)
                doesn't stretch the short block beside it. */}
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <SkillsField control={control} hasError={Boolean(errors.skills)} />

                <FormSection title="Backstory">
                  <Label htmlFor="backstory" className="sr-only">
                    Backstory
                  </Label>
                  <Textarea
                    id="backstory"
                    placeholder="Where did your character come from?"
                    {...register("backstory")}
                  />
                </FormSection>

                <InventoryField control={control} register={register} />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <PowerStatsSummary control={control} />

                <PowerOptionsField
                  control={control}
                  register={register}
                  error={errors.powerOptions?.message}
                />
              </div>
            </div>

            {createCharacter.isError && (
              <p className="text-base text-destructive">Couldn&apos;t create character.</p>
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

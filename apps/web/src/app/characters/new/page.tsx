"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreateCharacterInput, SkillName } from "@tmrpg/schemas";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

const DEFAULT_SCORE = 0;

export default function NewCharacterPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateCharacterInput),
    defaultValues: {
      name: "",
      skills: {
        physique: DEFAULT_SCORE,
        wits: DEFAULT_SCORE,
        charm: DEFAULT_SCORE,
        senses: DEFAULT_SCORE,
      },
    },
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

            <div>
              <p className="mb-2 text-sm font-medium">Skills</p>
              <div className="grid grid-cols-3 gap-3">
                {SkillName.options.map((skill) => (
                  <div
                    key={skill}
                    className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted p-2"
                  >
                    <Label htmlFor={skill} className="text-xs capitalize text-muted-foreground">
                      {skill}
                    </Label>
                    <Input
                      id={skill}
                      type="number"
                      className="bg-card"
                      {...register(`skills.${skill}`, { valueAsNumber: true })}
                    />
                  </div>
                ))}
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

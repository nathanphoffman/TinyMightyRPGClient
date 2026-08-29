"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nestApi } from "@/lib/api/nest-client";
import { useAuth } from "@/lib/stores/use-auth";

export default function CharactersPage() {
  const { token, ready } = useAuth();

  const {
    data: characters,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["characters", token],
    queryFn: () => nestApi.listCharacters(token as string),
    enabled: !!token,
  });

  if (!ready) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
        <p className="text-muted-foreground">Log in to see your characters.</p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your characters</h1>
        <Button asChild size="sm">
          <Link href="/characters/new">New character</Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading…</p>}

      {isError && (
        <p className="text-sm text-destructive">
          Could not load your characters. Please try again.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {characters?.map((character) => (
          <Link key={character.id} href={`/characters/${character.id}`}>
            <Card className="transition-colors hover:bg-muted">
              <CardHeader>
                <CardTitle>
                  {character.name} — Level {character.level}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                HP {character.hitPoints.current}/{character.hitPoints.max}
              </CardContent>
            </Card>
          </Link>
        ))}
        {characters?.length === 0 && (
          <p className="text-muted-foreground">No characters yet — create your first one.</p>
        )}
      </div>
    </main>
  );
}

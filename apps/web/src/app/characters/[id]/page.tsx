"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nestApi } from "@/lib/api/nest-client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    data: character,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["character", id, accessToken],
    queryFn: () => nestApi.getCharacter(id, accessToken as string),
    enabled: !!accessToken,
  });

  if (!accessToken) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
        <p className="text-muted-foreground">Log in to see this character.</p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-16">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (isError || !character) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-16">
        <p className="text-muted-foreground">Couldn&apos;t find that character.</p>
        <Button asChild variant="outline">
          <Link href="/characters">Back to characters</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-16">
      <div className="flex items-center justify-between">
        <Link href="/characters" className="text-sm text-muted-foreground hover:underline">
          ← Back to characters
        </Link>
        <Button asChild size="sm" variant="outline">
          <Link href={`/characters/${character.id}/edit`}>Edit character</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {character.name} — Level {character.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="text-sm text-muted-foreground">
            HP {character.hitPoints.current}/{character.hitPoints.max}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Skills</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(character.skills).map(([skill, value]) => (
                <div
                  key={skill}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted p-2"
                >
                  <span className="text-xs capitalize text-muted-foreground">{skill}</span>
                  <span className="text-sm font-medium">+{value}</span>
                </div>
              ))}
            </div>
          </div>

          {character.backstory && (
            <div>
              <p className="mb-2 text-sm font-medium">Backstory</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {character.backstory}
              </p>
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium">Inventory</p>
            {character.inventory.length === 0 && (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            )}
            <div className="flex flex-col gap-2">
              {character.inventory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2 text-sm"
                >
                  <span>
                    {item.name} {item.equipped && <span className="text-xs">(equipped)</span>}
                  </span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

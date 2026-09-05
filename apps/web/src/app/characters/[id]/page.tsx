"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { StatusScreen } from "@/components/status-screen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nestApi } from "@/lib/api/nest-client";
import { CharacterInventory } from "./CharacterInventory";
import { CharacterPowers } from "./CharacterPowers";
import { CharacterSkills } from "./CharacterSkills";
import { CharacterStats } from "./CharacterStats";
import { DeleteCharacterButton } from "./DeleteCharacterButton";
import { type DiceRoll, rollDice } from "./dice";
import { DiceTray } from "./DiceTray";

export default function CharacterPage() {
  return (
    <AuthGate message="Log in to see this character.">
      {(token) => <CharacterView token={token} />}
    </AuthGate>
  );
}

function CharacterView({ token }: { token: string }) {
  const { id } = useParams<{ id: string }>();
  const [roll, setRoll] = useState<DiceRoll | null>(null);

  const {
    data: character,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["character", id, token],
    queryFn: () => nestApi.getCharacter(id, token),
  });

  if (isLoading) {
    return <StatusScreen>Loading…</StatusScreen>;
  }

  if (isError || !character) {
    return (
      <StatusScreen action={{ href: "/characters", label: "Back to characters", variant: "outline" }}>
        Couldn&apos;t find that character.
      </StatusScreen>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-16">
      <div className="flex items-center justify-between">
        <Link href="/characters" className="text-sm text-muted-foreground hover:underline">
          ← Back to characters
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/characters/${character.id}/edit`}>Edit character</Link>
          </Button>
          <DeleteCharacterButton id={character.id} name={character.name} token={token} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {character.name} — Level {character.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <CharacterStats
            hitPoints={character.hitPoints}
            attackBonus={character.attackBonus}
            defense={character.defense}
            onRollAttack={(label, modifier) => setRoll(rollDice(modifier, label))}
          />

          <CharacterSkills
            skills={character.skills}
            onRollSkill={(label, modifier) => setRoll(rollDice(modifier, label))}
          />

          <DiceTray roll={roll} onRoll={() => setRoll(rollDice())} />

          <div>
            <p className="mb-2 text-sm font-medium">Backstory</p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {character.backstory || (
                <span className="italic">No background written yet.</span>
              )}
            </p>
          </div>

          <CharacterPowers powers={character.powers} />

          <CharacterInventory inventory={character.inventory} />
        </CardContent>
      </Card>
    </main>
  );
}

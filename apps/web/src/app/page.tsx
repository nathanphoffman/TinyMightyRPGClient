import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-16">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">TinyMightyRPG</h1>
        <p className="mt-2 text-muted-foreground">
          Build characters, manage sheets, and eventually play together live.
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Get started</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/characters/new">Create a character</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/characters">View your characters</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

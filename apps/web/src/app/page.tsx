import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <Image
        src="/tinymighty-logo.png"
        alt="Tiny Mighty"
        width={1298}
        height={812}
        priority
        className="w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-700"
      />

      <p className="max-w-md text-center text-muted-foreground">
        Build characters, manage sheets, and eventually play together live.
      </p>

      <nav className="flex flex-col items-center gap-2 sm:flex-row">
        <Link
          href="/characters/new"
          className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Create a character
        </Link>
        <Link
          href="/characters"
          className="rounded-lg bg-secondary px-5 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          View your characters
        </Link>
        <Link
          href="/login"
          className="rounded-lg px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Log in
        </Link>
      </nav>
    </main>
  );
}
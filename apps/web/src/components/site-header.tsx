import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/characters", label: "Characters" },
  { href: "/characters/new", label: "New character" },
  { href: "/login", label: "Log in" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/tinymighty-logo.png"
            alt="Tiny Mighty"
            width={1298}
            height={812}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

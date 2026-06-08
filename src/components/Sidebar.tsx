"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/transactions", label: "Transactions" },
  { href: "/dashboard/budgets", label: "Budgets" },
];

export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-line bg-card md:h-screen md:w-64 md:border-r">
      <div className="flex items-center justify-between p-6 md:block">
        <Link href="/dashboard" className="font-serif text-xl font-semibold text-moss-700">
          Ledgerleaf
        </Link>
        <p className="mt-1 hidden text-sm text-muted md:block">Hi, {name.split(" ")[0]}</p>
      </div>

      <nav className="flex gap-1 px-4 pb-4 md:mt-2 md:flex-col">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-moss-50 text-moss-700"
                  : "text-muted hover:bg-moss-50 hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mx-4 mb-6 mt-auto rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-moss-50 hover:text-ink md:mt-auto"
      >
        Sign out
      </button>
    </aside>
  );
}

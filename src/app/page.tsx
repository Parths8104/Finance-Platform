import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-5xl px-6">
      <nav className="flex items-center justify-between py-6">
        <span className="font-serif text-xl font-semibold text-moss-700">
          Ledgerleaf
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink hover:text-moss-600">
            Log in
          </Link>
          <Link href="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </nav>

      <section className="grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
            Personal finance, simplified
          </p>
          <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
            See where your money actually goes.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted">
            Track income and expenses, set monthly budgets by category, and watch
            your spending take shape, all in one calm, private dashboard.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary px-5 py-3">
              Create your account
            </Link>
            <Link href="/login" className="btn-ghost px-5 py-3">
              Log in
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted">
            Want a quick look? Seed the demo and log in with{" "}
            <code className="rounded bg-moss-50 px-1.5 py-0.5 text-moss-700">
              demo@finance.app
            </code>
          </p>
        </div>

        <div className="panel p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm text-muted">Net balance</span>
            <span className="font-serif text-2xl font-semibold text-moss-700">
              $2,710.71
            </span>
          </div>
          <div className="space-y-3">
            {[
              ["Groceries", "$232.90", "58%"],
              ["Dining", "$77.10", "39%"],
              ["Transport", "$82.50", "55%"],
              ["Entertainment", "$15.99", "20%"],
            ].map(([name, amt, pct]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{name}</span>
                  <span className="text-muted">{amt}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-moss-50">
                  <div
                    className="h-full rounded-full bg-moss-500"
                    style={{ width: pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-sm text-muted">
        Built with Next.js, TypeScript, Prisma, and PostgreSQL.
      </footer>
    </main>
  );
}

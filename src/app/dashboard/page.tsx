import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SpendingChart, type CategorySlice } from "@/components/SpendingChart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  let income = 0;
  let expense = 0;
  let monthExpense = 0;
  const byCategory = new Map<string, { value: number; color: string }>();

  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      income += amt;
    } else {
      expense += amt;
      if (t.date >= monthStart) monthExpense += amt;
      const key = t.category?.name ?? "Uncategorized";
      const color = t.category?.color ?? "#74786f";
      const cur = byCategory.get(key);
      byCategory.set(key, { value: (cur?.value ?? 0) + amt, color });
    }
  }

  const balance = income - expense;
  const chartData: CategorySlice[] = Array.from(byCategory.entries())
    .map(([name, v]) => ({ name, value: Math.round(v.value * 100) / 100, color: v.color }))
    .sort((a, b) => b.value - a.value);

  const recent = transactions.slice(0, 6);

  const cards = [
    { label: "Net balance", value: balance, accent: "text-moss-700" },
    { label: "Total income", value: income, accent: "text-moss-600" },
    { label: "Total expenses", value: expense, accent: "text-clay" },
    { label: "Spent this month", value: monthExpense, accent: "text-ink" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Overview</h1>
        <p className="mt-1 text-muted">A snapshot of where your money stands.</p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="panel p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-2 font-serif text-2xl font-semibold ${c.accent}`}>
              {formatCurrency(c.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="panel p-6 lg:col-span-2">
          <h2 className="mb-4 font-serif text-lg text-ink">Spending by category</h2>
          <SpendingChart data={chartData} />
        </div>

        <div className="panel p-6 lg:col-span-3">
          <h2 className="mb-4 font-serif text-lg text-ink">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: t.category?.color ?? "#74786f" }}
                    />
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {t.note || t.category?.name || "Transaction"}
                      </p>
                      <p className="text-xs text-muted">
                        {t.category?.name ?? "Uncategorized"} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "INCOME" ? "text-moss-600" : "text-ink"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {formatCurrency(Number(t.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

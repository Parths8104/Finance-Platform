import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetManager } from "@/components/BudgetManager";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const monthStart = new Date(year, now.getMonth(), 1);
  const monthEnd = new Date(year, now.getMonth() + 1, 1);

  const [budgets, categories, monthExpenses] = await Promise.all([
    prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  const spentByCategory: Record<string, number> = {};
  for (const row of monthExpenses) {
    if (row.categoryId) spentByCategory[row.categoryId] = Number(row._sum.amount ?? 0);
  }

  const initialBudgets = budgets.map((b) => ({
    id: b.id,
    amount: Number(b.amount),
    categoryId: b.categoryId,
    categoryName: b.category.name,
    categoryColor: b.category.color,
    spent: spentByCategory[b.categoryId] ?? 0,
  }));

  const cats = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return (
    <BudgetManager
      initialBudgets={initialBudgets}
      categories={cats}
      month={month}
      year={year}
    />
  );
}

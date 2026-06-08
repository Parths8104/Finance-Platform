import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionManager } from "@/components/TransactionManager";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  // Serialize Prisma Decimal/Date into plain values for the client component.
  const initialTxns = transactions.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type,
    note: t.note,
    date: t.date.toISOString(),
    categoryId: t.categoryId,
    categoryName: t.category?.name ?? null,
    categoryColor: t.category?.color ?? null,
  }));

  const cats = categories.map((c) => ({ id: c.id, name: c.name, color: c.color }));

  return <TransactionManager initialTxns={initialTxns} categories={cats} />;
}

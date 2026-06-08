import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json(budgets);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { amount, categoryId, month, year } = parsed.data;

  const owned = await prisma.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
  });
  if (!owned) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // One budget per category per month: update if it exists, otherwise create.
  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId: session.user.id,
        categoryId,
        month,
        year,
      },
    },
    update: { amount },
    create: { amount, categoryId, month, year, userId: session.user.id },
    include: { category: true },
  });

  return NextResponse.json(budget, { status: 201 });
}

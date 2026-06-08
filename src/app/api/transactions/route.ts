import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { amount, type, note, date, categoryId } = parsed.data;

  // Ensure the category belongs to this user before linking it.
  if (categoryId) {
    const owned = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.user.id },
    });
    if (!owned) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
  }

  const txn = await prisma.transaction.create({
    data: {
      amount,
      type,
      note: note ?? "",
      date: new Date(date),
      categoryId: categoryId || null,
      userId: session.user.id,
    },
    include: { category: true },
  });

  return NextResponse.json(txn, { status: 201 });
}

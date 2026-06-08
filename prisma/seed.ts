import { PrismaClient, TxnType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Salary", color: "#2f7d50" },
  { name: "Groceries", color: "#c2613f" },
  { name: "Rent", color: "#3b6ea5" },
  { name: "Dining", color: "#d29a3b" },
  { name: "Transport", color: "#7a5ea8" },
  { name: "Utilities", color: "#4c9d6b" },
  { name: "Entertainment", color: "#b14d6b" },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const email = "demo@finance.app";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // Reset the demo user so the seed is idempotent.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: { name: "Demo User", email, passwordHash, role: "USER" },
  });

  const categories: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { name: c.name, color: c.color, userId: user.id },
    });
    categories[c.name] = cat.id;
  }

  const txns: {
    amount: number;
    type: TxnType;
    note: string;
    date: Date;
    categoryId: string;
  }[] = [
    { amount: 4200, type: "INCOME", note: "Monthly salary", date: daysAgo(28), categoryId: categories["Salary"] },
    { amount: 1450, type: "EXPENSE", note: "Apartment rent", date: daysAgo(27), categoryId: categories["Rent"] },
    { amount: 86.4, type: "EXPENSE", note: "Weekly groceries", date: daysAgo(24), categoryId: categories["Groceries"] },
    { amount: 42.1, type: "EXPENSE", note: "Dinner with friends", date: daysAgo(22), categoryId: categories["Dining"] },
    { amount: 60, type: "EXPENSE", note: "Metro card", date: daysAgo(20), categoryId: categories["Transport"] },
    { amount: 120.5, type: "EXPENSE", note: "Electricity bill", date: daysAgo(18), categoryId: categories["Utilities"] },
    { amount: 15.99, type: "EXPENSE", note: "Streaming subscription", date: daysAgo(16), categoryId: categories["Entertainment"] },
    { amount: 92.3, type: "EXPENSE", note: "Groceries", date: daysAgo(12), categoryId: categories["Groceries"] },
    { amount: 35, type: "EXPENSE", note: "Lunch", date: daysAgo(9), categoryId: categories["Dining"] },
    { amount: 300, type: "INCOME", note: "Freelance payout", date: daysAgo(7), categoryId: categories["Salary"] },
    { amount: 54.2, type: "EXPENSE", note: "Groceries", date: daysAgo(4), categoryId: categories["Groceries"] },
    { amount: 22.5, type: "EXPENSE", note: "Rideshare", date: daysAgo(2), categoryId: categories["Transport"] },
  ];

  for (const t of txns) {
    await prisma.transaction.create({ data: { ...t, userId: user.id } });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const budgets = [
    { category: "Groceries", amount: 400 },
    { category: "Dining", amount: 200 },
    { category: "Transport", amount: 150 },
    { category: "Entertainment", amount: 80 },
  ];
  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        amount: b.amount,
        month,
        year,
        userId: user.id,
        categoryId: categories[b.category],
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login with:  demo@finance.app  /  demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

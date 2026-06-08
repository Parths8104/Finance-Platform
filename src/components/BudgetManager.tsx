"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

type Category = { id: string; name: string; color: string };

type Budget = {
  id: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  spent: number;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BudgetManager({
  initialBudgets,
  categories,
  month,
  year,
}: {
  initialBudgets: Budget[];
  categories: Category[];
  month: number;
  year: number;
}) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveBudget(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, categoryId, month, year }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save budget.");
      setSaving(false);
      return;
    }

    const saved = await res.json();
    setBudgets((prev) => {
      const existingSpent =
        prev.find((b) => b.categoryId === saved.categoryId)?.spent ?? 0;
      const next = prev.filter((b) => b.categoryId !== saved.categoryId);
      return [
        ...next,
        {
          id: saved.id,
          amount: Number(saved.amount),
          categoryId: saved.categoryId,
          categoryName: saved.category.name,
          categoryColor: saved.category.color,
          spent: existingSpent,
        },
      ].sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    });
    setAmount("");
    setSaving(false);
  }

  async function removeBudget(id: string) {
    const prev = budgets;
    setBudgets((b) => b.filter((x) => x.id !== id));
    const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (!res.ok) setBudgets(prev);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Budgets</h1>
        <p className="mt-1 text-muted">
          Set monthly limits for {MONTHS[month - 1]} {year} and track your progress.
        </p>
      </header>

      <form onSubmit={saveBudget} className="panel mb-8 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label">Category</label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="label">Monthly limit</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full py-2.5" disabled={saving}>
              {saving ? "Saving…" : "Set budget"}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">
            {error}
          </p>
        )}
      </form>

      {budgets.length === 0 ? (
        <div className="panel p-12 text-center text-sm text-muted">
          No budgets set for this month yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((b) => {
            const pct = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0;
            const over = b.spent > b.amount;
            const remaining = b.amount - b.spent;
            return (
              <div key={b.id} className="panel group p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: b.categoryColor }}
                    />
                    <span className="font-medium text-ink">{b.categoryName}</span>
                  </div>
                  <button
                    onClick={() => removeBudget(b.id)}
                    className="text-xs text-muted opacity-0 transition hover:text-clay group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-2 flex items-baseline justify-between text-sm">
                  <span className="text-muted">
                    {formatCurrency(b.spent)} of {formatCurrency(b.amount)}
                  </span>
                  <span className={over ? "font-medium text-clay" : "text-moss-600"}>
                    {over
                      ? `${formatCurrency(Math.abs(remaining))} over`
                      : `${formatCurrency(remaining)} left`}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-moss-50">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: over ? "#c2613f" : b.categoryColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

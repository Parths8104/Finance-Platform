"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

type Category = { id: string; name: string; color: string };

type Txn = {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  note: string;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionManager({
  initialTxns,
  categories,
}: {
  initialTxns: Txn[];
  categories: Category[];
}) {
  const [txns, setTxns] = useState<Txn[]>(initialTxns);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function addTxn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, type, note, date, categoryId: categoryId || null }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add transaction.");
      setSaving(false);
      return;
    }

    const created = await res.json();
    setTxns((prev) => [
      {
        id: created.id,
        amount: Number(created.amount),
        type: created.type,
        note: created.note,
        date: created.date,
        categoryId: created.categoryId,
        categoryName: created.category?.name ?? null,
        categoryColor: created.category?.color ?? null,
      },
      ...prev,
    ]);
    setAmount("");
    setNote("");
    setSaving(false);
  }

  async function removeTxn(id: string) {
    const prev = txns;
    setTxns((t) => t.filter((x) => x.id !== id)); // optimistic
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) setTxns(prev); // revert on failure
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-ink">Transactions</h1>
        <p className="mt-1 text-muted">Log income and expenses as they happen.</p>
      </header>

      <form onSubmit={addTxn} className="panel mb-8 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div>
            <label className="label">Amount</label>
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
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Note</label>
            <input
              className="input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">
            {error}
          </p>
        )}

        <div className="mt-4">
          <button type="submit" className="btn-primary px-5 py-2.5" disabled={saving}>
            {saving ? "Adding…" : "Add transaction"}
          </button>
        </div>
      </form>

      <div className="panel overflow-hidden">
        {txns.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">
            No transactions yet. Add your first one above.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {txns.map((t) => (
              <li
                key={t.id}
                className="group flex items-center justify-between px-6 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: t.categoryColor ?? "#74786f" }}
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {t.note || t.categoryName || "Transaction"}
                    </p>
                    <p className="text-xs text-muted">
                      {t.categoryName ?? "Uncategorized"} · {formatDate(t.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "INCOME" ? "text-moss-600" : "text-ink"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "−"}
                    {formatCurrency(t.amount)}
                  </span>
                  <button
                    onClick={() => removeTxn(t.id)}
                    className="text-xs text-muted opacity-0 transition hover:text-clay group-hover:opacity-100"
                    aria-label="Delete transaction"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

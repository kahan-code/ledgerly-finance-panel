import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, WalletCards, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { formatLocalDate } from '@/utils/date';
import { Button } from '@/components/ui/button';

const FIELDS = ['Id','Name','amount_c','type_c','category_c','merchant_c','date_c','paymentMethod_c','note_c'];

async function fetchTransactions() {
  const response = await sdk.table('transactions_c').select(FIELDS).page(1, 100).fetch();
  if (!response?.success) throw new Error(response?.message || 'Could not load transactions.');
  return response.data ?? [];
}

async function fetchBudgets() {
  const response = await sdk.table('budgets_c').select(['Id','Name','category_c','month_c','limit_c']).page(1, 20).fetch();
  if (!response?.success) throw new Error(response?.message || 'Could not load budgets.');
  return response.data ?? [];
}

export const route = { path: '/dashboard', layout: 'owner' };

export const nav = {
  label: 'Overview',
  to: '/dashboard',
  icon: 'LayoutDashboard',
  section: 'Workspace',
  order: 1
};

export default function Dashboard() {
  const { data: transactions, loading, error, run } = useFetch(fetchTransactions, []);
  const { data: budgets, loading: budgetsLoading } = useFetch(fetchBudgets, []);

  const metrics = useMemo(() => {
    const rows = transactions ?? [];
    const income = rows.filter((r) => r.type_c === 'Income').reduce((sum, r) => sum + Number(r.amount_c || 0), 0);
    const expense = rows.filter((r) => r.type_c === 'Expense').reduce((sum, r) => sum + Number(r.amount_c || 0), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categorySpend = useMemo(() => {
    const map = new Map();
    (transactions ?? []).filter((r) => r.type_c === 'Expense').forEach((r) => {
      map.set(r.category_c, (map.get(r.category_c) || 0) + Number(r.amount_c || 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [transactions]);

  const recent = [...(transactions ?? [])].sort((a, b) => String(b.date_c).localeCompare(String(a.date_c))).slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-success">September 2026</p>
          <h1 className="mt-1 font-heading text-4xl sm:text-5xl">Your money, at a glance.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A calm snapshot of what came in, what went out, and what your plans are asking from you.</p>
        </div>
        <Button onClick={() => window.dispatchEvent(new CustomEvent('ledgerly:new-transaction'))} className="hover:opacity-95 focus-visible:ring-ring">
          <Plus size={17} /> Add transaction
        </Button>
      </header>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-card p-5">
          <p className="font-semibold text-destructive">We couldn't refresh your money data.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={run} className="mt-3 hover:bg-accent focus-visible:ring-ring">Try again</Button>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Available balance', value: metrics.balance, icon: WalletCards, tone: 'bg-accent text-accent-foreground' },
          { label: 'Income this month', value: metrics.income, icon: ArrowUpRight, tone: 'bg-success-muted text-success' },
          { label: 'Spent this month', value: metrics.expense, icon: ArrowDownRight, tone: 'bg-muted text-foreground' }
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className={'grid size-9 place-items-center rounded-xl ' + tone}><Icon size={18} /></span>
            </div>
            {loading ? <div className="mt-5 h-10 w-36 animate-pulse rounded-lg bg-muted" /> : <p className="mt-4 font-heading text-4xl">₹{value.toLocaleString('en-IN')}</p>}
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div><h2 className="text-lg font-bold">Recent activity</h2><p className="text-sm text-muted-foreground">Your latest money movements.</p></div>
            <Button variant="ghost" size="sm" asChild className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring"><Link to="/transactions">See all</Link></Button>
          </div>
          <div className="mt-5 divide-y divide-border">
            {loading && [1,2,3].map((n) => <div key={n} className="flex items-center gap-4 py-4 animate-pulse"><div className="size-10 rounded-full bg-muted" /><div className="flex-1"><div className="h-4 w-32 rounded bg-muted" /><div className="mt-2 h-3 w-20 rounded bg-muted" /></div><div className="h-4 w-20 rounded bg-muted" /></div>)}
            {!loading && recent.map((row) => (
              <div key={row.Id} className="flex items-center gap-4 py-4">
                <div className="grid size-10 place-items-center rounded-full bg-muted"><span className="text-sm font-bold">{row.category_c?.slice(0,1)}</span></div>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.merchant_c}</p><p className="text-xs text-muted-foreground">{row.category_c} · {formatLocalDate(row.date_c)}</p></div>
                <p className={row.type_c === 'Income' ? 'font-semibold text-success' : 'font-semibold'}>{row.type_c === 'Income' ? '+' : '-'}₹{Number(row.amount_c).toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!loading && recent.length === 0 && <div className="py-12 text-center"><Sparkles className="mx-auto text-primary" /><p className="mt-3 font-semibold">Your ledger is ready.</p><p className="mt-1 text-sm text-muted-foreground">Add your first transaction to see activity here.</p></div>}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div><h2 className="text-lg font-bold">Where it goes</h2><p className="text-sm text-muted-foreground">Top spending categories.</p></div>
          <div className="mt-6 space-y-5">
            {categorySpend.length === 0 && !loading && <p className="py-8 text-sm text-muted-foreground">No expense categories yet.</p>}
            {categorySpend.map(([category, amount], index) => {
              const max = categorySpend[0]?.[1] || 1;
              return <div key={category}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{category}</span><span className="text-muted-foreground">₹{amount.toLocaleString('en-IN')}</span></div>
                <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: ((amount / max) * 100) + '%' }} /></div>
                <p className="mt-1 text-[11px] text-muted-foreground">{index === 0 ? 'Your biggest category this month' : 'Share of your tracked spending'}</p>
              </div>;
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Budget pulse</h2><p className="text-sm text-muted-foreground">How your current plans are holding up.</p></div><Target size={20} className="text-primary" /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {budgetsLoading && [1,2,3,4].map((n) => <div key={n} className="h-24 animate-pulse rounded-xl bg-muted" />)}
          {(budgets ?? []).map((budget) => {
            const spent = categorySpend.find(([category]) => category === budget.category_c)?.[1] || 0;
            const percent = Math.min(100, Math.round((spent / Number(budget.limit_c || 1)) * 100));
            return <div key={budget.Id} className="rounded-xl bg-muted p-4"><div className="flex justify-between text-sm font-semibold"><span>{budget.category_c}</span><span>{percent}%</span></div><div className="mt-3 h-2 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{ width: percent + '%' }} /></div><p className="mt-2 text-xs text-muted-foreground">₹{spent.toLocaleString('en-IN')} of ₹{Number(budget.limit_c).toLocaleString('en-IN')}</p></div>;
          })}
        </div>
      </section>
    </div>
  );
}

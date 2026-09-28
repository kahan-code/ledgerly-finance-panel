import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus, WalletCards, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatLocalDate } from '@/utils/date';
import { Button } from '@/components/ui/button';

export const route = { path: '/dashboard', layout: 'owner', access: 'authenticated' };
export const nav = { label: 'Overview', to: '/dashboard', icon: 'LayoutDashboard', section: 'Workspace', order: 1 };

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const [{ data: tx, error: txError }, { data: bg, error: bgError }] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }).limit(100),
        supabase.from('budgets').select('*').order('month', { ascending: false }).limit(20),
      ]);
      if (txError) throw txError;
      if (bgError) throw bgError;
      setTransactions(tx ?? []);
      setBudgets(bg ?? []);
    } catch (e) {
      setError(e?.message || 'Could not load your finance data.');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const income = transactions.filter(r => r.type === 'Income').reduce((s,r) => s + Number(r.amount || 0), 0);
    const expense = transactions.filter(r => r.type === 'Expense').reduce((s,r) => s + Number(r.amount || 0), 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categorySpend = useMemo(() => {
    const map = new Map();
    transactions.filter(r => r.type === 'Expense').forEach(r => map.set(r.category, (map.get(r.category) || 0) + Number(r.amount || 0)));
    return [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0,4);
  }, [transactions]);

  const recent = transactions.slice(0,5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-success">Live account</p><h1 className="mt-1 font-heading text-4xl sm:text-5xl">Your money, at a glance.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Your figures come directly from your private Supabase account.</p></div>
        <Button asChild><Link to="/transactions?add=1"><Plus size={17}/> Add transaction</Link></Button>
      </header>

      {error && <div className="rounded-2xl border border-destructive/30 bg-card p-5"><p className="font-semibold text-destructive">We couldn't refresh your money data.</p><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button variant="outline" size="sm" onClick={load} className="mt-3">Try again</Button></div>}

      <section className="grid gap-4 md:grid-cols-3">
        {[['Available balance',metrics.balance,WalletCards],['Income this month',metrics.income,ArrowUpRight],['Spent this month',metrics.expense,ArrowDownRight]].map(([label,value,Icon]) =>
          <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-xs"><div className="flex items-start justify-between"><p className="text-sm text-muted-foreground">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-muted"><Icon size={18}/></span></div>{loading ? <div className="mt-5 h-10 w-36 animate-pulse rounded-lg bg-muted"/> : <p className="mt-4 font-heading text-4xl">₹{value.toLocaleString('en-IN')}</p>}</div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent activity</h2><p className="text-sm text-muted-foreground">Your latest money movements.</p></div><Button variant="ghost" size="sm" asChild><Link to="/transactions">See all</Link></Button></div>
          <div className="mt-5 divide-y divide-border">
            {!loading && recent.map(row => <div key={row.id} className="flex items-center gap-4 py-4"><div className="grid size-10 place-items-center rounded-full bg-muted"><span className="text-sm font-bold">{row.category?.slice(0,1)}</span></div><div className="min-w-0 flex-1"><p className="truncate font-semibold">{row.merchant}</p><p className="text-xs text-muted-foreground">{row.category} · {formatLocalDate(row.date)}</p></div><p className={row.type === 'Income' ? 'font-semibold text-success' : 'font-semibold'}>{row.type === 'Income' ? '+' : '-'}₹{Number(row.amount).toLocaleString('en-IN')}</p></div>)}
            {!loading && recent.length === 0 && <div className="py-12 text-center"><Sparkles className="mx-auto text-primary"/><p className="mt-3 font-semibold">Your ledger is ready.</p><p className="mt-1 text-sm text-muted-foreground">Add your first transaction to see activity here.</p></div>}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs"><div><h2 className="text-lg font-bold">Where it goes</h2><p className="text-sm text-muted-foreground">Top spending categories.</p></div><div className="mt-6 space-y-5">{categorySpend.length === 0 && !loading && <p className="py-8 text-sm text-muted-foreground">No expense categories yet.</p>}{categorySpend.map(([category,amount],i) => {const max=categorySpend[0]?.[1]||1; return <div key={category}><div className="flex justify-between text-sm"><span className="font-semibold">{category}</span><span className="text-muted-foreground">₹{amount.toLocaleString('en-IN')}</span></div><div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:(amount/max*100)+'%'}}/></div><p className="mt-1 text-[11px] text-muted-foreground">{i===0?'Your biggest category this month':'Share of tracked spending'}</p></div>})}</div></div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-xs"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Budget pulse</h2><p className="text-sm text-muted-foreground">Your current spending guardrails.</p></div><Target size={20} className="text-primary"/></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{budgets.map(b => {const spent=categorySpend.find(([c])=>c===b.category)?.[1]||0;const percent=Math.min(100,Math.round(spent/Number(b.monthly_limit||1)*100));return <div key={b.id} className="rounded-xl bg-muted p-4"><div className="flex justify-between text-sm font-semibold"><span>{b.category}</span><span>{percent}%</span></div><div className="mt-3 h-2 rounded-full bg-background"><div className="h-full rounded-full bg-primary" style={{width:percent+'%'}}/></div><p className="mt-2 text-xs text-muted-foreground">₹{spent.toLocaleString('en-IN')} of ₹{Number(b.monthly_limit).toLocaleString('en-IN')}</p></div>})}</div></section>
    </div>
  );
}

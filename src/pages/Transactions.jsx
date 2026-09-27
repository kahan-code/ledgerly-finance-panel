import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, ReceiptText, Search, Trash2, X } from 'lucide-react';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { formatLocalDate } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FIELDS = ['Id','Name','amount_c','type_c','category_c','merchant_c','date_c','paymentMethod_c','note_c'];
const EMPTY = { Name:'', amount_c:'', type_c:'Expense', category_c:'Food', merchant_c:'', date_c:new Date().toISOString().slice(0,10), paymentMethod_c:'UPI', note_c:'' };

async function fetchTransactions() {
  const response = await sdk.table('transactions_c').select(FIELDS).page(1, 100).fetch();
  if (!response?.success) throw new Error(response?.message || 'Could not load transactions.');
  return response.data ?? [];
}

export const route = { path: '/transactions', layout: 'owner' };
export const nav = { label: 'Transactions', to: '/transactions', icon: 'ReceiptText', section: 'Workspace', order: 2 };

export default function Transactions() {
  const { data, loading, error, run } = useFetch(fetchTransactions, []);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [sort, setSort] = useState('date');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    const open = () => { setEditing('new'); setForm(EMPTY); };
    window.addEventListener('ledgerly:new-transaction', open);
    return () => window.removeEventListener('ledgerly:new-transaction', open);
  }, []);

  const rows = useMemo(() => {
    return [...(data ?? [])]
      .filter((r) => type === 'All' || r.type_c === type)
      .filter((r) => [r.merchant_c, r.category_c, r.Name, r.note_c].join(' ').toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => sort === 'amount' ? Number(b.amount_c) - Number(a.amount_c) : String(b.date_c).localeCompare(String(a.date_c)));
  }, [data, query, type, sort]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    if (!form.merchant_c.trim() || !form.amount_c || !form.date_c) return;
    setSaving(true);
    try {
      const payload = { ...form, amount_c: Number(form.amount_c), Name: form.Name.trim() || form.merchant_c.trim() };
      const response = editing === 'new'
        ? await sdk.table('transactions_c').create(payload)
        : await sdk.table('transactions_c').update({ ...payload, Id: editing });
      if (!response?.success) throw new Error(response?.message || 'Could not save the transaction.');
      setEditing(null);
      setForm(EMPTY);
      await run();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const response = await sdk.table('transactions_c').remove(id);
      if (!response?.success) throw new Error(response?.message || 'Could not delete the transaction.');
      await run();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-success">Ledger</p><h1 className="mt-1 font-heading text-4xl sm:text-5xl">Transactions</h1><p className="mt-2 text-sm text-muted-foreground">Every rupee in one searchable, editable place.</p></div>
        <Button onClick={() => { setEditing('new'); setForm(EMPTY); }} className="hover:opacity-95 focus-visible:ring-ring"><Plus size={17} /> Add transaction</Button>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search merchant, category, notes..." className="pl-9 focus-visible:ring-ring" /></div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option>All</option><option>Expense</option><option>Income</option></select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="date">Newest first</option><option value="amount">Largest first</option></select>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-destructive/30 bg-card p-5"><p className="font-semibold text-destructive">Transactions couldn't load.</p><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button variant="outline" size="sm" onClick={run} className="mt-3 hover:bg-accent focus-visible:ring-ring">Retry</Button></div>}

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <div className="hidden grid-cols-[1.3fr_1fr_.8fr_.8fr_110px] gap-4 border-b border-border bg-muted px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground md:grid"><span>Transaction</span><span>Category</span><span>Date</span><span>Amount</span><span /></div>
        {loading && [1,2,3,4].map((n) => <div key={n} className="grid gap-4 border-b border-border px-5 py-5 animate-pulse md:grid-cols-[1.3fr_1fr_.8fr_.8fr_110px]"><div><div className="h-4 w-32 rounded bg-muted" /><div className="mt-2 h-3 w-20 rounded bg-muted" /></div><div className="h-4 w-24 rounded bg-muted" /><div className="h-4 w-20 rounded bg-muted" /><div className="h-4 w-24 rounded bg-muted" /><div className="h-8 w-20 rounded bg-muted" /></div>)}
        {!loading && rows.map((row) => (
          <div key={row.Id} className="grid gap-3 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[1.3fr_1fr_.8fr_.8fr_110px] md:items-center">
            <div><p className="font-semibold">{row.merchant_c}</p><p className="text-xs text-muted-foreground">{row.paymentMethod_c} · {row.note_c || row.Name}</p></div>
            <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{row.category_c}</span>
            <span className="text-sm text-muted-foreground">{formatLocalDate(row.date_c)}</span>
            <span className={row.type_c === 'Income' ? 'font-semibold text-success' : 'font-semibold'}>{row.type_c === 'Income' ? '+' : '-'}₹{Number(row.amount_c).toLocaleString('en-IN')}</span>
            <div className="flex gap-1 md:justify-end">
              <Button variant="ghost" size="icon" onClick={() => { setEditing(row.Id); setForm({...row, amount_c:String(row.amount_c)}); }} aria-label="Edit transaction" className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring"><Pencil size={16} /></Button>
              <Button variant="ghost" size="icon" disabled={deleting === row.Id} onClick={() => remove(row.Id)} aria-label="Delete transaction" className="text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring"><Trash2 size={16} /></Button>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && <div className="py-16 text-center"><ReceiptText className="mx-auto text-primary" size={28} /><p className="mt-4 font-semibold">Nothing matches that view.</p><p className="mt-1 text-sm text-muted-foreground">Try another search or add a new transaction.</p></div>}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between"><div><h2 className="font-heading text-3xl">{editing === 'new' ? 'Add transaction' : 'Edit transaction'}</h2><p className="mt-1 text-sm text-muted-foreground">Keep the details simple; you can always refine them later.</p></div><Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Close" className="hover:bg-accent focus-visible:ring-ring"><X size={18} /></Button></div>
            <form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold">Type<select value={form.type_c} onChange={(e) => setField('type_c', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal focus:outline-none focus:ring-2 focus:ring-ring"><option>Expense</option><option>Income</option></select></label>
              <label className="grid gap-1.5 text-sm font-semibold">Amount<Input required type="number" min="0" step="0.01" value={form.amount_c} onChange={(e) => setField('amount_c', e.target.value)} placeholder="0" className="font-normal focus-visible:ring-ring" /></label>
              <label className="grid gap-1.5 text-sm font-semibold">Merchant<Input required value={form.merchant_c} onChange={(e) => setField('merchant_c', e.target.value)} placeholder="e.g. Campus Cafe" className="font-normal focus-visible:ring-ring" /></label>
              <label className="grid gap-1.5 text-sm font-semibold">Category<select value={form.category_c} onChange={(e) => setField('category_c', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal focus:outline-none focus:ring-2 focus:ring-ring"><option>Food</option><option>Housing</option><option>Transport</option><option>Work</option><option>Personal</option><option>Education</option><option>Health</option><option>Other</option></select></label>
              <label className="grid gap-1.5 text-sm font-semibold">Date<Input required type="date" value={form.date_c} onChange={(e) => setField('date_c', e.target.value)} className="font-normal focus-visible:ring-ring" /></label>
              <label className="grid gap-1.5 text-sm font-semibold">Payment method<select value={form.paymentMethod_c} onChange={(e) => setField('paymentMethod_c', e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal focus:outline-none focus:ring-2 focus:ring-ring"><option>UPI</option><option>Card</option><option>Cash</option><option>Bank Transfer</option><option>Other</option></select></label>
              <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Note<Input value={form.note_c} onChange={(e) => setField('note_c', e.target.value)} placeholder="Optional context" className="font-normal focus-visible:ring-ring" /></label>
              <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setEditing(null)} className="hover:bg-accent focus-visible:ring-ring">Cancel</Button><Button disabled={saving} type="submit" className="focus-visible:ring-ring">{saving ? 'Saving…' : 'Save transaction'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

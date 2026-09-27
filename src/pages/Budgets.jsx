import { useMemo, useState } from 'react';
import { Pencil, Plus, Target, Trash2, X } from 'lucide-react';
import { sdk } from '@/services/sdk';
import { useFetch } from '@/hooks/useFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

async function fetchBudgets() {
  const response = await sdk.table('budgets_c').select(['Id','Name','category_c','month_c','limit_c']).page(1, 50).fetch();
  if (!response?.success) throw new Error(response?.message || 'Could not load budgets.');
  return response.data ?? [];
}

export const route = { path: '/budgets', layout: 'owner' };
export const nav = { label: 'Budgets', to: '/budgets', icon: 'Target', section: 'Planning', order: 3 };

export default function Budgets() {
  const { data, loading, error, run } = useFetch(fetchBudgets, []);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category_c:'Food', month_c:'2026-09-01', limit_c:'' });

  const total = useMemo(() => (data ?? []).reduce((sum, row) => sum + Number(row.limit_c || 0), 0), [data]);

  function openNew() { setEditing('new'); setForm({ category_c:'Food', month_c:'2026-09-01', limit_c:'' }); }
  function openEdit(row) { setEditing(row.Id); setForm({ category_c:row.category_c, month_c:row.month_c, limit_c:String(row.limit_c) }); }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { Name: form.category_c, ...form, limit_c: Number(form.limit_c) };
      const response = editing === 'new' ? await sdk.table('budgets_c').create(payload) : await sdk.table('budgets_c').update({ ...payload, Id: editing });
      if (!response?.success) throw new Error(response?.message || 'Could not save the budget.');
      setEditing(null);
      await run();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this budget?')) return;
    try {
      const response = await sdk.table('budgets_c').remove(id);
      if (!response?.success) throw new Error(response?.message || 'Could not delete the budget.');
      await run();
    } catch (err) { window.alert(err.message); }
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-semibold text-success">Planning</p><h1 className="mt-1 font-heading text-4xl sm:text-5xl">Budgets</h1><p className="mt-2 text-sm text-muted-foreground">Give each important category a ceiling for the month.</p></div>
        <Button onClick={openNew} className="hover:opacity-95 focus-visible:ring-ring"><Plus size={17} /> Add budget</Button>
      </header>

      <div className="rounded-2xl bg-sidebar p-6 text-sidebar-foreground shadow-md">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-sidebar-foreground/70">Planned monthly spend</p><p className="mt-1 font-heading text-4xl">₹{total.toLocaleString('en-IN')}</p></div><span className="grid size-11 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><Target size={21} /></span></div>
        <p className="mt-4 max-w-xl text-sm leading-6 text-sidebar-foreground/70">Budgets are guardrails, not restrictions. Adjust them as your month changes.</p>
      </div>

      {error && <div className="rounded-2xl border border-destructive/30 bg-card p-5"><p className="font-semibold text-destructive">Budgets couldn't load.</p><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button variant="outline" size="sm" onClick={run} className="mt-3 hover:bg-accent focus-visible:ring-ring">Retry</Button></div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading && [1,2,3,4].map((n) => <div key={n} className="h-48 animate-pulse rounded-2xl bg-muted" />)}
        {!loading && (data ?? []).map((row) => (
          <article key={row.Id} className="rounded-2xl border border-border bg-card p-5 shadow-xs transition-transform hover:-translate-y-0.5">
            <div className="flex items-start justify-between"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{row.category_c}</span><div className="flex"><Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit budget" className="hover:bg-accent focus-visible:ring-ring"><Pencil size={15} /></Button><Button variant="ghost" size="icon" onClick={() => remove(row.Id)} aria-label="Delete budget" className="text-destructive hover:bg-destructive/10 focus-visible:ring-ring"><Trash2 size={15} /></Button></div></div>
            <p className="mt-8 font-heading text-3xl">₹{Number(row.limit_c).toLocaleString('en-IN')}</p>
            <p className="mt-1 text-xs text-muted-foreground">monthly limit · {String(row.month_c).slice(0,7)}</p>
            <div className="mt-5 h-2 rounded-full bg-muted"><div className="h-full w-0 rounded-full bg-primary" /></div>
            <p className="mt-2 text-xs text-muted-foreground">Spending progress appears on the overview.</p>
          </article>
        ))}
        {!loading && (data ?? []).length === 0 && <div className="sm:col-span-2 xl:col-span-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center"><Target className="mx-auto text-primary" size={28} /><p className="mt-4 font-semibold">No budgets yet.</p><p className="mt-1 text-sm text-muted-foreground">Create one for the category you want to watch first.</p></div>}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-start justify-between"><div><h2 className="font-heading text-3xl">{editing === 'new' ? 'Add budget' : 'Edit budget'}</h2><p className="mt-1 text-sm text-muted-foreground">Set the amount you want to stay under.</p></div><Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Close" className="hover:bg-accent focus-visible:ring-ring"><X size={18} /></Button></div>
            <form onSubmit={save} className="mt-6 grid gap-4">
              <label className="grid gap-1.5 text-sm font-semibold">Category<select value={form.category_c} onChange={(e) => setForm({...form, category_c:e.target.value})} className="h-10 rounded-md border border-input bg-background px-3 font-normal focus:outline-none focus:ring-2 focus:ring-ring"><option>Food</option><option>Housing</option><option>Transport</option><option>Personal</option><option>Education</option><option>Health</option><option>Other</option></select></label>
              <label className="grid gap-1.5 text-sm font-semibold">Month<Input type="date" value={form.month_c} onChange={(e) => setForm({...form, month_c:e.target.value})} className="font-normal focus-visible:ring-ring" /></label>
              <label className="grid gap-1.5 text-sm font-semibold">Monthly limit<Input required type="number" min="0" step="1" value={form.limit_c} onChange={(e) => setForm({...form, limit_c:e.target.value})} placeholder="5000" className="font-normal focus-visible:ring-ring" /></label>
              <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setEditing(null)} className="hover:bg-accent focus-visible:ring-ring">Cancel</Button><Button disabled={saving} type="submit" className="focus-visible:ring-ring">{saving ? 'Saving…' : 'Save budget'}</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

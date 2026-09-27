import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ReceiptText, ShieldCheck, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const route = { path: '/', layout: 'public', access: 'public' };

export default function Home() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <WalletCards size={20} />
          </span>
          <span className="font-heading text-2xl">Ledgerly</span>
        </div>
        <Button variant="ghost" asChild className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring">
          <Link to="/login">Sign in</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-success-muted px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-success">Personal finance, simplified</p>
            <h1 className="max-w-3xl font-heading text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">Know where your money is going.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Ledgerly turns everyday spending into a clear monthly picture—income, expenses, budgets, and the decisions that matter next.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-sm hover:opacity-95 focus-visible:ring-ring"><Link to="/login">Open my tracker <ArrowRight size={17} /></Link></Button>
              <Button asChild variant="outline" size="lg" className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring"><Link to="/login">View the demo</Link></Button>
            </div>
          </div>
          <div className="relative rounded-[2rem] border border-border bg-card p-6 shadow-lg">
            <div className="absolute -right-3 -top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">September snapshot</div>
            <p className="text-sm text-muted-foreground">Available after planned spending</p>
            <p className="mt-2 font-heading text-5xl">₹18,240</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-success-muted p-4"><p className="text-xs text-muted-foreground">Income</p><p className="mt-1 text-xl font-bold text-success">₹42,000</p></div>
              <div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Spent</p><p className="mt-1 text-xl font-bold">₹24,760</p></div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full w-[59%] rounded-full bg-primary" /></div>
            <p className="mt-2 text-xs text-muted-foreground">59% of this month's income is allocated</p>
          </div>
        </section>
        <section className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { icon: ReceiptText, title: 'Fast capture', text: 'Add an expense or income in seconds, with sensible categories and payment methods.' },
            { icon: BarChart3, title: 'Useful reporting', text: 'See monthly cash flow and category patterns without spreadsheet maintenance.' },
            { icon: ShieldCheck, title: 'Private by design', text: 'Your financial records live behind your account and are separated per user.' }
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-0.5">
              <Icon className="text-primary" size={22} />
              <h2 className="mt-5 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

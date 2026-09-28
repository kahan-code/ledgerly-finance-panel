import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, Menu, Plus, WalletCards, X } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useOwnerLayoutData } from '@/hooks/useOwnerLayoutData';

export default function OwnerLayout() {
  const { user, logout, navGroups, homeRoute, initials, displayName } = useOwnerLayoutData();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:flex min-h-svh flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-6 py-7">
          <NavLink to={homeRoute} className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg">
            <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <WalletCards size={21} />
            </span>
            <span>
              <span className="block font-heading text-2xl">Ledgerly</span>
              <span className="block text-xs text-sidebar-foreground/70">money, made legible</span>
            </span>
          </NavLink>
        </div>
        <nav className="flex-1 px-3 space-y-5" aria-label="Main navigation">
          {navGroups.map((group, index) => (
            <div key={group.label ?? index}>
              {group.label && <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">{group.label}</p>}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => [
                      'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                      isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/75'
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="size-9 rounded-full bg-sidebar-accent grid place-items-center text-sm font-bold text-sidebar-accent-foreground">{initials}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.emailAddress ?? ''}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={logout} className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring">
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0">
        <div className="lg:hidden sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between">
          <NavLink to={homeRoute} className="flex items-center gap-2 font-heading text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
            <WalletCards size={20} />
            Ledgerly
          </NavLink>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="icon" onClick={() => window.dispatchEvent(new CustomEvent('ledgerly:new-transaction'))} aria-label="Add transaction">
              <Plus size={18} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <button aria-label="Close navigation" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <aside className="absolute right-0 top-0 h-full w-[min(86vw,340px)] border-l border-border bg-background p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl">Ledgerly</span>
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19}/></Button>
              </div>
              <nav className="mt-7 space-y-6" aria-label="Mobile navigation">
                {navGroups.map((group, index) => (
                  <div key={group.label ?? index}>
                    {group.label && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{group.label}</p>}
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => [
                          'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold',
                          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                        ].join(' ')}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="absolute inset-x-5 bottom-5 border-t border-border pt-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-muted text-sm font-bold">{initials}</div>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{displayName}</p><p className="truncate text-xs text-muted-foreground">{user?.email ?? ''}</p></div>
                </div>
                <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}><LogOut size={16}/> Sign out</Button>
              </div>
            </aside>
          </div>
        )}
        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

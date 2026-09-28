import { useMemo } from 'react';
import { useAuth } from '@/layouts/RootLayout';
import { APP_CONFIG, GENERIC_AUTH } from '@/config/app.config';

const pageMods = import.meta.glob('/src/pages/**/*.jsx', { eager: true });

const discoveredNavItems = Object.entries(pageMods)
  .filter(([, mod]) => mod.nav)
  .map(([, ,]) => null);

const navItems = Object.entries(pageMods)
  .filter(([, mod]) => mod.nav)
  .map(([, mod]) => ({ ...mod.nav, to: mod.nav.to ?? mod.route?.path }))
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

const footerPages = Object.entries(pageMods)
  .filter(([, mod]) => mod.route && mod.route.layout === 'owner' && mod.route.access !== 'public' && !mod.route.path.includes(':') && !navItems.some((n) => n.to === mod.route.path))
  .map(([, mod]) => mod.route);

export function useOwnerLayoutData() {
  const { logout, user } = useAuth();

  const homeRoute = GENERIC_AUTH?.redirectAfterAuth ?? '/dashboard';

  const visibleNav = useMemo(() => navItems.filter((item) => !item.profiles), []);

  const navGroups = useMemo(() => {
    const groups = [];
    const byLabel = new Map();
    for (const item of visibleNav) {
      const label = item.section ?? null;
      let group = label ? byLabel.get(label) : null;
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
        if (label) byLabel.set(label, group);
      }
      group.items.push(item);
    }
    return groups;
  }, [visibleNav]);

  const email = user?.email ?? user?.emailAddress ?? '';
  const metadata = user?.user_metadata ?? {};
  const firstName = metadata.first_name ?? metadata.firstName ?? '';
  const lastName = metadata.last_name ?? metadata.lastName ?? '';
  const initials = (firstName[0] && lastName[0]
    ? firstName[0] + lastName[0]
    : email.slice(0, 2)
  ).toUpperCase() || APP_CONFIG.name.slice(0, 2).toUpperCase();
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Account';

  return { user, logout, homeRoute, navItems: visibleNav, navGroups, footerPages, initials, displayName, counts: {}, refreshCounts: () => {} };
}

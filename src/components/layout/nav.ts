import type { Session } from '@/lib/session/types';

export type NavIcon =
  'panou' | 'loturi' | 'organizatie' | 'verificari' | 'colectori' | 'taxonomie' | 'activare';

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  /** Numărul afișat ca badge (ex. loturi în coadă). */
  badge?: number;
  /** Activ doar pe potrivire exactă (pentru rădăcini precum /admin). */
  exact?: boolean;
};

export function navFor(session: Session, counts: { verificariInCoada: number }): NavItem[] {
  if (session.rol === 'ADMIN') {
    return [
      { href: '/admin', label: 'Panou', icon: 'panou', exact: true },
      { href: '/admin/verificari', label: 'Verificări', icon: 'verificari', badge: counts.verificariInCoada },
      { href: '/admin/colectori', label: 'Colectori', icon: 'colectori' },
      { href: '/admin/loturi', label: 'Loturi', icon: 'loturi' },
      { href: '/admin/taxonomie', label: 'Taxonomie', icon: 'taxonomie' },
    ];
  }
  if (session.statusCont === 'NEACTIVAT') {
    return [{ href: '/onboarding', label: 'Activare cont', icon: 'activare' }];
  }
  return [
    { href: '/panou', label: 'Panou', icon: 'panou' },
    { href: '/loturi', label: 'Loturi', icon: 'loturi' },
    { href: '/organizatie', label: 'Organizație', icon: 'organizatie' },
  ];
}

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const SEGMENT_LABEL: Record<string, string> = {
  panou: 'Panou',
  loturi: 'Loturi',
  nou: 'Lot nou',
  editare: 'Editare',
  onboarding: 'Activare cont',
  organizatie: 'Organizație',
  cont: 'Cont',
  verificari: 'Coada de verificare',
  colectori: 'Colectori',
  taxonomie: 'Taxonomie',
};

export type Crumb = { label: string; href: string };

/**
 * Breadcrumb din URL: /admin/verificari/LOT-2026-0418 → Coada de verificare › LOT-2026-0418.
 * Segmentul „admin” nu apare; singur, înseamnă panoul admin.
 */
export function breadcrumbsFor(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 1 && parts[0] === 'admin') return [{ label: 'Panou', href: '/admin' }];
  const crumbs: Crumb[] = [];
  parts.forEach((part, i) => {
    if (part === 'admin') return;
    const href = `/${parts.slice(0, i + 1).join('/')}`;
    // ID-urile tehnice ale colectorilor nu spun nimic în breadcrumb; titlul paginii are numele.
    const label =
      parts[i - 1] === 'colectori' ? 'Detaliu colector' : (SEGMENT_LABEL[part] ?? decodeURIComponent(part));
    crumbs.push({ label, href });
  });
  return crumbs;
}

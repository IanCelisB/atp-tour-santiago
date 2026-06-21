import { Activity, Newspaper, Trophy, Users, type LucideIcon } from 'lucide-react';

/**
 * Color tokens supported by `components/NavItem.tsx`.
 *
 * Tailwind's JIT compiler cannot see class names that are concatenated at
 * runtime (e.g. `bg-${color}/20`), so every card must pick a color from this
 * fixed palette — anything else will render with no background or icon tint.
 */
export type MenuColor = 'amber' | 'blue' | 'green' | 'purple';

export interface MenuItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: MenuColor;
}

/**
 * Single source of truth for the homepage navigation grid.
 *
 * Each entry is consumed by `components/HomeMenu.tsx`, which renders one
 * `NavItem` per element. Keeping this as pure data (no JSX, no React
 * component) means it is trivially testable — see `menu-config.test.ts`.
 *
 * The `color` field must be a key of the `COLOR_MAP` inside
 * `components/NavItem.tsx`; the test suite enforces that contract.
 */
export const MENU_ITEMS: readonly MenuItem[] = [
  {
    title: 'Campeonatos',
    description: 'Torneos ATP activos y pasados en Santiago.',
    icon: Trophy,
    href: '/campeonatos',
    color: 'amber',
  },
  {
    title: 'Jugadores',
    description: 'Perfiles, ranking y estadísticas de los tenistas.',
    icon: Users,
    href: '/jugadores',
    color: 'blue',
  },
  {
    title: 'Partido Status',
    description: 'Estado en vivo de cada partido del torneo.',
    icon: Activity,
    href: '/partidos',
    color: 'green',
  },
  {
    title: 'Noticias',
    description: 'Últimas novedades del circuito ATP.',
    icon: Newspaper,
    href: '/noticias',
    color: 'purple',
  },
] as const;
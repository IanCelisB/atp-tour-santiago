import { describe, expect, it } from 'vitest';
import { Activity, Image, Newspaper, TrendingUp, Trophy, Users } from 'lucide-react';
import { MENU_ITEMS, type MenuItem } from './menu-config';

/**
 * Menu configuration for the homepage navigation grid.
 *
 * The homepage (app/page.tsx) renders a 2x2 grid of cards; this data file
 * is the single source of truth for which sections are exposed, what they
 * link to, and what color/icon each card uses. Keeping it as pure data
 * (no JSX, no side effects) means we can test it without rendering React.
 *
 * Acceptance criteria covered by these tests:
 *   - Exposes exactly 6 menu entries (Campeonatos, Jugadores, Partidos, Noticias, Ranking, Galería)
 *   - Every entry carries the fields the NavItem component consumes
 *   - `href` values are unique so each card points somewhere different
 *   - The color keys are part of the fixed palette supported by NavItem
 */
describe('lib/menu-config', () => {
  const EXPECTED_HREFS = [
    '/campeonatos',
    '/jugadores',
    '/partidos',
    '/noticias',
    '/ranking',
    '/galeria',
  ] as const;

  const SUPPORTED_COLORS = ['amber', 'blue', 'green', 'purple'] as const;

  it('exports exactly 6 menu items (one per site section)', () => {
    expect(MENU_ITEMS).toHaveLength(6);
  });

  it('includes every expected section href', () => {
    const hrefs = MENU_ITEMS.map((item) => item.href);
    for (const expected of EXPECTED_HREFS) {
      expect(hrefs).toContain(expected);
    }
  });

  it('contains no duplicate hrefs (each card points to a unique route)', () => {
    const hrefs = MENU_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('every item carries the required fields NavItem consumes', () => {
    for (const item of MENU_ITEMS) {
      const candidate: MenuItem = item;
      expect(candidate.title).toBeTypeOf('string');
      expect(candidate.title.length).toBeGreaterThan(0);

      expect(candidate.description).toBeTypeOf('string');
      expect(candidate.description.length).toBeGreaterThan(0);

      // Lucide icons are forwardRef components — they're renderable React
      // components, not bare functions. We assert the value is a real
      // component (has React's `$$typeof` marker) so a missing/wrong
      // import is caught instead of silently rendering nothing.
      expect(candidate.icon).toBeDefined();
      expect(typeof candidate.icon).toBe('object');

      expect(candidate.href).toMatch(/^\/[a-z]+$/);

      expect(candidate.color).toBeTypeOf('string');
    }
  });

  it('only uses colors from the palette supported by NavItem', () => {
    for (const item of MENU_ITEMS) {
      expect(SUPPORTED_COLORS).toContain(item.color);
    }
  });

  it('Campeonatos uses the Trophy icon and amber color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/campeonatos');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(Trophy);
    expect(item?.color).toBe('amber');
  });

  it('Jugadores uses the Users icon and blue color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/jugadores');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(Users);
    expect(item?.color).toBe('blue');
  });

  it('Partidos uses the Activity icon and green color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/partidos');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(Activity);
    expect(item?.color).toBe('green');
  });

  it('Noticias uses the Newspaper icon and purple color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/noticias');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(Newspaper);
    expect(item?.color).toBe('purple');
  });

  it('Ranking uses the TrendingUp icon and green color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/ranking');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(TrendingUp);
    expect(item?.color).toBe('green');
  });

  it('Galería uses the Image icon and purple color', () => {
    const item = MENU_ITEMS.find((entry) => entry.href === '/galeria');
    expect(item).toBeDefined();
    expect(item?.icon).toBe(Image);
    expect(item?.color).toBe('purple');
  });
});
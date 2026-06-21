"use client";

import { NavItem } from "@/components/NavItem";
import { MENU_ITEMS } from "@/lib/menu-config";

/**
 * Homepage navigation grid.
 *
 * Renders one `NavItem` per entry of `MENU_ITEMS` in a responsive grid
 * (single column on mobile, two columns on `sm`). Each card fades in
 * with a staggered delay (0 / 100 / 200 / 300 ms) so the four sections
 * appear in sequence rather than all at once.
 *
 * The animation class and per-card delay live on the wrapper here, not
 * on `NavItem` itself, so the component stays presentation-only and
 * can be reused without inheriting the homepage's entrance animation.
 */
const STAGGER_MS = 100;

export function HomeMenu() {
  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
      {MENU_ITEMS.map((item, index) => (
        <div
          key={item.href}
          className="animate-fade-up"
          style={{ animationDelay: `${index * STAGGER_MS}ms` }}
        >
          <NavItem
            title={item.title}
            description={item.description}
            icon={item.icon}
            href={item.href}
            color={item.color}
          />
        </div>
      ))}
    </div>
  );
}
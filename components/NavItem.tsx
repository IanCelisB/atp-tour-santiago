"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { type MenuColor } from "@/lib/menu-config";

/**
 * Explicit color palette for navigation cards.
 *
 * Tailwind's JIT compiler scans for class names as literal strings; any
 * class assembled at runtime (e.g. `bg-${color}/20` or even
 * `group-hover:${something}`) is invisible to the scanner and silently
 * produces no CSS — which is why every dynamic color previously rendered
 * without background, glow or shadow.
 *
 * Every entry below is a COMPLETE literal class string (no concatenation
 * with the `color` variable at the call site). Adding a new color means
 * appending an entry here AND extending the `MenuColor` union in
 * `lib/menu-config.ts`; the test suite for menu-config enforces that
 * the two stay in sync.
 */
const COLOR_MAP: Record<
  MenuColor,
  {
    /** Icon container: resting background. */
    iconBg: string;
    /** Icon container: hover background (`group-hover:`). */
    iconBgHover: string;
    /** Icon stroke color. */
    iconText: string;
    /** Decorative glow blob: resting background. */
    glowBg: string;
    /** Decorative glow blob: hover background (`group-hover:`). */
    glowBgHover: string;
    /** Card-level hover shadow (`hover:shadow-…`). */
    cardHoverShadow: string;
    /** Icon-level hover shadow (`group-hover:shadow-…`). */
    iconHoverShadow: string;
  }
> = {
  amber: {
    iconBg: "bg-amber-500/10",
    iconBgHover: "group-hover:bg-amber-500/20",
    iconText: "text-amber-500",
    glowBg: "bg-amber-500/20",
    glowBgHover: "group-hover:bg-amber-500/30",
    cardHoverShadow: "hover:shadow-amber-500/25",
    iconHoverShadow: "group-hover:shadow-amber-500/25",
  },
  blue: {
    iconBg: "bg-blue-500/10",
    iconBgHover: "group-hover:bg-blue-500/20",
    iconText: "text-blue-500",
    glowBg: "bg-blue-500/20",
    glowBgHover: "group-hover:bg-blue-500/30",
    cardHoverShadow: "hover:shadow-blue-500/25",
    iconHoverShadow: "group-hover:shadow-blue-500/25",
  },
  green: {
    iconBg: "bg-green-500/10",
    iconBgHover: "group-hover:bg-green-500/20",
    iconText: "text-green-500",
    glowBg: "bg-green-500/20",
    glowBgHover: "group-hover:bg-green-500/30",
    cardHoverShadow: "hover:shadow-green-500/25",
    iconHoverShadow: "group-hover:shadow-green-500/25",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconBgHover: "group-hover:bg-purple-500/20",
    iconText: "text-purple-500",
    glowBg: "bg-purple-500/20",
    glowBgHover: "group-hover:bg-purple-500/30",
    cardHoverShadow: "hover:shadow-purple-500/25",
    iconHoverShadow: "group-hover:shadow-purple-500/25",
  },
};

interface NavItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: MenuColor;
  delay?: number;
}

export function NavItem({
  title,
  description,
  icon: Icon,
  href,
  color,
  delay = 0,
}: NavItemProps) {
  const palette = COLOR_MAP[color];

  return (
    <Link href={href} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl ${palette.cardHoverShadow}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Glow effect */}
        <div
          className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${palette.glowBg} blur-3xl transition-all duration-700 group-hover:scale-150 ${palette.glowBgHover}`}
        />

        {/* Icon */}
        <div
          className={`relative mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText} transition-all duration-500 group-hover:scale-110 ${palette.iconBgHover} group-hover:shadow-lg ${palette.iconHoverShadow}`}
        >
          <Icon className="h-7 w-7" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h3 className="relative mb-2 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-white">
          {title}
        </h3>
        <p className="relative text-sm leading-relaxed text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
          {description}
        </p>

        {/* Arrow */}
        <div className="relative mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-all duration-300 group-hover:text-white">
          <span>Ver más</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
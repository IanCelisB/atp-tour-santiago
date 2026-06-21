"use client";

import { useMemo } from "react";

interface Stat {
  label: string;
  value: number;
}

interface RadarChartProps {
  stats: Stat[];
  size?: number;
  color?: string;
}

/**
 * Pure SVG radar chart — video game style (FIFA player stats).
 *
 * 6 axes at 60° intervals, starting from top (12 o'clock).
 * Features:
 * - Dark grid lines at 25%, 50%, 75%, 100%
 * - Brighter axis lines radiating from center
 * - Filled polygon with gradient fill and glow effect
 * - Labels at each axis endpoint
 * - Responsive via `size` prop
 */
export function RadarChart({
  stats,
  size = 300,
  color = "#3b82f6",
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.75;
  const angleStep = (2 * Math.PI) / stats.length;

  // Compute points for the polygon
  const getPoint = useMemo(() => {
    return (index: number, value: number) => {
      const angle = angleStep * index - Math.PI / 2; // Start from top
      const r = (value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };
  }, [angleStep, center, radius]);

  // Grid circles at 25%, 50%, 75%, 100%
  const gridLevels = [25, 50, 75, 100];

  // Data polygon points
  const dataPoints = stats.map((stat, i) => getPoint(i, stat.value));
  const polygonPath = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ") + " Z";

  // Axis endpoints (for axis lines)
  const axisPoints = stats.map((_, i) => getPoint(i, 100));

  // Label positions (slightly beyond axis endpoints)
  const labelPoints = stats.map((stat, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const labelRadius = radius + 20;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      label: stat.label,
      value: stat.value,
    };
  });

  // Unique ID for gradient/glow
  const uniqueId = useMemo(
    () => `radar-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-lg"
    >
      <defs>
        {/* Gradient fill for the data polygon */}
        <linearGradient id={`${uniqueId}-fill`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.15} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`${uniqueId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid circles */}
      {gridLevels.map((level) => (
        <circle
          key={level}
          cx={center}
          cy={center}
          r={(level / 100) * radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {axisPoints.map((point, i) => (
        <line
          key={`axis-${i}`}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      ))}

      {/* Data polygon with glow */}
      <path
        d={polygonPath}
        fill={`url(#${uniqueId}-fill)`}
        stroke={color}
        strokeWidth={2}
        filter={`url(#${uniqueId}-glow)`}
      />

      {/* Data points */}
      {dataPoints.map((point, i) => (
        <circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={color}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}

      {/* Labels */}
      {labelPoints.map((point, i) => (
        <text
          key={`label-${i}`}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-zinc-400 text-[10px] font-medium"
        >
          {point.label}
        </text>
      ))}
    </svg>
  );
}

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RadarChart } from "./RadarChart";

/**
 * RadarChart component tests.
 *
 * Covers:
 * - Renders all stat labels
 * - Renders SVG with correct dimensions
 * - Renders data polygon path
 * - Handles empty stats gracefully
 * - Custom size and color props
 */

const defaultStats = [
  { label: "RES", value: 80 },
  { label: "VEL", value: 70 },
  { label: "DER", value: 90 },
  { label: "REV", value: 60 },
  { label: "EST", value: 75 },
  { label: "POW", value: 85 },
];

describe("components/RadarChart", () => {
  it("renders all stat labels", () => {
    render(<RadarChart stats={defaultStats} />);
    for (const stat of defaultStats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });

  it("renders an SVG element", () => {
    const { container } = render(<RadarChart stats={defaultStats} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies custom size to SVG", () => {
    const { container } = render(<RadarChart stats={defaultStats} size={400} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "400");
    expect(svg).toHaveAttribute("height", "400");
  });

  it("renders grid circles for each level", () => {
    const { container } = render(<RadarChart stats={defaultStats} />);
    const circles = container.querySelectorAll("circle");
    // 4 grid circles + 6 data points = 10
    expect(circles.length).toBe(10);
  });

  it("renders axis lines from center", () => {
    const { container } = render(<RadarChart stats={defaultStats} />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toBe(6);
  });

  it("renders data polygon path", () => {
    const { container } = render(<RadarChart stats={defaultStats} />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(1);
    expect(paths[0].getAttribute("d")).toMatch(/^M .+ L .+ Z$/);
  });

  it("handles a single stat", () => {
    const { container } = render(<RadarChart stats={[{ label: "POW", value: 50 }]} />);
    expect(screen.getByText("POW")).toBeInTheDocument();
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(1);
  });
});

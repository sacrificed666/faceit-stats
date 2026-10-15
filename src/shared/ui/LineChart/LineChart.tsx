"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

import { cx } from "@/shared/lib/cx";
import { position, type Scale } from "@/shared/lib/scale";

import LocalDate from "../LocalDate/LocalDate";

import styles from "./LineChart.module.scss";

export type SeriesTone = "data" | "context";

export interface ChartSeries {
  id: string;
  label: string;
  tone: SeriesTone;
  values: ReadonlyArray<number | null>;
}

export interface ChartPoint {
  key: string;
  label: string;
  detail?: string;
  timestamp?: number;
}

interface LineChartProps {
  label: string;
  series: readonly ChartSeries[];
  points: readonly ChartPoint[];
  scale: Scale;
  format: (value: number) => string;
  reference?: { value: number; label: string } | null;
  height?: number;
}

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 100;

const TONES: Record<SeriesTone, { stroke: string; width: number; dot: string }> = {
  data: { stroke: "var(--data)", width: 2, dot: cx(styles.data, "mark") },
  context: { stroke: "var(--data-muted)", width: 1.5, dot: cx(styles.context, "mark-muted") },
};

// Horizontal position of a point, from 0 to 1
const xRatio = (index: number, count: number): number => (count <= 1 ? 0.5 : index / (count - 1));

// An SVG path through the values, with gaps where a value is missing
const linePath = (values: ReadonlyArray<number | null>, count: number, domain: [number, number]): string => {
  let path = "";
  let drawing = false;
  values.forEach((value, index) => {
    if (value === null) {
      drawing = false;
      return;
    }
    const x = xRatio(index, count) * VIEW_WIDTH;
    const y = (1 - position(value, domain)) * VIEW_HEIGHT;
    path += `${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    drawing = true;
  });
  return path;
};

// The line sample of a legend entry
const LineKey = ({ tone }: { tone: SeriesTone | "reference" }) => {
  if (tone === "reference") {
    return <span aria-hidden="true" className={styles.referenceKey} />;
  }
  return <span aria-hidden="true" className={cx(styles.key, TONES[tone].dot)} />;
};

// A label under the chart, as a date when the point has a time
const AxisLabel = ({ point, align = "start" }: { point: ChartPoint; align?: "start" | "end" }) => {
  const className = cx(styles.axisLabel, align === "end" && styles.axisEnd);
  return point.timestamp === undefined ? (
    <span className={className}>{point.label}</span>
  ) : (
    <LocalDate timestamp={point.timestamp} className={className} />
  );
};

// Legend of the series and the reference line
export const ChartLegend = ({
  series,
  reference,
}: {
  series: ReadonlyArray<{ id: string; label: string; tone: SeriesTone }>;
  reference?: string | null;
}) => (
  <ul className={styles.legend}>
    {series.map((entry) => (
      <li key={entry.id} className={styles.legendItem}>
        <LineKey tone={entry.tone} />
        {entry.label}
      </li>
    ))}
    {reference ? (
      <li className={styles.legendItem}>
        <LineKey tone="reference" />
        {reference}
      </li>
    ) : null}
  </ul>
);

// SVG line chart with a crosshair, a readout above the plot and a keyboard slider
const LineChart = ({ label, series, points, scale, format, reference = null, height = 220 }: LineChartProps) => {
  const [active, setActive] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const count = points.length;
  const last = Math.max(count - 1, 0);
  const { domain, ticks } = scale;

  // A reading picked by touch stays until the next touch somewhere else
  useEffect(() => {
    if (active === null) return;
    // Clears the reading when a touch lands outside the plot
    const dismiss = (event: globalThis.PointerEvent): void => {
      const inside = event.target instanceof Node && plotRef.current?.contains(event.target);
      if (event.pointerType === "touch" && !inside) setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  // Moves the crosshair to the match nearest to the pointer
  const onPointer = (event: PointerEvent<HTMLDivElement>): void => {
    if (count === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
    setActive(Math.min(Math.max(Math.round(ratio * last), 0), last));
  };

  // The spoken value of every series at one match
  const describe = (index: number): string => {
    const target = points[index];
    if (!target) return "";
    const values = series.flatMap((entry) => {
      const value = entry.values[index] ?? null;
      return value === null ? [] : [`${entry.label} ${format(value)}`];
    });
    return `${target.label}${target.detail ? `, ${target.detail}` : ""}: ${values.join(", ")}`;
  };

  const point = active === null ? null : points[active];
  const first = points[0];
  const final = points[count - 1];
  const left = active === null ? 0 : xRatio(active, count) * 100;
  const readings = series.flatMap((entry) => {
    const value = active === null ? null : (entry.values[active] ?? null);
    return value === null ? [] : [{ entry, value }];
  });
  const readoutAlign = left < 18 ? styles.alignStart : left > 82 ? styles.alignEnd : undefined;

  return (
    <figure className={styles.chart}>
      <div className={styles.grid}>
        <div aria-hidden="true" className={styles.ticks} style={{ height }}>
          {ticks.map((tick) => (
            <span key={tick} className={styles.tick} style={{ top: `${(1 - position(tick, domain)) * 100}%` }}>
              {format(tick)}
            </span>
          ))}
        </div>
        <div className={styles.area} style={{ height }}>
          <input
            type="range"
            min={0}
            max={last}
            step={1}
            value={active ?? last}
            disabled={count === 0}
            aria-label={label}
            aria-valuetext={describe(active ?? last)}
            onChange={(event) => setActive(Number(event.target.value))}
            onFocus={() => setActive((current) => current ?? last)}
            onBlur={() => setActive(null)}
            className={styles.slider}
          />
          <div
            ref={plotRef}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(event) => {
              if (event.pointerType !== "touch") setActive(null);
            }}
            className={styles.plot}
          >
            <svg
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              className={styles.svg}
            >
              {ticks.map((tick) => {
                const y = (1 - position(tick, domain)) * VIEW_HEIGHT;
                return (
                  <line
                    key={tick}
                    x1={0}
                    x2={VIEW_WIDTH}
                    y1={y}
                    y2={y}
                    stroke={tick === domain[0] ? "var(--axis)" : "var(--grid)"}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {reference ? (
                <line
                  x1={0}
                  x2={VIEW_WIDTH}
                  y1={(1 - position(reference.value, domain)) * VIEW_HEIGHT}
                  y2={(1 - position(reference.value, domain)) * VIEW_HEIGHT}
                  stroke="var(--ink-muted)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {series.map((entry) => (
                <path
                  key={entry.id}
                  d={linePath(entry.values, count, domain)}
                  fill="none"
                  stroke={TONES[entry.tone].stroke}
                  strokeWidth={TONES[entry.tone].width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {count === 1 && !point
              ? series.flatMap((entry) => {
                  const value = entry.values[0] ?? null;
                  return value === null
                    ? []
                    : [
                        <span
                          key={entry.id}
                          aria-hidden="true"
                          className={cx(styles.dot, styles.single, TONES[entry.tone].dot)}
                          style={{ top: `${(1 - position(value, domain)) * 100}%` }}
                        />,
                      ];
                })
              : null}
            {point ? (
              <>
                <div aria-hidden="true" className={styles.crosshair} style={{ left: `${left}%` }} />
                {readings.map(({ entry, value }) => (
                  <span
                    key={entry.id}
                    aria-hidden="true"
                    className={cx(styles.dot, TONES[entry.tone].dot)}
                    style={{ left: `${left}%`, top: `${(1 - position(value, domain)) * 100}%` }}
                  />
                ))}
                <div aria-hidden="true" className={cx(styles.readout, readoutAlign)} style={{ left: `${left}%` }}>
                  <p className={styles.point}>
                    {point.label}
                    {point.detail ? <span className={styles.detail}> · {point.detail}</span> : null}
                  </p>
                  <ul className={styles.readings}>
                    {readings.map(({ entry, value }) => (
                      <li key={entry.id} className={styles.reading}>
                        <LineKey tone={entry.tone} />
                        {format(value)}
                      </li>
                    ))}
                    {reference ? (
                      <li className={styles.referenceReading}>
                        <LineKey tone="reference" />
                        {format(reference.value)}
                      </li>
                    ) : null}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <span />
        <div aria-hidden="true" className={styles.axis}>
          {first ? <AxisLabel point={first} /> : null}
          {count > 1 && final ? <AxisLabel point={final} align="end" /> : null}
        </div>
      </div>
    </figure>
  );
};

export default LineChart;

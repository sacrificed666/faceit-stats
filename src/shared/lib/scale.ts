export interface Scale {
  domain: [number, number];
  ticks: number[];
}

const STEPS = [1, 2, 2.5, 5, 10];

// Decimal places of a step, so ticks print without float noise
const decimals = (step: number): number => {
  const text = String(step);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
};

// A chart scale with round ticks that covers every value
export const niceScale = (values: readonly number[], count = 4, includeZero = true): Scale => {
  const finite = values.filter((value) => Number.isFinite(value));
  let min = includeZero ? 0 : Math.min(...finite);
  let max = Math.max(...finite);
  if (finite.length === 0) {
    min = 0;
    max = 1;
  }
  if (max === min) max = min + 1;
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = (STEPS.find((candidate) => candidate * magnitude >= raw) ?? 10) * magnitude;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const precision = decimals(Number(step.toPrecision(12)));
  const ticks: number[] = [];
  for (let tick = start; tick <= end + step / 2; tick += step) ticks.push(Number(tick.toFixed(precision)));
  return { domain: [Number(start.toFixed(precision)), Number(end.toFixed(precision))], ticks };
};

// Where a value sits between the ends of a domain, from 0 to 1
export const position = (value: number, [min, max]: [number, number]): number =>
  max === min ? 0.5 : (value - min) / (max - min);

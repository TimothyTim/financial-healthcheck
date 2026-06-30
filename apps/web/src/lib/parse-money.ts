export function parsePoundsToPence(value: string): number {
  const normalized = value.trim().replace(/,/g, "");
  const pounds = Number(normalized);

  if (!Number.isFinite(pounds)) {
    return Number.NaN;
  }

  return Math.round(pounds * 100);
}

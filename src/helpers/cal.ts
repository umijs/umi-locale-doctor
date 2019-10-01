export function toPercent(total: number, current: number) {
  return ((100 * current) / total).toFixed(1)
}

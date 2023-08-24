export function capitalize(v: string): string {
  return v
    .split('_')
    .map((s, i) => (i === 0 ? s : s.at(0)?.toUpperCase() + s.slice(1)))
    .join('')
}

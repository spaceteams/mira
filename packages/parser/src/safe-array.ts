export function safeArray<T>(v: T[] | T | undefined): T[] {
  if (v === undefined) {
    return []
  }
  if (Array.isArray(v)) {
    return v
  }
  return [v]
}

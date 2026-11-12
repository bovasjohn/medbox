// Turns a list of previously used values into suggestions:
// most used first, then alphabetical, ignoring case and empty values.
// "extra" values are offered too (when they have not been used yet).
export function suggest(values, extra = []) {
  const found = new Map()
  for (const value of values) {
    const text = String(value ?? '').trim()
    if (!text) continue
    const key = text.toLowerCase()
    const entry = found.get(key) ?? { text, count: 0 }
    entry.count++
    found.set(key, entry)
  }
  for (const value of extra) {
    const text = String(value ?? '').trim()
    if (text && !found.has(text.toLowerCase())) found.set(text.toLowerCase(), { text, count: 0 })
  }
  return [...found.values()]
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text))
    .slice(0, 60)
    .map((entry) => entry.text)
}

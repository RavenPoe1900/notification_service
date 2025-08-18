export function chunk<T>(arr: T[], size = 50): T[][] {
  return Array(Math.ceil(arr.length / size))
    .fill(null)
    .map((_, i) => arr.slice(i * size, i * size + size));
}
export function getBasePrice(qty: number): number {
  if (qty >= 100) return 2.00
  if (qty >= 50)  return 2.25
  return 2.75
}

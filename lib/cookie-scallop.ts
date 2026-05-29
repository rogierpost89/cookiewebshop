/**
 * Generates an SVG path string for a scalloped disc (round cookie shape).
 * cx/cy = centre, R = radius to scallop centres, r = scallop radius, N = count.
 */
export function scallopPath(
  cx: number,
  cy: number,
  R: number,
  r: number,
  N: number
): string {
  const valleys: [number, number][] = []

  for (let i = 0; i < N; i++) {
    const a1 = (2 * Math.PI * i) / N - Math.PI / 2
    const a2 = (2 * Math.PI * (i + 1)) / N - Math.PI / 2
    const c1x = cx + R * Math.cos(a1)
    const c1y = cy + R * Math.sin(a1)
    const c2x = cx + R * Math.cos(a2)
    const c2y = cy + R * Math.sin(a2)
    const mx = (c1x + c2x) / 2
    const my = (c1y + c2y) / 2
    const d = Math.sqrt((c2x - c1x) ** 2 + (c2y - c1y) ** 2)

    if (d >= 2 * r) {
      const ang = Math.atan2(my - cy, mx - cx)
      valleys.push([cx + (R - r) * Math.cos(ang), cy + (R - r) * Math.sin(ang)])
    } else {
      const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2))
      const dx = (c2x - c1x) / d
      const dy = (c2y - c1y) / d
      const ix1 = mx + h * dy
      const iy1 = my - h * dx
      const ix2 = mx - h * dy
      const iy2 = my + h * dx
      const d1 = Math.sqrt((ix1 - cx) ** 2 + (iy1 - cy) ** 2)
      const d2 = Math.sqrt((ix2 - cx) ** 2 + (iy2 - cy) ** 2)
      valleys.push(d1 < d2 ? [ix1, iy1] : [ix2, iy2])
    }
  }

  let path = ''
  for (let i = 0; i < N; i++) {
    const [vx, vy] = valleys[i]
    const [nx, ny] = valleys[(i + 1) % N]
    if (i === 0) path += `M ${vx.toFixed(2)} ${vy.toFixed(2)} `
    path += `A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${nx.toFixed(2)} ${ny.toFixed(2)} `
  }
  return path + 'Z'
}

/** Map icing hex colour → darker debossed text colour */
export const ICING_TEXT_COLORS: Record<string, string> = {
  '#F5F0E8': '#B09878',
  '#F5E080': '#A08830',
  '#FFAEC0': '#A85060',
  '#A8C8E0': '#507898',
}

/** Colour used in the SVG filter fallback when icing colour is unknown */
export const FALLBACK_TEXT_COLOR = '#888888'

import 'server-only'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { scallopPath, ICING_TEXT_COLORS, FALLBACK_TEXT_COLOR } from './cookie-scallop'

const FONT_PATH = path.join(process.cwd(), 'public', 'fonts', 'CutiveMono-Regular.ttf')

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildCookieSvg(color: string, line1: string, line2: string): string {
  const textColor = ICING_TEXT_COLORS[color] ?? FALLBACK_TEXT_COLOR
  const CX = 200, CY = 200

  const basePath = scallopPath(CX, CY, 160, 23.5, 22)
  const icingPath = scallopPath(CX, CY, 143, 21, 22)

  return `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="42%" cy="36%" r="62%">
      <stop offset="0%" stop-color="#ECC870"/>
      <stop offset="60%" stop-color="#C89040"/>
      <stop offset="100%" stop-color="#A06820"/>
    </radialGradient>
    <filter id="shadow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#7A4818" flood-opacity="0.28"/>
    </filter>
    <filter id="deboss" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur"/>
      <feOffset dx="0" dy="2.5" in="blur" result="sh"/>
      <feFlood flood-color="rgba(0,0,0,0.22)" result="col"/>
      <feComposite in="col" in2="sh" operator="in" result="cs"/>
      <feMerge><feMergeNode in="cs"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="204" cy="388" rx="130" ry="14" fill="rgba(80,40,10,0.12)"/>
  <path d="${basePath}" fill="url(#bg)" filter="url(#shadow)"/>
  <path d="${icingPath}" fill="${escapeXml(color)}"/>
  <ellipse cx="168" cy="168" rx="50" ry="30" fill="rgba(255,255,255,0.20)" transform="rotate(-28,168,168)"/>
  <g filter="url(#deboss)" font-family="Cutive Mono">
    <text x="200" y="190" text-anchor="middle" font-size="52" fill="${textColor}">${escapeXml(line1)}</text>
    <text x="200" y="238" text-anchor="middle" font-size="24" letter-spacing="4" fill="${textColor}">${escapeXml(line2.toUpperCase())}</text>
  </g>
</svg>`
}

export async function generateCookiePreviewPng(params: {
  color: string
  line1: string
  line2: string
}): Promise<string | null> {
  try {
    const svg = buildCookieSvg(params.color, params.line1, params.line2)
    const resvg = new Resvg(svg, {
      font: { fontFiles: [FONT_PATH], loadSystemFonts: false },
      fitTo: { mode: 'width', value: 400 },
    })
    const png = resvg.render().asPng()
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (err) {
    console.error('[cookie-image] PNG generation failed:', err)
    return null
  }
}

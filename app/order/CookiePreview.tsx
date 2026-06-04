'use client'

const COLOR_TO_FILE: Record<string, string> = {
  pink:   'pinkcookienoname',
  blue:   'bluecookienoname',
  white:  'ivorycookienoname',
  yellow: 'ivorycookienoname',
  custom: 'ivorycookienoname',
}

const TEXT_COLOR: Record<string, string> = {
  pink:   '#C46480',
  blue:   '#507898',
  white:  '#B09878',
  yellow: '#B09878',
  custom: '#B09878',
}

interface CookiePreviewProps {
  colorKey: string
  line1: string
  line2: string
}

export default function CookiePreview({ colorKey, line1, line2 }: CookiePreviewProps) {
  const filename = COLOR_TO_FILE[colorKey] ?? 'Ivory_cookie'
  const textColor = TEXT_COLOR[colorKey] ?? '#B09878'
  const hasText = line1 || line2

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/cookies/${filename}.png`}
        alt="Cookie preview"
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.08))' }}
      />
      {hasText && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingTop: '8%' }}
        >
          {line1 && (
            <span
              style={{
                fontFamily: 'var(--font-cutive-mono), monospace',
                fontSize: `${Math.max(0.6, 1.05 - line1.length * 0.032)}rem`,
                color: textColor,
                letterSpacing: '0.06em',
                textShadow: '0 1px 2px rgba(0,0,0,0.12), 0 -1px 0 rgba(255,255,255,0.15)',
                display: 'block',
                textAlign: 'center',
              }}
            >
              {line1}
            </span>
          )}
          {line2 && (
            <span
              style={{
                fontFamily: 'var(--font-cutive-mono), monospace',
                fontSize: '0.52rem',
                color: textColor,
                letterSpacing: '0.14em',
                textShadow: '0 1px 1px rgba(0,0,0,0.1), 0 -1px 0 rgba(255,255,255,0.1)',
                display: 'block',
                textAlign: 'center',
                marginTop: '0.2rem',
              }}
            >
              {line2.toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

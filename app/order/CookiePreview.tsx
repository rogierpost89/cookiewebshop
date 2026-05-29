'use client'

import { useEffect, useRef } from 'react'
import { scallopPath, ICING_TEXT_COLORS, FALLBACK_TEXT_COLOR } from '@/lib/cookie-scallop'

interface CookiePreviewProps {
  color: string
  line1: string
  line2: string
}

const CX = 110, CY = 110

export default function CookiePreview({ color, line1, line2 }: CookiePreviewProps) {
  const baseRef = useRef<SVGPathElement>(null)
  const icingRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (baseRef.current) {
      baseRef.current.setAttribute('d', scallopPath(CX, CY, 88, 13, 22))
    }
    if (icingRef.current) {
      icingRef.current.setAttribute('d', scallopPath(CX, CY, 79, 11.5, 22))
    }
  }, [])

  const textColor = ICING_TEXT_COLORS[color] ?? FALLBACK_TEXT_COLOR

  return (
    <svg
      viewBox="0 0 220 220"
      className="w-full max-w-[200px]"
      aria-label={`Cookie preview: ${line1} ${line2}`}
    >
      <defs>
        <radialGradient id="cp-base" cx="42%" cy="36%" r="62%">
          <stop offset="0%" stopColor="#ECC870" />
          <stop offset="60%" stopColor="#C89040" />
          <stop offset="100%" stopColor="#A06820" />
        </radialGradient>
        <filter id="cp-shadow">
          <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#7A4818" floodOpacity="0.28" />
        </filter>
        <filter id="cp-deboss">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.7" result="blur" />
          <feOffset dx="0" dy="1.5" in="blur" result="shadow" />
          <feFlood floodColor="rgba(0,0,0,0.2)" result="color" />
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow" />
          <feMerge>
            <feMergeNode in="coloredShadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="112" cy="207" rx="72" ry="8" fill="rgba(80,40,10,0.11)" />
      <path ref={baseRef} fill="url(#cp-base)" filter="url(#cp-shadow)" />
      <path ref={icingRef} fill={color} />
      <ellipse
        cx="90" cy="88" rx="28" ry="16"
        fill="rgba(255,255,255,0.20)"
        transform="rotate(-28,90,88)"
      />

      <g filter="url(#cp-deboss)">
        <text
          x="110" y="103"
          textAnchor="middle"
          fontFamily="var(--font-cutive-mono), monospace"
          fontSize="12"
          letterSpacing="2"
          fill={textColor}
        >
          {line1.toUpperCase()}
        </text>
        <text
          x="110" y="138"
          textAnchor="middle"
          fontFamily="var(--font-cutive-mono), monospace"
          fontSize="28"
          fill={textColor}
        >
          {line2}
        </text>
      </g>
    </svg>
  )
}

import React from "react"

export function Logo({ className = "h-6 w-6", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary, #8b5cf6)" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      {/* Primary Growth Line */}
      <path
        d="M4 18L10 12L14 16L20 8"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Glowing terminal node dot */}
      <circle cx="20" cy="8" r="2" fill="url(#logo-grad)" />
      {/* Secondary background growth line */}
      <path
        d="M4 8L10 14L14 10L20 16"
        stroke="url(#logo-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.3"
      />
    </svg>
  )
}

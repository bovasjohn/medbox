// Same artwork as public/icon.svg, inlined so it themes and loads instantly.
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#356AE6" />
      <path
        d="M216 120h80a16 16 0 0 1 16 16v64h64a16 16 0 0 1 16 16v80a16 16 0 0 1-16 16h-64v64a16 16 0 0 1-16 16h-80a16 16 0 0 1-16-16v-64h-64a16 16 0 0 1-16-16v-80a16 16 0 0 1 16-16h64v-64a16 16 0 0 1 16-16z"
        fill="#fff"
      />
      <circle cx="378" cy="378" r="68" fill="#20A66B" />
      <path
        d="M348 380l22 22 42-46"
        stroke="#fff"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

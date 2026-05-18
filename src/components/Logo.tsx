/**
 * KejaLink brand logo components.
 *
 * Both components use inline SVG so the mark is:
 *   - Rendered immediately with zero network requests
 *   - Scalable to any size without quality loss
 *   - Themeable via CSS (colour variables apply to surrounding elements)
 *
 * The SVG paths are derived from the official KejaLink brand guide (Nguvu Group, 2026).
 * Do not modify the paths without consulting the brand guidelines.
 */

interface LogoProps {
  /** Rendered pixel size (width = height). Default: 32 */
  size?: number
  className?: string
}

/**
 * Icon mark only — the house with interlinked chain rings and cyan roof node.
 * Use in compact spaces: navbars, favicons, mobile headers.
 */
export function KejaLinkIcon({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role="img"
      aria-label="KejaLink icon"
      className={className}
    >
      {/* House body */}
      <path d="M24 2L1 20H6.5V46H41.5V20H47L24 2Z" fill="#00CE92" />
      {/* Door background */}
      <rect x="14.5" y="27" width="19" height="19" rx="2" fill="#0A0F1E" />
      {/* Chain link rings — interlocked effect */}
      <circle cx="30.5" cy="36.5" r="7.5" fill="none" stroke="#00CE92" strokeWidth="2.5" />
      <rect x="23" y="36.5" width="8.5" height="8" fill="#0A0F1E" />
      <circle cx="17.5" cy="36.5" r="7.5" fill="none" stroke="#00CE92" strokeWidth="2.5" />
      <rect x="23" y="28.5" width="8.5" height="8" fill="#0A0F1E" />
      <path d="M23,28.7 A7.5,7.5,0,0,1,23,44.3" fill="none" stroke="#00CE92" strokeWidth="2.5" />
      {/* Roof peak node — signals digital connectivity */}
      <circle cx="24" cy="2" r="3" fill="#00E5FF" />
      <circle cx="24" cy="2" r="1.5" fill="#FFFFFF" />
      {/* Eave highlight */}
      <path d="M24 2L1 20H47L24 2Z" fill="none" stroke="#00A878" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Full wordmark — icon mark + "Keja" (white) + "Link" (green) logotype.
 * Use in navigation headers and marketing materials where space allows.
 */
export function KejaLinkWordmark({ className = '' }: Pick<LogoProps, 'className'>) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <KejaLinkIcon size={30} />
      <span className="font-display text-xl font-black tracking-tight leading-none">
        <span className="text-foreground">Keja</span>
        <span className="text-primary">Link</span>
      </span>
    </span>
  )
}

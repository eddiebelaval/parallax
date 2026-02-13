interface IconProps {
  size?: number;
  className?: string;
}

export function MicIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7.5C3 10.26 5.24 12.5 8 12.5C10.76 12.5 13 10.26 13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MicOffIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="5.5" y="1" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7.5C3 10.26 5.24 12.5 8 12.5C10.76 12.5 13 10.26 13 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="12.5" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="5.5" y1="15" x2="10.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function KeyboardIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="7" x2="6" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="5" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

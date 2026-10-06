export function AmazonLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 116 46"
      role="img"
      aria-label="Amazon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text x="1" y="30" fill="currentColor" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fontWeight="700" letterSpacing="-2">amazon</text>
      <path d="M17 35 C37 45 72 45 96 34" fill="none" stroke="#f49a35" strokeWidth="2.7" strokeLinecap="round" />
      <path d="m92 31 6 2-4 5" fill="none" stroke="#f49a35" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

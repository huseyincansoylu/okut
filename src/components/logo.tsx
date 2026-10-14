import { cn } from "cn";

function roundedRect(x: number, y: number, size: number, r: number) {
  const e = x + size;
  const b = y + size;
  return `M${x + r} ${y}H${e - r}A${r} ${r} 0 0 1 ${e} ${y + r}V${b - r}A${r} ${r} 0 0 1 ${e - r} ${b}H${x + r}A${r} ${r} 0 0 1 ${x} ${b - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** Ring with a transparent hole, so the mark sits on any background. */
const RING = roundedRect(0, 0, 70, 16) + roundedRect(10, 10, 50, 9);
const DOT = roundedRect(21, 21, 28, 6);

/**
 * Okut's mark: a QR finder pattern (the nested squares in a QR code's corners).
 * It stands in for the "o" of the wordmark and works alone as the app icon.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 70 70" aria-hidden className={className}>
      <path d={RING} fillRule="evenodd" fill="currentColor" />
      <path d={DOT} fill="currentColor" />
    </svg>
  );
}

/** Okut wordmark: the mark as the "o", followed by "kut". */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-brand text-3xl font-extrabold tracking-tight", className)}>
      <LogoMark className="mr-[0.03em] size-[0.7em] translate-y-[0.02em] text-primary" />
      <span aria-hidden>kut</span>
      <span className="sr-only">Okut</span>
    </span>
  );
}

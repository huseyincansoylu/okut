import { cn } from "cn";

/** Okut wordmark. */
export function Logo({ className }: { className?: string }) {
  return <span className={cn("text-3xl font-bold tracking-tight", className)}>Okut</span>;
}

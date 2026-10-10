import { cn } from "cn";

/** Okut wordmark. */
export function Logo({ className }: { className?: string }) {
  return <span className={cn("text-2xl font-bold tracking-tight", className)}>okut</span>;
}

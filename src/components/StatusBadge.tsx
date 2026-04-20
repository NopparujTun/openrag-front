import { cn } from "@/lib/utils";

type Variant = "ready" | "missing" | "processing" | "failed" | "neutral";

const styles: Record<Variant, string> = {
  ready: "bg-success/10 text-success border-success/20",
  missing: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-primary/10 text-primary border-primary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  variant = "neutral",
  children,
  className,
}: {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {variant !== "neutral" && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "ready" && "bg-success",
            variant === "missing" && "bg-warning",
            variant === "processing" && "bg-primary animate-pulse",
            variant === "failed" && "bg-destructive",
          )}
        />
      )}
      {children}
    </span>
  );
}

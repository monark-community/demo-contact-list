import {
  BadgeCheckIcon,
  CircleDashedIcon,
  GlobeIcon,
  LockIcon,
  OctagonAlertIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { TagTone, TrustLevel, Visibility } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/**
 * Small status chips. Presentational (no client code) so the marketing pages
 * can render the same chips as the demo. Colour always comes with an icon and
 * a text label.
 */

const TRUST: Record<TrustLevel, { icon: LucideIcon; className: string }> = {
  trusted: { icon: ShieldCheckIcon, className: "border-success/40 bg-success/10 text-success" },
  known: { icon: UserCheckIcon, className: "border-border bg-secondary text-foreground" },
  unverified: { icon: CircleDashedIcon, className: "border-dashed border-input text-muted-foreground" },
  flagged: { icon: OctagonAlertIcon, className: "border-destructive/40 bg-destructive/10 text-destructive" },
}

export function TrustChip({ level, label, className }: { level: TrustLevel; label: string; className?: string }) {
  const t = TRUST[level]
  const Icon = t.icon
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs font-bold whitespace-nowrap",
        t.className,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export const VISIBILITY_ICON: Record<Visibility, LucideIcon> = {
  private: LockIcon,
  circle: UsersIcon,
  public: GlobeIcon,
}

export function VisibilityChip({ level, label, className }: { level: Visibility; label: string; className?: string }) {
  const Icon = VISIBILITY_ICON[level]
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground", className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export function VerifiedMark({ label, className, withText = true }: { label: string; className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-bold text-foreground", className)} title={label}>
      <BadgeCheckIcon className="size-4 text-primary" aria-hidden="true" />
      {withText ? label : <span className="sr-only">{label}</span>}
    </span>
  )
}

const TAG_TONE: Record<TagTone, string> = {
  positive: "border-primary/50",
  neutral: "border-border",
  caution: "border-destructive/50 text-destructive",
}

export function TagChip({ label, tone = "neutral", className }: { label: string; tone?: TagTone; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-center truncate rounded-full border bg-card px-2.5 text-xs font-semibold",
        TAG_TONE[tone],
        className
      )}
    >
      {label}
    </span>
  )
}

import { ListChecksIcon, SplitIcon, VoteIcon, type LucideIcon } from "lucide-react"

import type { AppId } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

const ICONS: Record<AppId, LucideIcon> = {
  splitflow: SplitIcon,
  taskflow: ListChecksIcon,
  govchain: VoteIcon,
}

/** Neutral mark for a sibling Monark app (they share the Monark butterfly, so no invented logos). */
export function AppMark({ id, className }: { id: AppId; className?: string }) {
  const Icon = ICONS[id]
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background", className)}>
      <Icon className="size-4 text-foreground" aria-hidden="true" />
    </span>
  )
}

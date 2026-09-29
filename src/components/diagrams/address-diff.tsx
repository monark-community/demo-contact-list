import { addressGroups } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * Two addresses in groups of four hex characters, the pasted one underneath
 * the real one. Differing characters light up; matching ones settle into
 * muted text. Each group fades in 60 ms after the previous one (the scan),
 * except with reduced motion. Server-safe: used on the home page too.
 */
export function AddressDiff({
  real,
  pasted,
  realLabel,
  pastedLabel,
  animate = true,
  className,
}: {
  real: string
  pasted: string
  realLabel: string
  pastedLabel: string
  animate?: boolean
  className?: string
}) {
  const a = addressGroups(real)
  const b = addressGroups(pasted)
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Row label={realLabel} groups={a} other={b} kind="real" animate={animate} />
      <Row label={pastedLabel} groups={b} other={a} kind="pasted" animate={animate} />
    </div>
  )
}

function Row({
  label,
  groups,
  other,
  kind,
  animate,
}: {
  label: string
  groups: string[]
  other: string[]
  kind: "real" | "pasted"
  animate: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-[0.95rem] leading-6 tabular-nums sm:text-base" translate="no">
        <span className="text-muted-foreground">0x</span>
        {groups.map((g, gi) => (
          <span
            key={gi}
            className={cn("inline-flex rounded-md", animate && "tl-resolve")}
            style={animate ? { animationDelay: `${gi * 60}ms` } : undefined}
          >
            {g.split("").map((ch, ci) => {
              const differs = other[gi]?.[ci] !== ch
              return (
                <span
                  key={ci}
                  className={cn(
                    differs
                      ? kind === "pasted"
                        ? "rounded-[3px] bg-destructive/12 font-bold text-destructive underline decoration-2 underline-offset-4"
                        : "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {ch}
                </span>
              )
            })}
          </span>
        ))}
      </p>
    </div>
  )
}

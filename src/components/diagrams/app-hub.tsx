import { BookUserIcon, LockIcon } from "lucide-react"

import { AppMark } from "@/components/demo/app-mark"
import type { AppId, Scope } from "@/lib/demo/types"

const APPS: { id: AppId; scopes: Scope[] }[] = [
  { id: "splitflow", scopes: ["names", "trust", "warnings"] },
  { id: "taskflow", scopes: ["names", "trust", "warnings"] },
  { id: "govchain", scopes: ["names"] },
]

/**
 * "One list, every app": your list on the left, flat orange lines out to
 * three Monark apps (each labelled with the scopes it may read), and the
 * private notes held back behind a padlock. Stacks vertically on phones.
 */
export function AppHub({
  label,
  yourList,
  notesStay,
  scopes,
  apps,
}: {
  label: string
  yourList: string
  notesStay: string
  scopes: Record<Scope, string>
  apps: Record<AppId, string>
}) {
  return (
    <figure aria-label={label} className="mx-auto w-full max-w-4xl">
      <div className="grid items-center gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)]">
        {/* Your list + notes held back */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full max-w-[16rem] items-center gap-3 rounded-3xl border-2 border-primary bg-card p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary">
              <BookUserIcon className="size-5 text-primary-foreground" aria-hidden="true" />
            </span>
            <span className="font-extrabold">{yourList}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-dashed px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <LockIcon className="size-3.5" aria-hidden="true" />
            {notesStay}
          </div>
        </div>

        {/* Lines: horizontal fan on desktop, a vertical trunk on phones */}
        <svg viewBox="0 0 200 240" preserveAspectRatio="none" className="hidden h-60 w-full md:block" aria-hidden="true">
          {[40, 120, 200].map((y) => (
            <path
              key={y}
              d={`M 0 120 C 100 120, 100 ${y}, 200 ${y}`}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <circle cx="0" cy="120" r="4" fill="var(--primary)" />
        </svg>
        <div className="mx-auto h-8 w-0.5 bg-primary md:hidden" aria-hidden="true" />

        {/* Apps */}
        <ul className="flex flex-col gap-3">
          {APPS.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
              <AppMark id={a.id} />
              <span className="min-w-0">
                <span className="block font-bold">{apps[a.id]}</span>
                <span className="flex flex-wrap gap-1 pt-0.5">
                  {a.scopes.map((s) => (
                    <span key={s} className="inline-flex h-5 items-center rounded-full border border-primary/60 px-2 text-[0.7rem] font-semibold">
                      {scopes[s]}
                    </span>
                  ))}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

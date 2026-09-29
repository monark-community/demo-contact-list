"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

/** A shortened monospace address; the button copies the full value. */
export function AddressCopy({
  address,
  copyLabel,
  copiedLabel,
  full = false,
  className,
}: {
  address: string
  copyLabel: string
  copiedLabel: string
  full?: boolean
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const onCopy = () => {
    try {
      void navigator.clipboard?.writeText(address).then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      })
    } catch {
      // Clipboard unavailable (insecure context): the full address stays readable in the title.
    }
  }
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      <span className={cn("min-w-0 font-mono text-sm tabular-nums", full && "break-all")} title={address}>
        {full ? address : shortAddress(address)}
      </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? copiedLabel : `${copyLabel} ${shortAddress(address)}`}
        title={copied ? copiedLabel : copyLabel}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:size-11"
      >
        {copied ? <CheckIcon className="size-3.5 text-success" aria-hidden="true" /> : <CopyIcon className="size-3.5" aria-hidden="true" />}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </span>
  )
}

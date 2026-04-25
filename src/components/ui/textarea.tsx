import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-[var(--r-input)] border border-input bg-input px-3 py-2.5 text-sm outline-none",
        "placeholder:text-muted-foreground/60",
        "transition-[border-color,box-shadow] duration-[var(--dur-fast)]",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "resize-none field-sizing-content min-h-[5rem]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

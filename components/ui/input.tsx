import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-[20px] border border-white/5 bg-white/5 px-6 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all appearance-none glass-input",
        className
      )}
      {...props}
    />
  )
}

export { Input }

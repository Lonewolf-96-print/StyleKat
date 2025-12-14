"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * A minimal scrollable container component.
 * - Adds custom scrollbar styling.
 * - Supports any content size.
 * - You can control max height via parent.
 */
export const ScrollArea = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-y-auto rounded-lg",
          "scrollbar-thin scrollbar-thumb-rounded-md scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

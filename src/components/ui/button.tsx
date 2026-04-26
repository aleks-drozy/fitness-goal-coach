import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97]",
        outline:
          "border-border bg-background hover:bg-surface hover:text-foreground active:scale-[0.97]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.97]",
        ghost:
          "hover:bg-muted hover:text-foreground active:scale-[0.97]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 rounded-[var(--r-button)] px-3 transition-[background-color,transform,opacity] duration-[var(--dur-instant)] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--r-input),10px)] px-2 text-xs transition-[background-color,transform,opacity] duration-[var(--dur-instant)] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--r-input),12px)] px-2.5 text-[0.8rem] transition-[background-color,transform,opacity] duration-[var(--dur-instant)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-2 rounded-[var(--r-button)] px-5 text-[0.9375rem] transition-[background-color,transform,opacity] duration-[var(--dur-instant)]",
        icon: "size-8 rounded-[var(--r-button)] transition-[background-color,transform,opacity] duration-[var(--dur-instant)]",
        "icon-xs":
          "size-6 rounded-[min(var(--r-input),10px)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--r-input),12px)] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9 rounded-[var(--r-button)] transition-[background-color,transform,opacity] duration-[var(--dur-instant)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

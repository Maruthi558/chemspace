import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority"
import { cn } from "cn"
import ButtonSpinner from "../common/ButtonSpinner"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all duration-200 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] shadow-sm hover:shadow-md border-[var(--border-subtle)]",
        primary:
          "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] shadow-sm hover:shadow-md border-[var(--border-subtle)]",
        secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-hover)] border-[var(--btn-secondary-border)] hover:border-[var(--btn-secondary-hover-border)] shadow-sm",
        outline:
          "border-[var(--border-medium)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        orange:
          "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-[0_2px_12px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.45)] hover:from-orange-400 hover:to-amber-400 border border-orange-400/30",
        accent:
          "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_2px_10px_rgba(16,185,129,0.15)]",
        emerald:
          "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-[0_2px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.45)] hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/30",
        destructive:
          "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 hover:border-rose-500/50",
        tool:
          "bg-[var(--bg-inner)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-xs",
        circular:
          "rounded-full p-2.5 bg-[var(--bg-inner)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] shadow-sm hover:scale-105 active:scale-95",
        link:
          "text-[var(--accent-orange)] underline-offset-4 hover:underline p-0 h-auto bg-transparent border-none active:scale-100",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-xs tracking-tight",
        xs: "h-6.5 gap-1.5 rounded-lg px-2 text-[10px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-5 text-sm tracking-tight font-semibold [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-8.5 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-7.5 rounded-lg p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 rounded-xl p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-circular": "size-10 rounded-full p-0 [&_svg:not([class*='size-'])]:size-4.5",
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
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}) {
  const isOrangeVariant = variant === "orange";
  const spinnerAccent = isOrangeVariant ? "#ffffff" : "#f97316";

  return (
    <ButtonPrimitive
      data-slot="button"
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      className={cn(
        buttonVariants({ variant, size, className }),
        loading && "pointer-events-none cursor-wait"
      )}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2 animate-in fade-in duration-150">
          <ButtonSpinner
            className="w-3.5 h-3.5"
            color="currentColor"
            accentColor={spinnerAccent}
          />
          {loadingText ? <span>{loadingText}</span> : children}
        </span>
      ) : (
        children
      )}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }


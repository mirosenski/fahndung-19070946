"use client"

import * as React from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "~/lib/utils"

const themes = [
  {
    value: "light",
    label: "Hell",
    icon: Sun,
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
  },
  {
    value: "dark",
    label: "Dunkel",
    icon: Moon,
  },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            type="button"
            className="rounded-full p-2 border border-border bg-muted text-muted-foreground opacity-50"
            disabled
          >
            <t.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex gap-2"
      role="radiogroup"
      aria-label="Theme wechseln"
    >
      {themes.map((t) => {
        const active = theme === t.value || (theme === undefined && t.value === "system")
        return (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`Switch to ${t.label} theme`}
            data-active={active}
            data-theme-switcher
            onClick={() => setTheme(t.value)}
            className={cn(
              "theme-switcher_switch rounded-full p-2 border border-border bg-muted text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
              active && "ring-2 ring-primary bg-background text-primary border-primary",
              !active && "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <t.icon className="w-5 h-5" />
          </button>
        )
      })}
    </div>
  )
} 
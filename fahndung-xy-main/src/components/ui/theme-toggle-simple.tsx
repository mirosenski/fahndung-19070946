"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"

export function ThemeToggleSimple() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const cycleTheme = () => {
    const themes = ["light", "dark", "system"]
    const currentIndex = themes.indexOf(theme || "system")
    const nextIndex = (currentIndex + 1) % themes.length
    const nextTheme = themes[nextIndex]
    console.log("Theme wechseln zu:", nextTheme)
    setTheme(nextTheme as "light" | "dark" | "system")
  }

  const getIcon = () => {
    if (resolvedTheme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />
    if (resolvedTheme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />
  }

  const getTooltip = () => {
    if (resolvedTheme === "dark") return "Aktuell: Dunkel (Klick für Hell)"
    if (resolvedTheme === "light") return "Aktuell: Hell (Klick für System)"
    return "Aktuell: System (Klick für Hell)"
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={cycleTheme}
      title={getTooltip()}
    >
      {getIcon()}
      <span className="sr-only">Theme wechseln</span>
    </Button>
  )
} 
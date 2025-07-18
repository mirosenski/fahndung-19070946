"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "~/components/ui/button"

export function ThemeToggleNative() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    console.log("Theme wechseln zu:", newTheme)
    setTheme(newTheme as "light" | "dark" | "system")
    setIsOpen(false)
  }

  const getIcon = () => {
    if (resolvedTheme === "dark") return <Moon className="h-[1.2rem] w-[1.2rem]" />
    if (resolvedTheme === "light") return <Sun className="h-[1.2rem] w-[1.2rem]" />
    return <Monitor className="h-[1.2rem] w-[1.2rem]" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {getIcon()}
        <span className="sr-only">Theme wechseln</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => handleThemeChange("light")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center"
            >
              <Sun className="mr-2 h-4 w-4" />
              Hell
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center"
            >
              <Moon className="mr-2 h-4 w-4" />
              Dunkel
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center"
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
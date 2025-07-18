import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Design System Konfiguration
export const designSystem = {
  // Theme Farben
  colors: {
    primary: {
      light: "hsl(210, 100%, 50%)",
      dark: "hsl(210, 100%, 60%)",
    },
    secondary: {
      light: "hsl(210, 20%, 96%)",
      dark: "hsl(210, 20%, 8%)",
    },
    background: {
      light: "hsl(0, 0%, 100%)",
      dark: "hsl(210, 20%, 2%)",
    },
    foreground: {
      light: "hsl(210, 20%, 10%)",
      dark: "hsl(210, 20%, 98%)",
    },
    border: {
      light: "hsl(210, 20%, 90%)",
      dark: "hsl(210, 20%, 15%)",
    },
    destructive: {
      light: "hsl(0, 100%, 50%)",
      dark: "hsl(0, 100%, 60%)",
    },
    success: {
      light: "hsl(120, 100%, 40%)",
      dark: "hsl(120, 100%, 50%)",
    },
    warning: {
      light: "hsl(45, 100%, 50%)",
      dark: "hsl(45, 100%, 60%)",
    },
  },
  
  // Komponenten Varianten
  variants: {
    button: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    badge: {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      outline: "text-foreground border border-input",
    },
    card: {
      default: "bg-card text-card-foreground border border-border",
      elevated: "bg-card text-card-foreground border border-border shadow-lg",
    },
  },
  
  // Spacing System
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  
  // Border Radius
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  },
  
  // Typography
  typography: {
    h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
    h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
    h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
    h4: "scroll-m-20 text-xl font-semibold tracking-tight",
    p: "leading-7 [&:not(:first-child)]:mt-6",
    blockquote: "mt-6 border-l-2 pl-6 italic",
    code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    lead: "text-xl text-muted-foreground",
    large: "text-lg font-semibold",
    small: "text-sm font-medium leading-none",
    muted: "text-sm text-muted-foreground",
  },
}

// Utility Funktionen für das Design System
export const designUtils = {
  // Theme-spezifische Klassen generieren
  themeClass: (lightClass: string, darkClass: string) => 
    `${lightClass} dark:${darkClass}`,
  
  // Responsive Klassen
  responsive: {
    mobile: "sm:hidden",
    tablet: "hidden sm:block md:hidden",
    desktop: "hidden md:block",
  },
  
  // Animation Klassen
  animation: {
    fadeIn: "animate-in fade-in duration-300",
    slideIn: "animate-in slide-in-from-bottom-4 duration-300",
    scaleIn: "animate-in zoom-in-95 duration-300",
  },
  
  // Focus Styles
  focus: "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  
  // Hover Styles
  hover: "hover:bg-accent hover:text-accent-foreground",
}

// Komponenten Registry für einfache Verwaltung
export const componentRegistry = {
  // Layout Komponenten
  layout: {
    Header: "src/components/layout/Header.tsx",
    Footer: "src/components/layout/Footer.tsx",
  },
  
  // UI Komponenten
  ui: {
    Button: "src/components/ui/button.tsx",
    Card: "src/components/ui/card.tsx",
    Badge: "src/components/ui/badge.tsx",
    Input: "src/components/ui/input.tsx",
    Form: "src/components/ui/form.tsx",
    Select: "src/components/ui/select.tsx",
    Progress: "src/components/ui/progress.tsx",
    Label: "src/components/ui/label.tsx",
    Textarea: "src/components/ui/textarea.tsx",
    ThemeToggle: "src/components/ui/theme-toggle.tsx",
    ThemeProvider: "src/components/ui/theme-provider.tsx",
  },
  
  // Feature Komponenten
  features: {
    InvestigationCard: "src/components/InvestigationCard.tsx",
    UserDialog: "src/components/admin/UserDialog.tsx",
    UserManagement: "src/components/admin/UserManagement.tsx",
  },
  
  // Wizard Komponenten
  wizard: {
    WizardBase: "src/components/wizard/WizardBase.tsx",
    StolenGoodsWizard: "src/components/wizard/StolenGoodsWizard.tsx",
    UnknownDeadWizard: "src/components/wizard/UnknownDeadWizard.tsx",
    MissingPersonWizard: "src/components/wizard/MissingPersonWizard.tsx",
    WantedPersonWizard: "src/components/wizard/WantedPersonWizard.tsx",
    WizardPreviewTabs: "src/components/wizard/WizardPreviewTabs.tsx",
    WizardContext: "src/components/wizard/WizardContext.tsx",
  },
}

// Theme Konfiguration
export const themeConfig = {
  light: {
    "--color-background": "0 0% 100%",
    "--color-foreground": "210 20% 10%",
    "--color-primary": "210 100% 50%",
    "--color-primary-foreground": "0 0% 100%",
    "--color-secondary": "210 20% 96%",
    "--color-secondary-foreground": "210 20% 10%",
    "--color-muted": "210 20% 96%",
    "--color-muted-foreground": "210 20% 50%",
    "--color-accent": "210 20% 96%",
    "--color-accent-foreground": "210 20% 10%",
    "--color-destructive": "0 100% 50%",
    "--color-destructive-foreground": "0 0% 100%",
    "--color-border": "210 20% 90%",
    "--color-input": "210 20% 90%",
    "--color-ring": "210 100% 50%",
    "--color-card": "0 0% 100%",
    "--color-card-foreground": "210 20% 10%",
    "--color-popover": "0 0% 100%",
    "--color-popover-foreground": "210 20% 10%",
    "--radius": "0.5rem",
  },
  dark: {
    "--color-background": "210 20% 2%",
    "--color-foreground": "210 20% 98%",
    "--color-primary": "210 100% 60%",
    "--color-primary-foreground": "210 20% 2%",
    "--color-secondary": "210 20% 8%",
    "--color-secondary-foreground": "210 20% 98%",
    "--color-muted": "210 20% 8%",
    "--color-muted-foreground": "210 20% 70%",
    "--color-accent": "210 20% 8%",
    "--color-accent-foreground": "210 20% 98%",
    "--color-destructive": "0 100% 60%",
    "--color-destructive-foreground": "210 20% 2%",
    "--color-border": "210 20% 15%",
    "--color-input": "210 20% 15%",
    "--color-ring": "210 100% 60%",
    "--color-card": "210 20% 4%",
    "--color-card-foreground": "210 20% 98%",
    "--color-popover": "210 20% 4%",
    "--color-popover-foreground": "210 20% 98%",
    "--radius": "0.5rem",
  },
} 
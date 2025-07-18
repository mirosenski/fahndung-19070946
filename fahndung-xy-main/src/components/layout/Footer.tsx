import React from 'react';
import { ThemeSwitcher } from "~/components/ui/theme-switcher";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4 text-center flex flex-col items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © 2024 Fahndung - Ein System zur Verwaltung öffentlicher Fahndungen
        </p>
        <ThemeSwitcher />
      </div>
    </footer>
  );
} 
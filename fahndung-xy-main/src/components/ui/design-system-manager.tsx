"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ThemeToggle } from "~/components/ui/theme-toggle"
import { designSystem, componentRegistry, themeConfig } from "~/lib/design-system"
import { Settings, Palette, Type, Layout, Code } from "lucide-react"

interface DesignSystemManagerProps {
  onThemeChange?: (theme: string) => void
  onColorChange?: (color: string, value: string) => void
}

export function DesignSystemManager({ 
  onColorChange 
}: DesignSystemManagerProps) {
  const [activeTab, setActiveTab] = useState("colors")
  const [selectedComponent, setSelectedComponent] = useState("Button")

  const tabs = [
    { id: "colors", label: "Farben", icon: Palette },
    { id: "typography", label: "Typografie", icon: Type },
    { id: "components", label: "Komponenten", icon: Layout },
    { id: "code", label: "Code", icon: Code },
  ]

  const colorOptions = [
    { name: "Primary", key: "primary" },
    { name: "Secondary", key: "secondary" },
    { name: "Background", key: "background" },
    { name: "Foreground", key: "foreground" },
    { name: "Border", key: "border" },
    { name: "Destructive", key: "destructive" },
    { name: "Success", key: "success" },
    { name: "Warning", key: "warning" },
  ]

  const typographyOptions = [
    { name: "H1", key: "h1" },
    { name: "H2", key: "h2" },
    { name: "H3", key: "h3" },
    { name: "H4", key: "h4" },
    { name: "Paragraph", key: "p" },
    { name: "Small", key: "small" },
    { name: "Muted", key: "muted" },
  ]

  const componentCategories = [
    { name: "Layout", components: Object.keys(componentRegistry.layout) },
    { name: "UI", components: Object.keys(componentRegistry.ui) },
    { name: "Features", components: Object.keys(componentRegistry.features) },
    { name: "Wizard", components: Object.keys(componentRegistry.wizard) },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Design System Manager</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Colors Tab */}
        {activeTab === "colors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colorOptions.map((color) => (
              <Card key={color.key}>
                <CardHeader>
                  <CardTitle className="text-lg">{color.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Light Mode</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={designSystem.colors[color.key as keyof typeof designSystem.colors]?.light || ""}
                        onChange={(e) => onColorChange?.(`${color.key}-light`, e.target.value)}
                        placeholder="HSL Wert"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{
                          backgroundColor: designSystem.colors[color.key as keyof typeof designSystem.colors]?.light || "transparent"
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dark Mode</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={designSystem.colors[color.key as keyof typeof designSystem.colors]?.dark || ""}
                        onChange={(e) => onColorChange?.(`${color.key}-dark`, e.target.value)}
                        placeholder="HSL Wert"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{
                          backgroundColor: designSystem.colors[color.key as keyof typeof designSystem.colors]?.dark || "transparent"
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === "typography" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {typographyOptions.map((typography) => (
                <Card key={typography.key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{typography.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>CSS Klassen</Label>
                      <Input
                        value={designSystem.typography[typography.key as keyof typeof designSystem.typography] || ""}
                        readOnly
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <Label>Vorschau</Label>
                      <div className={`mt-2 p-4 border rounded ${designSystem.typography[typography.key as keyof typeof designSystem.typography] || ""}`}>
                        Beispiel Text für {typography.name}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === "components" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Komponente auswählen</Label>
                <Select value={selectedComponent} onValueChange={setSelectedComponent}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {componentCategories.map((category) => (
                      <div key={category.name}>
                        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                          {category.name}
                        </div>
                        {category.components.map((component) => (
                          <SelectItem key={component} value={component}>
                            {component}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Komponenten Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Datei Pfad</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {componentRegistry.layout[selectedComponent as keyof typeof componentRegistry.layout] ||
                         componentRegistry.ui[selectedComponent as keyof typeof componentRegistry.ui] ||
                         componentRegistry.features[selectedComponent as keyof typeof componentRegistry.features] ||
                         componentRegistry.wizard[selectedComponent as keyof typeof componentRegistry.wizard] ||
                         "Nicht gefunden"}
                      </p>
                    </div>
                    <div>
                      <Label>Varianten</Label>
                      <div className="mt-2 space-y-2">
                        {designSystem.variants[selectedComponent.toLowerCase() as keyof typeof designSystem.variants] ? 
                          Object.keys(designSystem.variants[selectedComponent.toLowerCase() as keyof typeof designSystem.variants]).map((variant) => (
                            <div key={variant} className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded bg-primary" />
                              <span className="text-sm">{variant}</span>
                            </div>
                          )) : 
                          <p className="text-sm text-muted-foreground">Keine Varianten definiert</p>
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Design System Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>CSS Variablen</Label>
                    <pre className="mt-2 p-4 bg-muted rounded text-sm overflow-x-auto">
                      <code>
                        {Object.entries(themeConfig.light).map(([key, value]) => 
                          `${key}: ${value};`
                        ).join('\n')}
                      </code>
                    </pre>
                  </div>
                  <div>
                    <Label>Tailwind Konfiguration</Label>
                    <pre className="mt-2 p-4 bg-muted rounded text-sm overflow-x-auto">
                      <code>
                        {`colors: {
  primary: {
    DEFAULT: "hsl(var(--color-primary))",
    foreground: "hsl(var(--color-primary-foreground))",
  },
  // ... weitere Farben
}`}
                      </code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 
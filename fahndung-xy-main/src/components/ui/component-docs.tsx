"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Progress } from "~/components/ui/progress"
import { Textarea } from "~/components/ui/textarea"
import { ThemeToggle } from "~/components/ui/theme-toggle"
import { componentRegistry, designSystem } from "~/lib/design-system"

import { 
  Code, 
  Copy, 
  Check,
  EyeOff
} from "lucide-react"

interface ComponentDocsProps {
  componentName: string
}

export function ComponentDocs({ componentName }: ComponentDocsProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)

  const copyToClipboard = async (text: string, component: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(component)
    setTimeout(() => setCopied(null), 2000)
  }

  const getComponentExample = (name: string) => {
    switch (name) {
      case "Button":
        return {
          title: "Button Komponenten",
          description: "Verschiedene Button-Varianten und Größen",
          examples: [
            {
              name: "Primary",
              code: '<Button>Primary Button</Button>',
              component: <Button>Primary Button</Button>
            },
            {
              name: "Secondary",
              code: '<Button variant="secondary">Secondary Button</Button>',
              component: <Button variant="secondary">Secondary Button</Button>
            },
            {
              name: "Destructive",
              code: '<Button variant="destructive">Destructive Button</Button>',
              component: <Button variant="destructive">Destructive Button</Button>
            },
            {
              name: "Outline",
              code: '<Button variant="outline">Outline Button</Button>',
              component: <Button variant="outline">Outline Button</Button>
            },
            {
              name: "Ghost",
              code: '<Button variant="ghost">Ghost Button</Button>',
              component: <Button variant="ghost">Ghost Button</Button>
            },
            {
              name: "Link",
              code: '<Button variant="link">Link Button</Button>',
              component: <Button variant="link">Link Button</Button>
            },
            {
              name: "Small",
              code: '<Button size="sm">Small Button</Button>',
              component: <Button size="sm">Small Button</Button>
            },
            {
              name: "Large",
              code: '<Button size="lg">Large Button</Button>',
              component: <Button size="lg">Large Button</Button>
            }
          ]
        }

      case "Badge":
        return {
          title: "Badge Komponenten",
          description: "Verschiedene Badge-Varianten",
          examples: [
            {
              name: "Default",
              code: '<Badge>Default Badge</Badge>',
              component: <Badge>Default Badge</Badge>
            },
            {
              name: "Secondary",
              code: '<Badge variant="secondary">Secondary Badge</Badge>',
              component: <Badge variant="secondary">Secondary Badge</Badge>
            },
            {
              name: "Destructive",
              code: '<Badge variant="destructive">Destructive Badge</Badge>',
              component: <Badge variant="destructive">Destructive Badge</Badge>
            },
            {
              name: "Outline",
              code: '<Badge variant="outline">Outline Badge</Badge>',
              component: <Badge variant="outline">Outline Badge</Badge>
            }
          ]
        }

      case "Card":
        return {
          title: "Card Komponenten",
          description: "Verschiedene Card-Layouts",
          examples: [
            {
              name: "Default Card",
              code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>`,
              component: (
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here</p>
                  </CardContent>
                </Card>
              )
            }
          ]
        }

      case "Input":
        return {
          title: "Input Komponenten",
          description: "Verschiedene Input-Typen",
          examples: [
            {
              name: "Default Input",
              code: '<Input placeholder="Enter text..." />',
              component: <Input placeholder="Enter text..." />
            },
            {
              name: "With Label",
              code: `<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter email..." />
</div>`,
              component: (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter email..." />
                </div>
              )
            }
          ]
        }

      case "Select":
        return {
          title: "Select Komponenten",
          description: "Dropdown-Auswahl-Komponenten",
          examples: [
            {
              name: "Default Select",
              code: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>`,
              component: (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              )
            }
          ]
        }

      case "Progress":
        return {
          title: "Progress Komponenten",
          description: "Fortschrittsbalken",
          examples: [
            {
              name: "Default Progress",
              code: '<Progress value={33} />',
              component: <Progress value={33} />
            },
            {
              name: "Custom Progress",
              code: '<Progress value={75} className="w-full" />',
              component: <Progress value={75} className="w-full" />
            }
          ]
        }

      case "Textarea":
        return {
          title: "Textarea Komponenten",
          description: "Mehrzeilige Texteingabe",
          examples: [
            {
              name: "Default Textarea",
              code: '<Textarea placeholder="Enter text..." />',
              component: <Textarea placeholder="Enter text..." />
            },
            {
              name: "With Label",
              code: `<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea id="description" placeholder="Enter description..." />
</div>`,
              component: (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter description..." />
                </div>
              )
            }
          ]
        }

      case "ThemeToggle":
        return {
          title: "Theme Toggle",
          description: "Dark/Light Mode Umschalter",
          examples: [
            {
              name: "Theme Toggle",
              code: '<ThemeToggle />',
              component: <ThemeToggle />
            }
          ]
        }

      default:
        return {
          title: `${componentName} Komponente`,
          description: "Keine Beispiele verfügbar",
          examples: []
        }
    }
  }

  const componentExample = getComponentExample(componentName)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{componentExample.title}</h2>
          <p className="text-muted-foreground mt-1">{componentExample.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? <EyeOff className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {showCode ? "Hide Code" : "Show Code"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {componentExample.examples.map((example, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{example.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
                {example.component}
              </div>
              
              {showCode && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(example.code, example.name)}
                  >
                    {copied === example.name ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Komponenten Registry Info */}
      <Card>
        <CardHeader>
          <CardTitle>Komponenten Informationen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Datei Pfad</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {componentRegistry.layout[componentName as keyof typeof componentRegistry.layout] ||
                 componentRegistry.ui[componentName as keyof typeof componentRegistry.ui] ||
                 componentRegistry.features[componentName as keyof typeof componentRegistry.features] ||
                 componentRegistry.wizard[componentName as keyof typeof componentRegistry.wizard] ||
                 "Nicht gefunden"}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Verfügbare Varianten</Label>
              <div className="mt-2 space-y-2">
                {designSystem.variants[componentName.toLowerCase() as keyof typeof designSystem.variants] ? 
                  Object.keys(designSystem.variants[componentName.toLowerCase() as keyof typeof designSystem.variants]).map((variant) => (
                    <div key={variant} className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded bg-primary" />
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
  )
} 
# Wizard-Komponenten

Diese Verzeichnis enthält die verschiedenen Wizard-Komponenten für das Fahndungssystem.

## Struktur

### Basis-Komponenten
- **`WizardBase.tsx`** - Basis-Wizard-Komponente mit gemeinsamer Funktionalität
- **`WizardContext.tsx`** - Context für Wizard-State-Management
- **`WizardPreviewTabs.tsx`** - Preview-Komponente für Vorschau

### Spezifische Wizards
- **`WantedPersonWizard.tsx`** - Wizard für Straftäter
- **`MissingPersonWizard.tsx`** - Wizard für vermisste Personen
- **`UnknownDeadWizard.tsx`** - Wizard für unbekannte Tote
- **`StolenGoodsWizard.tsx`** - Wizard für gesuchte Sachen

### Legacy (entfernt)
- ~~**`WizardComplete.tsx`**~~ - Ursprüngliche zusammengefasste Wizard-Komponente (wurde durch separate Wizards ersetzt)

## URLs

### Hauptauswahlseite
- **`/wizard`** - Hauptauswahlseite für alle Wizard-Typen (mit Header/Footer)

### Spezifische Wizards
- **`/wizard/wanted-person`** - Straftäter Wizard
- **`/wizard/missing-person`** - Vermisste Person Wizard
- **`/wizard/unknown-dead`** - Unbekannte Tote Wizard
- **`/wizard/stolen-goods`** - Gesuchte Sachen Wizard

### Entfernte Seiten
- ~~`/wizard-demo`~~ - Entfernt (ersetzt durch `/wizard`)
- ~~`/wizard-complete`~~ - Entfernt (ersetzt durch `/wizard`)

## Verwendung

### Einzelne Wizards verwenden

```tsx
import { WantedPersonWizard } from '~/components/wizard/WantedPersonWizard';
import { MissingPersonWizard } from '~/components/wizard/MissingPersonWizard';
import { UnknownDeadWizard } from '~/components/wizard/UnknownDeadWizard';
import { StolenGoodsWizard } from '~/components/wizard/StolenGoodsWizard';

// Oder über die Index-Datei
import { 
  WantedPersonWizard, 
  MissingPersonWizard, 
  UnknownDeadWizard, 
  StolenGoodsWizard 
} from '~/components/wizard';
```

### Gemeinsame Komponenten verwenden

```tsx
import { 
  WizardBase, 
  CategorySelection, 
  BasicInfoStep, 
  MediaUploadStep, 
  ContactStep 
} from '~/components/wizard/WizardBase';
```

## Wizard-Schritte

### WantedPersonWizard (Straftäter)
1. **category** - Kategorieauswahl
2. **basic** - Grundlegende Informationen
3. **crime** - Tatdetails
4. **appearance** - Personenbeschreibung
5. **media** - Bilder und Medien
6. **contact** - Kontakt & Veröffentlichung

### MissingPersonWizard (Vermisste Personen)
1. **category** - Kategorieauswahl
2. **basic** - Grundlegende Informationen
3. **lastSeen** - Letzter Aufenthaltsort
4. **appearance** - Personenbeschreibung
5. **medical** - Medizinische Informationen
6. **media** - Bilder und Medien
7. **contact** - Kontakt & Veröffentlichung

### UnknownDeadWizard (Unbekannte Tote)
1. **category** - Kategorieauswahl
2. **basic** - Grundlegende Informationen
3. **discovery** - Fundort und Umstände
4. **appearance** - Personenbeschreibung
5. **belongings** - Gefundene Gegenstände
6. **media** - Bilder und Medien
7. **contact** - Kontakt & Veröffentlichung

### StolenGoodsWizard (Gesuchte Sachen)
1. **category** - Kategorieauswahl
2. **basic** - Grundlegende Informationen
3. **item** - Gegenstandsbeschreibung
4. **theft** - Diebstahldetails
5. **media** - Bilder und Medien
6. **contact** - Kontakt & Veröffentlichung

## Gemeinsame Features

Alle Wizards teilen sich:
- Progress-Bar
- Navigation (Zurück/Weiter)
- Auto-Save-Funktionalität
- Preview-Modus
- Responsive Design
- Form-Validierung
- Error-Handling

## Migration

Die ursprüngliche `WizardComplete.tsx` wurde durch vier separate, spezialisierte Wizard-Komponenten ersetzt. Alle Verweise wurden aktualisiert, um die neuen Komponenten zu verwenden.

## Direkte Navigation

Sie können jetzt direkt zu den spezifischen Wizards navigieren:

- **Hauptauswahlseite**: `http://localhost:3001/wizard`
- **Straftäter**: `http://localhost:3001/wizard/wanted-person`
- **Vermisste Person**: `http://localhost:3001/wizard/missing-person`
- **Unbekannte Tote**: `http://localhost:3001/wizard/unknown-dead`
- **Gesuchte Sachen**: `http://localhost:3001/wizard/stolen-goods` 
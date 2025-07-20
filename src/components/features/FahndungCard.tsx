'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, MapPin, Calendar, Clock } from 'lucide-react'
import type { FahndungCardProps } from '@/types/fahndung'
import { FAHNDUNG_TYP_LABELS, FAHNDUNG_PRIORITAET_LABELS } from '@/types/fahndung'

export function FahndungCard({ fahndung, isNew = false, isFeatured = false }: FahndungCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const getPriorityColor = (prioritaet: string) => {
    switch (prioritaet) {
      case 'dringend':
        return 'bg-red-500 text-white'
      case 'hoch':
        return 'bg-orange-500 text-white'
      case 'normal':
        return 'bg-blue-500 text-white'
      case 'niedrig':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTypColor = (typ: string) => {
    switch (typ) {
      case 'straftaeter':
        return 'bg-red-100 text-red-800'
      case 'vermisste':
        return 'bg-blue-100 text-blue-800'
      case 'unbekannte_tote':
        return 'bg-gray-100 text-gray-800'
      case 'sachen':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="relative group perspective-1000">
      {/* NEU Badge */}
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-red-500 text-white text-xs font-bold">
            NEU
          </Badge>
        </div>
      )}

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="bg-yellow-500 text-black text-xs font-bold">
            HERAUSRAGEND
          </Badge>
        </div>
      )}

      <div
        className={`relative w-full h-80 transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getTypColor(fahndung.typ)}>
                  {FAHNDUNG_TYP_LABELS[fahndung.typ]}
                </Badge>
                <Badge className={getPriorityColor(fahndung.prioritaet)}>
                  {FAHNDUNG_PRIORITAET_LABELS[fahndung.prioritaet]}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {fahndung.titel}
              </h3>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {fahndung.kurzbeschreibung && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {fahndung.kurzbeschreibung}
                </p>
              )}
              
              <div className="space-y-2 text-sm text-gray-500">
                {fahndung.ort_name && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{fahndung.ort_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(fahndung.erstellt_am).toLocaleDateString('de-DE')}
                  </span>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Navigation zur Detail-Seite
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Details anzeigen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full bg-gray-50 shadow-lg">
            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Zusätzliche Informationen
              </h3>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {fahndung.beschreibung && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Beschreibung</h4>
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {fahndung.beschreibung}
                  </p>
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    Aktualisiert: {new Date(fahndung.aktualisiert_am).toLocaleDateString('de-DE')}
                  </span>
                </div>
                
                {fahndung.veroeffentlicht_von && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">
                      Veröffentlicht: {new Date(fahndung.veroeffentlicht_von).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Navigation zur Detail-Seite
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vollständige Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
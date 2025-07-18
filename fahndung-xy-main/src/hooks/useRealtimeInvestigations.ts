import { useEffect } from 'react'
import { subscribeToInvestigations, type InvestigationChange } from '~/lib/supabase'

export const useRealtimeInvestigations = () => {
  useEffect(() => {
    console.log('🔔 Initialisiere Real-time Updates für Fahndungen...')
    
    const subscription = subscribeToInvestigations((payload: InvestigationChange) => {
      console.log('🔔 Real-time Update erhalten:', payload)
      
      // Bei Änderungen die Seite neu laden oder einen Toast anzeigen
      if (payload.eventType === 'INSERT') {
        console.log('✅ Neue Fahndung hinzugefügt:', payload.new)
        // Hier könnte man einen Toast anzeigen
      }
      
      if (payload.eventType === 'UPDATE') {
        console.log('🔄 Fahndung aktualisiert:', payload.new)
        // Hier könnte man einen Toast anzeigen
      }
      
      if (payload.eventType === 'DELETE') {
        console.log('🗑️ Fahndung gelöscht:', payload.old)
        // Hier könnte man einen Toast anzeigen
      }
    })

    return () => {
      console.log('🔔 Real-time Updates beendet')
      subscription.unsubscribe()
    }
  }, [])
} 
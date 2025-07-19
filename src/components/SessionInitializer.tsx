'use client';

import { useEffect } from 'react';
import { initializeSession } from '~/lib/auth';

export function SessionInitializer() {
  useEffect(() => {
    // Session beim App-Start initialisieren
    void initializeSession();
  }, []);

  return null; // Diese Komponente rendert nichts
} 
// Einfache Session-Verwaltung für Demo-Zwecke
export interface DemoSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "USER";
  };
  expires: string;
}

export const createDemoSession = (): DemoSession => {
  return {
    user: {
      id: "demo-admin-1",
      email: "admin@fahndung.de",
      name: "Administrator",
      role: "ADMIN",
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 Stunden
  };
};

export const getDemoSession = (): DemoSession | null => {
  if (typeof window === "undefined") return null;
  
  const session = localStorage.getItem("demo-session");
  if (!session) return null;
  
  try {
    const parsedSession = JSON.parse(session) as DemoSession;
    
    // Prüfe, ob die Session abgelaufen ist
    if (new Date(parsedSession.expires) < new Date()) {
      localStorage.removeItem("demo-session");
      return null;
    }
    
    return parsedSession;
  } catch {
    localStorage.removeItem("demo-session");
    return null;
  }
};

export const setDemoSession = (session: DemoSession): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("demo-session", JSON.stringify(session));
};

export const clearDemoSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("demo-session");
}; 
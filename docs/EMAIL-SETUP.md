# E-Mail-Benachrichtigungen Setup für Fahndung System

## 🎯 Ziel
Als Super-User (ptlsweb@gmail.com) E-Mail-Benachrichtigungen erhalten, wenn sich neue Benutzer registrieren.

## 📧 Aktueller Status
Das System zeigt jetzt Konsolen-Ausgaben mit allen wichtigen Informationen an. Für echte E-Mail-Benachrichtigungen muss Supabase SMTP konfiguriert werden.

## 🔧 E-Mail-Konfiguration in Supabase

### Schritt 1: Supabase Auth Settings
1. Gehe zu: https://app.supabase.com/project/rgbxdxrhwrszidbnsmuy/auth/settings
2. Scrolle zu "Email Auth"
3. Aktiviere:
   - ✅ **"Enable email confirmations"**
   - ✅ **"Enable email change confirmations"**

### Schritt 2: SMTP-Konfiguration
1. Scrolle zu "SMTP Settings"
2. Fülle die Felder aus:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: ptlsweb@gmail.com
SMTP Pass: [Gmail App-Passwort]
Sender Name: Fahndung System
Sender Email: ptlsweb@gmail.com
```

### Schritt 3: Gmail App-Passwort erstellen
1. Gehe zu: https://myaccount.google.com/apppasswords
2. Wähle "Mail" und "Windows Computer"
3. Kopiere das generierte Passwort (16 Zeichen)
4. Verwende es als SMTP Pass in Supabase

### Schritt 4: URL-Konfiguration
```
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/dashboard
```

## 🚀 Workflow

### Wenn sich jemand registriert:
1. **Benutzer registriert sich** → Status: 'pending'
2. **Konsolen-Ausgabe** → Zeigt alle Details an
3. **Optional: E-Mail an ptlsweb@gmail.com** → Wenn SMTP konfiguriert
4. **Super-Admin prüft** → Geht zu /admin/users
5. **Admin genehmigt/lehnt ab** → Status: 'approved'/'rejected'
6. **Benutzer erhält Bestätigung** → Konsolen-Ausgabe + optional E-Mail

## 📋 Konsolen-Ausgaben

### Bei neuer Registrierung:
```
🔔 NEUE BENUTZER-REGISTRIERUNG - FAHNDUNG SYSTEM
⚠️ WICHTIG: Ein neuer Benutzer hat sich registriert und wartet auf Ihre Genehmigung.

📋 REGISTRIERUNGS-DETAILS:
Name: Max Mustermann
E-Mail: max@example.com
Abteilung: IT
Telefon: +49 123 456789
Registriert am: 15.12.2024, 14:30:25

🔗 AKTIONEN:
1. Gehen Sie zu: http://localhost:3000/admin/users
2. Melden Sie sich mit Ihren Admin-Daten an
3. Klicken Sie auf "Genehmigen" oder "Ablehnen"
4. Der Benutzer erhält automatisch eine Bestätigung
```

### Bei Genehmigung/Ablehnung:
```
✅ BENUTZER-BESTÄTIGUNG - FAHNDUNG SYSTEM
Status: GENEHMIGT
Benutzer: Max Mustermann (max@example.com)

✅ REGISTRIERUNG GENEHMIGT
Hallo Max Mustermann,
Ihre Registrierung für das Fahndung System wurde erfolgreich genehmigt!

🔗 ANMELDUNG:
Gehen Sie zu: http://localhost:3000/login
Melden Sie sich mit Ihrer E-Mail und Ihrem Passwort an
```

## 🔍 Admin-Seite
- **URL**: http://localhost:3000/admin/users
- **Zugang**: Nur für Admin-Benutzer
- **Funktionen**:
  - Alle ausstehenden Registrierungen anzeigen
  - Benutzer genehmigen/ablehnen
  - Bestätigungs-E-Mails senden
  - Benutzer-Rollen verwalten

## 🛠️ Troubleshooting

### Problem: E-Mails kommen nicht an
**Lösung**:
1. SMTP-Einstellungen prüfen
2. Gmail App-Passwort verwenden (nicht normales Passwort)
3. Spam-Ordner prüfen
4. Konsolen-Ausgaben als Backup verwenden

### Problem: Registrierung funktioniert nicht
**Lösung**:
1. E-Mail-Bestätigung in Supabase aktiviert?
2. URL-Einstellungen korrekt?
3. Schema erweitert?

### Problem: Admin-Zugang funktioniert nicht
**Lösung**:
1. Admin-User existiert in Supabase?
2. Rolle auf 'admin' gesetzt?
3. Session gültig?

## 📊 Datenbank-Tabellen

### admin_notifications (optional)
```sql
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  department VARCHAR(255),
  phone VARCHAR(50),
  registration_date VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_notifications (optional)
```sql
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎉 Erfolg!
Wenn alles funktioniert:
- ✅ Registrierung erstellt User mit Status 'pending'
- ✅ Konsolen-Ausgabe zeigt alle Details
- ✅ Optional: E-Mail an ptlsweb@gmail.com
- ✅ Super-Admin kann in /admin/users genehmigen/ablehnen
- ✅ Benutzer erhalten Bestätigungen

## 📞 Support
Bei Problemen:
1. Prüfe Konsolen-Ausgaben im Browser (F12)
2. Prüfe Supabase Logs
3. Kontaktiere: ptlsweb@gmail.com 
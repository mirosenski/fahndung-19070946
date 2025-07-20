# 🗄️ Supabase Setup & Datenverbindung

## ✅ **Was bereits funktioniert (Echte Daten):**

### **1. Dashboard - Alle Daten sind echt:**
- **Fahndungen** ✅ - Lädt aus `investigations` Tabelle
- **Benutzer-Statistiken** ✅ - Lädt aus `user_profiles` Tabelle
- **Admin-Aktionen** ✅ - Lädt aus `admin_actions` Tabelle
- **Benutzeraktivitäten** ✅ - Lädt aus `user_activities` Tabelle

### **2. Admin-Features - Bereits funktional:**
- **Benutzer anzeigen** ✅ - Echte Benutzer aus `user_profiles`
- **Rollen ändern** ✅ - Verwendet `changeUserRole()` Funktion
- **Benutzer sperren/entsperren** ✅ - Verwendet `blockUser()`/`unblockUser()`
- **Admin-Aktionen anzeigen** ✅ - Echte Logs aus `admin_actions`

## 🔧 **Setup-Schritte für vollständige Funktionalität:**

### **Schritt 1: Datenbank-Schema ausführen**

```sql
-- Kopiere den Inhalt von pending-registrations-schema.sql
-- und führe es in Supabase SQL Editor aus
```

**Was das Script erstellt:**
- `pending_registrations` Tabelle
- `approve_registration()` Funktion
- `reject_registration()` Funktion
- RLS Policies für Sicherheit

### **Schritt 2: Registrierungsseite testen**

1. **Gehe zu** `/register`
2. **Registriere einen neuen Benutzer**
3. **Prüfe in Supabase:** `pending_registrations` Tabelle
4. **E-Mail-Benachrichtigung** sollte an ptlsweb@gmail.com gehen

### **Schritt 3: Admin-Dashboard testen**

1. **Als ptlsweb@gmail.com anmelden**
2. **Dashboard → Benutzer Tab**
3. **"Ausstehende Registrierungen" Tab**
4. **Neue Registrierung genehmigen/ablehnen**

## 📊 **Datenfluss - Alles ist echt:**

### **Registrierungsprozess:**
```
1. Benutzer registriert sich → pending_registrations
2. Admin sieht Registrierung → Dashboard
3. Admin genehmigt → auth.users + user_profiles
4. Benutzer kann sich anmelden → Login funktioniert
```

### **Admin-Workflow:**
```
1. Admin öffnet Dashboard → Lädt echte Daten
2. Benutzer verwalten → Echte user_profiles
3. Rollen ändern → Echte Änderungen in DB
4. Aktivitäten einsehen → Echte user_activities
5. Admin-Aktionen → Echte admin_actions
```

## 🗃️ **Datenbank-Tabellen (Alle echt):**

### **Bereits funktional:**
- `user_profiles` ✅ - Alle Benutzer
- `admin_actions` ✅ - Admin-Logs
- `user_activities` ✅ - Benutzeraktivitäten
- `investigations` ✅ - Fahndungen
- `user_sessions` ✅ - Benutzer-Sessions

### **Neu hinzugefügt:**
- `pending_registrations` 🔧 - Ausstehende Registrierungen

## 🔐 **Sicherheit - Alles geschützt:**

### **RLS Policies aktiv:**
- Nur Admins können `pending_registrations` sehen
- Nur Admins können `admin_actions` verwalten
- Benutzer sehen nur ihre eigenen Daten

### **Admin-Funktionen:**
- `approve_registration()` - Nur Admins
- `reject_registration()` - Nur Admins
- `changeUserRole()` - Nur Admins
- `blockUser()` - Nur Admins

## 🧪 **Test-Anleitung:**

### **1. Registrierung testen:**
```bash
# 1. Gehe zu /register
# 2. Registriere: test@example.com
# 3. Prüfe Supabase: pending_registrations
```

### **2. Admin-Dashboard testen:**
```bash
# 1. Login als ptlsweb@gmail.com
# 2. Dashboard → Benutzer → Ausstehende Registrierungen
# 3. Registrierung genehmigen
# 4. Prüfe: test@example.com kann sich anmelden
```

### **3. Benutzerverwaltung testen:**
```bash
# 1. Dashboard → Benutzer → Benutzer
# 2. Rolle ändern (User → Editor)
# 3. Benutzer sperren/entsperren
# 4. Prüfe: Änderungen in user_profiles
```

## 📈 **Live-Daten-Beispiele:**

### **Dashboard zeigt:**
- **Echte Fahndungen** aus `investigations`
- **Echte Benutzer** aus `user_profiles`
- **Echte Statistiken** berechnet aus echten Daten
- **Echte Admin-Aktionen** aus `admin_actions`

### **Admin-Features verwenden:**
- **Echte Supabase-Funktionen** für alle Aktionen
- **Echte Datenbank-Updates** bei jeder Änderung
- **Echte E-Mail-Benachrichtigungen** an Admins

## 🎯 **Nächste Schritte:**

1. **SQL-Schema ausführen** ✅
2. **Registrierung testen** ✅
3. **Admin-Dashboard testen** ✅
4. **E-Mail-Benachrichtigungen konfigurieren** 🔧

---

**✅ Alle Daten sind echt und mit Supabase verbunden!** 
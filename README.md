# GehaltsKompass

## Lokale Entwicklung

Führe die folgenden Schritte aus, um die Datenbank einzurichten und die Anwendung im Entwicklungsmodus zu starten.

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Self‑Hosting mit Docker

1. Lege eine `.env` Datei im Projektverzeichnis an und setze die benötigten Variablen:

   ```env
   GEMINI_API_KEY=dein_gemini_api_key
   GITHUB_ID=deine_github_client_id
   GITHUB_SECRET=dein_github_client_secret
   NEXTAUTH_SECRET=ein_langes_random_secret
   ```

   Der Eintrag `DATABASE_URL` ist in der `docker-compose.yml` bereits für den lokalen Postgres‑Container gesetzt.

2. Starte die Container:

   ```bash
   docker-compose up -d
   ```

   Die Compose-Datei startet die Anwendung, eine PostgreSQL-Datenbank sowie einen Watchdog, der das Image aktuell hält.

## SaaS mit Supabase & Vercel

1. Erstelle ein Supabase-Projekt und notiere dir den Postgres-Verbindungsstring.
2. Lege in GitHub eine OAuth-App an, um GitHub als Authentifizierungsprovider zu nutzen.
3. Importiere dieses Repository als neues Projekt in Vercel und hinterlege die folgenden Umgebungsvariablen:

   ```env
   DATABASE_URL=<supabase_connection_string>
   GEMINI_API_KEY=<dein_gemini_api_key>
   GITHUB_ID=<deine_github_client_id>
   GITHUB_SECRET=<dein_github_client_secret>
   NEXTAUTH_SECRET=<ein_langes_random_secret>
   ```

4. Starte das Deployment in Vercel.

Die Gemini-Integration stellt die KI-Funktionalität bereit, und die Anmeldung erfolgt über GitHub.

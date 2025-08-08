# GehaltsKompass

## Datenbank einrichten und Anwendung starten

Initiale Einrichtung der Datenbank und Start der Anwendung.
Auch für neue Datenbankschemata verwenden (zuvor dev.db löschen).

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

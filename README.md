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

Auf APS den Proxy vorher setzen. Es wird nur die lokale SQLite-Datenbank verwendet.

```bash
 $env:HTTPS_PROXY="http://sia-lb.telekom.de:8080"
```

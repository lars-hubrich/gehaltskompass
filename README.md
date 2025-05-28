# GehaltsKompass

## Setup DB and run application

Initial setup of the database and running the application.
Also use for new database scheme (delete dev.db beforehand).

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

On APS set Proxy before hand. Only use local sqlite db.

```bash
 $env:HTTPS_PROXY="http://sia-lb.telekom.de:8080"
```

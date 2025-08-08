# Projektstruktur

Dieses Dokument beschreibt die Funktion der einzelnen Dateien und Ordner des Projekts.

## Wurzelverzeichnis

### Ordner `.github`

Konfigurationsdateien für GitHub.

- `workflows/ci.yml` – GitHub Actions Workflow für Continuous Integration.

### Ordner `.idea`

Projektkonfiguration für JetBrains IDEs.

- `jsLinters/eslint.xml` – IDE-Konfiguration für ESLint in JetBrains‑Tools.
- `prettier.xml` – IDE-Konfiguration für Prettier.
- `.gitignore` – legt Dateien fest, die von Git ignoriert werden.
- `.prettierignore` – Dateien, die nicht von Prettier formatiert werden sollen.
- `Dockerfile` – Definition des Docker-Images für die Anwendung.
- `README.md` – Übersicht und Hinweise zur Anwendung.
- `cypress.config.ts` – Konfiguration für Cypress End‑to‑End‑Tests.
- `docker-compose.yml` – lokale Container-Orchestrierung.
- `eslint.config.mjs` – zentrale ESLint‑Konfiguration.
- `jest.config.ts` – Konfiguration für Jest Tests.
- `jest.setup.ts` – Setup-Datei für Jest.
- `next.config.ts` – Next.js Konfiguration.
- `package.json` – Projektinformationen und npm-Skripte.
- `package-lock.json` – exakte Versionsabbildung der npm-Abhängigkeiten.
- `postcss.config.mjs` – Konfiguration von PostCSS/Tailwind.
- `node_modules/` – installierte Drittanbieter-Bibliotheken (nicht versioniert).
- `tsconfig.json` – TypeScript Konfiguration.

## Ordner `app`

- `favicon.ico` – Favicon der Anwendung.
- `globals.css` – globale CSS‑Definitionen.
- `layout.tsx` – Basislayout der App.
- `page.tsx` – Startseite.
- `providers.tsx` – Kontext-Provider für die App.
- `login/page.tsx` – Loginseite.

### Ordner `app/(auth)`

- `layout.tsx` – Layout für geschützte Bereiche.
- `(nav)/layout.tsx` – Layout für Navigationsseiten.
- `(nav)/dashboard/page.tsx` – Dashboard‑Seite.
- `(nav)/insights/page.tsx` – Insights‑Seite.
- `(nav)/statements/page.tsx` – Übersicht über Statements.

### Ordner `app/api`

#### `auth/[...nextauth]`

- `route.ts` – NextAuth API‑Route für Authentifizierung.
- `route.test.ts` – Tests für die Authentifizierungs‑Route.

#### `chat`

- `route.ts` – API‑Route für Chat‑Funktionen.
- `route.test.ts` – Tests für die Chat‑Route.

#### `extract`

- `route.ts` – API‑Route zum Extrahieren von Daten aus Uploads.
- `route.test.ts` – Tests für diese Extraktions‑Route.

#### `statement`

- `route.ts` – API‑Route zum Anlegen von Statements.
- `route.test.ts` – Tests für das Anlegen von Statements.
- `[id]/route.ts` – API‑Route für einzelne Statements.
- `[id]/route.test.ts` – Tests für die Einzel‑Statement‑Route.

#### `user`

- `route.ts` – API‑Route für Benutzerdaten.
- `route.test.ts` – Tests für die Benutzer‑Route.
- `export/route.ts` – Export von Benutzerdaten.
- `export/route.test.ts` – Tests für den Export.
- `import/route.ts` – Import von Benutzerdaten.
- `import/route.test.ts` – Tests für den Import.

## Ordner `components`

- `ErrorSnackbar.tsx` – Snackbar für Fehlermeldungen.
- `LoadingScreen.tsx` – Ladeanzeige.
- `StatementForm.tsx` – Formular zum Erfassen von Statements.

### Ordner `components/dashboard`

- `HighlightedCard.tsx` – Hervorgehobene Kennzahlenkarte.
- `MainGrid.tsx` – Hauptlayout des Dashboards.
- `NoStatementsCard.tsx` – Hinweiskarte bei fehlenden Statements.
- `StatCard.tsx` – Karte für einzelne Kennzahlen.
- `StatementBarChart.tsx` – Balkendiagramm für Statements.
- `StatementLineChart.tsx` – Liniendiagramm für Statements.
- `StatementPieChart.tsx` – Tortendiagramm für Statements.

### Ordner `components/icons`

- `CustomIcons.tsx` – Sammlung benutzerdefinierter Icons.
- `GehaltskompassIcon.tsx` – App-spezifisches Icon.

### Ordner `components/login`

- `AppAppBar.tsx` – App-Bar der Login-Seiten.
- `Features.tsx` – Feature-Beschreibung im Login.
- `Hero.tsx` – Hero-Sektion der Login-Seiten.

### Ordner `components/navigation`

- `AppNavbar.tsx` – Navigationsleiste der App.
- `Header.tsx` – Kopfbereich der Seiten.
- `LogoutButton.tsx` – Button zum Abmelden.
- `MenuButton.tsx` – Button zur Menüsteuerung.
- `MenuContent.tsx` – Inhalt des Navigationsmenüs.
- `NavbarBreadcrumbs.tsx` – Brotkrumen-Navigation.
- `SideMenu.tsx` – Seitenmenü für Desktop.
- `SideMenuMobile.tsx` – Seitenmenü für mobile Ansicht.

### Ordner `components/statements`

- `StatementDataGrid.tsx` – Datenraster für Statements.
- `StatementsGrid.tsx` – Übersichtsgrid der Statements.

## Ordner `constants`

- `Interfaces.ts` – TypeScript-Interfaces.
- `fieldDescriptions.ts` – Beschreibungen der Formularfelder.
- `limits.ts` – Konstanten für Wertebereiche.
- `sampleStatements.ts` – Beispielhafte Statement-Daten.

## Ordner `cypress`

- `e2e/auth.feature` – BDD-Spezifikation für Authentifizierung.
- `e2e/auth.ts` – Schrittdefinitionen für `auth.feature`.
- `e2e/dashboard.feature` – BDD-Spezifikation für Dashboard.
- `e2e/dashboard.ts` – Schrittdefinitionen für `dashboard.feature`.
- `e2e/insights.feature` – Spezifikation für Insights.
- `e2e/insights.ts` – Schrittdefinitionen für Insights.
- `e2e/login.feature` – Spezifikation für Login.
- `e2e/login.ts` – Schrittdefinitionen für Login.
- `e2e/statements.feature` – Spezifikation für Statements.
- `e2e/statements.ts` – Schrittdefinitionen für Statements.
- `support/e2e.ts` – globale Cypress-Hooks.
- `support/global.d.ts` – globale TypeScript-Typen für Cypress.

## Ordner `lib`

- `auth.tsx` – Hilfsfunktionen für Authentifizierung im Client.
- `prisma.ts` – Prisma Client-Initialisierung.
- `server-utils.ts` – allgemeine Server-Helfer.

### Ordner `lib/statements`

- `chart-data.ts` – Aufbereitung von Statement-Daten für Charts.
- `utils.ts` – Utility-Funktionen für Statements.
- `utils.test.ts` – Tests für `utils.ts`.
- `validation.ts` – Validierung von Statements.
- `validation.test.ts` – Tests für `validation.ts`.

## Ordner `prisma`

- `schema.prisma` – Datenbankschema für Prisma.

## Ordner `public/images`

- `logo.png` – Vollständiges Logo.
- `logo_icon.png` – Ikonenvariante.
- `logo_transparent.png` – Transparentes Logo.

## Ordner `theme`

- `AppTheme.tsx` – Einstiegspunkt für das MUI‑Theme.
- `ColorModeIconDropdown.tsx` – Auswahl der Farbmodi über Icons.
- `ColorModeSelect.tsx` – Auswahl der Farbmodi als Select.
- `themePrimitives.ts` – Grundlegende Theme‑Konstanten.

### Ordner `theme/customizations`

- `charts.ts` – Theme-Anpassungen für Diagramme.
- `dataDisplay.tsx` – Theme-Anpassungen für Datenanzeige-Komponenten.
- `dataGrid.ts` – Anpassungen für DataGrid-Komponente.
- `feedback.tsx` – Anpassungen für Feedback-Komponenten.
- `index.ts` – Exporte der Anpassungsmodule.
- `inputs.tsx` – Anpassungen für Eingabekomponenten.
- `navigation.tsx` – Anpassungen für Navigation.
- `surfaces.ts` – Anpassungen für Oberflächenkomponenten.

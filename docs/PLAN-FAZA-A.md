# Plan Faza A — interfața cu date mock

Stare: **propunere, așteaptă aprobarea**. Nu s-a scris cod.

Decizie de stack (24.09.2026): Vuexy nu e disponibil încă. Construim pe **Next.js + MUI** (aceeași bază ca Vuexy), cu tema definită din `design/tokens.json`. Referința de componente este **Material 3 Design Kit** din Figma (structura componentelor), adaptată la „Precizie calmă”. Dacă Vuexy se cumpără ulterior, se poate adăuga fără rescrierea ecranelor.

---

## 1. Stack concret pentru Faza A

| Ce | Alegere | De ce |
|---|---|---|
| Framework | Next.js (App Router), TypeScript `strict` | din `CLAUDE.md` |
| UI | MUI (`@mui/material`) + `@mui/material-nextjs` (AppRouterCacheProvider) | baza Vuexy; temă centralizată |
| Iconuri | `@tabler/icons-react`, stroke 1.5 | setul din mockup-uri și Vuexy |
| Formulare | `react-hook-form` + `zod` (`@hookform/resolvers`) | validare la blur, aceleași scheme vor rula pe server în Faza B |
| Grafice | ApexCharts (`react-apexcharts`) | e librăria din Vuexy (cerută de SPEC §3.4) |
| Toast | MUI `Snackbar` într-un provider propriu, jos-dreapta, 4 s | fără dependență în plus |
| Fonturi | Inter 400/500/600 + Montserrat 700, locale din `public/fonts/` | din `design/fonts/`, fără Google Fonts |
| Teste | Vitest (logică), Playwright + `@axe-core/playwright` (fluxuri, 390 px, a11y) | din `CLAUDE.md` |
| Calitate | ESLint (config Next) + Prettier | |

Fără dark mode, fără customizer de temă.

## 2. Cum aplic tema

- `src/theme/tokens.ts` — tokenii tipați, generați o dată din `design/tokens.json` (un script mic, ca să nu divergă).
- `src/theme/theme.ts` — `createTheme`:
  - `palette.primary` = petrol / petrol-hover / petrol-soft; `success|warning|error` = tokenii de status (`main` = fill, `dark` = varianta `-text`, `light` = `-soft`); culori custom `ai`, `aiSoft`, `highlight`, `line`, `lineStrong`, `canvas` prin augmentarea tipurilor MUI;
  - `typography`: Inter, variantele `display 28/36`, `heading 20/28`, `subheading 16/24`, `body 14/20`, `bodyStrong 14/20·500`, `caption 13/18`, `metric 28/32` (variante custom, tipate);
  - `shape.borderRadius = 8`; carduri 10, badge-uri 6 prin `components` overrides;
  - `spacing = 4` (grilă de 4 px);
  - `shadows`: toate `none`, cu excepția celor folosite de Menu / Popover / Dialog / Snackbar → `shadow-overlay`;
  - overrides globale: `MuiButton` (fără uppercase, fără elevație, 40 px, 44 px pe mobil), `MuiCard` / `MuiPaper` (bordură `line`, fără umbră), `MuiOutlinedInput` (bordură `line-strong`, focus petrol), `MuiTableCell` (antet 12 px `ink-muted`, cifre tabulare), `MuiChip` (radius 6), focus vizibil global: inel petrol 2 px, offset 2 px;
  - `transitions`: durate 150 / 200 ms, `ease-out`; dezactivate la `prefers-reduced-motion`.
- `public/fonts/` + `@font-face` din `design/fonts/fonts.css`; `public/brand/deee-manager-mark.png`.
- Componenta `Logo`: simbol 28 px + „DEEE Manager” Montserrat 700 17 px `#0A2114`.

## 3. Material 3 (Figma) → MUI → tokeni

Din kitul Material 3 luăm **structura** (anatomie, stări, variante); aspectul vine din tokeni.

| Material 3 | Componentă MUI | Adaptare „Precizie calmă” |
|---|---|---|
| Button filled / outlined / text | `Button` contained / outlined / text | radius 8 (nu pastilă), petrol, fără tonal/elevated; o singură acțiune `contained` pe ecran |
| Icon button | `IconButton` | 40 px (44 pe mobil), `aria-label` obligatoriu |
| Text field (outlined) | `TextField` outlined | eticheta deasupra câmpului (13 px), nu floating label ca în M3 |
| Navigation drawer | `Drawer` permanent / temporary | 248 px, alb, bordură dreapta; temporary sub 1024 px |
| Top app bar | `AppBar` | 64 px, alb, bordură jos, fără umbră |
| Data table (list) | `Table` | rânduri 48 px, hover `canvas`, rând întreg clicabil; sub 640 px → carduri |
| Chips (filter / input) | `Chip` | filtre active ștergibile, radius 6 |
| Badge / assist chip | `Chip` mic → `StatusBadge` | culorile de status, textul în varianta `-text` |
| Tabs (secondary) | `Tabs` | indicator petrol, fără ripple colorat |
| Progress indicator (linear) | `LinearProgress` | 4–6 px, petrol, tranziție pe lățime |
| Dialog | `Dialog` | radius 10, `shadow-overlay` |
| Snackbar | `Snackbar` | jos-dreapta, 4 s |
| Menu | `Menu` | radius 8, `shadow-overlay` |
| Checkbox / Radio / Switch | aceleași | petrol; animație de bifare scale 0.8 → 1 |
| Tooltip | `Tooltip` | ink pe fundal închis, 13 px |
| Stepper (nu există în M3) | `Stepper` custom | cerc petrol + bifă; pe mobil, bară în 3 segmente „Pasul X din 3” |

Figma îl consult punctual (planul Starter are limite mici de cereri), doar când o stare a unei componente nu e clară din mockup-uri.

## 4. Structura de foldere

```
src/
  app/
    (auth)/              autentificare, inregistrare, confirmare-email, recuperare-parola,
                         resetare-parola/[token], activare-cont/[token]   → AuthShell
    (colector)/          panou, loturi, loturi/nou, loturi/[id], loturi/[id]/editare,
                         onboarding, organizatie, cont                    → AppShell colector
    admin/               page (panou), verificari, verificari/[lotId], colectori,
                         colectori/[id], loturi, taxonomie                → AppShell admin
    acces-interzis/, eroare/ (+ error.tsx), not-found.tsx (/404)
    layout.tsx           ThemeProvider, fonturi, ToastProvider
  middleware.ts          redirect după rol; colector neactivat → /onboarding
  theme/                 tokens.ts, theme.ts, types (augmentare MUI)
  components/
    layout/              AppShell, Sidebar, Topbar, AuthShell, Breadcrumbs, PageHeader
    ui/                  StatusBadge, StatusDot, AiExtracted, SourceHighlight, EmptyState,
                         MetricCard, ResponsiveTable, FilterChips, UploadTile, Stepper,
                         SkeletonCard, Toast
  features/
    panou/               De rezolvat, StocCategorii, grafice, UltimeleLoturi
    loturi/              listă, filtre (în URL), arbore pe categorii, detaliu + tab-uri
    wizard/              pași, schemele zod, autosalvare, lista de documente cerute
    verificare/          coada (scurtături), raport (split view, vizualizator document)
    onboarding/, organizatie/, admin/ (colectori, taxonomie, panou admin)
  lib/
    domain/              tipuri (Lot, LinieLot, Sursa, DocumentLot, Verificare, Regula...),
                         statusuri + etichete, documente-cerute.ts (logica listei)
    format.ts            Intl ro-RO: 1.234,50 kg, 24.09.2026
    data/                interfața stratului de date (contracte TypeScript)
    mock/                implementarea mock a interfeței + seed-uri (taxonomie Anexa A,
                         coduri, loturi, colectori, rezultate reguli)
    session/             sesiune mock (rol + status cont, într-un cookie)
tests/
  unit/                  documente-cerute, scheme zod, format, izolarea pe organizație în mock
  e2e/                   navigare, wizard pe 390 px, coada din tastatură, axe
public/fonts/, public/brand/
```

## 5. Stratul de date mock

- `lib/data/` definește **contractele**: funcții async, ex. `loturi.list(ctx, filtre, pagina)`, `loturi.get(ctx, id)`, `loturi.saveDraft(ctx, draft)`, `verificari.coada(ctx)`, `verificari.decide(ctx, lotId, decizie)`, `taxonomie.tree()`, `organizatie.get(ctx)`.
- `ctx` = sesiunea (`organizatieId`, `rol`). **Orice funcție pe date operaționale filtrează după `ctx.organizatieId`** (colector) — același helper de acces care va exista în Faza B. Teste pentru izolare încă de acum.
- `lib/mock/` implementează contractele în memorie (+ `localStorage` doar pentru ciorna wizard-ului pe client), cu latență simulată mică, ca skeleton-urile să fie vizibile.
- În Faza B se scrie `lib/prisma/` cu aceleași contracte; ecranele nu se schimbă.
- Datele de exemplu din mockup-uri (Colector Demo SRL, LOT-2026-0418 etc.) intră în seed-ul mock, nu în componente.
- **Sesiune mock:** un comutator dev pe `/autentificare` („Intră ca: Colector activ / Colector neactivat / Admin”) setează cookie-ul, ca să poată fi testat middleware-ul și ambele meniuri. Dispare în Faza B.

## 6. Ordinea de implementare

| # | Livrabil | Verificare |
|---|---|---|
| 1 | Setup: Next + TS strict, MUI, tema din tokeni, fonturi locale, logo, ESLint/Prettier, Vitest, Playwright | pagină de probă cu tipografie, butoane, câmpuri, badge-uri |
| 2 | AppShell (sidebar 248, topbar 64, drawer < 1024 px, căutare cu `/`), AuthShell, sesiune mock, middleware, /404, /eroare, /acces-interzis | navigare ambele roluri |
| 3 | Componentele comune din `components/ui` + `lib/format` | teste unitare pentru format |
| 4 | **Panou colector** (mockup 01) | comparat cu `01-panou-colector.png` |
| 5 | Listă loturi (filtre în URL, arbore) + detaliu lot (tab-uri, banner completări) | |
| 6 | **Wizard lot** — pașii 1–3, zod, autosalvare 800 ms, lista de documente cerute, mobil (mockup 02, 02b) | teste unitare pentru `documente-cerute`; e2e pe 390 px |
| 7 | **Coada admin** cu scurtături (mockup 04) | e2e din tastatură |
| 8 | **Raport de verificare** split view, vizualizator cu zona evidențiată (mockup 03) | comparat cu PNG |
| 9 | Autentificare (toate paginile), onboarding | |
| 10 | Admin: panou, colectori + detaliu, loturi, taxonomie; Organizație, Cont | |
| 11 | Trecere finală: responsive, animații, `prefers-reduced-motion`, axe, contrast | criteriul „Gata când” din `CLAUDE.md` |

După fiecare punct marcat cu mockup mă opresc scurt să compari în browser.

## 7. Conflicte și decizii de confirmat

1. **Pasul proveniențelor în wizard.** Mockup-ul 02 pune „Proveniența lotului” pe pasul 2 (Documente); SPEC §5 recomandă pasul 1, fiindcă lista de documente se generează din ea. **Propun pasul 1**, conform spec-ului.
2. **Înălțimea rândurilor de tabel.** BRAND spune 44 px, SPEC 48–52 px, mockup-urile ~48 px. **Propun 48 px** (44 px e ținta minimă de atingere oricum).
3. **Antetul de tabel la 12 px** e în afara scării tipografice (13/14/16/20/28). **Propun 12 px / 500** doar pentru antetele de tabel și etichetele de grup cu majuscule (ca în mockup).
4. **Meniul admin.** `CLAUDE.md` cere și intrarea „Verificări” cu badge de număr; mockup-ul 03 are doar Panou · Colectori · Loturi · Taxonomie. **Propun să adaug „Verificări” cu badge**, după Panou.
5. **Mărimea iconurilor:** `CLAUDE.md` 18–24 px, BRAND 18–20 px. **Propun 18 px în meniu și butoane, 20 px în carduri, 24 doar în iconurile de categorie.**
6. **Fonturi:** BRAND menționează Google Fonts; `CLAUDE.md` cere fonturi locale. **Locale** (fișierele există în `design/fonts/`).
7. **Vizualizatorul de documente în Faza A:** imagini mock cu dreptunghiul de evidențiere din coordonate mock; randarea PDF reală (pdf.js) intră în Faza B/C.
8. **„Descarcă dosarul”** în Faza A: buton vizibil pe lot acceptat, fără PDF real (toast „disponibil în Faza B”).
9. **Material 3 vs. brand:** M3 are butoane pastilă, culori tonale, umbre de elevație și etichete flotante — toate înlocuite de tokeni (secțiunea 3).
10. **Logo:** SVG-urile au simbolul ca PNG încorporat; folosim PNG-ul, suficient la 28 px. Pentru favicon și dimensiuni mari e nevoie de vectorul complet (punct deschis la client).

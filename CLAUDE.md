# DEEE Manager — context pentru Claude Code

Acest fișier stă în rădăcina repo-ului și se citește la începutul fiecărei sesiuni. Conține deciziile deja luate. Nu le redeschide fără să întrebi.

## 1. Produsul

DEEE Manager (deeemanager.ro) este o platformă web B2B pentru colectorii de deșeuri de echipamente electrice și electronice (DEEE), construită pentru clientul Electronic Waste Collect.

Bucla MVP:
1. Colectorul își face cont, încarcă documentele firmei, iar contul e verificat de admin.
2. Colectorul încarcă un lot: linii pe subcategorie + cod deșeu, proveniență, foto/video, documente.
3. AI-ul citește documentele, extrage datele și rulează regulile de verificare R01–R13, apoi propune un verdict.
4. Administratorul acceptă, cere completări sau respinge.
5. Lotul acceptat intră în stoc, ordonat pe categorii, iar documentele se centralizează într-un dosar.

**Principiu nenegociabil:** AI-ul verifică, extrage și centralizează. NU generează documente noi și NU decide. Orice verdict e „propus de AI · confirmat de [admin]”.

## 2. Surse de adevăr (toate sunt în acest repo)

| Ce | Unde |
|---|---|
| Brief tehnic v1.0, arhitectura paginilor, plan MVP v1.1 | `docs/` |
| Identitate de brand, principii, voce, reguli vizuale | `design/BRAND.md` |
| Specificația fiecărui ecran: comportament, stări, animații, legături | `design/SPEC-ECRANE.md` |
| Tokeni de design | `design/tokens.json` (sursa) și `design/tokens.css` (variabile CSS) |
| Fonturi (Inter, Montserrat) — locale, licență OFL | `design/fonts/` |
| Logo | `design/brand/deee-manager-mark.png` + numele în Montserrat 700 `#0A2114` |
| Mockup-uri ecrane-cheie | `design/mockups/*.html` (se deschid în browser) și `design/mockups/png/*.png` |

**Înainte de a implementa un ecran:** citește secțiunea lui din `SPEC-ECRANE.md` și uită-te la PNG-ul corespunzător. Reproduci ierarhia, spațierea, stările și microcopy-ul; markup-ul mockup-urilor e doar referință, nu cod de copiat.

Pentru ecranele fără mockup (autentificare, onboarding, listă loturi, detaliu lot, admin), construiești în același limbaj vizual, după spec.

Versiunile live (opționale) ale design system-ului și mockup-urilor: https://claude.ai/artifact/KtuiAE6k1VSWmMGPNzyppD și https://claude.ai/artifact/5uJmgYeufHr4T7hwZYocJb. Fișierele din repo au prioritate.

## 3. Stack

- **UI:** Next.js + MUI, fără template (decizie 24.09.2026: Vuexy nu e disponibil). Tema se construiește din `design/tokens.json`. Referința de componente este Material 3 Design Kit (Figma), adaptată la tokeni. Vuexy poate fi adăugat ulterior; nu-l căuta în repo. Planul detaliat: `docs/PLAN-FAZA-A.md`.
- **Framework:** Next.js App Router, TypeScript strict. Server Components implicit; client components doar unde e interacțiune.
- **Date:** PostgreSQL + Prisma. Local: Docker Compose (Postgres + MinIO).
- **Auth:** Auth.js (credentials: email + parolă, hash argon2), sesiuni server-side, roluri `COLECTOR` și `ADMIN`.
- **Validare:** zod, pe server, pentru orice input.
- **Fișiere:** stocare S3-compatibilă (MinIO local, Cloudflare R2 în producție), upload prin URL-uri pre-semnate, acces prin URL-uri semnate.
- **Joburi (Faza C):** BullMQ + Redis, într-un worker separat pentru pipeline-ul AI.
- **AI (Faza C):** Anthropic API prin SDK-ul oficial, output JSON validat cu zod. Cheia doar în `.env`.
- **Teste:** Vitest pentru logică (mai ales regulile de verificare), Playwright pentru fluxurile principale.

Secretele stau DOAR în `.env` (există `.env.example` fără valori). Nu scrie niciodată chei în cod sau în commit-uri.

## 4. Design — „Precizie calmă”

### Tokens (se definesc în tema MUI, nu inline)

| Token | Valoare | Folosire |
|---|---|---|
| petrol | `#0F4C5C` | Primară: butoane principale, nav activ, linkuri, focus |
| petrol-hover | `#0B3C49` | Hover / apăsat |
| petrol-soft | `#E3EEF0` | Rând selectat, item activ în meniu |
| ink | `#0F1A1F` | Text principal |
| ink-muted | `#5B6770` | Text secundar, etichete |
| line | `#E3E7EA` | Borduri carduri, separatoare |
| line-strong | `#C9D0D5` | Borduri câmpuri |
| canvas | `#F6F7F7` | Fundal pagină |
| surface | `#FFFFFF` | Carduri, tabele, formulare |
| success / success-text / success-soft | `#1E8E5A` / `#17724A` / `#E6F4EC` | DOAR status |
| warning / warning-text / warning-soft | `#B7791F` / `#8A5A12` / `#FBF1DF` | DOAR status |
| danger / danger-soft | `#C53030` / `#FBE9E9` | DOAR status |
| ai / ai-soft | `#4F46E5` / `#EEEDFC` | EXCLUSIV marcajul datelor extrase de AI |
| highlight | `#FFF3B0` | Zona sursă evidențiată în documente |

Pentru text de status se folosesc variantele `-text`, nu fill-urile. Magenta din logo apare DOAR în logo.

### Tipografie, formă, mișcare

- **Font:** Inter (400/500/600) pentru toată interfața; Montserrat 700 doar în logo. Fonturile se servesc local, din `design/fonts/` (copiate în `public/fonts/`), nu de la Google Fonts.
- **Scară:** 13 / 14 / 16 / 20 / 28 px.
- **Cifre:** tabulare peste tot unde apar cantități (`font-variant-numeric: tabular-nums`), aliniate la dreapta în tabele.
- **Formate:** `Intl.NumberFormat('ro-RO')` → `1.234,50 kg`; date `24.09.2026`.
- **Grilă și forme:** grilă de 4 px; padding card 24 px; gutter 16 px; radius carduri 10 px, câmpuri și butoane 8 px, badge-uri 6 px.
- **Adâncime:** borduri, nu umbre. Umbra doar pe elemente care plutesc (meniuri, modale, toast).
- **Iconuri:** Tabler Icons, 18–24 px, stroke 1.5. Categorii: 1 frigider, 2 monitor, 3 bec, 4 mașină de spălat, 5 cuptor cu microunde, 6 telefon.
- **Animații:** 150–200 ms, doar funcționale (deschidere drawer/modal, apariție toast, tranziție între pașii wizard-ului, expand în arbore). Respectă `prefers-reduced-motion`. Fără animații decorative.
- **Mod întunecat:** dezactivat în MVP. Fără customizer de temă și fără aplicații demo.

### Principii de interfață

1. **O singură acțiune principală pe ecran**, buton petrol plin; restul sunt secundare.
2. **Fiecare cifră verificată se poate deschide la sursă:** documentul cu zona evidențiată.
3. **Datele extrase de AI** au iconul și eticheta „Extras de AI” (culoarea `ai`) și fundal `ai-soft`.
4. **Teren întâi:**
   - ținte de minimum 44 px;
   - `<input type="file" accept="image/*" capture="environment">` pentru fotografiere și `accept="video/*"` pentru filmare;
   - ciorna se salvează automat, debounced la ~800 ms.
5. **Microcopy în română, la persoana a II-a, fără exclamări.** Erorile spun ce e de făcut.
6. **Stări goale** cu un singur buton; skeleton-uri la încărcare, nu spinnere pe toată pagina.

## 5. Rute

- **Autentificare:** `/autentificare`, `/inregistrare`, `/confirmare-email`, `/recuperare-parola`, `/resetare-parola/[token]`, `/activare-cont/[token]`
- **Colector:** `/panou`, `/loturi`, `/loturi/nou`, `/loturi/[id]`, `/loturi/[id]/editare`, `/onboarding`, `/organizatie`, `/cont`
- **Admin:** `/admin`, `/admin/verificari` (coada), `/admin/verificari/[lotId]` (raport), `/admin/colectori`, `/admin/colectori/[id]`, `/admin/loturi`, `/admin/taxonomie`
- **Sistem:** `/404`, `/eroare`, `/acces-interzis`

Meniul lateral:
- colector: Panou · Loturi · Organizație
- admin: Panou · Colectori · Loturi · Taxonomie, plus Verificări cu badge de număr

Middleware-ul redirecționează după rol, iar un colector cu contul neactivat ajunge pe `/onboarding`.

## 6. Model de date (Prisma)

| Model | Rol |
|---|---|
| `Organizatie` | Colectorul sau administratorul; are tip și status cont |
| `Utilizator` | Aparține unei organizații; are rol |
| `DocumentOrganizatie` | Documentele de onboarding |
| `Autorizatie` | Număr, valabilitate, visa, `coduriAutorizate[]` |
| `Categorie`, `Subcategorie` | Taxonomia, seed din Anexa A a briefului; unitate de tarif `PER_BUCATA` sau `PER_KG` |
| `CodDeseu` | Codul din lista de deșeuri, cu marcaj periculos |
| `Lot` | Antetul lotului |
| `LinieLot` | Subcategorie, cod, cantitate (buc/kg), sursă |
| `Sursa` | Tip, denumire, CUI, adresă, contract, document de proveniență |
| `FisierMedia` | Foto/video, cu hash |
| `DocumentLot` | Tip, fișier, hash, `dateExtrase` (JSON), încredere, versiune model |
| `Verificare` | Rezultatele pe reguli, verdict propus, decizie, motiv, cine și când a decis |
| `Regula` | Cod, activă, severitate, toleranță |
| `LotIstoric` | Audit log |

Chei primare uuid pe entitățile operaționale.

**Izolare multi-tenant:** fiecare query pe date operaționale filtrează după `organizatieId` din sesiune, într-un singur helper de acces. Un colector nu vede niciodată datele altuia. Scrie teste pentru asta.

**Statusuri lot:** `CIORNA`, `IN_VERIFICARE`, `NECESITA_COMPLETARI`, `ACCEPTAT`, `RESPINS`, `ANULAT`. Etichete UI: Ciornă, În verificare, Necesită completări, Acceptat, Respins, Anulat.

## 7. Faze de lucru

Lucrează o fază pe rând. La finalul fiecărei faze, oprește-te, rezumă ce ai făcut și ce ai presupus, și așteaptă confirmarea.

**Faza A — Interfața cu date mock**
- Tema, layout-ul și meniul personalizate.
- Toate ecranele din secțiunea 5 cu navigarea completă, pe un strat de date mock tipat (`lib/mock`), care expune aceeași interfață ca viitorul strat real.
- Wizard-ul de lot funcțional pe client:
  - pașii și validarea cu zod;
  - lista de documente cerute generată din proveniență și din codurile periculoase;
  - autosalvarea.
- Raportul de verificare cu split view, coada admin cu scurtături de tastatură (săgeți, Enter, A / C / R, active doar pe pagina cozii), animațiile din secțiunea 4.
- **Gata când:** fiecare ecran din mockup-uri e implementat fidel, responsive (inclusiv wizard-ul pe 390 px), și trece verificarea de accesibilitate de bază (contrast, focus vizibil, etichete).

**Faza B — Backend real**
- Schema Prisma și migrațiile; seed pentru taxonomie și coduri.
- Auth și roluri; onboarding cu upload în S3.
- Validarea CUI prin serviciul public ANAF.
- CRUD pentru loturi, audit log, înlocuirea stratului mock cu cel real.
- **Gata când:** fluxurile colector și admin merg cap-coadă fără AI, cu teste pentru izolarea datelor.

**Faza C — Pipeline AI**
- Worker cu coadă de joburi; clasificare și extracție per tip de document, cu schemă JSON fixă.
- Regulile R01–R13 implementate în cod, pe datele extrase; AI doar pentru R11 și R13.
- Raportul de verificare generat și salvat, cu versiunea de prompt și model.
- **Toleranțele sunt configurabile din admin, nu hardcodate.** Regulamentul de verificare nu e încă validat de client: implementează regulile ca listă de reguli configurabile și marchează în cod unde e nevoie de validare.

## 8. Ce NU faci

- Nu generezi documente legale (aviz, Anexa 3, borderou etc.). Dosarul lotului este doar compilarea documentelor încărcate.
- Nu construiești marketplace, anunțuri către OTR/brokeri, modulul Lichidatori sau rating: nu fac parte din DEEE Manager.
- Nu folosești culorile de status sau magenta decorativ; nu adaugi dark mode, emoji sau gradienturi.
- Nu inventezi reguli legale: dacă o regulă de conformitate nu e clară, lasă un `TODO(validare-client)` și întreabă.
- Nu rulezi migrații distructive și nu ștergi date fără confirmare.

# Faza A — rezumat

Interfața completă pe date mock. Fiecare ecran din `CLAUDE.md` §5 există, cu navigarea completă, pe stratul `lib/data` (interfață) implementat de `lib/mock`. În Faza B se înlocuiește doar implementarea; ecranele rămân aceleași.

## Cum se încearcă

| Cont de test | Email | Ce vezi |
|---|---|---|
| Colector cu cont activ | andrei@colectordemo.ro | Panou, loturi, lot nou, organizație |
| Colector cu cont neactivat | maria@ecorecilfov.ro | Activarea contului, cu extrasul ONRC respins |
| Administrator platformă | elena@ewastecollect.ro | Panou admin, coada, raport, colectori, taxonomie |

- Parola tuturor conturilor de test: `DeeeDemo2026!`. Pe `/autentificare` există și butoane de intrare directă.
- Cont nou: `/inregistrare`, apoi codul de confirmare `246810`.
- Linkuri de test: `/resetare-parola/demo`, `/activare-cont/demo`. Orice alt token arată starea de link expirat.
- Datele modificate (decizii, ciorne, onboarding, taxonomie) trăiesc în memoria serverului și se pierd la repornire.

## Verificare

- `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run test:e2e` (Playwright, desktop 1440 px și telefon 390 px).
- `tests/e2e/ecrane.spec.ts` trece prin toate rutele, pentru fiecare rol:
  - un singur titlu h1 vizibil;
  - fără scroll orizontal, la 390 / 768 / 1024 / 1280 / 1440 px;
  - axe WCAG 2.2 A/AA (contrast, etichete, mărimea țintelor);
  - dialoguri deschise;
  - „Sari la conținut” și inelul de focus;
  - focusul nu rămâne sub barele lipite;
  - `prefers-reduced-motion`;
  - ținte de minimum 44 px pe telefon;
  - fonturi servite local.
- Izolarea datelor între colectori e testată în `tests/unit` (loturi, raport, onboarding, colectori).

## Abateri de la mockup-uri și spec

- Graficul de statusuri de pe panou folosește cifrele calculate din date, nu cele desenate în mockup; graficele sunt componente proprii, nu ApexCharts.
- În coadă, C și R deschid un dialog cu motivul precompletat; nu aplică decizia direct.
- Codul subcategoriei nu se editează în taxonomie: loturile existente sunt legate de el. Se pot edita denumirea, unitatea și tariful; propunere pentru Faza B: versiuni de taxonomie.
- Pe detaliul colectorului există un singur buton principal, „Aprobă toate”; fiecare document are și „Aprobă” / „Cere reîncărcare”.
- `/dev/tema` (pagina de probă a temei) a fost scoasă la finalul fazei.

## Ce vine în Faza B și e doar simulat acum

- Autentificarea (Auth.js, argon2), emailurile, codurile și tokenurile.
- Legătura dintre activarea contului de către admin și sesiunea colectorului: contul de test „neactivat” rămâne neactivat.
- Upload-ul în S3 (fișierele au doar nume și mărime); „Descarcă dosarul”.
- Validarea CUI la ANAF (răspunsuri simulate); extragerea AI (valori simulate, marcate „Extras de AI”).
- Schimbarea parolei din Cont nu se salvează.

## Întrebări deschise pentru client — `TODO(validare-client)` în cod

1. Maparea subcategorie → coduri de deșeu permise (inclusiv codurile periculoase cu asterisc); vezi `docs/NOTE-MATERIALE-CLIENT.md`.
2. Severitatea și toleranța fiecărei reguli R01–R13. Propunerile actuale: R02 ±1%, R09 ±30%. Se editează din `/admin/taxonomie` → Reguli.
3. La loturile doar de la persoane fizice se cer tot tichetul de cântar și filmarea?
4. Vechimea maximă acceptată a extrasului ONRC (am presupus 30 de zile).
5. Greutățile medii de referință pentru R09: cele din Excel sau valori proprii?
6. Logo vectorial complet, pentru favicon și dimensiuni mari.

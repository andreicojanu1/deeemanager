# DEEE Manager — identitate de brand și design system

DEEE Manager este platforma prin care colectorii de DEEE își încarcă loturile, iar acestea sunt verificate cu ajutorul AI înainte de a intra în stoc. Direcția de design se numește **„Precizie calmă”**: un registru digital sobru, aerisit, cu cifre impecabile și zero zgomot vizual. Tonul de referință este un instrument financiar serios, nu o aplicație „eco”. Utilizatorii sunt verificați de Garda de Mediu, iar produsul trebuie să transmită ordine și control.

Interfața este construită pe template-ul Vuexy, personalizat după regulile de mai jos.

## Principii

1. **Statusul e interfața.** Fiecare lot arată mereu unde se află și care e următorul pas. Pe fiecare ecran există o singură acțiune principală (buton `petrol`); restul acțiunilor sunt secundare (contur sau text).
2. **Fiecare cifră are o sursă.** Orice cantitate sau cod verificat se poate deschide pentru a vedea documentul original, cu zona sursă marcată cu `highlight`.
3. **AI-ul e vizibil, dar nu decide.** Datele extrase de AI poartă marcajul `ai` (icon + „extras de AI”) și fundalul `ai-soft`. Un verdict se scrie mereu „Propus de AI · confirmat de [nume]”. Fără animații „magice”.
4. **Teren întâi.** Încărcarea lotului se face des de pe telefon: ținte de minimum 44 px, fotografiere direct din aplicație, ciornă salvată automat la fiecare câmp.
5. **Limbaj de om, nu de lege.** Termenul legal rămâne, cu o explicație scurtă alături: „Anexa 3 — formularul de încărcare-descărcare semnat la transport”.
6. **Densitate controlată.** Tabelele sunt compacte (rânduri de 44 px), formularele aerisite (un grup de câmpuri pe rând). Detaliile apar la click.

## Voce și microcopy

- Română peste tot, cu diacritice corecte (ș, ț cu virgulă).
- Propoziții scurte, la persoana a II-a, fără exclamări. „Mai lipsește tichetul de cântar.”, nu „Eroare: document lipsă!”.
- Erorile spun ce e de făcut: „Încarcă din nou avizul — imaginea e neclară în zona cantității.”
- Stările goale au un singur buton: „Nu ai încă loturi. **Încarcă primul lot**”.
- Statusurile lotului au exact aceste nume: Ciornă, În verificare, Necesită completări, Acceptat, Respins, Anulat.

## Culoare

Culoarea poartă sens; nu se folosește decorativ.

- `petrol` e singura culoare de brand. Fundalul paginii e `canvas`, cardurile sunt `surface`, textul e `ink` / `ink-muted`.
- `success`, `warning`, `danger` au **monopol pe statusuri** (semaforul verificării, statusul lotului). Nu apar niciodată pe butoane de brand sau în grafice decorative. De aceea brandul nu e verde.
- Ca text, succesul și avertismentul folosesc `success-text` și `warning-text`: nuanțele de fill nu au contrast suficient pe alb.
- `ai` apare rar și doar pentru ce a extras AI-ul.
- Graficele folosesc `petrol` și nuanțe de gri; culorile de status doar dacă graficul chiar arată statusuri.

## Tipografie

Un singur font, Inter (Google Fonts), în greutățile 400, 500 și 600. Cantitățile, codurile și sumele au mereu cifre tabulare (`font-variant-numeric: tabular-nums`) și sunt aliniate la dreapta în tabele. Formatul numeric este cel românesc: `1.234,50 kg`, `24 buc`, date `24.09.2026`.

## Formă, spațiu, adâncime

- Grilă de 4 px (`space-1` … `space-8`). Cardurile au padding `space-6`, gutter `space-4`.
- Colțuri: carduri `radius-lg` (10 px), câmpuri și butoane `radius-md` (8 px), badge-uri `radius-sm`.
- Borduri `line` în loc de umbre. `shadow-overlay` doar pentru ce plutește (meniuri, modale).
- Iconuri: un singur set, Tabler Icons (cel din Vuexy), linie de 1,5 px, 18–20 px.
- Mișcare: 150–200 ms, doar funcțională (deschidere, confirmare). Fără mod întunecat în MVP.

## Tipare de ecran

- **Dashboard colector:** blocul „De rezolvat” sus (loturi cu completări cerute, documente care expiră), apoi stocul pe cele 6 categorii în carduri (kg + buc), apoi ultimele loturi.
- **Wizard lot:** stepper în 3 pași, mereu vizibil; în lateral (jos pe mobil) lista de documente cerute, care se bifează pe măsură ce sunt încărcate.
- **Raport de verificare:** split view — regulile R01–R13 cu semafor în stânga, documentul cu zona sursă evidențiată în dreapta; la click pe o neconcordanță se văd ambele valori și ambele surse.
- **Coada admin:** tabel sortat după prioritate și vechime; lucru din tastatură — săgeți, `A` acceptă, `R` respinge, `C` cere completări.
- **Stoc:** arbore categorie → subcategorie → cod deșeu, totaluri aliniate la dreapta.

## Personalizarea Vuexy

Paleta de mai sus înlocuiește movul implicit (`#7367F0`); fontul devine Inter; umbrele cardurilor dispar; meniul lateral are 3 intrări pentru colector (Panou, Loturi, Organizație) și 4 pentru admin (Panou, Colectori, Loturi, Taxonomie); se elimină aplicațiile demo, customizer-ul de temă și modul întunecat.

## Logo

Logo-ul oficial are două părți:

- **Simbolul:** un hexagon construit din benzi, în gradient magenta (de la `#F06BA8` la `#ED1890`). Fișierul: `design/brand/deee-manager-mark.png`.
- **Numele „DEEE Manager”:** Montserrat Bold (700), culoarea `#0A2114`.

În aplicație, simbolul are 28 px înălțime în colțul din stânga-sus al meniului lateral, urmat de nume în Montserrat Bold, la 17 px. Montserrat se folosește **doar** în logo; restul interfeței rămâne în Inter.

Magenta aparține exclusiv logo-ului. Nu se folosește pe butoane, linkuri, grafice sau statusuri, unde rolurile sunt deja ocupate de `petrol` și de culorile semaforului.

**Limitare a fișierelor primite:** SVG-urile furnizate conțin simbolul ca imagine PNG de 152 × 132 px încorporată, iar numele ca text care nu a fost convertit în contur. Consecințe: simbolul devine neclar la dimensiuni mari, iar numele se afișează în alt font acolo unde Montserrat nu e instalat. Pentru producție e nevoie de un SVG vectorial complet, cu textul convertit în contururi.

## Fișiere în acest pachet

- `design/tokens.json` — sursa tokenilor (culori, tipografie, spațiere, radius, umbre), cu nota de folosire pentru fiecare.
- `design/tokens.css` — aceiași tokeni ca variabile CSS, gata de importat.
- `design/fonts/` — Inter (400/500/600) și Montserrat (700), fișiere woff2 locale + `fonts.css`. Licență OFL: se pot folosi comercial și se servesc de pe domeniul propriu, fără Google Fonts.
- `design/brand/` — simbolul logo (PNG, transparent) și SVG-urile originale furnizate (conțin simbolul ca PNG încorporat).
- `design/mockups/` — ecranele-cheie ca HTML static (se deschid în browser) și capturi PNG în `png/`.

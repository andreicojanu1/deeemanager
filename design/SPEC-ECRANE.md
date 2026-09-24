# DEEE Manager — specificația ecranelor, fluxurilor și interacțiunilor

Documentul descrie **ce** face fiecare ecran și **cum** se comportă. Aspectul vizual e în `design/mockups/` (HTML + PNG), iar regulile vizuale în `design/BRAND.md`.

Datele din mockup-uri (nume de firme, loturi, cantități) sunt exemple. În Faza A se folosesc ca date mock; nu se hardcodează în componente.

---

## 0. Reguli comune tuturor ecranelor

**Layout (App shell)**
- **Meniu lateral de 248 px, alb, cu bordură dreapta:**
  - sus, logo-ul (simbol de 28 px + „DEEE Manager” în Montserrat 700, `#0A2114`);
  - la mijloc, navigarea;
  - jos, un card cu organizația și rolul.
- **Bară superioară de 64 px:**
  - breadcrumb;
  - căutare globală de 280 px (loturi, coduri, documente), cu scurtătura `/` pentru focus;
  - notificări;
  - avatar cu meniu: Cont, Delogare.
- **Conținut:** fundal `canvas`, padding 32 px, secțiuni la 24 px distanță.
- **Sub 1024 px** meniul devine drawer (hamburger în bara superioară). Sub 640 px, tabelele devin liste de carduri.

**Titlul paginii**
- 28 px / 600, cu subtitlul dedesubt în `ink-muted`.
- Acțiunea principală a paginii stă aliniată la dreapta titlului.

**Tabele**
- Rânduri de 48–52 px, antet 12 px `ink-muted`.
- Cifrele aliniate la dreapta, tabulare.
- Hover pe rând: fundal `canvas`. Tot rândul e clicabil și duce la detaliu.
- Paginare server-side, 25 de rânduri pe pagină.

**Badge-uri de status lot**
| Status | Culoare |
|---|---|
| Ciornă | neutral |
| În verificare | petrol |
| Necesită completări | warning |
| Acceptat | success |
| Respins | danger |
| Anulat | neutral tăiat |

**Feedback**
- Toast jos-dreapta, 4 s, pentru confirmări („Lotul a fost trimis la verificare”).
- Erorile de validare apar sub câmp, în `danger`, cu textul „ce ai de făcut”.
- Nu se folosesc `alert()` sau modale pentru confirmări simple.

**Încărcare:** skeleton-uri cu forma conținutului; butonul apăsat primește un spinner mic în interior și devine dezactivat.

**Animații (150–200 ms, `ease-out`)**
- deschiderea drawer-ului, modalelor și meniurilor;
- tranziția între pașii wizard-ului (fade + slide 8 px);
- expandarea rândurilor și arborilor;
- apariția toast-urilor;
- bara de progres a documentelor (width transition);
- bifarea unui element din listă (scale 0.8 → 1).

Toate se dezactivează la `prefers-reduced-motion`.

**Accesibilitate**
- focus vizibil: inel `petrol` de 2 px cu offset de 2 px;
- toate acțiunile accesibile din tastatură;
- `aria-label` pe butoanele care au doar icon;
- contrast minim 4,5:1.

---

## 1. Autentificare (fără mockup — construiește în același stil)

Layout „Auth shell”: card alb centrat, de 440 px, pe `canvas`. Logo-ul stă deasupra cardului. Fără meniu.

- **/autentificare**
  - câmpuri email și parolă (cu buton afișează/ascunde);
  - butonul „Intră în cont”;
  - link-urile „Ai uitat parola?” și „Nu ai cont? Înregistrează-te”;
  - la eroare: „Emailul sau parola nu sunt corecte.” Nu se spune care dintre ele e greșit.
- **/inregistrare**
  - câmpuri: nume și prenume, email, parolă (cu indicator de complexitate), tip cont (Colector / Colector-Tratator / Tratator);
  - bifă de acceptare a termenilor și a politicii de confidențialitate.
  - După trimitere → /confirmare-email.
- **/confirmare-email:** câmp pentru cod de 6 cifre, auto-avans între cifre, „Retrimite codul” (disponibil după 60 s). După confirmare → /onboarding.
- **/recuperare-parola, /resetare-parola/[token], /activare-cont/[token]:** conform arhitecturii paginilor. Mesajul de confirmare e neutru: „Dacă adresa există, vei primi un email.”

---

## 2. Onboarding colector — /onboarding (fără mockup)

Cont nou sau neactivat. Middleware-ul trimite aici orice colector cu cont neactivat.

- **Antet:** „Activează-ți contul” și un stepper cu 4 stări: Documente → În verificare → Vizită în teren → Activ.
- **Secțiunea „Date firmă”:**
  - câmp CUI; la blur se cere datele de la ANAF, cu skeleton cât se încarcă;
  - denumirea și adresa se precompletează din ANAF (read-only, cu badge „din ANAF”);
  - punct de lucru, bancă, IBAN.
- **Secțiunea „Documente”:** listă cu zonă de încărcare pentru fiecare document. Fiecare element are aceleași stări ca în wizard-ul de lot: lipsă, încărcat, de verificat, respins cu motiv. Documentele:
  - certificat de înmatriculare;
  - certificat constatator al punctului de lucru;
  - extras ONRC;
  - contractul punctului de lucru;
  - autorizația de mediu;
  - visa anuală;
  - captură cu modulul DEEE activ în SIATD;
  - actul de identitate al administratorului;
  - declarația GDPR.
- **Autorizația de mediu:** după încărcare apare blocul „Extras de AI” cu număr, emitent, valabilitate și coduri de deșeu autorizate. Colectorul confirmă sau corectează.
- **Tabel de rezumat la final:** fiecare document cu statusul lui. Documentele respinse de admin sunt evidențiate, cu motivul.
- **Acțiune principală:** „Trimite la verificare” (activă doar când lista e completă).
- **După trimitere:** starea „În verificare · răspuns în maximum 24 h”. După aprobare: instrucțiunile pentru vizita în teren.

---

## 3. Panou colector — /panou · mockup `01-panou-colector`

Ordinea blocurilor e intenționată: întâi ce ai de făcut, apoi situația.

1. **Antet:** „Panou”, subtitlul „Stoc actual și ce ai de făcut azi”, butonul principal „Lot nou” → /loturi/nou.
2. **De rezolvat:** se afișează doar dacă există ceva. Surse:
   - loturi în starea „Necesită completări” (fiecare → /loturi/[id], cu motivul);
   - documente ale organizației care expiră în mai puțin de 30 de zile (→ /organizatie);
   - documente respinse la onboarding.

   Fiecare rând are un punct de status, titlu, descriere și un buton secundar. Starea goală: blocul dispare. Nu afișăm „Nimic de rezolvat”.
3. **Stoc pe categorii:** 6 carduri, câte unul pentru fiecare categorie principală. Fiecare card are:
   - iconul categoriei (1 frigider, 2 monitor, 3 bec, 4 mașină de spălat, 5 cuptor cu microunde, 6 telefon);
   - numărul categoriei și câte loturi conține;
   - denumirea;
   - kg (cifra mare) și bucăți;
   - bara cu procentul din stocul total.

   Click pe card → /loturi, cu filtrul categoriei aplicat. Totalul general apare în dreapta titlului secțiunii.
4. **Grafice:**
   - **„Intrări acceptate pe lună”:** coloane pentru ultimele 6 luni, luna curentă în petrol plin, restul în petrol la 28% opacitate. Variația față de luna anterioară apare în `success-text` (sau `danger` dacă e scădere). Tooltip la hover: luna, kg, număr de loturi.
   - **„Loturi pe status”:** bară segmentată pe ultimele 30 de zile, cu legendă, număr și procent; dedesubt, timpul mediu de verificare și procentul acceptat din prima.

   Graficele folosesc doar petrol și gri, cu excepția graficului de statusuri. Librărie: cea inclusă în Vuexy, stilizată pe tokeni.
5. **Ultimele loturi:** tabel cu 5 rânduri (Lot, Conținut, Cantitate, Data preluării, Status), plus link-ul „Vezi toate loturile” → /loturi.

---

## 4. Listă loturi — /loturi (fără mockup)

- **Antet:** „Loturi” + butonul „Lot nou”.
- **Bară de filtre:** căutare, categorie, subcategorie (dependentă de categorie), cod deșeu, status (multi-select), interval de date, punct de lucru. Filtrele active apar ca chip-uri ștergibile. Starea filtrelor se păstrează în URL.
- **Comutator de vizualizare:** „Listă” / „Pe categorii”.
  - Listă: tabel cu coloanele Lot, Conținut, Cantitate kg, Buc, Data preluării, Status, Actualizat.
  - Pe categorii: arbore categorie → subcategorie → cod deșeu, cu totalurile aliniate la dreapta. Expandarea e animată. Click pe o frunză filtrează lista.
- **Stare goală:** „Nu ai încă loturi.” + „Încarcă primul lot”.

---

## 5. Lot nou — /loturi/nou · mockup-uri `02-lot-nou-documente` și `02b-lot-nou-mobil`

Wizard în 3 pași. Stepper-ul e mereu vizibil sus-dreapta; pe mobil devine o bară de progres în 3 segmente, cu textul „Pasul X din 3”.

**Reguli pentru tot wizard-ul**
- **Autosalvare** ca ciornă (debounce de ~800 ms), cu indicatorul „Ciornă salvată automat acum X secunde” în subsol. Lotul primește ID (LOT-AAAA-NNNN) la prima salvare.
- **Validare la ieșirea din câmp,** nu la fiecare tastă.
- **Butonul principal din subsol** („Continuă…”) rămâne dezactivat până la completarea pasului. Lângă el scrie ce lipsește: „Mai lipsesc 4 documente”.
- **Ieșirea din wizard** cu modificări nesalvate e imposibilă (autosalvarea există). Ieșirea e liberă, ciorna rămâne în /loturi.

**Pasul 1 — Informații**
- **Antet lot:** data preluării, punct de lucru, destinație declarată (stocare temporară / tratator / propunere de vânzare către OTR).
- **Linii de lot:** tabel editabil. Pentru fiecare linie:
  - subcategorie, prin selector cu căutare, grupat pe categorii, cu iconuri;
  - cod deșeu, filtrat pe subcategorie ȘI pe codurile din autorizația colectorului; un cod neautorizat apare dezactivat, cu tooltip „Nu e în autorizația ta de mediu”;
  - cantitate: bucăți și/sau kg, în funcție de unitatea de tarif, cu validarea „cel puțin una > 0”;
  - stare: complet / incomplet / amestec.

  Butonul „Adaugă linie”. Codurile periculoase (cu *) primesc un badge `warning`.
- **Proveniență și surse:** aceleași carduri ca în mockup, secțiunea „Proveniența lotului”. Recomandarea e ca această secțiune să stea în Pasul 1, pentru că lista de documente se generează din ea.
  - câmpul Proveniență: persoane juridice / persoane fizice / mixt;
  - pentru fiecare sursă: tip, denumire, CUI (verificat ANAF, bifă „ANAF”), adresă de ridicare, contract/comandă, liniile acoperite;
  - dedesubt, verificarea de închidere: „Sursele acoperă X kg din Y kg declarate”, în `success-text` dacă se potrivește, `warning` dacă nu.
  - **Persoane fizice:** nume, CNP și seria/numărul actului de identitate, afișate mascat (•••• ultimele 4) după introducere. Borderoul de achiziție devine document obligatoriu pentru fiecare sursă PF.

**Pasul 2 — Documente** (ecranul din mockup)
- **Foto și video ale lotului**, prima secțiune:
  - miniaturi de 132 × 104 px cu etichetă (Față, Lateral, Spate, Cântar plin / gol), nume de fișier și dimensiune, plus bifă verde când fișierul e încărcat;
  - video-urile au durata în colț și iconul de play;
  - butoanele „Fotografiază” (`capture="environment"`) și „Filmează” sunt în antet; ultima miniatură e zona de „tragere” fișiere;
  - încărcarea arată progres pe fiecare miniatură (o bară subțire jos);
  - blocul „Verificat de AI” apare după analiză.
- **Proveniența** (dacă rămâne pe acest pas) — vezi Pasul 1.
- **Documente:** grilă de carduri pe 2 coloane.
  - Documentele încărcate au badge „Încărcat” / „De verificat”, numele fișierului, „Înlocuiește” și blocul „Extras de AI” cu valorile-cheie.
  - Documentele lipsă au bordură întreruptă și butoanele „Încarcă fișier” și „Fotografiază”.
  - Documentele cerute din cauza unui cod periculos au sub titlu explicația, în `warning-text`: „Cerut pentru că linia 2 are un cod periculos”.
- **Panoul lateral „Documente cerute”:**
  - contor „X din Y” și bară de progres;
  - lista pe grupuri („Pentru orice lot de la persoane juridice”, „Cod periculos declarat · …”);
  - stări: bifă verde / cerc portocaliu (parțial) / cerc gol;
  - click pe un element derulează la cardul lui;
  - dedesubt, nota despre AI.
- **Logica listei (în cod, configurabilă):**
  - proveniența PJ cere: centralizator, aviz, Anexa 3, PV recepție, tichet de cântar, foto (3 unghiuri), filmare cântar;
  - fiecare sursă PF cere un borderou de achiziție (cu reținere 2% + 10%);
  - un cod periculos cere suplimentar Anexa 2, Anexa 1 și autorizația de transport pentru deșeuri periculoase;
  - CMR doar pentru transport internațional.
- **Mobil:** lista de documente e ecranul principal. Fiecare rând are 64 px înălțime și butonul de cameră de 44 px. Butonul fix de jos, „Fotografiază următorul document”, deschide camera pentru primul document lipsă.

**Pasul 3 — Confirmare**
- rezumat read-only: linii, total, surse, fișiere pe grupuri;
- bifă obligatorie: „Declar pe propria răspundere că informațiile sunt corecte”;
- butonul „Trimite la verificare”.

După trimitere: toast, redirect la /loturi/[id], status „În verificare”.

---

## 6. Detaliu lot — /loturi/[id] (fără mockup)

- **Antet:** ID, badge de status, conținut, cantitate.
- **Acțiuni:**
  - „Editează” doar pe Ciornă sau Necesită completări;
  - „Anulează” cere un motiv, într-un modal.
- **Pe status Necesită completări:** banner `warning` cu motivul trimis de admin și lista documentelor de înlocuit, fiecare cu buton de încărcare direct în banner. Butonul principal devine „Retrimite la verificare”.
- **Tab-uri:** Rezumat · Documente și media (galerie + previzualizare) · Verificare (raportul, read-only pentru colector) · Istoric (audit log: cine, ce, când).
- **Pe Acceptat:** butonul „Descarcă dosarul” (PDF compilat din documentele existente).

---

## 7. Coada de verificare — /admin/verificari · mockup `04-coada-verificare-admin`

- **Antet:** titlul, subtitlul cu numărul de loturi și timpul mediu de decizie, butoanele „Filtre” și „Deschide primul lot”.
- **Tab-uri:** De verificat (implicit) · Așteaptă colectorul · Decise azi, fiecare cu contor.
- **Tabel:**
  - coloanele Prioritate, Lot, Colector, În coadă de, Cantitate, Cod periculos, Rezultat reguli (contoare verde/galben/roșu), Verdict propus de AI;
  - sortarea implicită: prioritatea (un roșu blocant urcă), apoi vechimea.
- **Rândul selectat:** fundal `petrol-soft` și bordură stânga de 3 px petrol, doar pentru selecția din tastatură.
- **Scurtături** (active doar pe această pagină și doar când focusul nu e într-un câmp):
  - `↑` / `↓` selectează rândul;
  - `Enter` deschide raportul;
  - `A` / `C` / `R` aplică acțiunea direct. Acceptarea cere confirmare doar dacă există reguli roșii.

  Bara de scurtături e afișată sub tabel.

---

## 8. Raport de verificare — /admin/verificari/[lotId] · mockup `03-raport-verificare-admin`

- **Antet:** ID lot, badge, rezumatul lotului. În dreapta, cardul „Verdict propus de AI” cu contoarele pe culori.
- **Coloana stângă (400 px):** lista regulilor R01–R13, fiecare cu punct de semafor, cod, nume și rezumatul valorii.
  - Click (sau `↑` / `↓`) selectează regula, iar regula selectată primește fundal `petrol-soft`.
  - Regulile roșii sunt selectate automat la deschidere.
- **Coloana dreaptă:**
  - **Card de comparație pentru regula selectată:** valorile puse față în față, cu sursa lor. Valoarea din documentul afișat e pe fundal `highlight`. Diferența și toleranța apar în `danger`. Badge „Blocant” / „Avertisment”.
  - **Vizualizator de document:**
    - tab-uri pe documente;
    - numele fișierului și numărul paginii;
    - zoom (butoane + scroll cu Ctrl);
    - zona sursă a valorii e desenată peste document ca dreptunghi `highlight` cu contur `warning`, din coordonatele salvate la extracție;
    - la schimbarea regulii, vizualizatorul sare la documentul și zona relevante (tranziție de 200 ms).

    Dedesubt: „Zona evidențiată este sursa valorii X · încredere extracție Y%”.
- **Bara de decizie** (fixă jos):
  - câmpul „Motiv trimis colectorului · redactat de AI, editabil”;
  - butoanele Respinge (R), Acceptă (A) și Cere completări (C). Butonul verdictului propus de AI e cel principal (petrol plin).
  - La „Cere completări” se pot bifa documentele de înlocuit.
  - După decizie: toast și trecerea automată la următorul lot din coadă.
- **Regula de bază:** nimic nu se decide fără click / tastă de la admin. Decizia salvează adminul, ora și versiunea regulamentului.

---

## 9. Alte ecrane admin (fără mockup)

- **/admin (panou):** contoare (colectori activi, loturi în coadă, decise azi, timp mediu), graficul de intrări pe toată platforma, lista „Conturi de verificat”.
- **/admin/colectori:** tabel (denumire, CUI, status cont, loturi, înregistrat la), filtre și butonul „Colector nou”.
- **/admin/colectori/[id]:** tab-uri:
  - Date;
  - Documente onboarding, cu aceleași acțiuni: aprobă / cere reîncărcare cu motiv;
  - Vizită în teren, marcată manual;
  - Loturi;
  - Utilizatori.
- **/admin/loturi:** aceeași listă ca /loturi, plus filtrul și coloana Colector.
- **/admin/taxonomie:** arbore categorie → subcategorie. Editare inline pentru cod, denumire, unitate de tarif și valoare tarif. Dezactivare în loc de ștergere. Tab separat pentru „Coduri deșeu” și unul pentru „Reguli de verificare” (activă, severitate, toleranță).

---

## 10. Legături între pagini (harta de navigare)

- Login → /panou (colector activ) · /onboarding (colector neactivat) · /admin (admin)
- /panou → „Lot nou” → /loturi/nou → trimite → /loturi/[id]
- /panou → card categorie → /loturi?categorie=N
- /panou → rând „De rezolvat” → /loturi/[id] sau /organizatie
- /loturi → rând → /loturi/[id] → „Editează” → /loturi/[id]/editare (același wizard)
- /admin → „Loturi în coadă” → /admin/verificari → rând / Enter → /admin/verificari/[lotId] → decizie → următorul lot
- /admin/colectori → rând → /admin/colectori/[id] → aprobare → emailul către colector
- Un rol greșit pe o rută → /acces-interzis. O rută inexistentă → /404.

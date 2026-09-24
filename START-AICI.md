# DEEE Manager — pachet de predare pentru dezvoltare

Pachetul conține tot ce s-a decis până acum pentru DEEE Manager: produsul, planul, identitatea de brand, design system-ul, ecranele-cheie și specificația de comportament. E pregătit pentru a fi construit cu Claude Code.

## Ce e în pachet

```
CLAUDE.md                  ← instrucțiunile pentru Claude Code (citite automat)
START-AICI.md              ← acest fișier
docs/
  Brief_Tehnic_v1.0.pdf
  Arhitectura_Pagini.pdf
  DEEE_Manager_Plan_MVP_v1.1.docx
design/
  BRAND.md                 ← identitate de brand, principii, voce, culori, tipografie, logo
  SPEC-ECRANE.md           ← ce face fiecare ecran, stări, animații, legături între pagini
  tokens.json / tokens.css ← tokenii de design
  fonts/                   ← Inter + Montserrat (woff2, licență OFL)
  brand/                   ← simbolul logo + SVG-urile originale
  mockups/                 ← 5 ecrane-cheie în HTML + capturi PNG
```

## Cum pornești

1. Instalează Node.js (LTS), Git și Docker Desktop.
2. Cumpără Vuexy și dezarhivează versiunea **Next.js (TypeScript)**:
   - `starter-kit` → devine rădăcina proiectului;
   - `full-version` → pune-l alături, în `_vuexy-full-version/`, ca sursă de componente (nu intră în aplicație).
3. Copiază conținutul acestui pachet în rădăcina proiectului (lângă `package.json`).
4. Rulează `git init` și fă primul commit, ca să poți reveni oricând.
5. Deschide folderul în Claude Code (aplicația desktop, tab-ul Code) și trimite primul mesaj de mai jos.

## Primul mesaj pentru Claude Code

```
Citește CLAUDE.md, START-AICI.md, design/BRAND.md și design/SPEC-ECRANE.md.
Uită-te la toate capturile din design/mockups/png/.
Apoi citește structura starter-kit-ului Vuexy din acest folder și documentația lui.
_vuexy-full-version/ e doar sursă de componente.

Nu scrie cod încă. Propune-mi planul pentru Faza A:
- cum aplici tema (tokens, fonturi locale, logo) în Vuexy;
- ce componente iei din full-version pentru fiecare ecran;
- structura de foldere și stratul de date mock;
- ordinea de implementare a ecranelor.

Semnalează orice conflict între Vuexy și design system.
```

## Cum lucrezi apoi

- Aprobi planul, apoi îi ceri tema și layout-ul. Verifici în browser.
- Apoi ecran cu ecran, în ordinea din plan. La fiecare ecran compari cu PNG-ul din `design/mockups/png/`.
- La finalul fiecărei faze (A: interfață cu date mock, B: backend, C: AI), Claude Code se oprește și îți face un rezumat.
- Cheile (Anthropic API, stocare fișiere) le pui tu în `.env`, abia în Faza C. Nu le lipi niciodată în conversație.

## Deschis încă (decizii ale clientului)

- regulamentul de verificare v1 și toleranțele;
- deșeurile periculoase și bateriile în MVP;
- modelul comercial, de care depinde licența Vuexy (Regular vs Extended);
- logo-ul vectorial complet, cu textul convertit în contur.

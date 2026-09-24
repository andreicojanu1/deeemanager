# Note din materialele primite de la client (24.09.2026)

Fișierele sursă nu sunt în repo: excelul conține nume de persoane, iar PDF-ul e o listă de tarife a unei terțe părți. Aici e doar ce folosim din ele.

## Tarife Alegreen (PDF, EN)

- Aceleași subcategorii și aceleași tarife totale ca Anexa A din Brief v1.0 → taxonomia din `src/lib/mock/seed/taxonomie.ts` e confirmată.
- PDF-ul descompune tariful total în două componente (costuri art. 25 alin. 11 lit. a–c din OUG 5/2015 și cheltuieli de funcționare ale organizației). Nu le folosim în MVP; dacă „valoarea estimată a lotului” intră în scope (întrebarea 5 din brief), folosim doar tariful total.

## NIR DEEE transport (Excel)

Un NIR pe transport, cu trei foi:

1. **Nomenclator**: tipuri de DEEE, cod de deșeu și **greutate medie de referință (kg/buc)**. Autorul notează că greutățile sunt estimări orientative, nu dintr-o sursă oficială.
2. **PV-uri**: bucăți pe tip de DEEE, pe fiecare proces-verbal de predare inclus în transport (serie/nr., dată, predător).
3. **NIR**: greutatea netă din bonul de cântar (brut − tară) se **repartizează pe tipuri proporțional cu greutatea teoretică** (bucăți × greutate medie); restul de rotunjire merge pe tipul cu greutatea cea mai mare. Un **factor de corecție** net / teoretic în afara intervalului 0,7–1,3 semnalează greutăți medii nerealiste. La final, centralizare pe cod de deșeu.

### Unde ne ajută

| Idee din Excel | Unde o folosim | Când |
|---|---|---|
| Greutate medie de referință pe tip | Regula **R09 „Plauzibilitate greutate / bucată”**: kg/buc declarat comparat cu referința subcategoriei, cu toleranță configurabilă | Faza C (acum doar date mock) |
| Factor de corecție 0,7–1,3 | Pragurile implicite ale R09, editabile din `/admin/taxonomie` → Reguli | Faza C |
| Repartizarea netului din bonul de cântar | Sugestie opțională în wizard: dacă ai doar bucățile, propunem kg din tichetul de cântar. Nu se completează nimic fără confirmarea colectorului | De discutat |
| Centralizare pe cod de deșeu | Arborele „Pe categorii” din `/loturi` și rapoartele | Pasul 5 (arbore) |
| PV-uri de predare pe transport | Sursele persoane fizice din wizard: fiecare PV/borderou = o sursă | Pasul 6 |

## De clarificat cu clientul — TODO(validare-client)

- **Codurile de deșeu per tip nu coincid între surse.** Excelul pune frigiderul și congelatorul la `20 01 36`, iar aparatul de aer condiționat la `20 01 23`. În lista de deșeuri (HG 856/2002), `20 01 23*` înseamnă echipamente cu CFC, cod periculos, iar frigiderele vechi intră frecvent aici. Codurile din Excel nu au asteriscul care marchează deșeurile periculoase (`20 01 21*`, `20 01 23*`, `20 01 35*`). Maparea subcategorie → coduri permise trebuie stabilită de client sau de consultantul de mediu. Până atunci, datele demo folosesc o aproximare marcată în cod.
- Greutățile medii de referință: le preluăm ca valori implicite editabile sau clientul are valori proprii, din cântăriri?

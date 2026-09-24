import type { DocumentOrganizatie, LinieLot, Lot } from '@/lib/domain/lot';
import { subcategorie } from './taxonomie';

/**
 * Loturile demo. Istoricul acceptat e generat determinist, astfel încât totalurile
 * să reproducă mockup-ul 01 (16.771 kg, 41 de loturi acceptate, stocul pe categorii
 * și intrările lunare), iar loturile recente sunt scrise explicit.
 */

export const ORG_DEMO = 'org-colector-demo';
export const ORG_ALT = 'org-reciclare-nord';

/** „Acum” în datele mock, ca rezultatele să fie aceleași la fiecare rulare. */
export const MOCK_NOW = '2026-09-24T10:00:00';

// TODO(validare-client): corespondența subcategorie → cod de deșeu trebuie validată cu clientul.
// Aici e doar o aproximare pentru date demo.
const COD_DESEU: Record<number, string> = {
  1: '20 01 23*',
  2: '20 01 35*',
  3: '20 01 21*',
  4: '20 01 36',
  5: '20 01 36',
  6: '20 01 36',
};

const linie = (cod: string, kg: number, buc: number, codDeseu?: string): LinieLot => ({
  subcategorieCod: cod,
  codDeseu: codDeseu ?? COD_DESEU[subcategorie(cod).categorieId],
  kg,
  buc,
});

const iso = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
};
const zi = (s: string) => s.slice(0, 10);
const plus = (s: string, ore: number) => iso(new Date(new Date(s).getTime() + ore * 3_600_000));

// ── Loturile recente, cele din tabelul „Ultimele loturi” al mockup-ului ────────────
const RECENTE: Lot[] = [
  {
    id: 'LOT-2026-0418',
    organizatieId: ORG_DEMO,
    status: 'IN_VERIFICARE',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-24',
    linii: [linie('4.2', 930, 18, '20 01 35*'), linie('5.2', 310, 34)],
    creatLa: '2026-09-24T08:15:00',
    trimisLa: '2026-09-24T09:42:00',
  },
  {
    id: 'LOT-2026-0416',
    organizatieId: ORG_DEMO,
    status: 'CIORNA',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-23',
    linii: [linie('2.3', 96, 14)],
    creatLa: '2026-09-23T16:05:00',
  },
  {
    id: 'LOT-2026-0415',
    organizatieId: ORG_DEMO,
    status: 'ACCEPTAT',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-23',
    linii: [linie('1.1', 860, 12)],
    creatLa: '2026-09-23T08:30:00',
    trimisLa: '2026-09-23T09:10:00',
    decisLa: '2026-09-23T11:55:00',
  },
  {
    id: 'LOT-2026-0412',
    organizatieId: ORG_DEMO,
    status: 'NECESITA_COMPLETARI',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-22',
    linii: [linie('2.4', 415, 58)],
    creatLa: '2026-09-22T09:00:00',
    trimisLa: '2026-09-22T10:20:00',
    decisLa: '2026-09-22T14:05:00',
    motiv: 'Tichetul de cântar e neclar în zona cantității nete. Încarcă din nou imaginea.',
  },
  {
    id: 'LOT-2026-0409',
    organizatieId: ORG_DEMO,
    status: 'ACCEPTAT',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-20',
    linii: [linie('4.1', 2130, 30)],
    creatLa: '2026-09-20T07:50:00',
    trimisLa: '2026-09-20T08:40:00',
    decisLa: '2026-09-20T12:10:00',
  },
  {
    id: 'LOT-2026-0407',
    organizatieId: ORG_DEMO,
    status: 'RESPINS',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-15',
    linii: [linie('5.1', 140, 11)],
    creatLa: '2026-09-15T10:00:00',
    trimisLa: '2026-09-15T11:00:00',
    decisLa: '2026-09-15T15:30:00',
    motiv: 'Fotografiile arată alte echipamente decât cele declarate. Creează un lot nou cu liniile corecte.',
  },
  {
    id: 'LOT-2026-0406',
    organizatieId: ORG_DEMO,
    status: 'ACCEPTAT',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-19',
    linii: [linie('6.1', 18, 140), linie('6.6', 40, 90)],
    creatLa: '2026-09-19T09:30:00',
    trimisLa: '2026-09-19T10:05:00',
    decisLa: '2026-09-19T13:00:00',
    aFostCompletat: true,
  },
  {
    id: 'LOT-2026-0404',
    organizatieId: ORG_DEMO,
    status: 'ANULAT',
    punctLucru: 'Chiajna',
    dataPreluarii: '2026-09-12',
    linii: [linie('3.2', 12, 160)],
    creatLa: '2026-09-12T13:00:00',
    motiv: 'Lot introdus de două ori.',
  },
];

// ── Istoricul acceptat, generat ───────────────────────────────────────────────────
// Ținta, după mockup: kg acceptate pe lună (martie = restul, până la totalul de 16.771 kg)
// și, pe categorii, kg / bucăți / număr de loturi.
const LUNI: [string, number][] = [
  ['2026-03', 881],
  ['2026-04', 1920],
  ['2026-05', 2480],
  ['2026-06', 2150],
  ['2026-07', 3060],
  ['2026-08', 2870],
  ['2026-09', 3410],
];
const CATEGORII_TINTA = [
  { id: 1, kg: 4860, buc: 38, loturi: 6, sub: ['1.1', '1.2', '1.4'] },
  { id: 2, kg: 2315, buc: 112, loturi: 9, sub: ['2.4', '2.3', '2.2', '2.5'] },
  { id: 3, kg: 186, buc: 1240, loturi: 3, sub: ['3.2', '3.1'] },
  { id: 4, kg: 7940, buc: 96, loturi: 11, sub: ['4.1', '4.2', '4.3', '4.5'] },
  { id: 5, kg: 1128, buc: 430, loturi: 7, sub: ['5.1', '5.2', '5.4'] },
  { id: 6, kg: 342, buc: 860, loturi: 5, sub: ['6.1', '6.6', '6.2'] },
];

function genereazaIstoric(recenteAcceptate: Lot[]): Lot[] {
  const cat = (cod: string) => subcategorie(cod).categorieId;
  // Scade loturile recente din ținte.
  const tinte = CATEGORII_TINTA.map((c) => {
    const ale = recenteAcceptate.filter((l) => cat(l.linii[0].subcategorieCod) === c.id);
    return {
      ...c,
      kg: c.kg - ale.reduce((s, l) => s + l.linii.reduce((a, x) => a + x.kg, 0), 0),
      buc: c.buc - ale.reduce((s, l) => s + l.linii.reduce((a, x) => a + x.buc, 0), 0),
      loturi: c.loturi - ale.length,
    };
  });
  const luni = LUNI.map(([luna, kg]) => ({
    luna,
    kg:
      kg -
      recenteAcceptate
        .filter((l) => l.decisLa?.startsWith(luna))
        .reduce((s, l) => s + l.linii.reduce((a, x) => a + x.kg, 0), 0),
  }));

  // Regula colțului nord-vest: împarte kg-ul fiecărei categorii pe luni.
  type Celula = { luna: string; catIdx: number; kg: number };
  const celule: Celula[] = [];
  const lunaRest = luni.map((l) => l.kg);
  const catRest = tinte.map((c) => c.kg);
  let i = 0;
  let j = 0;
  while (i < luni.length && j < tinte.length) {
    const q = Math.min(lunaRest[i], catRest[j]);
    if (q > 0) celule.push({ luna: luni[i].luna, catIdx: j, kg: q });
    lunaRest[i] -= q;
    catRest[j] -= q;
    if (lunaRest[i] === 0) i++;
    else j++;
  }

  // Împarte celulele până fiecare categorie are numărul de loturi cerut.
  const loturi: Celula[] = [];
  tinte.forEach((c, idx) => {
    const ale = celule.filter((x) => x.catIdx === idx);
    while (ale.length < c.loturi) {
      ale.sort((a, b) => b.kg - a.kg);
      const mare = ale[0];
      const parte = Math.round(mare.kg * 0.58);
      ale.push({ ...mare, kg: mare.kg - parte });
      mare.kg = parte;
    }
    loturi.push(...ale);
  });

  // Bucățile, proporțional cu kg-ul, cu restul pus pe cel mai mare lot al categoriei.
  const buc = new Map<Celula, number>();
  tinte.forEach((c, idx) => {
    const ale = loturi.filter((x) => x.catIdx === idx);
    let alocat = 0;
    ale.forEach((x) => {
      const b = Math.max(1, Math.floor((x.kg / c.kg) * c.buc));
      buc.set(x, b);
      alocat += b;
    });
    const mare = [...ale].sort((a, b) => b.kg - a.kg)[0];
    buc.set(mare, (buc.get(mare) ?? 0) + c.buc - alocat);
  });

  // Date deterministe în lună, apoi ID-uri în ordine cronologică.
  const cuDate = loturi.map((x, k) => {
    const zi = x.luna === '2026-09' ? 2 + ((k * 5) % 14) : 2 + ((k * 7) % 25);
    const decis = `${x.luna}-${String(zi).padStart(2, '0')}T${String(10 + (k % 6)).padStart(2, '0')}:${k % 2 ? '30' : '05'}:00`;
    return { x, decis, k };
  });
  cuDate.sort((a, b) => a.decis.localeCompare(b.decis));

  return cuDate.map(({ x, decis, k }, n) => {
    const t = tinte[x.catIdx];
    const oreVerificare = 1.5 + ((k * 37) % 50) / 10;
    const trimis = plus(decis, -oreVerificare);
    return {
      id: `LOT-2026-${String(355 + n).padStart(4, '0')}`,
      organizatieId: ORG_DEMO,
      status: 'ACCEPTAT' as const,
      punctLucru: 'Chiajna',
      dataPreluarii: zi(plus(trimis, -30)),
      linii: [linie(t.sub[k % t.sub.length], x.kg, buc.get(x) ?? 1)],
      creatLa: plus(trimis, -2),
      trimisLa: trimis,
      decisLa: decis,
      aFostCompletat: k % 7 === 3,
    };
  });
}

// ── Alt colector, ca să verificăm izolarea datelor ─────────────────────────────────
const ALT_COLECTOR: Lot[] = [
  {
    id: 'LOT-2026-0417',
    organizatieId: ORG_ALT,
    status: 'IN_VERIFICARE',
    punctLucru: 'Suceava',
    dataPreluarii: '2026-09-23',
    linii: [linie('1.1', 640, 9)],
    creatLa: '2026-09-23T12:00:00',
    trimisLa: '2026-09-23T13:10:00',
  },
  {
    id: 'LOT-2026-0402',
    organizatieId: ORG_ALT,
    status: 'ACCEPTAT',
    punctLucru: 'Suceava',
    dataPreluarii: '2026-09-10',
    linii: [linie('4.1', 1150, 16)],
    creatLa: '2026-09-10T09:00:00',
    trimisLa: '2026-09-10T10:00:00',
    decisLa: '2026-09-10T13:20:00',
  },
];

export const LOTURI: Lot[] = [
  ...RECENTE,
  ...genereazaIstoric(RECENTE.filter((l) => l.status === 'ACCEPTAT')),
  ...ALT_COLECTOR,
];

export const DOCUMENTE_ORGANIZATIE: DocumentOrganizatie[] = [
  {
    id: 'doc-visa-2026',
    organizatieId: ORG_DEMO,
    tip: 'VISA_ANUALA',
    denumire: 'Visa anuală a autorizației de mediu',
    valabilPana: '2026-10-12',
    status: 'APROBAT',
  },
  {
    id: 'doc-autorizatie',
    organizatieId: ORG_DEMO,
    tip: 'AUTORIZATIE_MEDIU',
    denumire: 'Autorizația de mediu',
    valabilPana: '2029-03-31',
    status: 'APROBAT',
  },
  {
    id: 'doc-alt-visa',
    organizatieId: ORG_ALT,
    tip: 'VISA_ANUALA',
    denumire: 'Visa anuală a autorizației de mediu',
    valabilPana: '2026-09-30',
    status: 'APROBAT',
  },
];

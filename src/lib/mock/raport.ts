import type { LotDetaliu, RezultatRegula, Semafor } from '@/lib/domain/lot';
import { totalBuc, totalKg } from '@/lib/domain/lot';
import {
  zonaRand,
  type DocumentVizual,
  type RandDocument,
  type RegulaRaport,
  type Severitate,
  type ValoareComparata,
} from '@/lib/domain/raport';
import { formatDate, formatNumber, formatPercent } from '@/lib/format';
import { subcategorie } from './seed/taxonomie';

/**
 * Configurarea regulilor din regulamentul v1.
 * TODO(validare-client): severitățile și toleranțele nu sunt încă validate de client;
 * în Faza C se editează din /admin/taxonomie → Reguli de verificare.
 */
export const CONFIG_REGULI: Record<string, { activa?: boolean; severitate: Severitate; toleranta?: number }> =
  {
    R01: { severitate: 'BLOCANT' },
    R02: { severitate: 'BLOCANT', toleranta: 0.01 },
    R03: { severitate: 'BLOCANT' },
    R04: { severitate: 'BLOCANT' },
    R05: { severitate: 'BLOCANT' },
    R06: { severitate: 'BLOCANT' },
    R07: { severitate: 'BLOCANT' },
    R08: { severitate: 'AVERTISMENT' },
    // Abaterea acceptată față de greutatea tipică pe bucată a subcategoriei.
    R09: { severitate: 'AVERTISMENT', toleranta: 0.3 },
    R10: { severitate: 'BLOCANT' },
    R11: { severitate: 'BLOCANT' },
    R12: { severitate: 'AVERTISMENT' },
    R13: { severitate: 'AVERTISMENT' },
  };

/** Cântăririle din tichetele demo care diferă de declarație (mockup 03). */
const TICHETE: Record<string, { brut: number; tara: number }> = {
  'LOT-2026-0418': { brut: 4870, tara: 3560 },
};

const kg = (n: number) => `${formatNumber(n)} kg`;

function documenteVizuale(lot: LotDetaliu, colector: string): DocumentVizual[] {
  const total = totalKg(lot);
  const n = lot.id.slice(-4);
  const data = formatDate(lot.dataPreluarii);
  const sursa = lot.surse[0];
  const cantar = TICHETE[lot.id] ?? { brut: total + 3560, tara: 3560 };
  const r = (cheie: string, eticheta: string, valoare: string, accent?: boolean): RandDocument => ({
    cheie,
    eticheta,
    valoare,
    accent,
  });

  const continut: Record<string, Omit<DocumentVizual, 'id' | 'tip' | 'denumire' | 'fisier'>> = {
    TICHET_CANTAR: {
      titlu: `CÂNTAR AUTO · PUNCT DE LUCRU ${lot.punctLucru.toUpperCase()}`,
      subsol: 'Cântar verificat metrologic · BRML 1207/2025',
      randuri: [
        r('NR', 'Tichet nr.', `000 ${String(8000 + Number(n)).padStart(4, '0')}`),
        r('DATA', 'Data / ora', `${data} 14:07`),
        r('AUTO', 'Nr. auto', 'IF 27 EWC'),
        r('FURNIZOR', 'Furnizor', colector),
        r('PRODUS', 'Produs', 'DEEE'),
        r('BRUT', 'Brut', kg(cantar.brut)),
        r('TARA', 'Tară', kg(cantar.tara)),
        r('NET', 'NET', kg(cantar.brut - cantar.tara), true),
      ],
    },
    AVIZ: {
      titlu: 'AVIZ DE ÎNSOȚIRE A MĂRFII',
      randuri: [
        r('NR', 'Seria / nr.', `EWC ${n === '0418' ? '0457' : n}`),
        r('DATA', 'Data', data),
        r('EXPEDITOR', 'Expeditor', sursa?.denumire ?? '—'),
        r('CUI', 'CUI expeditor', sursa?.cui ?? '—'),
        r('DESTINATAR', 'Destinatar', colector),
        r('COD', 'Cod deșeu', lot.linii.map((l) => l.codDeseu).join(', ')),
        r('CANTITATE', 'Cantitate', kg(total), true),
      ],
    },
    ANEXA_3: {
      titlu: 'ANEXA 3 · ÎNCĂRCARE – DESCĂRCARE',
      randuri: [
        r('SERIE', 'Seria / nr.', `A3 ${n}`),
        r('DATA', 'Data transportului', data),
        r('COD', 'Cod deșeu', lot.linii.map((l) => l.codDeseu).join(', ')),
        r('CANTITATE', 'Cantitate', kg(total)),
        r('TRANSPORTATOR', 'Transportator', 'Transport propriu'),
      ],
    },
    CENTRALIZATOR: {
      titlu: 'CENTRALIZATOR DEȘEURI TRANSPORTATE',
      randuri: [
        ...lot.linii.map((l, i) =>
          r(`L${i + 1}`, `${l.subcategorieCod} · ${l.codDeseu}`, `${formatNumber(l.buc)} buc · ${kg(l.kg)}`),
        ),
        r('TOTAL', 'Total', kg(total), true),
      ],
    },
    PV_RECEPTIE: {
      titlu: 'PROCES-VERBAL DE RECEPȚIE',
      randuri: [
        r('NR', 'Nr.', `PV ${n}`),
        r('DATA', 'Data', data),
        r('CANTITATE', 'Cantitate recepționată', kg(total)),
        r('PRIMIT', 'Primit de', colector),
      ],
    },
  };

  return lot.documente
    .filter((d) => d.fisier)
    .map((d) => ({
      id: d.id,
      tip: d.tip,
      denumire: d.denumire,
      fisier: d.fisier!.nume,
      ...(continut[d.tip] ?? {
        titlu: d.denumire.toUpperCase(),
        randuri: [r('NR', 'Nr.', `${n}/2026`), r('DATA', 'Data', data), r('EMITENT', 'Emitent', 'APM Ilfov')],
      }),
    }));
}

export function construiesteRaport(lot: LotDetaliu, colector: string) {
  const documente = documenteVizuale(lot, colector);
  const doc = (tip: string) => documente.find((d) => d.tip === tip);
  const din = (tip: string, cheie: string, eticheta: string, incredere = 0.97): ValoareComparata | null => {
    const d = doc(tip);
    const rand = d?.randuri.find((x) => x.cheie === cheie);
    if (!d || !rand) return null;
    return { eticheta, valoare: rand.valoare, documentId: d.id, zona: zonaRand(d, cheie), incredere };
  };
  const declarat = (eticheta: string, valoare: string): ValoareComparata => ({ eticheta, valoare });

  const total = totalKg(lot);
  const buc = totalBuc(lot);
  const cantar = TICHETE[lot.id] ?? { brut: total + 3560, tara: 3560 };
  const net = cantar.brut - cantar.tara;
  const sub = subcategorie(lot.linii[0]?.subcategorieCod ?? '1.1');
  const cerute = lot.documente.length;
  const incarcate = lot.documente.filter((d) => d.fisier).length;

  const valori = (cod: string): ValoareComparata[] => {
    const v: (ValoareComparata | null)[] = (() => {
      switch (cod) {
        case 'R01':
          return [
            declarat('Documente cerute', String(cerute)),
            declarat('Documente încărcate', String(incarcate)),
          ];
        case 'R02':
          return [
            din('TICHET_CANTAR', 'NET', 'Tichet de cântar · net', 0.98),
            din('AVIZ', 'CANTITATE', `Aviz ${doc('AVIZ')?.randuri[0].valoare ?? ''}`),
            declarat('Declarat în lot', kg(total)),
          ];
        case 'R03':
        case 'R04':
          return [
            din('ANEXA_3', 'COD', 'Cod în Anexa 3'),
            declarat(
              cod === 'R03' ? 'Subcategorie declarată' : 'Autorizație de mediu',
              cod === 'R03' ? `${sub.cod} ${sub.denumire}` : '214/2024 · visa valabilă',
            ),
          ];
        case 'R07':
          return [
            din('AVIZ', 'EXPEDITOR', 'Expeditor în aviz'),
            declarat('Sursa declarată', lot.surse[0]?.denumire ?? '—'),
          ];
        case 'R08':
          return [din('TICHET_CANTAR', 'DATA', 'Data tichetului'), din('AVIZ', 'DATA', 'Data avizului')];
        case 'R09':
          return [
            declarat(
              'Declarat',
              `${formatNumber(Math.round((total / Math.max(buc, 1)) * 10) / 10)} kg / buc`,
            ),
            declarat('Subcategorie', `${sub.cod} ${sub.denumire}`),
          ];
        case 'R10':
          return [
            declarat('Documente comparate', String(incarcate)),
            declarat('Duplicate pe platformă', '0'),
          ];
        case 'R11':
          return [
            declarat('Fotografii', String(lot.media.filter((m) => m.tip === 'FOTO').length)),
            declarat('Categorie din fotografii', `Cat. ${sub.categorieId}`),
          ];
        case 'R12':
          return [declarat('Filmare cântar', lot.media.find((m) => m.tip === 'VIDEO')?.nume ?? 'Lipsește')];
        case 'R13':
          return [declarat('Stare declarată', 'Complet'), declarat('Din fotografii', 'Complet')];
        default:
          return [];
      }
    })();
    return v.filter((x): x is ValoareComparata => Boolean(x));
  };

  const mesaj = (r: RezultatRegula): string | undefined => {
    if (r.rezultat === 'VERDE' || r.rezultat === 'NA') return undefined;
    if (r.cod === 'R02') {
      const dif = Math.abs(net - total);
      const tol = CONFIG_REGULI.R02.toleranta ?? 0;
      return `Diferență ${kg(dif)} (${formatPercent(Math.round((dif / total) * 1000) / 1000)}) — peste toleranța de ±${formatPercent(tol)}.`;
    }
    return r.rezumat;
  };

  const reguli: RegulaRaport[] = (lot.verificare?.rezultate ?? [])
    .filter((r) => CONFIG_REGULI[r.cod]?.activa !== false)
    .map((r) => {
      const v = valori(r.cod);
      return {
        ...r,
        severitate: CONFIG_REGULI[r.cod]?.severitate ?? 'BLOCANT',
        valori: v,
        mesaj: mesaj(r),
        documenteImplicate: [...new Set(v.map((x) => x.documentId).filter((x): x is string => Boolean(x)))],
      };
    });

  return { documente, reguli };
}

export const eticheteSemafor: Record<Semafor, string> = {
  VERDE: 'trecută',
  GALBEN: 'avertisment',
  ROSU: 'blocantă',
  NA: 'nu se aplică',
};

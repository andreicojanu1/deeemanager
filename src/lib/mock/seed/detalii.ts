import { documenteCerute } from '@/lib/domain/documente-cerute';
import {
  totalKg,
  type DocumentLot,
  type EvenimentIstoric,
  type FisierMedia,
  type Lot,
  type LotDetaliu,
  type RezultatRegula,
  type Semafor,
  type Sursa,
  type Verificare,
} from '@/lib/domain/lot';
import { formatNumber } from '@/lib/format';

/** Regulamentul de verificare v1, cum apare în mockup-ul 03. Conținutul regulilor vine în Faza C. */
export const REGULI: { cod: string; nume: string }[] = [
  { cod: 'R01', nume: 'Completitudine documente' },
  { cod: 'R02', nume: 'Concordanța cantităților' },
  { cod: 'R03', nume: 'Cod deșeu valid pentru subcategorie' },
  { cod: 'R04', nume: 'Cod în autorizația colectorului' },
  { cod: 'R05', nume: 'Documente pentru cod periculos' },
  { cod: 'R06', nume: 'Borderou persoane fizice' },
  { cod: 'R07', nume: 'Părți și CUI-uri corecte' },
  { cod: 'R08', nume: 'Cronologia documentelor' },
  { cod: 'R09', nume: 'Plauzibilitate greutate / bucată' },
  { cod: 'R10', nume: 'Documente unice pe platformă' },
  { cod: 'R11', nume: 'Fotografii conforme' },
  { cod: 'R12', nume: 'Filmare cântar' },
  { cod: 'R13', nume: 'Stare declarată vs fotografii' },
];

const kg = (n: number) => `${formatNumber(n)} kg`;

const ADMIN = 'Elena Wagner';
const COLECTOR = 'Andrei Constantin';

function surseImplicite(lot: Lot): Sursa[] {
  return [
    {
      id: `${lot.id}-s1`,
      tip: 'GENERATOR',
      denumire: 'Hotel Parc Central SRL',
      cui: 'RO 18244571',
      cuiVerificatAnaf: true,
      adresaRidicare: 'Str. Fabricii 12, Chiajna, Ilfov',
      contract: 'C-112 / 03.03.2026',
      documentProvenienta: `Aviz EWC ${lot.id.slice(-4)}`,
      linii: lot.linii.map((l) => l.subcategorieCod),
      kg: totalKg(lot),
    },
  ];
}

function documenteDin(lot: Lot, surse: Sursa[], complet: boolean): DocumentLot[] {
  const cerute = documenteCerute({
    provenienta: 'PJ',
    surse: surse.map((s) => ({
      id: s.id,
      tip: s.tip === 'PERSOANA_FIZICA' ? 'PF' : 'PJ',
      denumire: s.denumire,
    })),
    coduri: lot.linii.map((l) => l.codDeseu),
  });
  const n = lot.id.slice(-4);
  const total = kg(totalKg(lot));
  const extras: Record<string, string> = {
    TICHET_CANTAR: `Net ${total}`,
    AVIZ: `Nr. EWC ${n} · ${total}`,
    ANEXA_3: `Cod ${lot.linii[0].codDeseu} · ${total}`,
    CENTRALIZATOR: `${lot.linii.length === 1 ? '1 linie' : `${lot.linii.length} linii`} · ${total}`,
  };
  const fisier: Record<string, string> = {
    TICHET_CANTAR: `tichet_cantar_${n}.jpg`,
    AVIZ: `aviz_EWC_${n}.pdf`,
    ANEXA_3: `anexa3_${n}.pdf`,
    CENTRALIZATOR: `centralizator_${n}.xlsx`,
    PV_RECEPTIE: `pv_receptie_${n}.pdf`,
    ANEXA_2: `anexa2_${n}.pdf`,
    ANEXA_1: `anexa1_${n}.pdf`,
    AUTORIZATIE_TRANSPORT_PERICULOASE: `autorizatie_transport_${n}.pdf`,
  };
  return cerute
    .filter((d) => d.tip !== 'FOTO_INCARCATURA' && d.tip !== 'FILMARE_CANTAR')
    .map((d) => ({
      id: `${lot.id}-${d.cheie}`,
      tip: d.tip,
      denumire: d.denumire,
      explicatie: d.explicatie,
      motivCerere: d.motiv,
      status: complet ? 'INCARCAT' : 'LIPSA',
      fisier: complet
        ? { nume: fisier[d.tip] ?? `${d.tip.toLowerCase()}_${n}.pdf`, marime: '480 KB' }
        : undefined,
      extras: complet ? extras[d.tip] : undefined,
    }));
}

function mediaImplicite(lot: Lot): FisierMedia[] {
  const n = Number(lot.id.slice(-4));
  return [
    { id: `${lot.id}-m1`, eticheta: 'Față', tip: 'FOTO', nume: `IMG_${4800 + n}.jpg`, marime: '3,2 MB' },
    { id: `${lot.id}-m2`, eticheta: 'Lateral', tip: 'FOTO', nume: `IMG_${4801 + n}.jpg`, marime: '3,4 MB' },
    { id: `${lot.id}-m3`, eticheta: 'Spate', tip: 'FOTO', nume: `IMG_${4803 + n}.jpg`, marime: '2,9 MB' },
    {
      id: `${lot.id}-m4`,
      eticheta: 'Cântar plin / gol',
      tip: 'VIDEO',
      nume: `VID_${n}.mp4`,
      marime: '48 MB',
      durata: '0:42',
    },
  ];
}

function istoricImplicit(lot: Lot, verificare?: Verificare): EvenimentIstoric[] {
  const ev: EvenimentIstoric[] = [{ la: lot.creatLa, autor: COLECTOR, actiune: 'A creat ciorna lotului' }];
  if (lot.trimisLa) ev.push({ la: lot.trimisLa, autor: COLECTOR, actiune: 'A trimis lotul la verificare' });
  if (lot.trimisLa && verificare) {
    const la = new Date(new Date(lot.trimisLa).getTime() + 6 * 60_000).toISOString().slice(0, 19);
    const eticheta = { ACCEPTAT: 'Acceptat', NECESITA_COMPLETARI: 'Necesită completări', RESPINS: 'Respins' };
    ev.push({
      la,
      autor: 'Verificare automată',
      actiune: 'A rulat regulamentul v1',
      detaliu: `Verdict propus: ${eticheta[verificare.verdictPropus]}`,
    });
  }
  if (lot.decisLa) {
    const actiune = {
      ACCEPTAT: 'A acceptat lotul',
      NECESITA_COMPLETARI: 'A cerut completări',
      RESPINS: 'A respins lotul',
    }[lot.status as 'ACCEPTAT' | 'NECESITA_COMPLETARI' | 'RESPINS'];
    if (actiune) ev.push({ la: lot.decisLa, autor: ADMIN, actiune, detaliu: lot.motiv });
  }
  if (lot.status === 'ANULAT')
    ev.push({ la: lot.creatLa, autor: COLECTOR, actiune: 'A anulat lotul', detaliu: lot.motiv });
  return ev.sort((a, b) => b.la.localeCompare(a.la));
}

function verificareDin(lot: Lot, semafor: Partial<Record<string, [Semafor, string]>> = {}): Verificare {
  const total = kg(totalKg(lot));
  const implicit: Record<string, string> = {
    R01: 'Toate documentele cerute',
    R02: `${total} în toate documentele`,
    R03: `${lot.linii[0].codDeseu} · ${lot.linii[0].subcategorieCod}`,
    R04: 'Autorizație 214/2024, visa valabilă',
    R05: lot.linii.some((l) => l.codDeseu.endsWith('*'))
      ? 'Anexa 1, Anexa 2, autorizație transport'
      : 'Nu se aplică',
    R06: 'Nu se aplică · proveniență PJ',
    R07: 'CUI-uri verificate la ANAF',
    R08: 'Ordine corectă',
    R09: 'În pragul subcategoriei',
    R10: 'Fără duplicate',
    R11: '3 unghiuri · categorie confirmată',
    R12: 'Prezentă',
    R13: '„Complet” confirmat',
  };
  const rezultate: RezultatRegula[] = REGULI.map((r) => {
    const [rezultat, rezumat] = semafor[r.cod] ?? [
      r.cod === 'R06' || (r.cod === 'R05' && implicit.R05 === 'Nu se aplică') ? 'NA' : 'VERDE',
      implicit[r.cod],
    ];
    return { ...r, rezultat, rezumat };
  });
  const rosu = rezultate.some((r) => r.rezultat === 'ROSU');
  const galben = rezultate.some((r) => r.rezultat === 'GALBEN');
  const verdictPropus = rosu || galben ? 'NECESITA_COMPLETARI' : 'ACCEPTAT';
  const decizie =
    lot.decisLa &&
    (lot.status === 'ACCEPTAT' || lot.status === 'NECESITA_COMPLETARI' || lot.status === 'RESPINS')
      ? { status: lot.status, de: ADMIN, la: lot.decisLa }
      : undefined;
  return { regulament: 'Regulament v1', verdictPropus, rezultate, decizie };
}

/** Detaliile lotului, cu excepții scrise explicit pentru loturile din mockup-uri. */
export function detaliuLot(lot: Lot): LotDetaliu {
  if (lot.id === 'LOT-2026-0418') return detaliu0418(lot);
  if (lot.id === 'LOT-2026-0412') return detaliu0412(lot);
  return detaliuGeneric(lot);
}

function detaliuGeneric(lot: Lot): LotDetaliu {
  const surse = surseImplicite(lot);
  const trimis = lot.status !== 'CIORNA';
  let verificare = trimis && lot.status !== 'ANULAT' ? verificareDin(lot) : undefined;
  if (verificare && lot.status === 'RESPINS') {
    verificare = verificareDin(lot, {
      R11: ['ROSU', 'Fotografiile arată alte echipamente'],
      R13: ['ROSU', 'Starea declarată nu se vede în fotografii'],
    });
    verificare.verdictPropus = 'RESPINS';
  }
  return {
    ...lot,
    surse,
    documente: documenteDin(lot, surse, trimis),
    media: trimis ? mediaImplicite(lot) : [],
    istoric: istoricImplicit(lot, verificare),
    verificare,
    deInlocuit: [],
  };
}

function detaliu0418(lot: Lot): LotDetaliu {
  const surse: Sursa[] = [
    {
      id: 'LOT-2026-0418-s1',
      tip: 'GENERATOR',
      denumire: 'Hotel Parc Central SRL',
      cui: 'RO 18244571',
      cuiVerificatAnaf: true,
      adresaRidicare: 'Str. Fabricii 12, Chiajna, Ilfov',
      contract: 'C-112 / 03.03.2026',
      documentProvenienta: 'Aviz EWC 0457',
      linii: ['4.2'],
      kg: 930,
    },
    {
      id: 'LOT-2026-0418-s2',
      tip: 'COLECTOR_PLATFORMA',
      denumire: 'EcoRec Ilfov SRL',
      cui: 'RO 30118902',
      cuiVerificatAnaf: true,
      adresaRidicare: 'Șos. Oltenitei 208, Popești-Leordeni',
      contract: 'Transfer T-0331',
      documentProvenienta: 'Aviz ECR 1190',
      linii: ['5.2'],
      kg: 310,
    },
  ];
  const documente: DocumentLot[] = [
    {
      id: 'd1',
      tip: 'TICHET_CANTAR',
      denumire: 'Tichet de cântar',
      explicatie: 'Dovada greutății la recepție',
      status: 'DE_VERIFICAT',
      fisier: { nume: 'tichet_cantar_2409.jpg', marime: '1,1 MB' },
      extras: 'Net 1.310 kg · brut 4.870 kg · tară 3.560 kg',
    },
    {
      id: 'd2',
      tip: 'AVIZ',
      denumire: 'Aviz de însoțire',
      explicatie: 'Documentul care însoțește marfa la transport',
      status: 'INCARCAT',
      fisier: { nume: 'aviz_EWC_0457.pdf', marime: '320 KB' },
      extras: 'Nr. EWC 0457 · 1.240 kg',
    },
    {
      id: 'd3',
      tip: 'ANEXA_3',
      denumire: 'Anexa 3',
      explicatie: 'Formularul de încărcare-descărcare semnat la transport',
      status: 'INCARCAT',
      fisier: { nume: 'anexa3_0457.pdf', marime: '410 KB' },
      extras: 'Cod 20 01 35* · 1.240 kg',
    },
    {
      id: 'd4',
      tip: 'CENTRALIZATOR',
      denumire: 'Centralizator',
      explicatie: 'Lista detaliată a deșeurilor transportate',
      status: 'INCARCAT',
      fisier: { nume: 'centralizator_0418.xlsx', marime: '42 KB' },
      extras: '2 linii · 1.240 kg',
    },
    {
      id: 'd5',
      tip: 'PV_RECEPTIE',
      denumire: 'Proces-verbal de recepție',
      explicatie: 'Confirmarea recepției deșeurilor la punctul de lucru',
      status: 'LIPSA',
    },
    {
      id: 'd6',
      tip: 'ANEXA_2',
      denumire: 'Anexa 2',
      explicatie: 'Formularul de trasabilitate pentru deșeuri periculoase',
      status: 'LIPSA',
      motivCerere: 'Cerut pentru că linia 1 are un cod periculos (20 01 35*)',
    },
    {
      id: 'd7',
      tip: 'ANEXA_1',
      denumire: 'Anexa 1',
      explicatie: 'Aprobarea de transport pentru deșeuri periculoase',
      status: 'LIPSA',
      motivCerere: 'Cerut pentru că linia 1 are un cod periculos (20 01 35*)',
    },
    {
      id: 'd8',
      tip: 'AUTORIZATIE_TRANSPORT_PERICULOASE',
      denumire: 'Autorizație transport deșeuri periculoase',
      explicatie: 'Autorizația transportatorului pentru deșeuri periculoase',
      status: 'LIPSA',
      motivCerere: 'Cerut pentru că linia 1 are un cod periculos (20 01 35*)',
    },
  ];
  const verificare = verificareDin(lot, {
    R01: ['VERDE', '10 din 10 documente'],
    R02: ['ROSU', '1.310 kg vs 1.240 kg · 5,6%'],
    R03: ['VERDE', '20 01 35* · 4.2'],
    R05: ['VERDE', 'Anexa 1, Anexa 2, autorizație transport'],
    R07: ['VERDE', '3 CUI-uri verificate la ANAF'],
    R08: ['GALBEN', 'PV recepție datat înaintea avizului'],
    R09: ['VERDE', '51,7 kg / buc · prag 4.2'],
  });
  return {
    ...lot,
    surse,
    documente,
    media: mediaImplicite(lot),
    istoric: istoricImplicit(lot, verificare),
    verificare,
    deInlocuit: [],
  };
}

function detaliu0412(lot: Lot): LotDetaliu {
  const baza = detaliuGeneric(lot);
  const verificare = verificareDin(lot, {
    R02: ['ROSU', 'Cantitatea netă nu se poate citi pe tichet'],
  });
  const documente: DocumentLot[] = baza.documente.map((d) =>
    d.tip === 'TICHET_CANTAR'
      ? {
          ...d,
          status: 'DE_INLOCUIT',
          extras: 'Net ilizibil · brut 3.980 kg',
          fisier: { nume: 'tichet_cantar_2209.jpg', marime: '0,8 MB' },
        }
      : d,
  );
  const tichet = documente.find((d) => d.tip === 'TICHET_CANTAR')!;
  return {
    ...baza,
    documente,
    istoric: istoricImplicit(lot, verificare),
    verificare,
    deInlocuit: [tichet.id],
  };
}

import {
  DOCUMENTE_ONBOARDING,
  onboardingNou,
  type ExtrasAutorizatie,
  type Onboarding,
  type StareDocumentOnboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';
import { COLECTORI, ORG_DUNAREA, ORG_ECOREC, ORG_PRAHOVA, type ColectorSeed } from './seed/colectori';
import { ORG_DEMO } from './seed/loturi';
import { AUTORIZATII } from './seed/organizatii';

export { ORG_ECOREC };

const fisier = (nume: string, marime: string, incarcatLa: string) => ({ nume, marime, incarcatLa });

/** Dosarul unui colector din demo, în etapa dată, cu toate documentele în aceeași stare. */
function dosar(
  c: ColectorSeed,
  etapa: Onboarding['etapa'],
  stare: StareDocumentOnboarding,
  trimisLa: string,
) {
  const o = onboardingNou(c.id, c.inregistratLa);
  o.etapa = etapa;
  o.trimisLa = trimisLa;
  o.firma = {
    cui: c.cui,
    cuiVerificatAnaf: true,
    denumire: c.denumire,
    adresaSediu: c.adresaSediu,
    punctLucru: c.punctLucru,
    banca: c.banca,
    iban: c.iban,
  };
  o.documente = o.documente.map((d) => ({
    ...d,
    stare,
    fisier: fisier(`${d.tip.toLowerCase().replace(/_/g, '-')}.pdf`, '412 KB', trimisLa),
  }));
  const a = AUTORIZATII[c.id];
  o.autorizatie = {
    numar: a?.numar ?? '57/2025',
    emitent: c.emitentAutorizatie,
    valabilPana: a?.valabilPana ?? '2030-12-31',
    coduri: a?.coduriAutorizate ?? ['20 01 23*', '20 01 35*', '20 01 36', '16 02 14'],
    confirmat: true,
    corectat: false,
  };
  const autorizatie = o.documente.find((d) => d.tip === 'AUTORIZATIE_MEDIU')!;
  autorizatie.valabilPana = o.autorizatie.valabilPana;
  return o;
}

function seed(c: ColectorSeed): Onboarding {
  if (c.id === ORG_ECOREC) return seedEcorec(c);
  if (c.id === ORG_PRAHOVA) return dosar(c, 'IN_VERIFICARE', 'DE_VERIFICAT', '2026-09-23T17:25:00');
  if (c.id === ORG_DUNAREA) {
    const o = dosar(c, 'VIZITA', 'APROBAT', '2026-09-15T10:00:00');
    o.vizita = { programataLa: '2026-09-29' };
    return o;
  }
  // Colectorii activi: dosar aprobat și vizită efectuată la o săptămână după înregistrare.
  const o = dosar(c, 'ACTIV', 'APROBAT', c.inregistratLa);
  const vizita = new Date(new Date(c.inregistratLa).getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  o.vizita = {
    programataLa: vizita,
    efectuataLa: vizita,
    de: 'Elena Wagner',
    observatii: 'Depozit conform.',
  };
  const visa = o.documente.find((d) => d.tip === 'VISA_ANUALA')!;
  // Visa colectorului demo expiră curând: apare în „De rezolvat” și pe /organizatie.
  visa.valabilPana = c.id === ORG_DEMO ? '2026-10-12' : '2027-03-31';
  return o;
}

/**
 * Colectorul neactivat din demo: dosarul a fost trimis o dată, iar administratorul a
 * respins extrasul ONRC. Mai are de încărcat trei documente și de confirmat datele din
 * autorizația de mediu.
 */
function seedEcorec(c: ColectorSeed): Onboarding {
  const o = dosar(c, 'DOCUMENTE', 'LIPSA', '2026-09-22T14:10:00');
  const aprobat = new Set<TipDocumentOnboarding>([
    'CERTIFICAT_INMATRICULARE',
    'CERTIFICAT_CONSTATATOR',
    'CONTRACT_PUNCT_LUCRU',
    'VISA_ANUALA',
  ]);
  o.documente = o.documente.map((d) => {
    if (aprobat.has(d.tip)) return { ...d, stare: 'APROBAT' };
    if (d.tip === 'EXTRAS_ONRC') {
      return {
        ...d,
        stare: 'RESPINS',
        fisier: fisier('extras-onrc-iunie.pdf', '188 KB', o.trimisLa!),
        motiv: 'Extrasul e mai vechi de 30 de zile. Încarcă unul emis recent.',
      };
    }
    if (d.tip === 'AUTORIZATIE_MEDIU') {
      return { ...d, stare: 'INCARCAT', fisier: fisier('autorizatie-mediu.pdf', '1,2 MB', o.trimisLa!) };
    }
    return { tip: d.tip, stare: 'LIPSA' };
  });
  o.autorizatie = extrasAutorizatieMock();
  return o;
}

/**
 * Faza A: extragerea din autorizația de mediu e simulată, ca să se vadă blocul „Extras de AI”.
 * În Faza C o produce pipeline-ul de extracție.
 */
export function extrasAutorizatieMock(): ExtrasAutorizatie {
  return {
    numar: '112/2025',
    emitent: 'Agenția pentru Protecția Mediului Ilfov',
    valabilPana: '2030-05-31',
    coduri: ['20 01 23*', '20 01 35*', '20 01 36', '16 02 13*', '16 02 14'],
    confirmat: false,
    corectat: false,
  };
}

const stari = new Map<string, Onboarding>(COLECTORI.map((c) => [c.id, seed(c)]));

export function onboardingPentru(organizatieId: string, acum?: Date): Onboarding {
  let o = stari.get(organizatieId);
  if (!o) {
    o = onboardingNou(organizatieId, acum?.toISOString());
    stari.set(organizatieId, o);
  }
  return o;
}

/** Toate dosarele cunoscute: colectorii din demo și conturile create în sesiunea curentă. */
export const toateDosarele = () => [...stari.values()];

export function salveazaOnboarding(o: Onboarding) {
  stari.set(o.organizatieId, o);
}

export const documentValid = (tip: string): tip is TipDocumentOnboarding =>
  DOCUMENTE_ONBOARDING.some((d) => d.tip === tip);

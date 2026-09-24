import {
  DOCUMENTE_ONBOARDING,
  onboardingNou,
  type ExtrasAutorizatie,
  type Onboarding,
  type TipDocumentOnboarding,
} from '@/lib/domain/onboarding';

export const ORG_ECOREC = 'org-ecorec-ilfov';

/**
 * Starea de onboarding a colectorului neactivat din demo: dosarul a fost trimis o dată,
 * iar administratorul a respins extrasul ONRC. Mai are de încărcat trei documente și
 * de confirmat datele din autorizația de mediu.
 */
function seedEcorec(): Onboarding {
  const o = onboardingNou(ORG_ECOREC);
  o.firma = {
    cui: '30118904',
    cuiVerificatAnaf: true,
    denumire: 'EcoRec Ilfov SRL',
    adresaSediu: 'Șos. Olteniței 208, Popești-Leordeni',
    punctLucru: 'Str. Depozitelor 4, Popești-Leordeni, Ilfov',
    banca: 'ING Bank',
    iban: 'RO21INGB0000999901234567',
  };
  const fisier = (nume: string, marime: string) => ({ nume, marime, incarcatLa: '2026-09-22T14:10:00' });
  const aprobat = new Set<TipDocumentOnboarding>([
    'CERTIFICAT_INMATRICULARE',
    'CERTIFICAT_CONSTATATOR',
    'CONTRACT_PUNCT_LUCRU',
    'VISA_ANUALA',
  ]);
  o.documente = o.documente.map((d) => {
    if (aprobat.has(d.tip))
      return { ...d, stare: 'APROBAT', fisier: fisier(`${d.tip.toLowerCase()}.pdf`, '412 KB') };
    if (d.tip === 'EXTRAS_ONRC') {
      return {
        ...d,
        stare: 'RESPINS',
        fisier: fisier('extras-onrc-iunie.pdf', '188 KB'),
        motiv: 'Extrasul e mai vechi de 30 de zile. Încarcă unul emis recent.',
      };
    }
    if (d.tip === 'AUTORIZATIE_MEDIU')
      return { ...d, stare: 'INCARCAT', fisier: fisier('autorizatie-mediu.pdf', '1,2 MB') };
    return d;
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

const stari = new Map<string, Onboarding>();

export function onboardingPentru(organizatieId: string): Onboarding {
  let o = stari.get(organizatieId);
  if (!o) {
    o = organizatieId === ORG_ECOREC ? seedEcorec() : onboardingNou(organizatieId);
    stari.set(organizatieId, o);
  }
  return o;
}

export function salveazaOnboarding(o: Onboarding) {
  stari.set(o.organizatieId, o);
}

export const documentValid = (tip: string): tip is TipDocumentOnboarding =>
  DOCUMENTE_ONBOARDING.some((d) => d.tip === tip);

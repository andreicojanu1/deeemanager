import { z } from 'zod';
import { cuiValid, ibanValid, normalizeazaCui } from './identificatori';

/** Documentele de onboarding (SPEC-ECRANE §2), în ordinea din listă. */
export const DOCUMENTE_ONBOARDING = [
  {
    tip: 'CERTIFICAT_INMATRICULARE',
    denumire: 'Certificat de înmatriculare',
    explicatie: 'Emis de ONRC la înființarea firmei.',
  },
  {
    tip: 'CERTIFICAT_CONSTATATOR',
    denumire: 'Certificat constatator al punctului de lucru',
    explicatie: 'Cu activitatea de colectare autorizată la punctul de lucru.',
  },
  {
    tip: 'EXTRAS_ONRC',
    denumire: 'Extras ONRC',
    // TODO(validare-client): vechimea maximă acceptată a extrasului (am presupus 30 de zile).
    explicatie: 'Emis în ultimele 30 de zile.',
  },
  {
    tip: 'CONTRACT_PUNCT_LUCRU',
    denumire: 'Contractul punctului de lucru',
    explicatie: 'Contract de închiriere, comodat sau act de proprietate.',
  },
  {
    tip: 'AUTORIZATIE_MEDIU',
    denumire: 'Autorizația de mediu',
    explicatie: 'Cu codurile de deșeu pe care le colectezi.',
  },
  {
    tip: 'VISA_ANUALA',
    denumire: 'Visa anuală a autorizației de mediu',
    explicatie: 'Pentru anul în curs.',
  },
  {
    tip: 'SIATD_DEEE',
    denumire: 'Captură SIATD cu modulul DEEE activ',
    explicatie: 'Captură de ecran din contul firmei în SIATD.',
  },
  {
    tip: 'ACT_IDENTITATE_ADMIN',
    denumire: 'Actul de identitate al administratorului',
    explicatie: 'Folosit doar pentru verificare; nu se afișează altor utilizatori.',
  },
  {
    tip: 'DECLARATIE_GDPR',
    denumire: 'Declarația GDPR',
    explicatie: 'Semnată de administratorul firmei.',
  },
] as const;

export type TipDocumentOnboarding = (typeof DOCUMENTE_ONBOARDING)[number]['tip'];

/** Aceleași stări ca în wizard-ul de lot: lipsă, încărcat, de verificat, respins cu motiv. */
export type StareDocumentOnboarding = 'LIPSA' | 'INCARCAT' | 'DE_VERIFICAT' | 'APROBAT' | 'RESPINS';

export const ETICHETA_STARE_DOC: Record<StareDocumentOnboarding, string> = {
  LIPSA: 'Lipsă',
  INCARCAT: 'Încărcat',
  DE_VERIFICAT: 'De verificat',
  APROBAT: 'Aprobat',
  RESPINS: 'Respins',
};

export type DocumentOnboarding = {
  tip: TipDocumentOnboarding;
  stare: StareDocumentOnboarding;
  fisier?: { nume: string; marime: string; incarcatLa: string };
  /** La respingere: ce are de făcut colectorul. */
  motiv?: string;
  /** Documentele cu termen (autorizație, visă): data până la care sunt valabile. */
  valabilPana?: string;
};

/** Datele extrase de AI din autorizația de mediu; colectorul le confirmă sau le corectează. */
export type ExtrasAutorizatie = {
  numar: string;
  emitent: string;
  valabilPana: string;
  coduri: string[];
  /** true după ce colectorul a confirmat sau corectat datele. */
  confirmat: boolean;
  /** true dacă cel puțin un câmp a fost corectat de colector. */
  corectat: boolean;
};

/**
 * Etapele activării (stepper-ul din antet).
 * DOCUMENTE: colectorul completează; IN_VERIFICARE: trimis, așteaptă adminul;
 * VIZITA: documentele sunt aprobate, urmează vizita în teren; ACTIV: cont activat.
 */
export type EtapaOnboarding = 'DOCUMENTE' | 'IN_VERIFICARE' | 'VIZITA' | 'ACTIV';

export const ETAPE: { etapa: EtapaOnboarding; eticheta: string }[] = [
  { etapa: 'DOCUMENTE', eticheta: 'Documente' },
  { etapa: 'IN_VERIFICARE', eticheta: 'În verificare' },
  { etapa: 'VIZITA', eticheta: 'Vizită în teren' },
  { etapa: 'ACTIV', eticheta: 'Activ' },
];

export const DateFirmaSchema = z.object({
  cui: z.string().max(20),
  cuiVerificatAnaf: z.boolean(),
  denumire: z.string().max(200),
  adresaSediu: z.string().max(300),
  punctLucru: z.string().max(300),
  banca: z.string().max(100),
  iban: z.string().max(40),
});

export type DateFirma = z.infer<typeof DateFirmaSchema>;

export type Onboarding = {
  organizatieId: string;
  etapa: EtapaOnboarding;
  firma: DateFirma;
  documente: DocumentOnboarding[];
  autorizatie: ExtrasAutorizatie | null;
  creatLa: string;
  trimisLa?: string;
  salvatLa?: string;
  /** Vizita în teren, marcată manual de administrator. */
  vizita?: { programataLa?: string; efectuataLa?: string; de?: string; observatii?: string };
};

export const FIRMA_GOALA: DateFirma = {
  cui: '',
  cuiVerificatAnaf: false,
  denumire: '',
  adresaSediu: '',
  punctLucru: '',
  banca: '',
  iban: '',
};

export function onboardingNou(organizatieId: string, creatLa = new Date().toISOString()): Onboarding {
  return {
    organizatieId,
    creatLa,
    etapa: 'DOCUMENTE',
    firma: { ...FIRMA_GOALA },
    documente: DOCUMENTE_ONBOARDING.map((d) => ({ tip: d.tip, stare: 'LIPSA' })),
    autorizatie: null,
  };
}

/** IBAN-ul se afișează în grupuri de câte 4, fără spații la salvare. */
export const normalizeazaIban = (iban: string) => iban.replace(/\s+/g, '').toUpperCase();
export const grupeazaIban = (iban: string) => normalizeazaIban(iban).replace(/(.{4})(?=.)/g, '$1 ');

/** Erorile pe câmpurile firmei; goale dacă totul e în regulă. */
export function valideazaFirma(f: DateFirma): Partial<Record<keyof DateFirma, string>> {
  const e: Partial<Record<keyof DateFirma, string>> = {};
  const cui = normalizeazaCui(f.cui);
  if (!f.cui.trim()) e.cui = 'Scrie CUI-ul firmei.';
  else if (!cui || !cuiValid(cui)) e.cui = 'CUI-ul nu e valid. Verifică cifrele.';
  else if (!f.cuiVerificatAnaf) e.cui = 'Verificăm CUI-ul la ANAF când ieși din câmp.';
  if (!f.punctLucru.trim()) e.punctLucru = 'Scrie adresa punctului de lucru.';
  if (!f.banca.trim()) e.banca = 'Scrie numele băncii.';
  if (!f.iban.trim()) e.iban = 'Scrie IBAN-ul firmei.';
  else if (!ibanValid(normalizeazaIban(f.iban)))
    e.iban = 'IBAN-ul nu e valid. Verifică cele 24 de caractere.';
  return e;
}

/** Un document e acceptabil pentru trimitere dacă e încărcat și nu e respins. */
const documentGata = (d: DocumentOnboarding) => d.stare !== 'LIPSA' && d.stare !== 'RESPINS';

export type ElementRezumat = { cheie: string; denumire: string; gata: boolean; detaliu: string };

/** Ce mai lipsește înainte de „Trimite la verificare”. Lista goală = dosar complet. */
export function ceLipseste(o: Onboarding): string[] {
  const lipsa: string[] = [];
  if (Object.keys(valideazaFirma(o.firma)).length) lipsa.push('Datele firmei');
  for (const d of o.documente) {
    const info = DOCUMENTE_ONBOARDING.find((x) => x.tip === d.tip)!;
    if (d.stare === 'RESPINS') lipsa.push(`${info.denumire} (respins)`);
    else if (!documentGata(d)) lipsa.push(info.denumire);
  }
  const autorizatie = o.documente.find((d) => d.tip === 'AUTORIZATIE_MEDIU');
  if (autorizatie && documentGata(autorizatie) && !o.autorizatie?.confirmat) {
    lipsa.push('Confirmarea datelor din autorizația de mediu');
  }
  return lipsa;
}

export const poateTrimite = (o: Onboarding) => o.etapa === 'DOCUMENTE' && ceLipseste(o).length === 0;

export const ExtrasAutorizatieSchema = z.object({
  numar: z.string().trim().min(1, 'Scrie numărul autorizației.').max(40),
  emitent: z.string().trim().min(1, 'Scrie emitentul.').max(120),
  valabilPana: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Alege data de valabilitate.'),
  coduri: z
    .array(z.string().regex(/^\d{2} \d{2} \d{2}\*?$/, 'Codurile au forma 20 01 36 sau 20 01 35*.'))
    .min(1, 'Adaugă cel puțin un cod de deșeu autorizat.')
    .max(60),
});

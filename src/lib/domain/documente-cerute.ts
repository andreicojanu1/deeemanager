/**
 * Lista de documente cerute pentru un lot, generată din proveniență, surse și
 * codurile de deșeu declarate (SPEC-ECRANE §5, „Logica listei”).
 *
 * TODO(validare-client): regulile de mai jos vin din board-ul Miro și din spec.
 * Nu sunt încă validate de client / consultantul de mediu. Sunt scrise ca date
 * (REGULI_DOCUMENTE), ca să poată fi mutate în configurarea din admin.
 */

export type Provenienta = 'PJ' | 'PF' | 'MIXT';

export type TipDocument =
  | 'TICHET_CANTAR'
  | 'AVIZ'
  | 'ANEXA_3'
  | 'CENTRALIZATOR'
  | 'PV_RECEPTIE'
  | 'FOTO_INCARCATURA'
  | 'FILMARE_CANTAR'
  | 'BORDEROU_ACHIZITIE'
  | 'ANEXA_2'
  | 'ANEXA_1'
  | 'AUTORIZATIE_TRANSPORT_PERICULOASE'
  | 'CMR';

export const DOCUMENT_INFO: Record<TipDocument, { denumire: string; explicatie: string; media?: boolean }> = {
  TICHET_CANTAR: { denumire: 'Tichet de cântar', explicatie: 'Dovada greutății la recepție' },
  AVIZ: { denumire: 'Aviz de însoțire', explicatie: 'Documentul care însoțește marfa la transport' },
  ANEXA_3: { denumire: 'Anexa 3', explicatie: 'Formularul de încărcare-descărcare semnat la transport' },
  CENTRALIZATOR: { denumire: 'Centralizator', explicatie: 'Lista detaliată a deșeurilor transportate' },
  PV_RECEPTIE: {
    denumire: 'Proces-verbal de recepție',
    explicatie: 'Confirmarea recepției deșeurilor la punctul de lucru',
  },
  FOTO_INCARCATURA: {
    denumire: 'Fotografii încărcătură',
    explicatie: 'Față, lateral și spate, ca să se vadă ce conține lotul',
    media: true,
  },
  FILMARE_CANTAR: {
    denumire: 'Filmare cântar plin / gol',
    explicatie: 'Cântărirea vehiculului încărcat și descărcat',
    media: true,
  },
  BORDEROU_ACHIZITIE: {
    denumire: 'Borderou de achiziție',
    explicatie: 'Achiziția de la persoana fizică, cu reținerile de 2% și 10%',
  },
  ANEXA_2: { denumire: 'Anexa 2', explicatie: 'Formularul de trasabilitate pentru deșeuri periculoase' },
  ANEXA_1: { denumire: 'Anexa 1', explicatie: 'Aprobarea de transport pentru deșeuri periculoase' },
  AUTORIZATIE_TRANSPORT_PERICULOASE: {
    denumire: 'Autorizație transport deșeuri periculoase',
    explicatie: 'Autorizația transportatorului pentru deșeuri periculoase',
  },
  CMR: { denumire: 'CMR', explicatie: 'Scrisoarea de trăsură pentru transport internațional' },
};

export type GrupDocumente = 'BAZA' | 'PJ' | 'PF' | 'PERICULOS' | 'INTERNATIONAL';

/** Regulile, ca date. Ordinea din listă e ordinea afișată. */
export const REGULI_DOCUMENTE: { grup: GrupDocumente; documente: TipDocument[] }[] = [
  // TODO(validare-client): pentru loturile doar de la persoane fizice, se cer tot tichetul și filmarea?
  { grup: 'BAZA', documente: ['TICHET_CANTAR', 'FOTO_INCARCATURA', 'FILMARE_CANTAR'] },
  { grup: 'PJ', documente: ['AVIZ', 'ANEXA_3', 'CENTRALIZATOR', 'PV_RECEPTIE'] },
  { grup: 'PF', documente: ['BORDEROU_ACHIZITIE'] },
  { grup: 'PERICULOS', documente: ['ANEXA_2', 'ANEXA_1', 'AUTORIZATIE_TRANSPORT_PERICULOASE'] },
  { grup: 'INTERNATIONAL', documente: ['CMR'] },
];

export type DocumentCerut = {
  /** Unic în lot: tipul, plus sursa pentru documentele cerute per sursă. */
  cheie: string;
  tip: TipDocument;
  denumire: string;
  explicatie: string;
  grup: GrupDocumente;
  /** De ce e cerut, când nu reiese din proveniență (ex. linia cu cod periculos). */
  motiv?: string;
  sursaId?: string;
};

export type IntrareDocumente = {
  provenienta: Provenienta;
  surse: { id: string; tip: 'PJ' | 'PF'; denumire: string }[];
  /** Codurile de deșeu, în ordinea liniilor. */
  coduri: string[];
  international?: boolean;
};

const periculos = (cod: string) => cod.trim().endsWith('*');

export function documenteCerute(intrare: IntrareDocumente): DocumentCerut[] {
  const rez: DocumentCerut[] = [];
  const areP = intrare.provenienta !== 'PF';
  const areF = intrare.provenienta !== 'PJ';
  const liniePericuloasa = intrare.coduri.findIndex(periculos);

  for (const regula of REGULI_DOCUMENTE) {
    const aplica =
      regula.grup === 'BAZA' ||
      (regula.grup === 'PJ' && areP) ||
      (regula.grup === 'PF' && areF) ||
      (regula.grup === 'PERICULOS' && liniePericuloasa >= 0) ||
      (regula.grup === 'INTERNATIONAL' && intrare.international);
    if (!aplica) continue;

    for (const tip of regula.documente) {
      const info = DOCUMENT_INFO[tip];
      if (tip === 'BORDEROU_ACHIZITIE') {
        for (const s of intrare.surse.filter((x) => x.tip === 'PF')) {
          rez.push({
            cheie: `${tip}:${s.id}`,
            tip,
            denumire: `${info.denumire} · ${s.denumire}`,
            explicatie: info.explicatie,
            grup: regula.grup,
            sursaId: s.id,
          });
        }
        continue;
      }
      rez.push({
        cheie: tip,
        tip,
        denumire: info.denumire,
        explicatie: info.explicatie,
        grup: regula.grup,
        motiv:
          regula.grup === 'PERICULOS'
            ? `Cerut pentru că linia ${liniePericuloasa + 1} are un cod periculos (${intrare.coduri[liniePericuloasa]})`
            : undefined,
      });
    }
  }
  return rez;
}

export const ETICHETA_GRUP: Record<GrupDocumente, string> = {
  BAZA: 'Pentru orice lot',
  PJ: 'Pentru orice lot de la persoane juridice',
  PF: 'Pentru fiecare sursă persoană fizică',
  PERICULOS: 'Cod periculos declarat',
  INTERNATIONAL: 'Transport internațional',
};

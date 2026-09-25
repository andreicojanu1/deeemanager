import type { StatusTone } from './status';
import type { EtapaOnboarding, Onboarding } from './onboarding';

/**
 * Statusul contului unui colector, văzut de administrator.
 * INVITAT: creat de admin, invitația nu a fost încă acceptată.
 * Celelalte urmează etapele activării (onboarding).
 */
export type StatusCont = 'INVITAT' | EtapaOnboarding;

export const ETICHETA_STATUS_CONT: Record<StatusCont, string> = {
  INVITAT: 'Invitat',
  DOCUMENTE: 'Documente incomplete',
  IN_VERIFICARE: 'Documente de verificat',
  VIZITA: 'Vizită în teren',
  ACTIV: 'Activ',
};

export const TON_STATUS_CONT: Record<StatusCont, StatusTone> = {
  INVITAT: 'neutral',
  DOCUMENTE: 'neutral',
  IN_VERIFICARE: 'petrol',
  VIZITA: 'warning',
  ACTIV: 'success',
};

/** Ordinea în coada „Conturi de verificat”: întâi cele care așteaptă adminul. */
export const DE_VERIFICAT: StatusCont[] = ['IN_VERIFICARE', 'VIZITA'];

export type RandColector = {
  id: string;
  denumire: string;
  cui: string;
  localitate: string;
  status: StatusCont;
  /** Loturile trimise (fără ciorne). */
  loturi: number;
  inregistratLa: string;
  /** Când a trimis dosarul la verificare, pentru „Conturi de verificat”. */
  trimisLa?: string;
};

export type Utilizator = {
  id: string;
  nume: string;
  email: string;
  rol: 'ADMINISTRATOR_FIRMA' | 'OPERATOR';
  /** null: invitație neacceptată. */
  ultimaAutentificare: string | null;
};

export const ETICHETA_ROL_UTILIZATOR: Record<Utilizator['rol'], string> = {
  ADMINISTRATOR_FIRMA: 'Administrator firmă',
  OPERATOR: 'Operator',
};

export type Vizita = NonNullable<Onboarding['vizita']>;

export type FiltreColectori = { q?: string; status?: StatusCont };

export function filtreazaColectori(randuri: RandColector[], f: FiltreColectori): RandColector[] {
  const q = f.q?.trim().toLowerCase();
  return randuri
    .filter((r) => !f.status || r.status === f.status)
    .filter(
      (r) =>
        !q ||
        r.denumire.toLowerCase().includes(q) ||
        r.cui.includes(q.replace(/^ro/, '')) ||
        r.localitate.toLowerCase().includes(q),
    )
    .sort((a, b) => a.denumire.localeCompare(b.denumire, 'ro'));
}

/** Conturile care așteaptă o acțiune a adminului, cele mai vechi primele. */
export function conturiDeVerificat(randuri: RandColector[]): RandColector[] {
  return randuri
    .filter((r) => DE_VERIFICAT.includes(r.status))
    .sort(
      (a, b) =>
        DE_VERIFICAT.indexOf(a.status) - DE_VERIFICAT.indexOf(b.status) ||
        (a.trimisLa ?? a.inregistratLa).localeCompare(b.trimisLa ?? b.inregistratLa),
    );
}

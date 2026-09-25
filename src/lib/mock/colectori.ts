import { AccesInterzisError, doarAdmin } from '@/lib/data/access';
import type { DataContext, DataLayer, DetaliuColector } from '@/lib/data/types';
import { filtreazaColectori, type RandColector, type Utilizator } from '@/lib/domain/colectori';
import { cuiValid, normalizeazaCui } from '@/lib/domain/identificatori';
import { DOCUMENTE_ONBOARDING, onboardingNou, type Onboarding } from '@/lib/domain/onboarding';
import { acumIso, now } from './ceas';
import { documentValid, onboardingPentru, salveazaOnboarding, toateDosarele } from './onboarding';
import { COLECTORI, colectorSeed } from './seed/colectori';
import { LOTURI } from './seed/loturi';
import { NUME_ORGANIZATIE } from './seed/organizatii';

/** Firmele invitate de admin care nu au acceptat încă invitația. */
const invitati: { id: string; denumire: string; cui: string; utilizator: Utilizator; creatLa: string }[] = [];

const localitate = (adresa: string) => adresa.split(',').slice(1).join(',').trim() || adresa || '—';

function rand(o: Onboarding): RandColector {
  const seed = colectorSeed(o.organizatieId);
  const denumire = o.firma.denumire || seed?.denumire || 'Cont nou, fără date firmă';
  return {
    id: o.organizatieId,
    denumire,
    cui: o.firma.cui || seed?.cui || '—',
    localitate: seed?.localitate ?? localitate(o.firma.adresaSediu),
    status: o.etapa,
    loturi: LOTURI.filter((l) => l.organizatieId === o.organizatieId && l.status !== 'CIORNA').length,
    inregistratLa: o.creatLa,
    trimisLa: o.etapa === 'IN_VERIFICARE' ? o.trimisLa : undefined,
  };
}

function randuri(): RandColector[] {
  return [
    ...toateDosarele().map(rand),
    ...invitati.map((i) => ({
      id: i.id,
      denumire: i.denumire,
      cui: i.cui,
      localitate: '—',
      status: 'INVITAT' as const,
      loturi: 0,
      inregistratLa: i.creatLa,
    })),
  ];
}

function dosarExistent(id: string): Onboarding {
  const o = toateDosarele().find((x) => x.organizatieId === id);
  if (!o) throw new Error('Colectorul nu există.');
  return o;
}

/** După ultima decizie pe dosar: înapoi la colector dacă ceva e respins, altfel vizita în teren. */
function avanseaza(o: Onboarding) {
  if (o.etapa !== 'IN_VERIFICARE') return;
  if (o.documente.some((d) => d.stare === 'DE_VERIFICAT' || d.stare === 'INCARCAT')) return;
  o.etapa = o.documente.some((d) => d.stare === 'RESPINS') ? 'DOCUMENTE' : 'VIZITA';
}

export const colectori: DataLayer['colectori'] = {
  async list(ctx, filtre) {
    doarAdmin(ctx);
    return filtreazaColectori(randuri(), filtre);
  },

  async get(ctx, id) {
    if (ctx.rol !== 'ADMIN' && ctx.organizatieId !== id) throw new AccesInterzisError();
    const invitat = invitati.find((i) => i.id === id);
    if (invitat) {
      const o = onboardingNou(id, invitat.creatLa);
      return {
        rand: randuri().find((r) => r.id === id)!,
        onboarding: o,
        utilizatori: [invitat.utilizator],
        acum: acumIso(),
      } satisfies DetaliuColector;
    }
    const o =
      ctx.rol === 'ADMIN' ? toateDosarele().find((x) => x.organizatieId === id) : onboardingPentru(id, now());
    if (!o) return null;
    return {
      rand: rand(o),
      onboarding: structuredClone(o),
      utilizatori: colectorSeed(id)?.utilizatori ?? [],
      acum: acumIso(),
    };
  },

  async decideDocument(ctx, id, tip, decizie, motiv) {
    doarAdmin(ctx);
    if (!documentValid(tip)) throw new Error('Tipul de document nu există.');
    const o = dosarExistent(id);
    const d = o.documente.find((x) => x.tip === tip)!;
    if (!d.fisier) throw new Error('Documentul nu a fost încărcat.');
    if (decizie === 'RESPINS') {
      const m = motiv?.trim();
      if (!m) throw new Error('Scrie motivul, ca firma să știe ce să încarce.');
      d.stare = 'RESPINS';
      d.motiv = m.slice(0, 300);
    } else {
      d.stare = 'APROBAT';
      d.motiv = undefined;
    }
    avanseaza(o);
    salveazaOnboarding(o);
  },

  async programeazaVizita(ctx, id, data) {
    doarAdmin(ctx);
    const o = dosarExistent(id);
    if (o.etapa !== 'VIZITA') throw new Error('Vizita se programează după aprobarea documentelor.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Alege data vizitei.');
    o.vizita = { ...o.vizita, programataLa: data };
    salveazaOnboarding(o);
  },

  async finalizeazaVizita(ctx, id, vizita, de) {
    doarAdmin(ctx);
    const o = dosarExistent(id);
    if (o.etapa !== 'VIZITA') throw new Error('Vizita se marchează după aprobarea documentelor.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(vizita.data)) throw new Error('Alege data la care a avut loc vizita.');
    if (vizita.data > acumIso().slice(0, 10)) throw new Error('Data vizitei nu poate fi în viitor.');
    o.vizita = {
      ...o.vizita,
      efectuataLa: vizita.data,
      de,
      observatii: vizita.observatii.trim().slice(0, 500) || undefined,
    };
    o.etapa = 'ACTIV';
    salveazaOnboarding(o);
  },

  async invita(ctx, date) {
    doarAdmin(ctx);
    const cui = normalizeazaCui(date.cui);
    if (!cui || !cuiValid(cui)) throw new Error('CUI-ul nu e valid. Verifică cifrele.');
    if (randuri().some((r) => r.cui === cui)) throw new Error('Există deja o firmă cu acest CUI.');
    const email = date.email.trim().toLowerCase();
    const emailuri = [...COLECTORI.flatMap((c) => c.utilizatori), ...invitati.map((i) => i.utilizator)];
    if (emailuri.some((x) => x.email === email)) throw new Error('Există deja un utilizator cu acest email.');
    const id = `org-invitat-${cui}`;
    invitati.push({
      id,
      denumire: date.denumire.trim(),
      cui,
      creatLa: acumIso(),
      utilizator: {
        id: `u-invitat-${cui}`,
        nume: date.nume.trim(),
        email,
        rol: 'ADMINISTRATOR_FIRMA',
        ultimaAutentificare: null,
      },
    });
    NUME_ORGANIZATIE[id] = date.denumire.trim();
    return { id };
  },
};

/** Documentele pe care firma activă le poate reînnoi din /organizatie. */
export async function inlocuiesteDocumentOrganizatie(
  ctx: DataContext,
  tip: string,
  fisier: { nume: string; marime: string },
) {
  if (!documentValid(tip)) throw new Error('Tipul de document nu există.');
  const o = onboardingPentru(ctx.organizatieId, now());
  if (o.etapa !== 'ACTIV') throw new Error('Documentele se încarcă din pagina de activare a contului.');
  const d = o.documente.find((x) => x.tip === tip)!;
  d.stare = 'DE_VERIFICAT';
  d.motiv = undefined;
  d.valabilPana = undefined;
  d.fisier = { nume: fisier.nume.slice(0, 200), marime: fisier.marime.slice(0, 20), incarcatLa: acumIso() };
  salveazaOnboarding(o);
}

export const DENUMIRI_DOCUMENTE = Object.fromEntries(DOCUMENTE_ONBOARDING.map((d) => [d.tip, d.denumire]));

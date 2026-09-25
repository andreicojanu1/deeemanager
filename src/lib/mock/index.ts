import { AccesInterzisError, doarAdmin, vizibilePentru } from '@/lib/data/access';
import type { DataContext, DataLayer } from '@/lib/data/types';
import { arbore, filtreaza, pagineaza } from '@/lib/domain/loturi';
import type { DocumentOrganizatie, LotDetaliu } from '@/lib/domain/lot';
import {
  deRezolvat,
  intrariPeLuna,
  loturiPeStatus,
  randLot,
  stocPeCategorii,
  ultimeleLoturi,
} from '@/lib/domain/panou';
import { CiornaSchema, poateFiTrimisa, type Ciorna } from '@/lib/domain/ciorna';
import { cuiValid, normalizeazaCui } from '@/lib/domain/identificatori';
import { poateAnula, poateEdita, poateRetrimite } from '@/lib/domain/tranzitii';
import { ciornaDinDetaliu, contextValidare, detaliuDinCiorna, liniiDinCiorna } from './ciorne';
import { CODURI_PE_CATEGORIE } from './seed/coduri';
import { ANAF, AUTORIZATII, NUME_ORGANIZATIE } from './seed/organizatii';
import { CODURI_DESEU } from './seed/coduri';
import { REGULI, detaliuLot, verificareDin } from './seed/detalii';
import { randCoada, sorteazaCoada } from '@/lib/domain/coada';
import { CONFIG_REGULI, construiesteRaport } from './raport';
import { DENUMIRI_DOCUMENTE, colectori, inlocuiesteDocumentOrganizatie } from './colectori';
import { conturiDeVerificat } from '@/lib/domain/colectori';
import { ModificareRegulaSchema } from '@/lib/domain/reguli';
import { ModificareSubcategorieSchema } from '@/lib/domain/taxonomie';
import { documentValid, extrasAutorizatieMock, onboardingPentru, salveazaOnboarding } from './onboarding';
import {
  DateFirmaSchema,
  ExtrasAutorizatieSchema,
  normalizeazaIban,
  poateTrimite,
  ceLipseste,
} from '@/lib/domain/onboarding';
import { LOTURI } from './seed/loturi';
import { CATEGORII, SUBCATEGORII, subcategorie } from './seed/taxonomie';

/** Latență simulată, ca skeleton-urile să fie vizibile în Faza A. */
const LATENTA_MS = process.env.NODE_ENV === 'test' ? 0 : 250;
const asteapta = () => new Promise((r) => setTimeout(r, LATENTA_MS));

export { now } from './ceas';
import { acumIso, now } from './ceas';

const tx = { categorii: CATEGORII, subcategorie };

/** Listele de loturi: adminul nu vede ciornele colectorilor, doar ce a fost trimis. */
const loturiVizibile = (ctx: DataContext) =>
  vizibilePentru(ctx, LOTURI).filter((l) => ctx.rol !== 'ADMIN' || l.status !== 'CIORNA');

const numeColector = (id: string) => NUME_ORGANIZATIE[id] ?? id;

/**
 * Starea modificabilă din Faza A: detaliile se calculează o dată și apoi se
 * modifică în memorie. Se pierd la repornirea serverului.
 */
const detalii = new Map<string, LotDetaliu>();
const ciorne = new Map<string, Ciorna>();

function idNou(): string {
  const max = Math.max(...LOTURI.map((l) => Number(l.id.slice(-4))));
  return `LOT-2026-${String(max + 1).padStart(4, '0')}`;
}

function gaseste(ctx: DataContext, id: string) {
  const lot = vizibilePentru(ctx, LOTURI).find((l) => l.id === id);
  if (!lot) return null;
  if (!detalii.has(id)) detalii.set(id, detaliuLot(lot));
  const d = detalii.get(id)!;
  // Statusul și motivul trăiesc pe lot; detaliul le copiază la fiecare citire.
  return { lot, detaliu: Object.assign(d, { status: lot.status, motiv: lot.motiv }) };
}

export const mockData: DataLayer = {
  taxonomie: {
    async categorii() {
      return CATEGORII;
    },
    async subcategorii() {
      return SUBCATEGORII;
    },
    async coduri() {
      return CODURI_DESEU;
    },
    async modificaSubcategorie(ctx, cod, modificare) {
      doarAdmin(ctx);
      const sc = SUBCATEGORII.find((x) => x.cod === cod);
      if (!sc) throw new Error('Subcategoria nu există.');
      Object.assign(sc, ModificareSubcategorieSchema.parse(modificare));
    },
    async modificaCod(ctx, cod, modificare) {
      doarAdmin(ctx);
      const c = CODURI_DESEU.find((x) => x.cod === cod);
      if (!c) throw new Error('Codul nu există.');
      c.activ = modificare.activ;
    },
    async reguli(ctx) {
      doarAdmin(ctx);
      return REGULI.map((r) => ({
        cod: r.cod,
        nume: r.nume,
        activa: CONFIG_REGULI[r.cod]?.activa !== false,
        severitate: CONFIG_REGULI[r.cod]?.severitate ?? 'BLOCANT',
        toleranta: CONFIG_REGULI[r.cod]?.toleranta,
      }));
    },
    async modificaRegula(ctx, cod, modificare) {
      doarAdmin(ctx);
      const c = CONFIG_REGULI[cod];
      if (!c) throw new Error('Regula nu există.');
      const m = ModificareRegulaSchema.parse(modificare);
      if (m.toleranta !== undefined && c.toleranta === undefined) {
        throw new Error('Regula nu are prag numeric.');
      }
      Object.assign(c, m);
    },
  },

  colectori,

  admin: {
    async panou(ctx) {
      doarAdmin(ctx);
      const coada = await mockData.verificari.coada(ctx);
      const toti = await colectori.list(ctx, {});
      return {
        colectoriActivi: toti.filter((c) => c.status === 'ACTIV').length,
        inCoada: coada.deVerificat.length,
        deciseAzi: coada.deciseAzi.length,
        timpMediuDecizieMin: coada.timpMediuDecizieMin,
        intrari: intrariPeLuna(LOTURI, now()),
        conturiDeVerificat: conturiDeVerificat(toti),
      };
    },
  },

  panou: {
    async colector(ctx) {
      await asteapta();
      const loturi = vizibilePentru(ctx, LOTURI);
      // Documentele firmei vin din dosarul de activare: o visă reînnoită nu mai apare aici.
      const dosar = onboardingPentru(ctx.organizatieId, now());
      const documente: DocumentOrganizatie[] = dosar.documente.map((d) => ({
        id: `doc-${dosar.organizatieId}-${d.tip}`,
        organizatieId: dosar.organizatieId,
        tip: d.tip,
        denumire: DENUMIRI_DOCUMENTE[d.tip],
        valabilPana: d.stare === 'APROBAT' ? d.valabilPana : undefined,
        status: d.stare,
        motivRespingere: d.motiv,
      }));
      const acum = now();
      return {
        deRezolvat: deRezolvat(loturi, documente, acum),
        stoc: stocPeCategorii(loturi, CATEGORII, subcategorie),
        intrari: intrariPeLuna(loturi, acum),
        statusuri: loturiPeStatus(loturi, acum),
        ultimeleLoturi: ultimeleLoturi(loturi).map((l) => randLot(l, subcategorie)),
      };
    },
  },

  loturi: {
    async list(ctx, filtre) {
      await asteapta();
      const loturi = filtreaza(loturiVizibile(ctx), filtre, tx, numeColector);
      return pagineaza(loturi, filtre.pagina ?? 1, tx);
    },
    async arbore(ctx, filtre) {
      await asteapta();
      return arbore(filtreaza(loturiVizibile(ctx), filtre, tx, numeColector), tx);
    },
    async optiuni(ctx) {
      const loturi = vizibilePentru(ctx, LOTURI);
      return {
        puncteLucru: [...new Set(loturi.map((l) => l.punctLucru))].sort(),
        colectori:
          ctx.rol === 'ADMIN'
            ? [...new Set(loturi.map((l) => l.organizatieId))].map((id) => ({
                id,
                denumire: numeColector(id),
              }))
            : [],
      };
    },
    async get(ctx, id) {
      await asteapta();
      return gaseste(ctx, id)?.detaliu ?? null;
    },
    async anuleaza(ctx, id, motiv) {
      const g = gaseste(ctx, id);
      if (!g || ctx.rol !== 'COLECTOR') throw new AccesInterzisError();
      if (!poateAnula(g.lot.status)) throw new Error('Lotul nu mai poate fi anulat.');
      g.lot.status = 'ANULAT';
      g.lot.motiv = motiv;
      g.detaliu.istoric.unshift({ la: acumIso(), autor: 'Tu', actiune: 'Ai anulat lotul', detaliu: motiv });
    },
    async inlocuiesteDocument(ctx, id, documentId, numeFisier) {
      const g = gaseste(ctx, id);
      if (!g || ctx.rol !== 'COLECTOR') throw new AccesInterzisError();
      const doc = g.detaliu.documente.find((d) => d.id === documentId);
      if (!doc) throw new Error('Documentul nu există în acest lot.');
      doc.status = 'INCARCAT';
      doc.fisier = { nume: numeFisier, marime: '—' };
      doc.extras = undefined;
      g.detaliu.deInlocuit = g.detaliu.deInlocuit.filter((d) => d !== documentId);
      g.detaliu.istoric.unshift({
        la: acumIso(),
        autor: 'Tu',
        actiune: `Ai înlocuit ${doc.denumire}`,
        detaliu: numeFisier,
      });
    },
    async ciorna(ctx, id) {
      const g = gaseste(ctx, id);
      if (!g || !poateEdita(g.lot.status)) return null;
      return ciorne.get(id) ?? ciornaDinDetaliu(g.detaliu);
    },
    async salveazaCiorna(ctx, intrare) {
      if (ctx.rol !== 'COLECTOR') throw new AccesInterzisError();
      const c = CiornaSchema.parse(intrare);
      const salvatLa = acumIso();
      let lot = c.id ? vizibilePentru(ctx, LOTURI).find((l) => l.id === c.id) : undefined;
      if (c.id && !lot) throw new AccesInterzisError();
      if (lot && !poateEdita(lot.status)) throw new Error('Lotul nu mai poate fi editat.');
      if (!lot) {
        lot = {
          id: idNou(),
          organizatieId: ctx.organizatieId,
          status: 'CIORNA',
          punctLucru: c.punctLucru,
          dataPreluarii: c.dataPreluarii,
          linii: [],
          creatLa: salvatLa,
        };
        LOTURI.push(lot);
      }
      lot.punctLucru = c.punctLucru;
      lot.dataPreluarii = c.dataPreluarii;
      lot.linii = liniiDinCiorna(c);
      const salvata = { ...c, id: lot.id };
      ciorne.set(lot.id, salvata);
      const istoric = detalii.get(lot.id)?.istoric ?? [
        { la: salvatLa, autor: 'Tu', actiune: 'Ai creat ciorna lotului' },
      ];
      detalii.set(lot.id, detaliuDinCiorna(lot, salvata, istoric));
      return { id: lot.id, salvatLa };
    },
    async trimite(ctx, id) {
      const g = gaseste(ctx, id);
      if (!g || ctx.rol !== 'COLECTOR') throw new AccesInterzisError();
      if (!poateEdita(g.lot.status)) throw new Error('Lotul a fost deja trimis.');
      const c = ciorne.get(id);
      if (!c) throw new Error('Salvează întâi ciorna.');
      const lipsa = poateFiTrimisa(c, contextValidare(ctx.organizatieId));
      if (lipsa) throw new Error(lipsa);
      const retrimis = g.lot.status === 'NECESITA_COMPLETARI';
      g.lot.status = 'IN_VERIFICARE';
      g.lot.trimisLa = acumIso();
      g.lot.motiv = undefined;
      if (retrimis) g.lot.aFostCompletat = true;
      const istoric = [
        {
          la: g.lot.trimisLa,
          autor: 'Tu',
          actiune: retrimis ? 'Ai retrimis lotul la verificare' : 'Ai trimis lotul la verificare',
        },
        ...g.detaliu.istoric,
      ];
      const detaliu = detaliuDinCiorna(g.lot, c, istoric);
      // Faza A: verificarea automată e simulată; în Faza C o produce pipeline-ul AI.
      detaliu.verificare = verificareDin(g.lot);
      detalii.set(id, detaliu);
    },
    async retrimite(ctx, id) {
      const g = gaseste(ctx, id);
      if (!g || ctx.rol !== 'COLECTOR') throw new AccesInterzisError();
      if (!poateRetrimite(g.lot.status)) throw new Error('Lotul nu așteaptă completări.');
      if (g.detaliu.deInlocuit.length) throw new Error('Mai ai documente de înlocuit.');
      g.lot.status = 'IN_VERIFICARE';
      g.lot.trimisLa = acumIso();
      g.lot.motiv = undefined;
      g.lot.aFostCompletat = true;
      g.detaliu.istoric.unshift({
        la: g.lot.trimisLa,
        autor: 'Tu',
        actiune: 'Ai retrimis lotul la verificare',
      });
    },
  },

  organizatie: {
    async autorizatie(ctx) {
      const a = AUTORIZATII[ctx.organizatieId];
      return a
        ? { numar: a.numar, coduriAutorizate: a.coduriAutorizate, puncteLucru: a.puncteLucru }
        : { numar: '', coduriAutorizate: [], puncteLucru: [] };
    },
    async coduriPeCategorie() {
      return CODURI_PE_CATEGORIE;
    },
    async inlocuiesteDocument(ctx, tip, fisier) {
      await inlocuiesteDocumentOrganizatie(ctx, tip, fisier);
    },
  },

  onboarding: {
    async get(ctx) {
      return structuredClone(onboardingPentru(ctx.organizatieId, now()));
    },
    async salveazaFirma(ctx, firma) {
      const o = onboardingPentru(ctx.organizatieId);
      if (o.etapa !== 'DOCUMENTE') throw new Error('Dosarul e trimis; datele nu se mai pot modifica.');
      const f = DateFirmaSchema.parse(firma);
      // Denumirea și adresa sediului vin doar din ANAF.
      const anaf = f.cuiVerificatAnaf ? await mockData.anaf.cauta(f.cui) : null;
      o.firma = {
        ...f,
        cuiVerificatAnaf: Boolean(anaf),
        denumire: anaf?.denumire ?? '',
        adresaSediu: anaf?.adresa ?? '',
        iban: normalizeazaIban(f.iban),
      };
      o.salvatLa = now().toISOString();
      salveazaOnboarding(o);
      return { salvatLa: o.salvatLa };
    },
    async incarcaDocument(ctx, tip, fisier) {
      const o = onboardingPentru(ctx.organizatieId);
      if (o.etapa !== 'DOCUMENTE') throw new Error('Dosarul e trimis; documentele nu se mai pot înlocui.');
      if (!documentValid(tip)) throw new Error('Tipul de document nu există.');
      const d = o.documente.find((x) => x.tip === tip)!;
      if (d.stare === 'APROBAT') throw new Error('Documentul e deja aprobat.');
      d.stare = 'INCARCAT';
      d.motiv = undefined;
      d.fisier = {
        nume: fisier.nume.slice(0, 200),
        marime: fisier.marime.slice(0, 20),
        incarcatLa: now().toISOString(),
      };
      if (tip === 'AUTORIZATIE_MEDIU') o.autorizatie = extrasAutorizatieMock();
      salveazaOnboarding(o);
      return structuredClone(o);
    },
    async confirmaAutorizatie(ctx, extras) {
      const o = onboardingPentru(ctx.organizatieId);
      if (o.etapa !== 'DOCUMENTE') throw new Error('Dosarul e trimis; datele nu se mai pot modifica.');
      if (!o.autorizatie) throw new Error('Încarcă întâi autorizația de mediu.');
      const e = ExtrasAutorizatieSchema.parse(extras);
      const a = o.autorizatie;
      const corectat =
        a.corectat ||
        e.numar !== a.numar ||
        e.emitent !== a.emitent ||
        e.valabilPana !== a.valabilPana ||
        e.coduri.join() !== a.coduri.join();
      o.autorizatie = { ...e, confirmat: true, corectat };
      salveazaOnboarding(o);
      return structuredClone(o);
    },
    async trimite(ctx) {
      const o = onboardingPentru(ctx.organizatieId);
      if (!poateTrimite(o)) throw new Error(`Mai ai de completat: ${ceLipseste(o).join(', ')}.`);
      o.etapa = 'IN_VERIFICARE';
      o.trimisLa = now().toISOString();
      for (const d of o.documente) if (d.stare === 'INCARCAT') d.stare = 'DE_VERIFICAT';
      salveazaOnboarding(o);
      return structuredClone(o);
    },
  },

  anaf: {
    async cauta(cui) {
      await new Promise((r) => setTimeout(r, process.env.NODE_ENV === 'test' ? 0 : 600));
      const n = normalizeazaCui(cui);
      if (!n || !cuiValid(n)) return null;
      // Mock: CUI-urile necunoscute, dar valide, primesc o firmă demo.
      return ANAF[n] ?? { denumire: `Firmă demo ${n} SRL`, adresa: '' };
    },
  },

  verificari: {
    async numarInCoada(ctx) {
      doarAdmin(ctx);
      return LOTURI.filter((l) => l.status === 'IN_VERIFICARE').length;
    },
    async coada(ctx) {
      doarAdmin(ctx);
      await asteapta();
      const azi = acumIso().slice(0, 10);
      const rand = (id: string) => {
        const g = gaseste(ctx, id)!;
        return randCoada(g.lot, numeColector(g.lot.organizatieId), g.detaliu.verificare);
      };
      const deciseAzi = LOTURI.filter(
        (l) =>
          l.decisLa?.startsWith(azi) && ['ACCEPTAT', 'RESPINS', 'NECESITA_COMPLETARI'].includes(l.status),
      );
      const durate = deciseAzi.map(
        (l) => (new Date(l.decisLa!).getTime() - new Date(l.trimisLa ?? l.creatLa).getTime()) / 60_000,
      );
      return {
        deVerificat: sorteazaCoada(LOTURI.filter((l) => l.status === 'IN_VERIFICARE').map((l) => rand(l.id))),
        asteaptaColectorul: LOTURI.filter((l) => l.status === 'NECESITA_COMPLETARI')
          .map((l) => rand(l.id))
          .sort((a, b) => (b.decisLa ?? '').localeCompare(a.decisLa ?? '')),
        deciseAzi: deciseAzi
          .map((l) => rand(l.id))
          .sort((a, b) => (b.decisLa ?? '').localeCompare(a.decisLa ?? '')),
        acum: acumIso(),
        timpMediuDecizieMin: durate.length ? durate.reduce((a, b) => a + b, 0) / durate.length : null,
      };
    },
    async raport(ctx, lotId) {
      doarAdmin(ctx);
      await asteapta();
      const g = gaseste(ctx, lotId);
      if (!g || g.lot.status === 'CIORNA' || g.lot.status === 'ANULAT') return null;
      const colector = numeColector(g.lot.organizatieId);
      const coada = sorteazaCoada(
        LOTURI.filter((l) => l.status === 'IN_VERIFICARE').map((l) =>
          randCoada(l, '', gaseste(ctx, l.id)!.detaliu.verificare),
        ),
      ).map((r) => r.id);
      const i = coada.indexOf(lotId);
      const urmatorul = (i >= 0 ? [...coada.slice(i + 1), ...coada.slice(0, i)] : coada)[0] ?? null;
      return { lot: g.detaliu, colector, ...construiesteRaport(g.detaliu, colector), urmatorul };
    },
    async decide(ctx, lotId, decizie, motiv, deciziaDe, documenteDeInlocuit) {
      doarAdmin(ctx);
      const g = gaseste(ctx, lotId);
      if (!g) throw new Error('Lotul nu există.');
      if (g.lot.status !== 'IN_VERIFICARE') throw new Error('Lotul a fost deja decis.');
      if (decizie !== 'ACCEPTAT' && !motiv.trim()) throw new Error('Scrie motivul pentru colector.');
      const la = acumIso();
      g.lot.status = decizie;
      g.lot.decisLa = la;
      g.lot.motiv = decizie === 'ACCEPTAT' ? undefined : motiv.trim();
      if (g.detaliu.verificare) g.detaliu.verificare.decizie = { status: decizie, de: deciziaDe, la };
      if (decizie === 'NECESITA_COMPLETARI') {
        // Documentele de înlocuit: cele marcate „de verificat” sau lipsă.
        g.detaliu.deInlocuit = documenteDeInlocuit?.length
          ? g.detaliu.documente.filter((d) => documenteDeInlocuit.includes(d.id)).map((d) => d.id)
          : g.detaliu.documente
              .filter((d) => d.status === 'DE_VERIFICAT' || d.status === 'LIPSA')
              .map((d) => d.id);
        for (const d of g.detaliu.documente)
          if (g.detaliu.deInlocuit.includes(d.id)) d.status = 'DE_INLOCUIT';
      }
      const actiune = {
        ACCEPTAT: 'A acceptat lotul',
        NECESITA_COMPLETARI: 'A cerut completări',
        RESPINS: 'A respins lotul',
      }[decizie];
      g.detaliu.istoric.unshift({ la, autor: deciziaDe, actiune, detaliu: g.lot.motiv });
    },
  },
};

import { AccesInterzisError, doarAdmin, vizibilePentru } from '@/lib/data/access';
import type { DataContext, DataLayer } from '@/lib/data/types';
import { arbore, filtreaza, pagineaza } from '@/lib/domain/loturi';
import type { LotDetaliu } from '@/lib/domain/lot';
import {
  deRezolvat,
  intrariPeLuna,
  loturiPeStatus,
  randLot,
  stocPeCategorii,
  ultimeleLoturi,
} from '@/lib/domain/panou';
import { poateAnula, poateRetrimite } from '@/lib/domain/tranzitii';
import { CODURI_DESEU } from './seed/coduri';
import { detaliuLot } from './seed/detalii';
import { DOCUMENTE_ORGANIZATIE, LOTURI, MOCK_NOW } from './seed/loturi';
import { CATEGORII, SUBCATEGORII, subcategorie } from './seed/taxonomie';

/** Latență simulată, ca skeleton-urile să fie vizibile în Faza A. */
const LATENTA_MS = process.env.NODE_ENV === 'test' ? 0 : 250;
const asteapta = () => new Promise((r) => setTimeout(r, LATENTA_MS));

export const now = () => new Date(MOCK_NOW);
const acumIso = () => new Date().toISOString().slice(0, 19);

const tx = { categorii: CATEGORII, subcategorie };

const NUME_ORGANIZATIE: Record<string, string> = {
  'org-colector-demo': 'Colector Demo SRL',
  'org-reciclare-nord': 'Reciclare Nord SRL',
};
const numeColector = (id: string) => NUME_ORGANIZATIE[id] ?? id;

/**
 * Starea modificabilă din Faza A: detaliile se calculează o dată și apoi se
 * modifică în memorie. Se pierd la repornirea serverului.
 */
const detalii = new Map<string, LotDetaliu>();

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
  },

  panou: {
    async colector(ctx) {
      await asteapta();
      const loturi = vizibilePentru(ctx, LOTURI);
      const documente = vizibilePentru(ctx, DOCUMENTE_ORGANIZATIE);
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
      const loturi = filtreaza(vizibilePentru(ctx, LOTURI), filtre, tx, numeColector);
      return pagineaza(loturi, filtre.pagina ?? 1, tx);
    },
    async arbore(ctx, filtre) {
      await asteapta();
      return arbore(filtreaza(vizibilePentru(ctx, LOTURI), filtre, tx, numeColector), tx);
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

  verificari: {
    async numarInCoada(ctx) {
      doarAdmin(ctx);
      return LOTURI.filter((l) => l.status === 'IN_VERIFICARE').length;
    },
  },
};

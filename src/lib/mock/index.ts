import { doarAdmin, vizibilePentru } from '@/lib/data/access';
import type { DataLayer } from '@/lib/data/types';
import {
  deRezolvat,
  intrariPeLuna,
  loturiPeStatus,
  randLot,
  stocPeCategorii,
  ultimeleLoturi,
} from '@/lib/domain/panou';
import { DOCUMENTE_ORGANIZATIE, LOTURI, MOCK_NOW } from './seed/loturi';
import { CATEGORII, subcategorie } from './seed/taxonomie';

/** Latență simulată, ca skeleton-urile să fie vizibile în Faza A. */
const LATENTA_MS = process.env.NODE_ENV === 'test' ? 0 : 250;
const asteapta = () => new Promise((r) => setTimeout(r, LATENTA_MS));

export const now = () => new Date(MOCK_NOW);

export const mockData: DataLayer = {
  taxonomie: {
    async categorii() {
      return CATEGORII;
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
  verificari: {
    async numarInCoada(ctx) {
      doarAdmin(ctx);
      return LOTURI.filter((l) => l.status === 'IN_VERIFICARE').length;
    },
  },
};

'use client';

import { createContext, useContext } from 'react';
import type { Ciorna, ContextValidare, Erori } from '@/lib/domain/ciorna';
import type { CodDeseu } from '@/lib/domain/lot';
import type { Categorie, Subcategorie } from '@/lib/domain/taxonomie';

export type Taxonomie = {
  categorii: Categorie[];
  subcategorii: Subcategorie[];
  coduri: CodDeseu[];
  coduriPeCategorie: Record<number, string[]>;
  coduriAutorizate: string[];
  numarAutorizatie: string;
  puncteLucru: string[];
};

export type OptiuniFisier = { accept: string; capture?: boolean };

export type WizardApi = {
  ciorna: Ciorna;
  actualizeaza: (fn: (draft: Ciorna) => void) => void;
  tx: Taxonomie;
  validare: ContextValidare;
  erori: Erori;
  /** Mesajul de eroare al câmpului, doar după ce l-ai părăsit sau ai încercat să continui. */
  eroare: (cheie: string) => string | undefined;
  atinge: (cheie: string) => void;
  /** Deschide selectorul de fișiere (sau camera) pentru un document sau slot. */
  alegeFisier: (cheie: string, opt: OptiuniFisier) => void;
  /** Adaugă fișiere trase peste zona de încărcare, în sloturile libere. */
  adaugaFisiere: (fisiere: File[]) => void;
  previzualizari: Record<string, string>;
  progres: Record<string, number>;
};

export const WizardContext = createContext<WizardApi | null>(null);

export function useWizard(): WizardApi {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard în afara wizard-ului');
  return ctx;
}

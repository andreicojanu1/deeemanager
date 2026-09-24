import type { Metadata } from 'next';
import CoadaVerificare from '@/features/verificare/CoadaVerificare';
import { contextDin, data } from '@/lib/data';
import { durata } from '@/lib/domain/coada';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Coada de verificare' };

export default async function CoadaPage() {
  const session = await requireSession();
  const coada = await data.verificari.coada(contextDin(session));
  const n = coada.deVerificat.length;
  const subtitlu = [
    n === 0
      ? 'Niciun lot nu așteaptă decizia ta'
      : n === 1
        ? '1 lot așteaptă decizia ta'
        : `${n} loturi așteaptă decizia ta`,
    coada.timpMediuDecizieMin !== null
      ? `timp mediu până la decizie azi: ${durata(coada.timpMediuDecizieMin)}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <CoadaVerificare
      deVerificat={coada.deVerificat}
      asteaptaColectorul={coada.asteaptaColectorul}
      deciseAzi={coada.deciseAzi}
      acum={coada.acum}
      subtitlu={subtitlu}
    />
  );
}

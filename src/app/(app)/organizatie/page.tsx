import type { Metadata } from 'next';
import Typography from '@mui/material/Typography';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { DateColector, UtilizatoriFirma } from '@/features/organizatie/DateColector';
import DocumenteFirma from '@/features/organizatie/DocumenteFirma';
import { contextDin, data } from '@/lib/data';
import { requireSession } from '@/lib/session/server';

export const metadata: Metadata = { title: 'Organizație' };

export default async function Page() {
  const session = await requireSession();
  if (session.rol !== 'COLECTOR') redirect('/admin');
  const colector = await data.colectori.get(contextDin(session), session.organizatie.id);
  if (!colector) redirect('/onboarding');
  return (
    <>
      <PageHeader
        title="Organizație"
        subtitle={`${colector.rand.denumire} · datele firmei, autorizația de mediu și documentele.`}
      />
      <DocumenteFirma documente={colector.onboarding.documente} acum={colector.acum} />
      <DateColector colector={colector} perspectiva="colector" />
      <section aria-labelledby="utilizatori-titlu">
        <Typography id="utilizatori-titlu" variant="h3" component="h2" sx={{ mb: 4 }}>
          Utilizatori
        </Typography>
        <UtilizatoriFirma utilizatori={colector.utilizatori} />
      </section>
      <Typography variant="caption" color="text.secondary">
        Datele firmei și utilizatorii se modifică de administratorul platformei. Dacă s-a schimbat ceva,
        încarcă documentul nou mai sus.
      </Typography>
    </>
  );
}

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { IconChevronDown } from '@tabler/icons-react';
import ButtonLink from '@/components/ui/ButtonLink';
import StatusBadge from '@/components/ui/StatusBadge';
import StatusDot from '@/components/ui/StatusDot';
import { DOCUMENT_INFO, ETICHETA_GRUP, REGULI_DOCUMENTE } from '@/lib/domain/documente-cerute';
import { DOCUMENTE_ONBOARDING } from '@/lib/domain/onboarding';
import { LOT_STATUSES, type LotStatus } from '@/lib/domain/status';
import { color, radius } from '@/theme/tokens';
import Cuprins, { type IntrareCuprins } from './Cuprins';
import { Lista, Nota, Paragraf, Pasi, Sectiune, Subtitlu, Ui } from './elemente';
import Figura from './Figura';

const SECTIUNI: IntrareCuprins[] = [
  { id: 'pe-scurt', titlu: 'Pe scurt' },
  { id: 'activare', titlu: 'Activarea contului' },
  { id: 'panou', titlu: 'Panoul' },
  { id: 'lot-nou', titlu: 'Încarci un lot nou' },
  { id: 'documente-cerute', titlu: 'Ce documente se cer' },
  { id: 'verificare', titlu: 'Cum se verifică lotul' },
  { id: 'statusuri', titlu: 'Statusurile unui lot' },
  { id: 'completari', titlu: 'Când ți se cer completări' },
  { id: 'loturi', titlu: 'Loturile tale și stocul' },
  { id: 'organizatie', titlu: 'Organizația și documentele firmei' },
  { id: 'cont', titlu: 'Contul tău' },
  { id: 'intrebari', titlu: 'Întrebări frecvente' },
  { id: 'glosar', titlu: 'Glosar' },
];

const PARCURS: { titlu: string; text: string }[] = [
  { titlu: 'Activezi contul', text: 'Datele firmei, documentele și vizita în teren.' },
  { titlu: 'Încarci lotul', text: 'Ce ai preluat, de la cine, cu documentele cerute.' },
  { titlu: 'AI-ul verifică', text: 'Citește documentele și propune un rezultat.' },
  { titlu: 'Administratorul decide', text: 'Acceptă, cere completări sau respinge.' },
  { titlu: 'Lotul intră în stoc', text: 'Pe categorii, cu dosarul de documente.' },
];

const DESPRE_STATUS: Record<LotStatus, { inseamna: string; faci: string }> = {
  CIORNA: {
    inseamna: 'Ai început lotul, dar nu l-ai trimis. Doar tu îl vezi.',
    faci: 'Îl completezi oricând din Loturi și îl trimiți la verificare.',
  },
  IN_VERIFICARE: {
    inseamna: 'Lotul a fost trimis. AI-ul l-a verificat și așteaptă decizia administratorului.',
    faci: 'Aștepți decizia. Statusul nou apare în Loturi și pe panou.',
  },
  NECESITA_COMPLETARI: {
    inseamna: 'Administratorul a găsit ceva de corectat și ți-a scris ce anume.',
    faci: 'Înlocuiești documentele marcate și apeși „Retrimite la verificare”.',
  },
  ACCEPTAT: {
    inseamna: 'Lotul a fost acceptat și a intrat în stoc.',
    faci: 'Descarci dosarul lotului, cu toate documentele încărcate.',
  },
  RESPINS: {
    inseamna: 'Lotul nu poate fi acceptat. Motivul apare pe pagina lotului.',
    faci: 'Citești motivul. Dacă e nevoie, încarci un lot nou, corect.',
  },
  ANULAT: {
    inseamna: 'Ai anulat lotul. Rămâne în istoric, dar nu mai contează în stoc.',
    faci: 'Nimic.',
  },
};

const SEMAFOR: { ton: 'success' | 'warning' | 'danger' | 'neutral'; eticheta: string; text: string }[] = [
  { ton: 'success', eticheta: 'Verde', text: 'Regula e îndeplinită.' },
  {
    ton: 'warning',
    eticheta: 'Galben',
    text: 'Avertisment: administratorul se uită mai atent, dar lotul poate fi acceptat.',
  },
  { ton: 'danger', eticheta: 'Roșu', text: 'Problemă care blochează acceptarea până se corectează.' },
  {
    ton: 'neutral',
    eticheta: 'Gri',
    text: 'Regula nu se aplică acestui lot (de exemplu, borderoul PF la un lot doar de la firme).',
  },
];

const INTREBARI: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Se pierde lotul dacă închid pagina înainte să-l trimit?',
    a: 'Nu. Lotul se salvează automat ca ciornă la câteva clipe după fiecare modificare. Îl găsești în Loturi, cu statusul Ciornă, și continui de unde ai rămas.',
  },
  {
    q: 'Pot încărca documentele de pe telefon?',
    a: 'Da. Pe telefon, butonul „Fotografiază” deschide direct camera, iar „Filmează” pornește filmarea cântarului. Lista de documente devine ecranul principal și bifezi pe rând ce ai încărcat.',
  },
  {
    q: 'De ce nu pot alege un anumit cod de deșeu?',
    a: 'Codurile care nu sunt în autorizația ta de mediu apar dezactivate, cu mențiunea „Nu e în autorizația ta de mediu”. Dacă autorizația s-a schimbat, încarcă varianta nouă din Organizație.',
  },
  {
    q: 'De ce mi se cer Anexa 1, Anexa 2 și autorizația de transport?',
    a: 'Pentru că ai declarat cel puțin un cod de deșeu periculos (codurile cu asterisc, de exemplu 20 01 35*). Lista îți arată pe ce linie e codul care le cere.',
  },
  {
    q: 'Ce fac dacă tichetul de cântar arată altă greutate decât am declarat?',
    a: 'Declară greutatea din tichet. Dacă diferența dintre documente depășește toleranța, regula „Concordanța cantităților” iese roșie și lotul nu poate fi acceptat până nu se clarifică.',
  },
  {
    q: 'Decide AI-ul dacă lotul meu e acceptat?',
    a: 'Nu. AI-ul citește documentele, compară cifrele și propune un rezultat. Decizia o ia întotdeauna un administrator, iar pe lot scrie cine a decis și când.',
  },
  {
    q: 'Pot modifica un lot după ce l-am trimis?',
    a: 'Cât timp e în verificare, nu. Îl poți doar anula. Dacă administratorul cere completări, lotul se deschide din nou pentru editare.',
  },
  {
    q: 'Ce se întâmplă când îmi expiră visa sau autorizația?',
    a: 'Cu 30 de zile înainte, documentul apare în „De rezolvat” pe panou și în Organizație. Încarcă varianta nouă din timp; după expirare nu mai poți trimite loturi.',
  },
];

const GLOSAR: { termen: string; definitie: string }[] = [
  { termen: 'DEEE', definitie: 'Deșeuri de echipamente electrice și electronice.' },
  { termen: 'Lot', definitie: 'Un transport de DEEE preluat și înregistrat de tine, cu documentele lui.' },
  {
    termen: 'Linie de lot',
    definitie: 'O subcategorie și un cod de deșeu din lot, cu bucățile și kilogramele lor.',
  },
  {
    termen: 'Subcategorie',
    definitie: 'Tipul de echipament, de exemplu 4.1 Mașini de spălat rufe. Stabilește tariful.',
  },
  {
    termen: 'Cod de deșeu',
    definitie:
      'Codul din lista de deșeuri, de exemplu 20 01 36. Asteriscul (*) marchează un deșeu periculos.',
  },
  {
    termen: 'Proveniență',
    definitie: 'De la cine ai preluat deșeurile: persoane juridice, persoane fizice sau ambele.',
  },
  { termen: 'Sursă', definitie: 'O firmă sau o persoană de la care ai preluat o parte din lot.' },
  { termen: 'Tichet de cântar', definitie: 'Dovada greutății: brut, tară și net.' },
  { termen: 'Aviz de însoțire', definitie: 'Documentul care însoțește marfa la transport.' },
  {
    termen: 'SIATD',
    definitie: 'Sistemul electronic de trasabilitate a deșeurilor, în care firma are modulul DEEE activ.',
  },
  {
    termen: 'Extras de AI',
    definitie: 'Date citite automat din documentele tale. Le recunoști după iconul și fundalul violet.',
  },
  {
    termen: 'Dosarul lotului',
    definitie: 'Toate documentele încărcate pentru un lot acceptat, adunate într-un singur loc.',
  },
];

export default function Documentatie() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 8,
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 240px' },
        alignItems: 'start',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 820, minWidth: 0 }}>
        {/* Pe ecrane mici, cuprinsul stă sus, într-un card. */}
        <Card sx={{ display: { lg: 'none' }, p: 4 }}>
          <Cuprins intrari={SECTIUNI} />
        </Card>

        <Sectiune
          id="pe-scurt"
          titlu="Pe scurt"
          intro="DEEE Manager îți ține evidența loturilor de deșeuri electrice și electronice: le încarci o dată, cu documentele lor, și platforma le verifică și le adună în stoc."
        >
          <Box
            component="ol"
            aria-label="Parcursul unui lot"
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
              },
            }}
          >
            {PARCURS.map((p, i) => (
              <Box
                component="li"
                key={p.titlu}
                sx={{
                  border: `1px solid ${color.line}`,
                  borderRadius: `${radius.lg}px`,
                  bgcolor: color.surface,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="caption" className="num" sx={{ color: color.petrol, fontWeight: 600 }}>
                  Pasul {i + 1}
                </Typography>
                <Typography variant="bodyStrong" component="p">
                  {p.titlu}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.text}
                </Typography>
              </Box>
            ))}
          </Box>
          <Paragraf>
            Meniul din stânga are trei pagini: <Ui>Panou</Ui> (ce ai de făcut azi și stocul), <Ui>Loturi</Ui>{' '}
            (toate loturile tale) și <Ui>Organizație</Ui> (datele și documentele firmei). Din colțul
            dreapta-sus, de la inițialele tale, ajungi la <Ui>Cont</Ui> și ieși din platformă.
          </Paragraf>
          <Nota tip="ai" titlu="AI-ul verifică, nu decide">
            AI-ul citește documentele încărcate, extrage cifrele și le compară între ele. Nu creează documente
            și nu ia decizii. Orice rezultat e „propus de AI” și e confirmat de un administrator.
          </Nota>
        </Sectiune>

        <Sectiune
          id="activare"
          titlu="Activarea contului"
          intro="Înainte de primul lot, contul trebuie activat. O faci o singură dată, din pagina Activare cont."
        >
          <Figura
            captura="activare"
            alt="Pagina Activează-ți contul: etapele Documente, În verificare, Vizită în teren, Activ; un mesaj că un document a fost respins; secțiunea Date firmă cu CUI-ul verificat la ANAF."
            legenda="Activarea contului: etapele sus, datele firmei și documentele dedesubt."
          />
          <Subtitlu>Cele patru etape</Subtitlu>
          <Pasi
            pasi={[
              <>
                <Ui>Documente</Ui>: completezi datele firmei și încarci documentele.
              </>,
              <>
                <Ui>În verificare</Ui>: administratorul verifică dosarul. Primești răspuns în maximum 24 de
                ore.
              </>,
              <>
                <Ui>Vizită în teren</Ui>: după aprobarea documentelor, stabilim împreună o vizită la punctul
                de lucru.
              </>,
              <>
                <Ui>Activ</Ui>: după vizită contul e activ și poți încărca loturi.
              </>,
            ]}
          />
          <Subtitlu>Datele firmei</Subtitlu>
          <Paragraf>
            Scrii CUI-ul (fără „RO”), iar la ieșirea din câmp platforma cere de la ANAF denumirea și adresa
            sediului. Acestea nu se pot modifica de mână și au eticheta <Ui>din ANAF</Ui>. Completezi apoi
            adresa punctului de lucru, banca și IBAN-ul. Tot ce scrii se salvează automat.
          </Paragraf>
          <Subtitlu>Documentele firmei</Subtitlu>
          <Paragraf>
            Pentru fiecare document ai un buton de încărcare și unul de fotografiere. Se cer:
          </Paragraf>
          <Lista
            elemente={DOCUMENTE_ONBOARDING.map(
              (d) => `${d.denumire} — ${d.explicatie.charAt(0).toLowerCase()}${d.explicatie.slice(1)}`,
            )}
          />
          <Subtitlu>Autorizația de mediu</Subtitlu>
          <Paragraf>
            După ce încarci autorizația, AI-ul citește din ea numărul, emitentul, valabilitatea și codurile de
            deșeu autorizate. Verifică-le cu documentul și apasă <Ui>Confirmă datele</Ui> sau{' '}
            <Ui>Corectează</Ui>, dacă ceva nu se potrivește.
          </Paragraf>
          <Figura
            captura="activare-extras-ai"
            alt="Blocul Extras de AI al autorizației de mediu: număr 112/2025, emitentul, valabilă până la 31.05.2030, cinci coduri de deșeu, butoanele Confirmă datele și Corectează."
            legenda="Datele extrase de AI din autorizație, cu fundal violet, așteaptă confirmarea ta."
          />
          <Nota>
            Codurile confirmate aici sunt singurele pe care le vei putea declara în loturi. Butonul{' '}
            <Ui>Trimite la verificare</Ui> devine activ doar când dosarul e complet; până atunci, bara de jos
            îți spune ce mai lipsește, iar <Ui>Arată ce lipsește</Ui> marchează câmpurile și documentele
            respective.
          </Nota>
          <Paragraf>
            Dacă administratorul respinge un document, îl vezi marcat cu roșu, cu motivul scris dedesubt.
            Încarci varianta corectă și trimiți dosarul din nou.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="panou"
          titlu="Panoul"
          intro="Prima pagină după autentificare: ce ai de făcut azi și cât ai în stoc."
        >
          <Figura
            captura="panou"
            alt="Panoul colectorului: De rezolvat cu două elemente, stocul pe cele șase categorii, graficul intrărilor lunare și loturile pe status."
            legenda="Panoul: de sus în jos, ce ai de rezolvat, stocul pe categorii, intrările lunare și statusul loturilor."
          />
          <Subtitlu>De rezolvat</Subtitlu>
          <Paragraf>
            Aici apar, cu un buton de acțiune fiecare, loturile la care administratorul a cerut completări și
            documentele firmei care expiră în mai puțin de 30 de zile sau au fost respinse. Când lista e
            goală, nu ai nimic urgent.
          </Paragraf>
          <Figura
            captura="panou-de-rezolvat"
            alt="Secțiunea De rezolvat: LOT-2026-0412 necesită completări, cu butonul Completează lotul; visa anuală expiră în 18 zile, cu butonul Încarcă visa."
            legenda="Fiecare element are un singur buton, care te duce exact unde ai de lucru."
          />
          <Subtitlu>Stoc pe categorii</Subtitlu>
          <Paragraf>
            Câte kilograme și bucăți ai acceptate în fiecare din cele șase categorii. Un clic pe o categorie
            deschide loturile ei.
          </Paragraf>
          <Figura
            captura="panou-stoc"
            alt="Șase carduri de categorie, fiecare cu numărul de loturi, kilogramele, bucățile și procentul din stoc."
            legenda="Stocul pe categorii: doar loturile acceptate intră aici."
          />
          <Paragraf>
            Mai jos ai graficul kilogramelor acceptate în ultimele 6 luni, loturile din ultimele 30 de zile pe
            status și ultimele loturi încărcate. Butonul <Ui>Lot nou</Ui> din dreapta-sus pornește un lot nou.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="lot-nou"
          titlu="Încarci un lot nou"
          intro="Un lot se încarcă în trei pași: Informații, Documente și Confirmare. Pașii parcurși au bifă și te poți întoarce la ei oricând."
        >
          <ButtonLink href="/loturi/nou" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
            Deschide Lot nou
          </ButtonLink>
          <Subtitlu id="lot-nou-pas-1">Pasul 1 · Informații</Subtitlu>
          <Figura
            captura="lot-nou-pas1"
            alt="Pasul 1 al lotului nou: Informații (data preluării, punct de lucru, destinație), Linii de lot (subcategorie, cod deșeu, bucăți, kg, stare) și Proveniența lotului."
            legenda="Pasul 1: informațiile generale, liniile lotului și proveniența."
          />
          <Pasi
            pasi={[
              <>
                La <Ui>Informații</Ui> alegi data preluării, punctul de lucru și destinația declarată (stocare
                temporară, predare la tratator sau propunere de vânzare către OTR).
              </>,
              <>
                La <Ui>Linii de lot</Ui> adaugi câte o linie pentru fiecare subcategorie și cod de deșeu.
                Caută subcategoria după nume sau cod (de exemplu „frigider” sau „4.2”), apoi alege codul,
                bucățile, kilogramele și starea (complet, incomplet, amestec).
              </>,
              <>
                La <Ui>Proveniența lotului</Ui> spui de la cine ai preluat deșeurile și adaugi fiecare sursă.
                La firme, CUI-ul se verifică automat la ANAF.
              </>,
            ]}
          />
          <Figura
            captura="lot-nou-provenienta"
            alt="Proveniența lotului: persoane juridice, o sursă de tip Generator, Hotel Parc Central SRL, CUI verificat la ANAF, adresa de ridicare, contractul, avizul și kilogramele acoperite."
            legenda="Fiecare sursă acoperă o parte din kilograme; jos vezi dacă sursele acoperă tot lotul."
          />
          <Nota>
            Sursele trebuie să acopere împreună toate kilogramele declarate. Mesajul verde de sub surse îți
            confirmă când se potrivesc. La persoane fizice, CNP-ul se afișează mascat după ce ieși din câmp.
          </Nota>

          <Subtitlu id="lot-nou-pas-2">Pasul 2 · Documente</Subtitlu>
          <Paragraf>
            Lista de documente se generează singură din proveniență și din codurile declarate. În dreapta, la{' '}
            <Ui>Documente cerute</Ui>, vezi ce ai încărcat și ce lipsește; un clic pe un rând te duce la
            documentul respectiv.
          </Paragraf>
          <Figura
            captura="lot-nou-pas2"
            alt="Pasul 2: foto și video ale lotului cu locurile Față, Lateral, Spate și Cântar plin/gol; carduri de încărcare pentru fiecare document; lista Documente cerute în dreapta."
            legenda="Pasul 2: fotografiile, filmarea cântarului și documentele, cu lista celor cerute în dreapta."
          />
          <Lista
            elemente={[
              <>
                <Ui>Fotografii</Ui>: minimum trei, față, lateral și spate, ca să se vadă ce conține lotul.
              </>,
              <>
                <Ui>Filmarea cântarului</Ui>: vehiculul cântărit plin și gol. Se acceptă MP4 și MOV, până la
                200 MB.
              </>,
              <>
                <Ui>Documente</Ui>: PDF, fotografie sau Excel. Pentru fiecare ai <Ui>Încarcă fișier</Ui> și{' '}
                <Ui>Fotografiază</Ui>. Fotografiile și filmarea le poți și trage direct în pagină, în zona{' '}
                <Ui>Trage fișiere</Ui>.
              </>,
            ]}
          />
          <Nota tip="ai">
            La încărcare, AI-ul citește documentul și îți arată pe scurt ce a extras (de exemplu „Net 1.310
            kg”), marcat <Ui>Extras de AI</Ui>. Diferențele dintre documente nu le vezi aici; apar în
            verificare.
          </Nota>

          <Subtitlu id="lot-nou-telefon">Pe telefon</Subtitlu>
          <Box
            sx={{
              display: 'grid',
              gap: 5,
              gridTemplateColumns: { xs: '1fr', sm: '220px minmax(0, 1fr)' },
              alignItems: 'start',
            }}
          >
            <Figura
              captura="lot-nou-mobil"
              alt="Pasul 2 pe telefon: lista Documente cerute, fiecare cu un buton de cameră; jos, butonul Fotografiază următorul document."
              legenda="Pe telefon, lista e ecranul principal."
              latimeMaxima={220}
            />
            <Paragraf>
              Pe telefon lucrezi direct din curte: fiecare document are un buton de cameră care pornește
              fotografierea, iar butonul de jos te duce la următorul document lipsă. Filmarea cântarului
              pornește camera video.
            </Paragraf>
          </Box>

          <Subtitlu id="lot-nou-pas-3">Pasul 3 · Confirmare</Subtitlu>
          <Paragraf>
            Vezi tot lotul pe o singură pagină: informațiile, liniile, sursele și fișierele. Dacă ceva nu e
            corect, te întorci la pasul respectiv din bara de sus. Când totul e în regulă, apeși{' '}
            <Ui>Trimite la verificare</Ui>.
          </Paragraf>

          <Subtitlu id="ciorna">Ciorna se salvează singură</Subtitlu>
          <Paragraf>
            La prima modificare lotul primește un număr (de exemplu LOT-2026-0419) și se salvează automat ca
            ciornă. Jos, în stânga, vezi când s-a salvat ultima dată. Poți închide pagina și continua mai
            târziu din <Ui>Loturi</Ui>.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="documente-cerute"
          titlu="Ce documente se cer"
          intro="Lista din pasul 2 se construiește după aceste reguli. Nu trebuie să le ții minte: platforma îți arată mereu doar ce se aplică lotului tău."
        >
          <Card>
            <Box
              sx={{ overflowX: 'auto' }}
              tabIndex={0}
              role="region"
              aria-label="Documentele cerute, pe situații"
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '34%' }}>Când se cere</TableCell>
                    <TableCell>Document</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {REGULI_DOCUMENTE.map((r) =>
                    r.documente.map((tip, i) => (
                      <TableRow key={`${r.grup}-${tip}`}>
                        {i === 0 ? (
                          <TableCell
                            rowSpan={r.documente.length}
                            sx={{ verticalAlign: 'top', fontWeight: 500 }}
                          >
                            {ETICHETA_GRUP[r.grup]}
                          </TableCell>
                        ) : null}
                        <TableCell>
                          <Typography component="span" sx={{ display: 'block' }}>
                            {DOCUMENT_INFO[tip].denumire}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {DOCUMENT_INFO[tip].explicatie}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            </Box>
          </Card>
          <Figura
            captura="lot-nou-documente-cerute"
            alt="Panoul Documente cerute: 1 din 11, grupat pe Pentru orice lot, Pentru orice lot de la persoane juridice și Cod periculos declarat 20 01 35*."
            legenda="Documentele cerute pentru un lot de la firme, cu un cod periculos declarat."
          />
          <Paragraf>
            Borderoul de achiziție se cere câte unul pentru fiecare persoană fizică adăugată ca sursă.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="verificare"
          titlu="Cum se verifică lotul"
          intro="După trimitere, AI-ul citește documentele și trece lotul prin 13 reguli de verificare (R01–R13). Rezultatul îl vezi în tab-ul Verificare al lotului."
        >
          <Figura
            captura="lot-verificare"
            alt="Tab-ul Verificare al lotului LOT-2026-0418: rezultatul propus de AI este Necesită completări; lista regulilor R01–R06, fiecare cu un punct colorat și o explicație scurtă."
            legenda="Tab-ul Verificare: rezultatul propus de AI și fiecare regulă cu culoarea ei."
          />
          <Paragraf>Fiecare regulă are o culoare:</Paragraf>
          <Box
            component="ul"
            sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {SEMAFOR.map((s) => (
              <Box component="li" key={s.eticheta} sx={{ display: 'flex', gap: 3, alignItems: 'baseline' }}>
                <StatusDot tone={s.ton} />
                <Typography sx={{ fontSize: 16, lineHeight: '26px' }}>
                  <Ui>{s.eticheta}</Ui> — {s.text}
                </Typography>
              </Box>
            ))}
          </Box>
          <Paragraf>
            Regulile verifică, printre altele: că ai toate documentele, că greutatea e aceeași în tichet, aviz
            și declarație, că fiecare cod de deșeu e potrivit subcategoriei și e în autorizația ta, că firmele
            și CUI-urile sunt corecte, că datele documentelor sunt în ordine și că fotografiile arată ce ai
            declarat.
          </Paragraf>
          <Nota tip="info" titlu="Cine decide">
            Rezultatul AI-ului e doar o propunere. Administratorul vede aceleași reguli, deschide fiecare
            cifră la sursă, în documentul tău, și decide: acceptă, cere completări sau respinge. Pe lot rămâne
            scris cine a decis și când.
          </Nota>
        </Sectiune>

        <Sectiune
          id="statusuri"
          titlu="Statusurile unui lot"
          intro="Statusul apare lângă numărul lotului, peste tot în platformă."
        >
          <Card>
            <Box sx={{ overflowX: 'auto' }} tabIndex={0} role="region" aria-label="Statusurile unui lot">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 200 }}>Status</TableCell>
                    <TableCell>Ce înseamnă</TableCell>
                    <TableCell>Ce faci</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {LOT_STATUSES.map((s) => (
                    <TableRow key={s}>
                      <TableCell>
                        <StatusBadge status={s} />
                      </TableCell>
                      <TableCell>{DESPRE_STATUS[s].inseamna}</TableCell>
                      <TableCell>{DESPRE_STATUS[s].faci}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
          <Paragraf>
            Poți anula un lot cât timp e ciornă, în verificare sau cu completări cerute. Lotul anulat rămâne
            în istoric.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="completari"
          titlu="Când ți se cer completări"
          intro="Dacă administratorul are nevoie de ceva în plus, lotul trece în Necesită completări și apare în De rezolvat pe panou."
        >
          <Figura
            captura="lot-completari"
            alt="Lotul LOT-2026-0412 cu statusul Necesită completări: mesajul administratorului despre tichetul de cântar neclar și documentul de înlocuit, cu butoanele Fotografiază și Încarcă fișier."
            legenda="Mesajul administratorului și documentele de înlocuit apar sus, pe pagina lotului."
          />
          <Pasi
            pasi={[
              <>
                Deschide lotul din panou (butonul <Ui>Completează lotul</Ui>) sau din Loturi.
              </>,
              <>Citește mesajul administratorului din chenarul de sus.</>,
              <>
                Înlocuiește fiecare document marcat, cu <Ui>Fotografiază</Ui> sau <Ui>Încarcă fișier</Ui>.
                Dacă trebuie corectate datele lotului, folosește <Ui>Editează</Ui>.
              </>,
              <>
                Apasă <Ui>Retrimite la verificare</Ui>. Butonul devine activ după ce ai înlocuit documentele
                cerute.
              </>,
            ]}
          />
        </Sectiune>

        <Sectiune
          id="loturi"
          titlu="Loturile tale și stocul"
          intro="Pagina Loturi îți arată toate loturile, cu filtre și două moduri de afișare."
        >
          <Figura
            captura="loturi-lista"
            alt="Pagina Loturi: căutarea, filtrele, butoanele Listă și Pe categorii și tabelul loturilor cu număr, conținut, kilograme, bucăți, data preluării, status și ultima actualizare."
            legenda="Lista de loturi: un clic pe rând deschide lotul."
          />
          <Lista
            elemente={[
              <>
                <Ui>Căutare</Ui>: după numărul lotului, subcategorie sau cod de deșeu.
              </>,
              <>
                <Ui>Filtre</Ui>: categorie, subcategorie, cod de deșeu, status, perioada preluării și punctul
                de lucru (pe telefon sunt sub butonul <Ui>Filtre</Ui>). Filtrele active apar ca etichete și le
                scoți cu un clic.
              </>,
              <>
                <Ui>Pe categorii</Ui>: arborele categorie → subcategorie → cod, cu totalurile de kilograme și
                bucăți.
              </>,
            ]}
          />
          <Figura
            captura="loturi-categorii"
            alt="Vederea Pe categorii: arbore cu categoriile, subcategoriile și codurile de deșeu, fiecare cu kilogramele și bucățile totale."
            legenda="Vederea pe categorii adună loturile pe categorie, subcategorie și cod."
          />
          <Subtitlu>Pagina unui lot</Subtitlu>
          <Paragraf>
            Are patru tab-uri: <Ui>Rezumat</Ui> (liniile și sursele), <Ui>Documente și media</Ui> (tot ce ai
            încărcat), <Ui>Verificare</Ui> (regulile și decizia) și <Ui>Istoric</Ui> (cine a făcut ce și
            când). La un lot acceptat ai și butonul <Ui>Descarcă dosarul</Ui>.
          </Paragraf>
          <Nota>
            Apasă tasta{' '}
            <Box
              component="kbd"
              sx={{
                px: 1.5,
                py: 0.25,
                border: `1px solid ${color.lineStrong}`,
                borderRadius: '4px',
                fontSize: 13,
              }}
            >
              /
            </Box>{' '}
            oriunde în platformă ca să ajungi direct în căutarea de sus.
          </Nota>
        </Sectiune>

        <Sectiune
          id="organizatie"
          titlu="Organizația și documentele firmei"
          intro="Pagina Organizație adună datele firmei, autorizația de mediu, documentele și utilizatorii."
        >
          <Figura
            captura="organizatie-documente"
            alt="Documentele firmei: fiecare cu statusul Aprobat; visa anuală are eticheta Expiră în 18 zile, un mesaj de avertizare și butonul Încarcă varianta nouă."
            legenda="Documentele firmei, cu termenul de valabilitate; cel care expiră curând are butonul principal."
          />
          <Paragraf>
            Când un document expiră în mai puțin de 30 de zile, primește eticheta <Ui>Expiră în … zile</Ui>.
            Apasă <Ui>Încarcă varianta nouă</Ui>: documentul trece în <Ui>De verificat</Ui>, iar până la
            aprobare rămâne valabilă varianta veche.
          </Paragraf>
          <Paragraf>
            Datele firmei și lista de utilizatori le modifică administratorul platformei. Dacă s-a schimbat
            ceva, încarcă documentul nou.
          </Paragraf>
        </Sectiune>

        <Sectiune
          id="cont"
          titlu="Contul tău"
          intro="Din colțul dreapta-sus, de la inițialele tale, deschizi Cont."
        >
          <Figura
            captura="cont"
            alt="Pagina Cont: Date personale cu numele, emailul și organizația; Schimbă parola cu parola actuală, parola nouă și confirmarea."
            legenda="Contul: numele tău și schimbarea parolei."
          />
          <Paragraf>
            Poți schimba numele afișat și parola. Parola nouă are cel puțin 10 caractere, cu litere mari și
            mici, o cifră și un simbol; indicatorul de sub câmp îți arată cât de puternică e. Emailul e și
            numele de utilizator și îl schimbă administratorul platformei.
          </Paragraf>
        </Sectiune>

        <Sectiune id="intrebari" titlu="Întrebări frecvente">
          <Box>
            {INTREBARI.map((i, k) => (
              <Accordion
                key={i.q}
                disableGutters
                elevation={0}
                sx={{
                  border: `1px solid ${color.line}`,
                  borderTop: k ? 'none' : `1px solid ${color.line}`,
                  '&::before': { display: 'none' },
                  '&:first-of-type': {
                    borderTopLeftRadius: `${radius.lg}px`,
                    borderTopRightRadius: `${radius.lg}px`,
                  },
                  '&:last-of-type': {
                    borderBottomLeftRadius: `${radius.lg}px`,
                    borderBottomRightRadius: `${radius.lg}px`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<IconChevronDown size={18} stroke={1.5} />}
                  sx={{ px: 5, minHeight: 56 }}
                >
                  <Typography variant="bodyStrong" component="h3">
                    {i.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 5, pb: 5, pt: 0 }}>
                  <Typography sx={{ fontSize: 16, lineHeight: '26px' }}>{i.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Sectiune>

        <Sectiune id="glosar" titlu="Glosar">
          <Card>
            <Box component="dl" sx={{ m: 0 }}>
              {GLOSAR.map((g, i) => (
                <Box
                  key={g.termen}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '180px minmax(0, 1fr)' },
                    gap: { xs: 0.5, sm: 4 },
                    px: 6,
                    py: 3,
                    borderTop: i ? `1px solid ${color.line}` : 'none',
                  }}
                >
                  <Typography component="dt" variant="bodyStrong">
                    {g.termen}
                  </Typography>
                  <Typography component="dd" sx={{ m: 0 }}>
                    {g.definitie}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Sectiune>
      </Box>

      <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 88 }}>
        <Cuprins intrari={SECTIUNI} />
      </Box>
    </Box>
  );
}

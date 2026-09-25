/**
 * Capturile de ecran din /documentatie. Se regenerează după schimbări de interfață:
 *   npm run build && npm run start -- -p 3200   (într-un terminal)
 *   node scripts/capturi-documentatie.mjs        (în altul)
 * Folosește datele demo, deci pornește serverul proaspăt (datele mock trăiesc în memorie).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:3200';
const OUT = new URL('../public/documentatie/', import.meta.url).pathname;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

// Câmpurile de dată iau formatul din limba sistemului, nu din contextul paginii.
const browser = await chromium.launch({
  executablePath,
  args: ['--lang=ro-RO'],
  env: { ...process.env, LANG: 'ro_RO.UTF-8', LANGUAGE: 'ro' },
});

async function sesiune(persona, { latime = 1440, inaltime = 900, mobil = false } = {}) {
  const context = await browser.newContext({
    viewport: { width: latime, height: inaltime },
    deviceScaleFactor: mobil ? 2 : 1.5,
    isMobile: mobil,
    hasTouch: mobil,
    reducedMotion: 'reduce',
    locale: 'ro-RO',
    timezoneId: 'Europe/Bucharest',
  });
  await context.addCookies([{ name: 'deee_sesiune_test', value: persona, url: BASE }]);
  const page = await context.newPage();
  return { context, page };
}

async function deschide(page, ruta) {
  await page.goto(BASE + ruta);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.fonts.ready.then(() => true));
  await page.waitForTimeout(400);
}

const sectiune = (page, titlu) =>
  page.locator('section, aside').filter({ has: page.getByRole('heading', { name: titlu, exact: true }) }).first();

async function captura(locator, nume) {
  await locator.scrollIntoViewIfNeeded();
  await locator.screenshot({ path: `${OUT}${nume}.png`, animations: 'disabled' });
  console.log('✓', nume);
}

async function ecran(page, nume, clip) {
  await page.screenshot({ path: `${OUT}${nume}.png`, animations: 'disabled', clip });
  console.log('✓', nume);
}

// ── Colectorul activ ────────────────────────────────────────────────────────────
{
  const { context, page } = await sesiune('colector-activ');

  await deschide(page, '/panou');
  await ecran(page, 'panou', { x: 0, y: 0, width: 1440, height: 900 });
  await captura(sectiune(page, 'De rezolvat'), 'panou-de-rezolvat');
  await captura(page.locator('section').filter({ hasText: 'Stoc pe categorii' }).first(), 'panou-stoc');

  await deschide(page, '/loturi');
  await ecran(page, 'loturi-lista', { x: 248, y: 64, width: 1192, height: 760 });
  await deschide(page, '/loturi?vedere=categorii');
  await ecran(page, 'loturi-categorii', { x: 248, y: 64, width: 1192, height: 700 });

  await deschide(page, '/loturi/nou');
  await ecran(page, 'lot-nou-pas1', { x: 248, y: 64, width: 1192, height: 836 });

  // Ciorna demo are o sursă completată: arată cum arată proveniența plină.
  await deschide(page, '/loturi/LOT-2026-0416/editare');
  await captura(sectiune(page, 'Proveniența lotului'), 'lot-nou-provenienta');
  await page.getByRole('button', { name: 'Continuă la documente' }).click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await ecran(page, 'lot-nou-pas2', { x: 248, y: 64, width: 1192, height: 836 });
  await captura(page.getByRole('complementary', { name: 'Documente cerute' }), 'lot-nou-documente-cerute');

  await deschide(page, '/loturi/LOT-2026-0412');
  await ecran(page, 'lot-completari', { x: 248, y: 64, width: 1192, height: 560 });
  await deschide(page, '/loturi/LOT-2026-0418?tab=verificare');
  await ecran(page, 'lot-verificare', { x: 248, y: 64, width: 1192, height: 760 });

  await deschide(page, '/organizatie');
  await captura(sectiune(page, 'Documentele firmei'), 'organizatie-documente');

  await deschide(page, '/cont');
  await ecran(page, 'cont', { x: 248, y: 64, width: 1192, height: 640 });
  await context.close();
}

// ── Pe telefon ──────────────────────────────────────────────────────────────────
{
  const { context, page } = await sesiune('colector-activ', { latime: 390, inaltime: 844, mobil: true });
  await deschide(page, '/loturi/LOT-2026-0416/editare');
  await page.getByRole('button', { name: 'Continuă la documente' }).click();
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await ecran(page, 'lot-nou-mobil', { x: 0, y: 0, width: 390, height: 844 });
  await context.close();
}

// ── Colectorul care își activează contul ────────────────────────────────────────
{
  const { context, page } = await sesiune('colector-neactivat');
  await deschide(page, '/onboarding');
  await ecran(page, 'activare', { x: 248, y: 64, width: 1192, height: 836 });
  await captura(page.getByRole('group', { name: 'Extras de AI' }), 'activare-extras-ai');
  await context.close();
}

await browser.close();

// Dimensiunile fiecărei capturi (din antetul PNG), ca pagina să rezerve spațiul și să nu sară la încărcare.
const dimensiuni = {};
for (const f of readdirSync(OUT).filter((x) => x.endsWith('.png')).sort()) {
  const b = readFileSync(OUT + f);
  dimensiuni[f.replace('.png', '')] = { latime: b.readUInt32BE(16), inaltime: b.readUInt32BE(20) };
}
writeFileSync(
  new URL('../src/features/documentatie/capturi.json', import.meta.url),
  JSON.stringify(dimensiuni, null, 2) + '\n',
);
console.log('✓ capturi.json');

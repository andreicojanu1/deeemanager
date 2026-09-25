import { expect, test } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

test('colectorul deschide documentația din meniu, jos, deasupra organizației', async ({
  page,
  baseURL,
  isMobile,
}) => {
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'colector-activ', url: baseURL! }]);
  await page.goto('/panou');
  if (isMobile) await page.getByRole('button', { name: 'Deschide meniul' }).click();
  const meniu = page.getByRole('navigation', { name: 'Meniu principal' }).filter({ visible: true });
  const link = meniu.getByRole('link', { name: 'Documentație' });
  const organizatie = meniu.getByText('Colector Demo SRL');
  const [l, o] = await Promise.all([link.boundingBox(), organizatie.boundingBox()]);
  expect(l!.y).toBeLessThan(o!.y);
  expect(o!.y - (l!.y + l!.height)).toBeLessThan(40);
  await link.click();
  await expect(page).toHaveURL(/\/documentatie$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Documentație' })).toBeVisible();
  // Pe telefon meniul se închide după navigare; îl redeschidem ca să vedem elementul activ.
  if (isMobile) await page.getByRole('button', { name: 'Deschide meniul' }).click();
  await expect(link).toHaveAttribute('aria-current', 'page');
});

test('cuprinsul duce la secțiuni, iar capturile se încarcă și se pot mări', async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'colector-activ', url: baseURL! }]);
  await page.goto('/documentatie');
  const cuprins = page.getByRole('navigation', { name: 'Cuprins' }).filter({ visible: true });
  await cuprins.getByRole('link', { name: 'Statusurile unui lot' }).click();
  await expect(page).toHaveURL(/#statusuri$/);
  await expect(page.getByRole('heading', { level: 2, name: 'Statusurile unui lot' })).toBeInViewport();
  for (const s of ['Ciornă', 'În verificare', 'Necesită completări', 'Acceptat', 'Respins', 'Anulat']) {
    await expect(
      page.getByRole('region', { name: 'Statusurile unui lot' }).getByText(s, { exact: true }),
    ).toBeVisible();
  }

  // Toate capturile există și au conținut.
  const imagini = page.locator('figure img');
  expect(await imagini.count()).toBeGreaterThanOrEqual(15);
  for (const img of await imagini.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true);
  }

  await page.getByRole('button', { name: /Mărește captura: Panoul/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'Decide AI-ul dacă lotul meu e acceptat?' }).click();
  await expect(page.getByText('Decizia o ia întotdeauna un administrator', { exact: false })).toBeVisible();
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
});

test('colectorul care își activează contul are și el documentația', async ({ page, baseURL }) => {
  await page
    .context()
    .addCookies([{ name: 'deee_sesiune_test', value: 'colector-neactivat', url: baseURL! }]);
  await page.goto('/documentatie');
  await expect(page.getByRole('heading', { level: 1, name: 'Documentație' })).toBeVisible();
});

test('adminul nu are documentația de colector', async ({ page, baseURL }) => {
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'admin', url: baseURL! }]);
  await page.goto('/admin');
  await expect(page.getByRole('link', { name: 'Documentație' })).toHaveCount(0);
  await page.goto('/documentatie');
  await expect(page).toHaveURL(/\/acces-interzis$/);
});

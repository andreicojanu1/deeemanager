import { expect, test } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

test.beforeEach(async ({ page }) => {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Colector cu cont activ/ }).click();
  await page.waitForURL(/\/panou$/);
});

test('lista de loturi: filtre în URL, chip-uri, paginare', async ({ page }) => {
  await page.goto('/loturi');
  await expect(page.getByText('46 loturi')).toBeVisible();
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);

  await page.goto('/loturi?categorie=1&status=ACCEPTAT');
  await expect(page.getByText('6 loturi')).toBeVisible();
  const chip = page.getByRole('button', { name: /Cat\. 1 Transfer termic/ });
  await expect(chip).toBeVisible();
  await page.getByRole('button', { name: 'Șterge filtrele' }).click();
  await expect(page).toHaveURL(/\/loturi$/);
  await expect(page.getByText('46 loturi')).toBeVisible();

  await page.getByRole('link', { name: 'Pagina următoare' }).click();
  await expect(page).toHaveURL(/pagina=2/);
  await expect(page.getByText('Pagina 2 din 2')).toBeVisible();
});

test('căutarea filtrează lista', async ({ page }) => {
  await page.goto('/loturi');
  await page.getByRole('textbox', { name: 'Caută în loturi' }).fill('LOT-2026-0412');
  await expect(page).toHaveURL(/q=LOT-2026-0412/);
  await expect(page.getByText('1 lot', { exact: true })).toBeVisible();
});

test('vederea pe categorii: arbore, iar un cod filtrează lista', async ({ page }) => {
  await page.goto('/loturi?vedere=categorii&status=ACCEPTAT');
  await expect(page.getByRole('tree', { name: 'Loturi pe categorii' })).toBeVisible();
  await faraProblemeA11y(page);
  await page
    .getByRole('treeitem', { name: /1\.1 Frigidere/ })
    .locator('button')
    .first()
    .click();
  await page
    .getByRole('button', { name: /20 01 23\*: arată loturile/ })
    .first()
    .click();
  await expect(page).toHaveURL(/subcategorie=1\.1/);
  await expect(page).toHaveURL(/cod=20\+01\+23/);
});

test('detaliul unui lot cu completări: banner, tab-uri, fără probleme a11y', async ({ page }) => {
  await page.goto('/loturi/LOT-2026-0412');
  await expect(page.getByRole('heading', { name: 'Administratorul a cerut completări' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Încarcă Tichet de cântar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retrimite la verificare' })).toBeDisabled();
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);

  for (const tab of ['Documente și media', 'Verificare', 'Istoric']) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
    await faraProblemeA11y(page);
  }
  await expect(page).toHaveURL(/tab=istoric/);
});

test('anularea cere un motiv', async ({ page }) => {
  await page.goto('/loturi/LOT-2026-0418');
  await page.getByRole('button', { name: 'Anulează lotul' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Motivul anulării' }).fill('nu');
  await dialog.getByRole('button', { name: 'Anulează lotul' }).click();
  await expect(dialog.getByText(/cel puțin 5 caractere/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Renunță' }).click();
  await expect(dialog).toBeHidden();
});

test('lotul altui colector arată 404', async ({ page }) => {
  await page.goto('/loturi/LOT-2026-0417');
  await expect(page.getByRole('heading', { name: 'Pagina nu există' })).toBeVisible();
});

test('paginile de lot încap pe ecran, fără scroll orizontal', async ({ page }) => {
  for (const url of [
    '/loturi',
    '/loturi?vedere=categorii',
    '/loturi/LOT-2026-0412',
    '/loturi/LOT-2026-0418',
    '/loturi/LOT-2026-0416',
  ]) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await faraScrollOrizontal(page);
  }
});

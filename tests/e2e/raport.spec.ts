import { expect, test, type Page } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

async function deschide(page: Page, id: string) {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Administrator platformă/ }).click();
  await page.waitForURL(/\/admin$/);
  await page.goto(`/admin/verificari/${id}`);
  await page.waitForSelector('body[data-raport-gata="true"]');
}

test('raportul deschide regula roșie, cu valorile față în față și zona sursă evidențiată', async ({
  page,
}) => {
  await deschide(page, 'LOT-2026-0418');
  await expect(page.getByRole('heading', { level: 1, name: 'LOT-2026-0418' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^R02 Concordanța cantităților/ })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.getByText('Diferență 70 kg (5,6%) — peste toleranța de ±1%.')).toBeVisible();
  await expect(page.getByText('Blocant')).toBeVisible();
  await expect(page.locator('[data-zona-sursa]')).toBeVisible();
  await expect(
    page.getByText(/Zona evidențiată este sursa valorii\s*1\.310 kg · încredere extracție 98%/),
  ).toBeVisible();
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);
});

test('săgețile schimbă regula, iar vizualizatorul sare la documentul ei', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Scurtăturile sunt pentru tastatură.');
  await deschide(page, 'LOT-2026-0418');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: /^R03 / })).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('tab', { name: 'Anexa 3' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(/Zona evidențiată este sursa valorii\s*20 01 35\*/)).toBeVisible();

  // Click pe o valoare din alt document mută vizualizatorul acolo.
  await page.getByRole('button', { name: /^R02 / }).click();
  await page.getByRole('button', { name: /^Aviz EWC 0457: 1\.240 kg/ }).click();
  await expect(page.getByRole('tab', { name: 'Aviz de însoțire' })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('button', { name: 'Mărește' }).click();
  await expect(page.getByText('120%')).toBeVisible();
});

test('C și R cer un motiv pentru colector', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Scurtăturile sunt pentru tastatură.');
  await deschide(page, 'LOT-2026-0413');
  await page.getByRole('textbox', { name: /Motiv trimis colectorului/ }).fill('');
  await page.locator('body').click({ position: { x: 5, y: 5 } });
  await page.keyboard.press('r');
  await expect(page.getByText(/cel puțin 10 caractere/)).toBeVisible();
  await expect(page.getByRole('textbox', { name: /Motiv trimis colectorului/ })).toBeFocused();
});

test('A pe un lot fără reguli roșii îl acceptă și trece la următorul lot din coadă', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Un singur lot de acceptat în datele demo.');
  await deschide(page, 'LOT-2026-0403');
  await page.keyboard.press('a');
  await expect(page).not.toHaveURL(/LOT-2026-0403$/);
  await expect(page).toHaveURL(/\/admin\/verificari(\/LOT-2026-\d{4})?$/);
  await expect(page.getByText(/LOT-2026-0403: acceptat\./)).toBeVisible();
});

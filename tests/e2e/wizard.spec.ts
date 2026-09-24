import { expect, test, type Page } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

test.beforeEach(async ({ page }) => {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Colector cu cont activ/ }).click();
  await page.waitForURL(/\/panou$/);
});

const fisier = (nume: string, mimeType: string) => ({ name: nume, mimeType, buffer: Buffer.from('demo') });

async function incarca(page: Page, buton: string | RegExp, f: ReturnType<typeof fisier>) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: buton }).click(),
  ]);
  await chooser.setFiles(f);
}

test('lot nou, cap-coadă: pasul 1 validat, autosalvare, documente, trimitere', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Fluxul complet pe desktop; mobilul are testul lui.');
  test.slow();
  await page.goto('/loturi/nou');
  await expect(page.getByRole('heading', { level: 1, name: 'Lot nou' })).toBeVisible();
  await faraProblemeA11y(page);

  // Butonul principal e dezactivat și spune ce lipsește.
  await expect(page.getByRole('button', { name: 'Continuă la documente' })).toBeDisabled();
  await page.getByRole('button', { name: /Mai ai \d+ câmpuri de completat/ }).click();
  await expect(page.getByText('Alege destinația declarată.')).toBeVisible();

  await page.getByRole('combobox', { name: 'Destinație declarată' }).click();
  await page.getByRole('option', { name: 'Stocare temporară' }).click();

  // Autosalvarea dă lotului un ID și schimbă adresa în cea de editare.
  await expect(page).toHaveURL(/\/loturi\/LOT-2026-\d{4}\/editare$/, { timeout: 10_000 });
  await expect(page.getByText(/Ciornă salvată automat/)).toBeVisible();

  await page.getByRole('combobox', { name: 'Subcategorie' }).fill('4.2');
  await page.getByRole('option', { name: /4\.2 Mașini de gătit/ }).click();
  await page.getByRole('combobox', { name: 'Cod deșeu' }).click();
  await expect(page.getByRole('option', { name: /16 02 13\*/ })).toBeVisible();
  await page.getByRole('option', { name: /^20 01 36/ }).click();
  await page.getByRole('textbox', { name: 'Bucăți' }).fill('18');
  await page.getByRole('textbox', { name: 'Kg', exact: true }).fill('930');

  await page.getByRole('combobox', { name: 'Proveniență' }).click();
  await page.getByRole('option', { name: 'Persoane juridice' }).click();
  const cui = page.getByRole('textbox', { name: 'CUI' });
  await cui.fill('RO 18244571');
  await cui.blur();
  await expect(page.getByRole('textbox', { name: 'Denumire' })).toHaveValue('Hotel Parc Central SRL', {
    timeout: 5000,
  });
  await page.getByRole('textbox', { name: 'Document de proveniență' }).fill('Aviz EWC 0457');
  await page.getByRole('combobox', { name: 'Linii acoperite' }).click();
  await page.getByRole('option', { name: /Linia 1/ }).click();
  await page.keyboard.press('Escape');
  await page.getByRole('textbox', { name: 'Kg de la această sursă' }).fill('930');
  await expect(page.getByText('Sursele acoperă 930 kg din 930 kg declarate')).toBeVisible();

  await page.getByRole('button', { name: 'Continuă la documente' }).click();
  await expect(page.getByRole('heading', { name: 'Documente cerute' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuă la confirmare' })).toBeDisabled();
  await faraProblemeA11y(page);

  for (const slot of ['Față', 'Lateral', 'Spate'])
    await incarca(page, `${slot}: fotografiază`, fisier(`${slot}.jpg`, 'image/jpeg'));
  await incarca(page, 'Cântar plin / gol: filmează', fisier('cantar.mp4', 'video/mp4'));
  for (const doc of [
    'Tichet de cântar',
    'Aviz de însoțire',
    'Anexa 3',
    'Centralizator',
    'Proces-verbal de recepție',
  ]) {
    await incarca(page, `Încarcă fișier: ${doc}`, fisier(`${doc}.pdf`, 'application/pdf'));
  }
  await expect(page.getByText('Verificat de AI')).toBeVisible();
  await page.getByRole('button', { name: 'Continuă la confirmare' }).click();

  await expect(page.getByRole('heading', { name: 'Linii de lot' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Trimite la verificare' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /Declar pe propria răspundere/ }).check();
  await faraProblemeA11y(page);
  await page.getByRole('button', { name: 'Trimite la verificare' }).click();

  await expect(page).toHaveURL(/\/loturi\/LOT-2026-\d{4}$/, { timeout: 10_000 });
  await expect(page.getByText('În verificare').first()).toBeVisible();
  await expect(page.getByText('Lotul a fost trimis la verificare.')).toBeVisible();
});

test('cod neautorizat apare dezactivat', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Selecția e aceeași pe mobil.');
  await page.goto('/loturi/nou');
  await page.getByRole('combobox', { name: 'Subcategorie' }).fill('3.2');
  await page.getByRole('option', { name: /3\.2 Alte lămpi/ }).click();
  await page.getByRole('combobox', { name: 'Cod deșeu' }).click();
  await expect(page.getByRole('option', { name: /20 01 21\*/ })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByRole('option', { name: /20 01 21\*/ })).toContainText(
    'Nu e în autorizația ta de mediu',
  );
});

test('pe telefon: pașii încap pe ecran, iar la documente lista e ecranul principal', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Doar pe mobil.');
  await page.goto('/loturi/LOT-2026-0416/editare');
  await expect(page.getByText('Pasul 1 din 3 · Informații')).toBeVisible();
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);
  await page.getByRole('button', { name: 'Continuă la documente' }).click();
  await expect(page.getByText('Pasul 2 din 3 · Documente')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fotografiază următorul document' })).toBeVisible();
  await expect(page.getByText(/Cod periculos declarat: mai ai nevoie de/)).toBeVisible();
  const camera = page.getByRole('button', { name: 'Fotografiază: Tichet de cântar' });
  await expect(camera).toBeVisible();
  const box = await camera.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);
});

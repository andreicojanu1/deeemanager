import { expect, test, type Page } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

const PDF = { name: 'document.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 demo') };

async function incarca(page: Page, nume: string) {
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: `Încarcă: ${nume}` }).click();
  await (await chooser).setFiles(PDF);
}

test('cont nou: înregistrare, cod de confirmare, activare și trimitere la verificare', async ({
  page,
}, info) => {
  test.slow();
  const email = `test-${info.project.name}-${Date.now()}@firma-noua.ro`;

  await page.goto('/inregistrare');
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
  await page.getByRole('button', { name: 'Creează contul' }).click();
  await expect(page.getByText('Bifează acordul cu termenii ca să poți continua.')).toBeVisible();

  await page.getByLabel('Nume și prenume').fill('Ioana Stan');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Parolă', { exact: true }).fill('Colectare2026!');
  await expect(page.getByText('Parolă puternică')).toBeVisible();
  await page.getByLabel(/Sunt de acord cu termenii/).check();
  await page.getByRole('button', { name: 'Creează contul' }).click();

  await expect(page).toHaveURL(/\/confirmare-email$/);
  await expect(page.getByText(/t\*+@firma-noua\.ro/)).toBeVisible();
  await faraProblemeA11y(page);
  await page.getByLabel('Cifra 1').fill('111111');
  await expect(page.getByText('Codul nu e corect.', { exact: false })).toBeVisible();
  await page.getByLabel('Cifra 1').fill('246810');

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Activează-ți contul' })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText('Documente');

  // Butonul principal e activ doar cu dosarul complet; „Arată ce lipsește” marchează câmpurile.
  await expect(page.getByRole('button', { name: 'Trimite la verificare' })).toBeDisabled();
  await expect(
    page.getByText(/Mai ai de completat(: Datele firmei| \d+ elemente)/).filter({ visible: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Arată ce lipsește' }).click();
  await expect(page.getByText('Scrie CUI-ul firmei.')).toBeVisible();

  await page.getByLabel('CUI').fill('30118904');
  await page.getByLabel('CUI').blur();
  await expect(page.getByLabel('Denumire')).toHaveValue('EcoRec Ilfov SRL');
  await page.getByLabel('Adresa punctului de lucru').fill('Str. Depozitelor 4, Popești-Leordeni');
  await page.getByLabel('Bancă').fill('ING Bank');
  await page.getByLabel('IBAN').fill('RO21INGB0000999901234568');
  await page.getByLabel('IBAN').blur();
  await expect(page.getByText(/IBAN-ul nu e valid/)).toBeVisible();
  await page.getByLabel('IBAN').fill('RO21INGB0000999901234567');
  await expect(page.getByLabel('IBAN')).toHaveValue('RO21 INGB 0000 9999 0123 4567');
  await expect(page.getByText(/Salvat automat la/)).toBeVisible();

  for (const nume of [
    'Certificat de înmatriculare',
    'Certificat constatator al punctului de lucru',
    'Extras ONRC',
    'Contractul punctului de lucru',
    'Autorizația de mediu',
    'Visa anuală',
    'Captură SIATD cu modulul DEEE activ',
    'Actul de identitate al administratorului',
    'Declarația GDPR',
  ]) {
    await incarca(page, nume);
    await expect(page.getByRole('button', { name: `Înlocuiește: ${nume}` })).toBeVisible();
  }

  const ai = page.getByRole('group', { name: 'Extras de AI' });
  await expect(ai).toContainText('112/2025');
  await expect(
    page
      .getByText(/Mai ai de completat(: Confirmarea datelor din autorizația de mediu| 1 element)/)
      .filter({ visible: true }),
  ).toBeVisible();
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);

  await ai.getByRole('button', { name: 'Corectează' }).click();
  await ai.getByLabel('Coduri de deșeu autorizate').fill('20 01 35*, 200136');
  await ai.getByRole('button', { name: 'Salvează corecturile' }).click();
  await expect(ai.getByText(/Codurile au forma/)).toBeVisible();
  await ai.getByLabel('Coduri de deșeu autorizate').fill('20 01 35*, 20 01 36');
  await ai.getByRole('button', { name: 'Salvează corecturile' }).click();
  await expect(ai.getByText('Corectat de tine')).toBeVisible();

  await expect(page.getByText('Dosarul e complet.')).toBeVisible();
  await page.getByRole('button', { name: 'Trimite la verificare' }).click();
  await expect(page.getByText('În verificare · răspuns în maximum 24 h')).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText('În verificare');
  await expect(page.getByRole('button', { name: 'Trimite la verificare' })).toHaveCount(0);

  // Colectorul neactivat nu poate intra în restul aplicației.
  await page.goto('/loturi');
  await expect(page).toHaveURL(/\/onboarding$/);
});

test('colectorul demo neactivat vede documentul respins, cu motivul', async ({ page }) => {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Colector cu cont neactivat/ }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByText('Un document a fost respins')).toBeVisible();
  await expect(
    page.getByText('Extrasul e mai vechi de 30 de zile. Încarcă unul emis recent.').first(),
  ).toBeVisible();
  await expect(page.getByLabel('Denumire')).toHaveValue('EcoRec Ilfov SRL');
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
});

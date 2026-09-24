import { expect, test } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

test('autentificare: eroare neutră, apoi intrare cu parola de test', async ({ page }) => {
  await page.goto('/autentificare');
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);

  await page.getByLabel('Email').fill('andrei@colectordemo.ro');
  await page.getByLabel('Parolă', { exact: true }).fill('gresita');
  await page.getByRole('button', { name: 'Intră în cont', exact: true }).click();
  await expect(page.getByText('Emailul sau parola nu sunt corecte.')).toBeVisible();

  await page.getByLabel('Parolă', { exact: true }).fill('DeeeDemo2026!');
  await page.getByRole('button', { name: 'Intră în cont', exact: true }).click();
  await expect(page).toHaveURL(/\/panou$/);
});

test('recuperare parolă: mesaj neutru', async ({ page }) => {
  await page.goto('/recuperare-parola');
  await page.getByLabel('Email').fill('oricine@firma.ro');
  await page.getByRole('button', { name: 'Trimite link' }).click();
  await expect(page.getByText(/Dacă adresa există, vei primi un email/)).toBeVisible();
});

test('resetare parolă: link expirat și link valid', async ({ page }) => {
  await page.goto('/resetare-parola/expirat');
  await expect(page.getByRole('heading', { name: 'Linkul nu mai e valid' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cere un link nou' })).toBeVisible();

  await page.goto('/resetare-parola/demo');
  await page.getByLabel('Parolă nouă').fill('ParolaNoua2026!');
  await page.getByLabel('Scrie parola din nou').fill('AltaParola2026!');
  await page.getByRole('button', { name: 'Salvează parola' }).click();
  await expect(page.getByText(/Parolele nu coincid/)).toBeVisible();

  await page.getByLabel('Scrie parola din nou').fill('ParolaNoua2026!');
  await page.getByRole('button', { name: 'Salvează parola' }).click();
  await expect(page).toHaveURL(/parola=schimbata/);
  await expect(page.getByText('Parola a fost schimbată.', { exact: false })).toBeVisible();
});

test('activare invitație: token invalid', async ({ page }) => {
  await page.goto('/activare-cont/necunoscut');
  await expect(page.getByRole('heading', { name: 'Invitația nu mai e validă' })).toBeVisible();
});

test('confirmarea emailului fără înregistrare trimite la înregistrare', async ({ page }) => {
  await page.goto('/confirmare-email');
  await expect(page).toHaveURL(/\/inregistrare$/);
});

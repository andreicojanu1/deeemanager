import { expect, test } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

// Testele modifică aceeași coadă (acceptă loturi), deci rulează pe rând.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Administrator platformă/ }).click();
  await page.waitForURL(/\/admin$/);
  await page.goto('/admin/verificari');
  await expect(page.getByRole('heading', { level: 1, name: 'Coada de verificare' })).toBeVisible();
  await page.waitForSelector('body[data-coada-gata="true"]');
});

test('coada: tab-uri cu contoare, sortare după prioritate, fără probleme a11y', async ({
  page,
  isMobile,
}) => {
  await expect(page.getByRole('tab', { name: /De verificat/ })).toHaveAttribute('aria-selected', 'true');
  await faraScrollOrizontal(page);
  await faraProblemeA11y(page);
  if (!isMobile) {
    const prioritati = await page.locator('tbody tr td:first-child').allTextContents();
    const rang = (t: string) => (t.includes('Ridicată') ? 0 : t.includes('Medie') ? 1 : 2);
    expect(prioritati.map(rang)).toEqual([...prioritati.map(rang)].sort());
    await expect(page.getByText('Decizia rămâne mereu a ta · AI-ul doar propune')).toBeVisible();
  }
  await page.getByRole('tab', { name: /Decise azi/ }).click();
  await faraProblemeA11y(page);
});

test('tastatura: săgeți, C deschide cererea de completări cu motivul AI, Enter deschide raportul', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Scurtăturile sunt pentru tastatură.');
  const randuri = page.locator('tbody tr');
  // Urcă până la primul rând, indiferent unde a pornit selecția.
  for (let k = 0; k < 12; k++) await page.keyboard.press('ArrowUp');
  await expect(randuri.nth(0)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowDown');
  await expect(randuri.nth(1)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('ArrowUp');
  await expect(randuri.nth(0)).toHaveAttribute('aria-current', 'true');

  // Primul rând are o regulă roșie → motivul e precompletat.
  await page.keyboard.press('c');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('textbox', { name: /redactat de AI/ })).not.toHaveValue('');
  await dialog.getByRole('button', { name: 'Renunță' }).click();
  await expect(dialog).toBeHidden();

  // Scurtăturile nu se declanșează când scrii într-un câmp.
  await page.getByRole('textbox', { name: /Caută lot/ }).focus();
  await page.keyboard.press('a');
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.locator('body').click({ position: { x: 5, y: 5 } });

  const id = (await randuri.nth(0).locator('td').nth(1).textContent())!.trim();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(`/admin/verificari/${id}$`));
});

test('A pe un lot fără reguli roșii îl acceptă direct și îl scoate din coadă', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Scurtăturile sunt pentru tastatură.');
  const randuri = page.locator('tbody tr');
  const n = await randuri.count();
  for (let k = 0; k < 12; k++) await page.keyboard.press('ArrowUp');
  let i = 0;
  // Coboară până la primul lot cu prioritate normală (fără roșu).
  while (!(await randuri.nth(i).textContent())!.includes('Normală')) {
    await page.keyboard.press('ArrowDown');
    i++;
  }
  await expect(randuri.nth(i)).toHaveAttribute('aria-current', 'true');
  const id = (await randuri.nth(i).locator('td').nth(1).textContent())!.trim();
  await page.keyboard.press('a');
  await expect(page.getByText(`${id} a fost acceptat.`)).toBeVisible();
  await expect(page.locator('tbody tr', { hasText: id })).toHaveCount(0);
  await expect(randuri).toHaveCount(n - 1);
});

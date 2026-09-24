import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function intraCa(page: Page, cont: RegExp) {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: cont }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/autentificare'));
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

async function faraProblemeA11y(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

test('fără sesiune, orice pagină duce la autentificare', async ({ page }) => {
  await page.goto('/loturi');
  await expect(page).toHaveURL(/\/autentificare$/);
  await faraProblemeA11y(page);
});

test('colectorul activ ajunge pe panou și navighează prin meniu', async ({ page, isMobile }) => {
  await intraCa(page, /Colector cu cont activ/);
  await expect(page).toHaveURL(/\/panou$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Panou' })).toBeVisible();
  await faraProblemeA11y(page);

  if (isMobile) await page.getByRole('button', { name: 'Deschide meniul' }).click();
  await page
    .getByRole('navigation', { name: 'Meniu principal' })
    .getByRole('link', { name: 'Loturi', exact: true })
    .click();
  await expect(page).toHaveURL(/\/loturi$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Loturi' })).toBeVisible();

  await page.goto('/admin/verificari');
  await expect(page).toHaveURL(/\/acces-interzis$/);
});

test('colectorul neactivat e trimis la activarea contului', async ({ page }) => {
  await intraCa(page, /Colector cu cont neactivat/);
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.goto('/loturi/nou');
  await expect(page).toHaveURL(/\/onboarding$/);
});

test('adminul vede meniul de admin, cu badge-ul cozii, și se poate deloga', async ({ page, isMobile }) => {
  await intraCa(page, /Administrator platformă/);
  await expect(page).toHaveURL(/\/admin$/);
  if (isMobile) await page.getByRole('button', { name: 'Deschide meniul' }).click();
  const verificari = page.getByRole('link', { name: /Verificări/ });
  await expect(verificari).toContainText(/\d+/);
  await verificari.click();
  await expect(page.getByRole('heading', { level: 1, name: 'Coada de verificare' })).toBeVisible();
  await faraProblemeA11y(page);

  await page.getByRole('button', { name: /Contul tău/ }).click();
  await page.getByRole('menuitem', { name: 'Delogare' }).click();
  await expect(page).toHaveURL(/\/autentificare$/);
});

test('„/” duce focusul în căutare', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Pe mobil căutarea se deschide din iconiță.');
  await intraCa(page, /Colector cu cont activ/);
  const cautare = page.getByRole('textbox', { name: /Caută lot/ });
  // Reîncearcă până la hidratare: scurtătura e atașată pe client.
  await expect(async () => {
    await page.locator('body').press('/');
    await expect(cautare).toBeFocused({ timeout: 500 });
  }).toPass();
});

test('pagina inexistentă arată 404', async ({ page }) => {
  await intraCa(page, /Colector cu cont activ/);
  await page.goto('/pagina-care-nu-exista');
  await expect(page.getByRole('heading', { name: 'Pagina nu există' })).toBeVisible();
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: /Colector cu cont activ/ }).click();
  await page.waitForURL(/\/panou$/);
  await expect(page.getByRole('heading', { name: 'Ultimele loturi' })).toBeVisible();
});

test('panoul arată blocurile din mockup, fără scroll orizontal și fără probleme a11y', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'De rezolvat' })).toBeVisible();
  await expect(page.getByText('LOT-2026-0412 · Necesită completări')).toBeVisible();
  await expect(page.getByText('Total 16.771 kg · 41 loturi acceptate')).toBeVisible();
  await expect(page.getByText('3.410 kg', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

test('cardul de categorie duce la loturi filtrate', async ({ page }) => {
  await page.getByRole('link', { name: /Categoria 1, Transfer termic/ }).click();
  await expect(page).toHaveURL(/\/loturi\?categorie=1$/);
});

test('rândurile duc la detaliul lotului', async ({ page }) => {
  await page.getByRole('link', { name: 'Completează lotul' }).click();
  await expect(page).toHaveURL(/\/loturi\/LOT-2026-0412$/);
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { faraScrollOrizontal } from './util';

test('pagina de probă a temei se încarcă cu fonturile locale și fără probleme de accesibilitate', async ({
  page,
}) => {
  await page.goto('/dev/tema');
  await expect(page.getByRole('heading', { name: 'Pagină de probă a temei' })).toBeVisible();

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toContain('Inter');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 16px Inter'))).toBe(true);

  await faraScrollOrizontal(page);

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

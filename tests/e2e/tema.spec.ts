import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('pagina de probă a temei se încarcă cu fonturile locale și fără probleme de accesibilitate', async ({
  page,
}) => {
  await page.goto('/dev/tema');
  await expect(page.getByRole('heading', { name: 'Pagină de probă a temei' })).toBeVisible();

  const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(fontFamily).toContain('Inter');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('600 16px Inter'))).toBe(true);

  // Fără scroll orizontal al paginii.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
});

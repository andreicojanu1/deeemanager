import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Pe mobil (isMobile), viewport-ul de layout se lărgește după conținut, așa că
 * `window.innerWidth` nu prinde depășirile. Comparăm cu lățimea configurată.
 */
export async function faraScrollOrizontal(page: Page) {
  const latime = page.viewportSize()!.width;
  const continut = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(continut, `conținutul are ${continut}px pe un ecran de ${latime}px`).toBeLessThanOrEqual(latime);
}

export async function faraProblemeA11y(page: Page) {
  // Contrastul se măsoară după ce animațiile de intrare (150–200 ms) s-au terminat.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
}

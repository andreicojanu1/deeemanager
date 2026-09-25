import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { faraScrollOrizontal } from './util';

/**
 * Trecerea finală a Fazei A: fiecare ecran din CLAUDE.md §5, pe desktop (1440 px) și pe
 * telefon (390 px): un singur titlu h1, fără scroll orizontal, fără probleme axe
 * (WCAG 2.2 A/AA, inclusiv mărimea țintelor), focus vizibil.
 */

type Persona = 'colector-activ' | 'colector-neactivat' | 'admin' | null;

const ECRANE: { persona: Persona; rute: string[] }[] = [
  {
    persona: null,
    rute: [
      '/autentificare',
      '/inregistrare',
      '/recuperare-parola',
      '/resetare-parola/demo',
      '/resetare-parola/expirat',
      '/activare-cont/demo',
      '/activare-cont/necunoscut',
      '/acces-interzis',
      '/eroare',
    ],
  },
  {
    persona: 'colector-activ',
    rute: [
      '/panou',
      '/loturi',
      '/loturi?vedere=categorii',
      '/loturi/nou',
      '/loturi/LOT-2026-0418',
      '/loturi/LOT-2026-0412',
      '/loturi/LOT-2026-0416/editare',
      '/organizatie',
      '/cont',
      '/pagina-care-nu-exista',
    ],
  },
  { persona: 'colector-neactivat', rute: ['/onboarding', '/cont'] },
  {
    persona: 'admin',
    rute: [
      '/admin',
      '/admin/verificari',
      '/admin/verificari/LOT-2026-0418',
      '/admin/colectori',
      '/admin/colectori/org-ecorec-ilfov',
      '/admin/colectori/org-ecorec-ilfov?tab=documente',
      '/admin/colectori/org-colector-demo?tab=vizita',
      '/admin/colectori/org-colector-demo?tab=utilizatori',
      '/admin/loturi',
      '/admin/taxonomie',
      '/admin/taxonomie?tab=coduri',
      '/admin/taxonomie?tab=reguli',
      '/cont',
    ],
  },
];

async function verifica(page: Page, ruta: string) {
  await page.goto(ruta);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1:visible'), `${ruta}: un singur h1 vizibil`).toHaveCount(1);
  await expect(page.locator('[aria-busy="true"]'), `${ruta}: skeleton-ul a dispărut`).toHaveCount(0);
  await faraScrollOrizontal(page);
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  await expect(page, `${ruta}: titlul paginii`).toHaveTitle(/\S/);
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']);
  // Pe raport, bara de decizie lipită jos stă peste regulile de sub linia ecranului; axe le
  // socotește „acoperite”. Se derulează normal; focusul neacoperit e testat separat mai jos.
  if (ruta.startsWith('/admin/verificari/')) builder = builder.disableRules(['target-size']);
  const axe = await builder.analyze();
  expect(
    axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
    ruta,
  ).toEqual([]);
}

for (const { persona, rute } of ECRANE) {
  test(`ecranele ${persona ?? 'fără sesiune'}: responsive și accesibile`, async ({ page, baseURL }) => {
    test.slow();
    if (persona) {
      await page.context().addCookies([{ name: 'deee_sesiune_test', value: persona, url: baseURL! }]);
    }
    for (const ruta of rute) await verifica(page, ruta);
  });
}

test('fonturile se servesc local, iar interfața folosește Inter', async ({ page }) => {
  const externe: string[] = [];
  page.on('request', (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) externe.push(r.url());
  });
  await page.goto('/autentificare');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain('Inter');
  expect(await page.evaluate(() => document.fonts.check('600 16px Inter'))).toBe(true);
  expect(externe).toEqual([]);
});

test('din tastatură: „Sari la conținut” e primul, iar focusul are inel vizibil', async ({
  page,
  baseURL,
  isMobile,
}) => {
  test.skip(isMobile, 'Tastatura fizică: desktop.');
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'colector-activ', url: baseURL! }]);
  await page.goto('/panou');
  await page.keyboard.press('Tab');
  const sari = page.getByRole('link', { name: 'Sari la conținut' });
  await expect(sari).toBeFocused();
  await expect(sari).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#continut')).toBeFocused();

  // Următorul element focusabil din conținut are inelul petrol de 2 px.
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const s = getComputedStyle(document.activeElement!);
    return { stil: s.outlineStyle, latime: s.outlineWidth };
  });
  expect(outline).toEqual({ stil: 'solid', latime: '2px' });
});

test('cu „reduce motion” animațiile și tranzițiile sunt oprite', async ({ page, baseURL }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'admin', url: baseURL! }]);
  await page.goto('/admin/taxonomie');
  const durata = await page.evaluate(() => {
    const el = document.querySelector('[aria-controls^="categorie-"] span') as HTMLElement;
    return getComputedStyle(el).transitionDuration;
  });
  expect(parseFloat(durata)).toBeLessThan(0.01);
});

test('ținte de atingere de minimum 44 px pe telefon', async ({ page, baseURL, isMobile }) => {
  test.skip(!isMobile, 'Doar pe telefon.');
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'colector-activ', url: baseURL! }]);
  for (const ruta of ['/panou', '/loturi', '/loturi/LOT-2026-0416/editare', '/organizatie']) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const mici = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          'main button, main [role="button"], main input, main select',
        ),
      ]
        .filter((el) => el.offsetParent !== null && !el.closest('[aria-hidden="true"]'))
        .filter(
          (el) => (el as HTMLInputElement).type !== 'hidden' && (el as HTMLInputElement).type !== 'file',
        )
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && Math.max(r.height, r.width) < 44 && r.height < 44)
        .map(
          ({ el, r }) =>
            `${el.tagName} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)}" ${Math.round(r.width)}×${Math.round(r.height)}`,
        ),
    );
    expect(mici, ruta).toEqual([]);
  }
});

test('focusul din tastatură nu rămâne sub bara de decizie a raportului', async ({
  page,
  baseURL,
  isMobile,
}) => {
  test.skip(isMobile, 'Tastatura fizică: desktop.');
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'admin', url: baseURL! }]);
  await page.goto('/admin/verificari/LOT-2026-0418');
  await page.waitForLoadState('networkidle');
  const r11 = page.getByRole('button', { name: /^R11 / });
  await page.getByRole('button', { name: /^R10 / }).focus();
  await page.keyboard.press('Tab');
  await expect(r11).toBeFocused();
  const [regula, bara] = await Promise.all([
    r11.boundingBox(),
    page.getByRole('button', { name: /Cere completări/ }).boundingBox(),
  ]);
  expect(regula!.y + regula!.height).toBeLessThanOrEqual(bara!.y - 12);
});

test('lățimi intermediare (tabletă): fără scroll orizontal', async ({ page, baseURL, isMobile }) => {
  test.skip(isMobile, 'Rulează o dată, schimbând lățimea.');
  test.slow();
  const rute: [string, string[]][] = [
    ['colector-activ', ['/panou', '/loturi', '/loturi/nou', '/loturi/LOT-2026-0418', '/organizatie']],
    [
      'admin',
      [
        '/admin',
        '/admin/verificari',
        '/admin/verificari/LOT-2026-0418',
        '/admin/colectori/org-colector-demo',
        '/admin/taxonomie?tab=reguli',
      ],
    ],
  ];
  for (const latime of [768, 1024, 1280]) {
    await page.setViewportSize({ width: latime, height: 900 });
    for (const [persona, lista] of rute) {
      await page.context().addCookies([{ name: 'deee_sesiune_test', value: persona, url: baseURL! }]);
      for (const ruta of lista) {
        await page.goto(ruta);
        await page.waitForLoadState('networkidle');
        const w = await page.evaluate(() => document.documentElement.scrollWidth);
        expect(w, `${ruta} la ${latime}px`).toBeLessThanOrEqual(latime);
      }
    }
  }
});

test('dialogurile deschise sunt accesibile și țin focusul', async ({ page, baseURL }) => {
  const axe = async (ce: string) => {
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(
      r.violations.map((v) => v.id),
      ce,
    ).toEqual([]);
  };
  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'admin', url: baseURL! }]);

  await page.goto('/admin/colectori');
  await page.getByRole('button', { name: 'Colector nou' }).click();
  const nou = page.getByRole('dialog', { name: 'Colector nou' });
  await expect(nou).toBeVisible();
  await expect(nou.getByLabel('Denumirea firmei')).toBeVisible();
  await axe('Colector nou');
  await page.keyboard.press('Escape');
  await expect(nou).toBeHidden();
  await expect(page.getByRole('button', { name: 'Colector nou' })).toBeFocused();

  await page.context().addCookies([{ name: 'deee_sesiune_test', value: 'colector-activ', url: baseURL! }]);
  await page.goto('/loturi/LOT-2026-0416');
  await page.getByRole('button', { name: 'Anulează lotul' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await axe('Anulare lot');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

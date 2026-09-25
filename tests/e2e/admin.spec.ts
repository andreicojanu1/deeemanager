import { expect, test, type Page } from '@playwright/test';
import { faraProblemeA11y, faraScrollOrizontal } from './util';

// Testele schimbă starea colectorilor din demo; rulează în ordine.
test.describe.configure({ mode: 'serial' });

async function intraCa(page: Page, cont: RegExp) {
  await page.goto('/autentificare');
  await page.getByRole('button', { name: cont }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/autentificare'));
}

/** Un CUI valid, diferit la fiecare rulare, pentru invitații. */
function cuiNou(): string {
  const corp = String(Date.now()).slice(-7);
  const cheie = '753217532';
  const p = corp.padStart(9, '0');
  let s = 0;
  for (let i = 0; i < 9; i++) s += Number(p[i]) * Number(cheie[i]);
  const c = (s * 10) % 11;
  return `${corp}${c === 10 ? 0 : c}`;
}

test('panoul admin: contoare, intrări pe platformă și conturile de verificat', async ({ page }) => {
  await intraCa(page, /Administrator platformă/);
  await expect(page.getByRole('heading', { level: 1, name: 'Panou' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Loturi în coadă/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Intrări acceptate pe lună' })).toBeVisible();
  const conturi = page.getByRole('region', { name: 'Conturi de verificat' });
  // Eco Dunărea rămâne la vizită; Recycle Prahova poate fi deja aprobat de alt test.
  await expect(conturi.getByRole('link', { name: /Eco Dunărea SRL/ })).toBeVisible();
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
});

test('lista colectorilor: căutare și filtru de status', async ({ page }) => {
  await intraCa(page, /Administrator platformă/);
  await page.goto('/admin/colectori');
  await expect(page.getByRole('status')).toContainText(/\d+ colectori/);
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);

  await page.getByLabel('Caută colector').fill('galați');
  await expect(page).toHaveURL(/q=gala/);
  await expect(page.getByRole('status')).toHaveText('1 colector');
  await expect(page.getByRole('link', { name: 'Eco Dunărea SRL' }).first()).toBeVisible();

  await page.goto('/admin/colectori?status=ACTIV');
  await expect(page.getByRole('link', { name: 'Colector Demo SRL' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'EcoRec Ilfov SRL' })).toHaveCount(0);
});

test('dosar de activare: aprobă documentele, marchează vizita, contul devine activ', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Fluxul modifică datele demo; rulează o dată, pe desktop.');
  await intraCa(page, /Administrator platformă/);
  await page.goto('/admin/colectori/org-recycle-prahova?tab=documente');
  await expect(page.getByRole('heading', { level: 1, name: 'Recycle Prahova SRL' })).toBeVisible();
  await faraProblemeA11y(page);

  // Cererea de reîncărcare fără motiv e oprită.
  await page.getByRole('button', { name: 'Cere reîncărcare: Extras ONRC' }).click();
  const dialog = page.getByRole('dialog', { name: /Cere reîncărcare/ });
  await dialog.getByRole('button', { name: 'Trimite colectorului' }).click();
  await expect(dialog.getByText('Scrie motivul, ca firma să știe ce să încarce.')).toBeVisible();
  await dialog.getByRole('button', { name: 'Renunță' }).click();

  await page.getByRole('button', { name: 'Aprobă: Certificat de înmatriculare' }).click();
  await expect(page.getByRole('button', { name: /^Aprobă: / })).toHaveCount(8);
  await page.getByRole('button', { name: 'Aprobă toate (8)' }).click();
  await expect(page.getByRole('button', { name: /^Aprobă: / })).toHaveCount(0);
  await expect(page.getByText('Vizită în teren').first()).toBeVisible();

  await page.getByRole('tab', { name: 'Vizită în teren' }).click();
  await page.getByLabel('Observații').fill('Depozit acoperit, cântar verificat.');
  await page.getByRole('button', { name: 'Marchează vizita și activează contul' }).click();
  await expect(page.getByRole('heading', { name: 'Vizită efectuată' })).toBeVisible();
  await expect(page.getByText('Depozit acoperit, cântar verificat.')).toBeVisible();
  await expect(
    page
      .locator('h1 + *')
      .or(page.getByText('Activ', { exact: true }))
      .first(),
  ).toBeVisible();
});

test('colector nou: validare și invitație', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Creează date noi; rulează o dată, pe desktop.');
  await intraCa(page, /Administrator platformă/);
  await page.goto('/admin/colectori');
  await page.getByRole('button', { name: 'Colector nou' }).click();
  const dialog = page.getByRole('dialog', { name: 'Colector nou' });
  await dialog.getByRole('button', { name: 'Trimite invitația' }).click();
  await expect(dialog.getByText('Scrie denumirea firmei.')).toBeVisible();
  await expect(dialog.getByText('CUI-ul nu e valid. Verifică cifrele.')).toBeVisible();

  await dialog.getByLabel('Denumirea firmei').fill('Colectare Test SRL');
  await dialog.getByLabel('CUI').fill(cuiNou());
  await dialog.getByLabel('Numele administratorului firmei').fill('Dan Ilie');
  await dialog.getByLabel('Email administrator').fill(`dan.${Date.now()}@colectaretest.ro`);
  await dialog.getByRole('button', { name: 'Trimite invitația' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Colectare Test SRL' })).toBeVisible();
  await page.getByRole('tab', { name: 'Utilizatori' }).click();
  await expect(page.getByText('Invitație trimisă').first()).toBeVisible();
});

test('loturile admin: coloana Colector, fără ciorne, rândul deschide raportul', async ({
  page,
  isMobile,
}) => {
  await intraCa(page, /Administrator platformă/);
  await page.goto('/admin/loturi');
  if (isMobile)
    await expect(page.getByText('Colector Demo SRL').filter({ visible: true }).first()).toBeVisible();
  else await expect(page.getByRole('columnheader', { name: 'Colector' })).toBeVisible();
  await expect(page.getByText('Ciornă', { exact: true }).filter({ visible: true })).toHaveCount(0);
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
  await page.getByRole('link', { name: 'LOT-2026-0418' }).first().click();
  await expect(page).toHaveURL(/\/admin\/verificari\/LOT-2026-0418$/);
});

test('taxonomie: editare inline a tarifului și reguli configurabile', async ({ page, isMobile }) => {
  await intraCa(page, /Administrator platformă/);
  await page.goto('/admin/taxonomie');
  await expect(page.getByRole('button', { name: /1\. Echipamente de transfer termic/ })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);

  if (!isMobile) {
    await page.getByRole('button', { name: 'Editează 1.2 Echipamente de aer condiționat ≤ 50 kg' }).click();
    await page.getByLabel('Valoare tarif').fill('abc');
    await page.getByRole('button', { name: 'Salvează' }).click();
    await expect(page.getByText('Scrie tariful ca număr, de exemplu 12,50.')).toBeVisible();
    await page.getByLabel('Valoare tarif').fill('42,50');
    await page.getByRole('button', { name: 'Salvează' }).click();
    await expect(page.locator('[data-subcategorie="1.2"]')).toContainText('42,50 lei / buc');
  }

  await page.getByRole('tab', { name: 'Reguli de verificare' }).click();
  await expect(
    page.getByText('Regulamentul de verificare nu e încă validat de client.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('Toleranță R02, în procente')).toBeVisible();
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
});

test('organizația colectorului: visa care expiră are acțiunea principală', async ({ page }) => {
  await intraCa(page, /Colector cu cont activ/);
  await page.goto('/organizatie');
  await expect(page.getByRole('heading', { level: 1, name: 'Organizație' })).toBeVisible();
  const visa = page.locator('[data-document="VISA_ANUALA"]');
  await expect(visa).toContainText(/Expiră în \d+ zile/);
  await expect(visa.getByRole('button', { name: /Încarcă varianta nouă/ })).toBeVisible();
  await expect(page.getByText('214/2024')).toBeVisible();
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);
});

test('cont: numele se schimbă, parola cere valoarea actuală corectă', async ({ page, isMobile }) => {
  await intraCa(page, isMobile ? /Administrator platformă/ : /Colector cu cont activ/);
  await page.goto('/cont');
  await faraProblemeA11y(page);
  await faraScrollOrizontal(page);

  const nume = page.getByLabel('Nume și prenume');
  const initial = await nume.inputValue();
  await nume.fill(`${initial} Test`);
  await page.getByRole('button', { name: 'Salvează' }).click();
  await expect(page.getByText('Numele a fost salvat.')).toBeVisible();
  await expect(nume).toHaveValue(`${initial} Test`);
  // Refacem numele, ca celelalte teste să vadă datele inițiale.
  await nume.fill(initial);
  await page.getByRole('button', { name: 'Salvează' }).click();
  await expect(nume).toHaveValue(initial);
  await expect(page.getByRole('button', { name: 'Salvează' })).toBeDisabled();

  await page.getByLabel('Parola actuală').fill('gresita');
  await page.getByLabel('Parolă nouă').fill('ParolaNoua2026!');
  await page.getByLabel('Scrie parola nouă din nou').fill('ParolaNoua2026!');
  await page.getByRole('button', { name: 'Schimbă parola' }).click();
  await expect(page.getByText('Parola actuală nu e corectă.')).toBeVisible();
  await page.getByLabel('Parola actuală').fill('DeeeDemo2026!');
  await page.getByRole('button', { name: 'Schimbă parola' }).click();
  await expect(page.getByText('Parola a fost schimbată.')).toBeVisible();
});

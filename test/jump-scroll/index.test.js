/**
 * Test the basic jump-scroll component.
 * 
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

const { test, expect } = require('@playwright/test');

test.describe('jump-scroll', () => {
  const baseUrl = 'http://localhost:3010/jump-scroll';

  test('next', async ({ page }) => {
    await page.goto(baseUrl);

    let section = page.getByText('Article 0');
    await expect(section).toBeVisible();

    await page.locator('.bc-next').click({
      timeout: 3000
    });

    section = page.getByText('Article 1');
    await expect(section).toBeVisible();
  });

  test('end/start', async ({ page }) => {
    await page.goto(baseUrl);

    let section = page.getByText('Article 0');
    await expect(section).toBeVisible();

    await page.locator('.bc-end').click({
      timeout: 3000
    });

    // Let it cook
    await new Promise(res => setTimeout(res, 250));

    section = page.getByText('Article 6');
    await expect(section).toBeVisible();

    const prev = page.locator('.bc-prev');
    await prev.click({
      timeout: 3000
    });

    section = page.getByText('Article 5');
    await expect(section).toBeVisible();

    const start = page.locator('.bc-start > button');
    await start.waitFor({
      state: 'visible',
      timeout: 3000
    });
    await expect(start).toBeVisible();

    await start.click();

    section = page.getByText('Article 0');
    await expect(section).toBeVisible();
  });

  test('jump scroll', async ({ page }) => {
    await page.goto(baseUrl);

    await page.getByText('Jump scroll to 5').click({
      timeout: 3000
    });

    const klass = await page.evaluate(() => {
      const el = document.querySelector('.jump-scroll');
      const current = el.currentTarget;
      const klass = current.getAttribute('class');
      return klass;
    });

    await expect(klass).toContain('fifth');
  });
});
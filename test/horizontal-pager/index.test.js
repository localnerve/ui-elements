/**
 * Test the basic horizontal-pager behavior.
 * 
 * Copyright (c) 2017-2025 Alex Grant (@localnerve), LocalNerve LLC
 * Copyrights licensed under the BSD License. See the accompanying LICENSE file for terms.
 */

const { test, expect } = require('@playwright/test');

test.describe('horizontal-pager', () => {
  const baseUrl = 'http://localhost:3010/horizontal-pager';

  test('target count', async ({ page }) => {
    await page.goto(baseUrl);

    const targetCount = await page.evaluate(() => window.horizontalPager.targetCount());
    expect(targetCount).toEqual(6);
  });

  test('move next', async ({ page }) => {
    await page.goto(baseUrl);

    let index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 2')).toBeHidden({
      timeout: 3000
    });

    const firstNext = (await page.getByText('Next').all())[0];
    await firstNext.click();
    
    await expect(page.getByText('Hello World 1')).toBeHidden({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 2')).toBeVisible({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(1);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);
  });

  test('move prev', async ({ page }) => {
    await page.goto(baseUrl);

    let index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 6')).toBeHidden({
      timeout: 3000
    });

    const firstPrev = (await page.getByText('Prev').all())[0];
    await firstPrev.click();
    
    await expect(page.getByText('Hello World 1')).toBeHidden({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 6')).toBeVisible({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(5);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);
  });

  test('move absolute', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 6')).toBeHidden({
      timeout: 3000
    });

    let index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    const firstEnd = (await page.getByText('Move to end').all())[0];
    await firstEnd.click();
    
    await expect(page.getByText('Hello World 1')).toBeHidden({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 6')).toBeVisible({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(5);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    const buttons = await page.getByText('Move to front').all();
    const lastFront = buttons[buttons.length - 1];
    await lastFront.click();

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 6')).toBeHidden({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(5);
  });

  test('move relative', async ({ page }) => {
    await page.goto(baseUrl);

    let index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 3')).toBeHidden({
      timeout: 3000
    });

    let firstRel = (await page.getByText('Move up 2').all())[0];
    await firstRel.click();

    await expect(page.getByText('Hello World 3')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 1')).toBeHidden({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(2);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(0);

    firstRel = (await page.getByText('Move back 2').all())[0];
    await firstRel.click();

    await expect(page.getByText('Hello World 1')).toBeVisible({
      timeout: 3000
    });
    await expect(page.getByText('Hello World 3')).toBeHidden({
      timeout: 3000
    });

    index = await page.evaluate(() => window.horizontalPager.currTargetIndex());
    expect(index).toEqual(0);

    index = await page.evaluate(() => window.horizontalPager.prevTargetIndex());
    expect(index).toEqual(2);
  });
});
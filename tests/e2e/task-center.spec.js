import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.goto('/');
  await page.locator('#bootScreen').evaluate(node=>node.remove());
  await page.locator('#taskCenterNav').click();
  await expect(page.locator('#taskCenter')).toHaveClass(/open/);
});

test('creates, completes, filters, edits and deletes a task', async ({ page }) => {
  await page.locator('[data-new-task]').click();
  await page.locator('[data-editor] input[name=title]').fill('自动化发布');
  await page.locator('[data-editor] select[name=priority]').selectOption('high');
  await page.locator('[data-editor] button[type=submit]').click();
  const card=page.locator('.task-item',{hasText:'自动化发布'}); await expect(card).toBeVisible();
  await card.locator('[data-toggle-task]').click(); await expect(page.locator('.task-item.completed')).toContainText('自动化发布');
  await page.locator('[data-status]').selectOption('completed'); await expect(page.locator('.task-item')).toHaveCount(1);
  await page.locator('.task-item [data-edit-task]').click(); await page.locator('[data-editor] input[name=title]').fill('自动化发布完成'); await page.locator('[data-editor] button[type=submit]').click();
  page.once('dialog',dialog=>dialog.accept()); await page.locator('.task-item [data-delete-task]').click(); await expect(page.locator('.task-item')).toHaveCount(0);
});

test('creates an event, warns on conflict, and persists after reload', async ({ page }) => {
  for (const [title,start,end] of [['设计评审','09:00','10:00'],['重叠会议','09:30','10:30']]) {
    await page.locator('[data-new-event]').click(); await page.locator('[data-editor] input[name=title]').fill(title);
    const day=await page.locator('[data-editor] input[name=startAt]').inputValue();
    await page.locator('[data-editor] input[name=startAt]').fill(`${day.slice(0,10)}T${start}`); await page.locator('[data-editor] input[name=endAt]').fill(`${day.slice(0,10)}T${end}`);
    if(title==='重叠会议') page.once('dialog',async dialog=>{const message=dialog.message();await dialog.accept();expect(message).toMatch(/冲突|conflict/i)});
    await page.locator('[data-editor] button[type=submit]').click();
  }
  await expect(page.locator('.event-item')).toHaveCount(2); await page.reload(); await page.locator('#bootScreen').evaluate(node=>node.remove()); await page.locator('#taskCenterNav').click(); await expect(page.locator('.event-item')).toHaveCount(2);
});

test('switches language and remains usable on a narrow viewport', async ({ page }) => {
  const initial=await page.locator('[data-center-title]').textContent(); await page.locator('#taskCenter [data-close]').click(); await page.locator('#languageToggle').click(); await page.locator('#taskCenterNav').click();
  await expect(page.locator('[data-center-title]')).not.toHaveText(initial); await page.setViewportSize({width:390,height:844}); await expect(page.locator('[data-new-task]')).toBeVisible();
});

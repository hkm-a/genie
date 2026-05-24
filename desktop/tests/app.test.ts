import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Application } from 'spectron';
import * as path from 'path';

describe('Electron 应用', () => {
  let app: Application;

  beforeAll(async () => {
    app = new Application({
      path: path.join(__dirname, '../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../')],
      waitTimeout: 10000,
    });

    await app.start();
  });

  afterAll(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('应该成功启动窗口', async () => {
    const windowCount = await app.client.getWindowCount();
    expect(windowCount).toBe(1);
  });

  it('应该显示正确的标题', async () => {
    const title = await app.client.getTitle();
    expect(title).toContain('Genie');
  });

  it('应该显示场景列表', async () => {
    const sceneList = await app.client.$('#scene-list');
    expect(await sceneList.isExisting()).toBe(true);
  });

  it('应该显示筛选器', async () => {
    const filterTabs = await app.client.$('#filter-tabs');
    expect(await filterTabs.isExisting()).toBe(true);
  });

  it('应该显示搜索框', async () => {
    const searchBox = await app.client.$('#search-input');
    expect(await searchBox.isExisting()).toBe(true);
  });

  it('应该有设置按钮', async () => {
    const settingsBtn = await app.client.$('#settings-button');
    expect(await settingsBtn.isExisting()).toBe(true);
  });
});

describe('场景详情页面', () => {
  let app: Application;

  beforeAll(async () => {
    app = new Application({
      path: path.join(__dirname, '../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../')],
      waitTimeout: 10000,
    });

    await app.start();
  });

  afterAll(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('点击场景卡片应该打开详情页面', async () => {
    const firstScene = await app.client.$('.scene-card');
    await firstScene.click();

    const sceneDetail = await app.client.$('#scene-detail');
    expect(await sceneDetail.isExisting()).toBe(true);
  });

  it('详情页面应该显示变量输入框', async () => {
    const variableInputs = await app.client.$$('.variable-input');
    expect(variableInputs.length).toBeGreaterThan(0);
  });

  it('详情页面应该有生成按钮', async () => {
    const generateBtn = await app.client.$('#generate-button');
    expect(await generateBtn.isExisting()).toBe(true);
  });
});

describe('设置页面', () => {
  let app: Application;

  beforeAll(async () => {
    app = new Application({
      path: path.join(__dirname, '../node_modules/.bin/electron'),
      args: [path.join(__dirname, '../')],
      waitTimeout: 10000,
    });

    await app.start();
  });

  afterAll(async () => {
    if (app && app.isRunning()) {
      await app.stop();
    }
  });

  it('点击设置按钮应该打开设置页面', async () => {
    const settingsBtn = await app.client.$('#settings-button');
    await settingsBtn.click();

    const settingsPage = await app.client.$('#settings-page');
    expect(await settingsPage.isExisting()).toBe(true);
  });

  it('设置页面应该有 API Key 输入框', async () => {
    const apiKeyInput = await app.client.$('#api-key-input');
    expect(await apiKeyInput.isExisting()).toBe(true);
  });

  it('设置页面应该有保存按钮', async () => {
    const saveBtn = await app.client.$('#save-settings-button');
    expect(await saveBtn.isExisting()).toBe(true);
  });
});

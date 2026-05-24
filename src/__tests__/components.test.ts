import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Navbar from '../components/Navbar.vue';
import SceneListView from '../views/SceneListView.vue';
import SceneDetailView from '../views/SceneDetailView.vue';
import SettingsView from '../views/SettingsView.vue';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue([]),
}));

// Mock pinia for any component that might use it
vi.mock('pinia', () => ({
  createPinia: () => ({}),
}));

describe('Navbar', () => {
  it('renders logo and brand name', () => {
    const wrapper = mount(Navbar);
    expect(wrapper.text()).toContain('Genie');
    expect(wrapper.text()).toContain('AI Prompt Studio');
  });

  it('emits navigate event when settings button is clicked', async () => {
    const wrapper = mount(Navbar);
    const settingsBtn = wrapper.find('#settings-button');
    await settingsBtn.trigger('click');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')![0]).toEqual(['settings']);
  });

  it('emits navigate event when logo is clicked', async () => {
    const wrapper = mount(Navbar);
    const logo = wrapper.find('.logo');
    await logo.trigger('click');
    expect(wrapper.emitted('navigate')).toBeTruthy();
    expect(wrapper.emitted('navigate')![0]).toEqual(['scenes']);
  });
});

describe('SceneListView', () => {
  it('renders hero section', () => {
    const wrapper = mount(SceneListView);
    expect(wrapper.find('.hero').exists()).toBe(true);
    expect(wrapper.text()).toContain('一句话');
  });

  it('renders filter tabs', () => {
    const wrapper = mount(SceneListView);
    const tabs = wrapper.findAll('.filter-tab');
    expect(tabs.length).toBeGreaterThanOrEqual(3);
    expect(tabs[0].text()).toContain('全部');
    expect(tabs[1].text()).toContain('文本');
    expect(tabs[2].text()).toContain('图像');
  });

  it('renders search input', () => {
    const wrapper = mount(SceneListView);
    expect(wrapper.find('#search-input').exists()).toBe(true);
  });

  it('shows empty state when no scenes match filter', async () => {
    const wrapper = mount(SceneListView);
    // Type a search that won't match anything
    const searchInput = wrapper.find('#search-input');
    await searchInput.setValue('zzzznonexistentzzzz');
    // Allow Vue to re-render
    await wrapper.vm.$nextTick();
    // Should show empty state
    expect(wrapper.find('.empty-state').exists()).toBe(true);
  });
});

describe('SceneDetailView', () => {
  const mockScene = {
    id: 'test-scene',
    name: 'Test Scene',
    name_zh: '测试场景',
    type: 'text' as const,
    category: 'Test',
    category_zh: '测试',
    description: 'A test scene',
    tags: ['test'],
    variables: [
      {
        name: 'topic',
        label: 'Topic',
        label_zh: '主题',
        type: 'text' as const,
        required: true,
        placeholder: '输入主题...',
      },
      {
        name: 'style',
        label: 'Style',
        label_zh: '风格',
        type: 'select' as const,
        required: true,
        options: ['A', 'B'],
      },
    ],
  };

  it('renders scene info', () => {
    const wrapper = mount(SceneDetailView, {
      props: { scene: mockScene },
    });
    expect(wrapper.text()).toContain('测试场景');
    expect(wrapper.text()).toContain('Test Scene');
    expect(wrapper.text()).toContain('文本场景');
  });

  it('renders variable inputs', () => {
    const wrapper = mount(SceneDetailView, {
      props: { scene: mockScene },
    });
    expect(wrapper.text()).toContain('主题');
    expect(wrapper.text()).toContain('风格');
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('renders generate button', () => {
    const wrapper = mount(SceneDetailView, {
      props: { scene: mockScene },
    });
    const btn = wrapper.find('#generate-button');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('开始生成');
  });

  it('emits back event when back button clicked', async () => {
    const wrapper = mount(SceneDetailView, {
      props: { scene: mockScene },
    });
    const backBtn = wrapper.find('.back-button');
    await backBtn.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });
});

describe('SettingsView', () => {
  it('renders settings header', () => {
    const wrapper = mount(SettingsView);
    expect(wrapper.find('h1').text()).toContain('设置');
  });

  it('renders API key inputs', () => {
    const wrapper = mount(SettingsView);
    expect(wrapper.text()).toContain('OpenAI');
    expect(wrapper.text()).toContain('DeepSeek');
    expect(wrapper.text()).toContain('Gemini');
  });

  it('renders save button', () => {
    const wrapper = mount(SettingsView);
    const btn = wrapper.find('#save-settings-button');
    expect(btn.exists()).toBe(true);
    expect(btn.text()).toContain('保存设置');
  });

  it('emits back event when back button clicked', async () => {
    const wrapper = mount(SettingsView);
    const backBtn = wrapper.find('.back-button');
    await backBtn.trigger('click');
    expect(wrapper.emitted('back')).toBeTruthy();
  });
});

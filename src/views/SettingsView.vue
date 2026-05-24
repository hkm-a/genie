<template>
  <div class="settings-view" id="settings-page">
    <div class="settings-header">
      <button class="back-button" @click="$emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
      <h1>设置</h1>
    </div>

    <div class="settings-content">
      <div class="settings-section">
        <h2 class="section-title">API Key 配置</h2>
        <p class="section-desc">配置 AI 服务的 API Key，数据仅保存在本地</p>

        <div class="api-key-inputs">
          <div class="api-key-input-group">
            <label class="input-label">OpenAI</label>
            <input 
              id="api-key-input"
              type="password"
              v-model="apiKeys.openai"
              placeholder="sk-..."
              class="input-field"
            >
          </div>
          <div class="api-key-input-group">
            <label class="input-label">DeepSeek</label>
            <input 
              type="password"
              v-model="apiKeys.deepseek"
              placeholder="sk-..."
              class="input-field"
            >
          </div>
          <div class="api-key-input-group">
            <label class="input-label">Gemini</label>
            <input 
              type="password"
              v-model="apiKeys.gemini"
              placeholder="Enter Gemini API Key..."
              class="input-field"
            >
          </div>
        </div>

        <button 
          id="save-settings-button"
          class="save-button" 
          @click="saveSettings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          保存设置
        </button>
      </div>

      <div class="settings-section">
        <h2 class="section-title">关于 Genie</h2>
        <p class="section-desc">AI Prompt Studio - 让创作更简单</p>
        <div class="about-content">
          <div class="logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <div class="logo-text">Genie</div>
              <div class="logo-subtitle">AI Prompt Studio</div>
            </div>
          </div>
          <p class="version">Version 1.0.0</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { saveApiKey, getApiKeys } from '../api';

const emit = defineEmits<{
  back: [];
}>();

const apiKeys = reactive({
  openai: '',
  deepseek: '',
  gemini: '',
});

onMounted(async () => {
  try {
    const savedKeys = await getApiKeys();
    savedKeys.forEach(item => {
      if (item.provider in apiKeys) {
        (apiKeys as any)[item.provider] = item.apiKey;
      }
    });
  } catch (e) {
    console.error('Load settings failed:', e);
  }
});

async function saveSettings() {
  try {
    for (const [provider, key] of Object.entries(apiKeys)) {
      await saveApiKey(provider, key);
    }
    alert('设置已保存');
  } catch (e) {
    console.error('Save failed:', e);
    alert('保存失败');
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  position: relative;
  z-index: 1;
}

.settings-header {
  margin-bottom: 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.back-button:hover {
  background: var(--color-bg-card);
  border-color: var(--color-border-light);
  color: var(--color-text);
}

.settings-header h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-desc {
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
  font-size: 0.9375rem;
}

.api-key-inputs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.api-key-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}

.about-content {
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
  animation: glow 3s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 45px rgba(139, 92, 246, 0.6); }
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
  text-align: left;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-align: left;
}

.version {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
</style>

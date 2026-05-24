<template>
  <div class="scene-detail-view" id="scene-detail">
    <div class="detail-header">
      <button class="back-button" @click="$emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回
      </button>
    </div>

    <div class="detail-content">
      <div class="scene-info">
        <div class="scene-type-badge" :class="scene.type">
          {{ scene.type === 'text' ? '文本场景' : '图像场景' }}
        </div>
        <h1 class="scene-name">{{ scene.name_zh }}</h1>
        <p class="scene-name-en">{{ scene.name }}</p>
        <p class="scene-desc">{{ scene.description }}</p>
        <div class="scene-tags">
          <span v-for="tag in scene.tags" :key="tag" class="scene-tag">{{ tag }}</span>
        </div>
      </div>

      <div class="variable-inputs">
        <h2 class="section-title">输入变量</h2>
        <div v-for="variable in scene.variables" :key="variable.name" class="variable-input">
          <label :for="variable.name" class="variable-label">
            {{ variable.label_zh }}
            <span v-if="variable.required" class="required">*</span>
          </label>
          <input 
            v-if="variable.type === 'text'"
            :id="variable.name"
            type="text"
            v-model="variables[variable.name]"
            :placeholder="variable.placeholder"
            class="input-field"
          >
          <select 
            v-else-if="variable.type === 'select'"
            :id="variable.name"
            v-model="variables[variable.name]"
            class="select-field"
          >
            <option value="">请选择...</option>
            <option v-for="opt in variable.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <button 
          id="generate-button"
          class="generate-button" 
          @click="generateResult"
          :disabled="isGenerating"
        >
          <span v-if="isGenerating">
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            生成中...
          </span>
          <span v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            开始生成
          </span>
        </button>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <h2 class="section-title">生成结果</h2>
      <div class="result-card">
        <div v-if="result.type === 'text'" class="text-result">
          <pre>{{ result.content }}</pre>
        </div>
        <img v-else-if="result.type === 'image' && result.image_url" :src="result.image_url" alt="Generated Image" class="image-result">
      </div>

      <details class="optimized-prompt-section">
        <summary>查看优化后的提示词</summary>
        <div class="optimized-prompt">
          <pre>{{ optimizedPrompt }}</pre>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Scene } from '../types';
import { runScene } from '../api';

const props = defineProps<{
  scene: Scene;
}>();

const emit = defineEmits<{
  back: [];
}>();

const variables = reactive<Record<string, string>>({});
const isGenerating = ref(false);
const result = ref<any>(null);
const optimizedPrompt = ref('');

async function generateResult() {
  const missingRequired = props.scene.variables
    .filter(v => v.required)
    .find(v => !variables[v.name]);

  if (missingRequired) {
    alert(`请填写必填项：${missingRequired.label_zh}`);
    return;
  }

  isGenerating.value = true;
  result.value = null;

  try {
    const response = await runScene(props.scene.id, variables);
    if (response.success) {
      result.value = response.result;
      optimizedPrompt.value = response.optimized_prompt;
    }
  } catch (e) {
    console.error('Generate failed:', e);
    alert('生成失败，请检查 API Key 配置');
  } finally {
    isGenerating.value = false;
  }
}
</script>

<style scoped>
.scene-detail-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  position: relative;
  z-index: 1;
}

.detail-header {
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
}

.back-button:hover {
  background: var(--color-bg-card);
  border-color: var(--color-border-light);
  color: var(--color-text);
}

.detail-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.scene-info {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.scene-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: var(--color-bg);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.scene-type-badge.text {
  color: var(--color-secondary);
}

.scene-type-badge.image {
  color: var(--color-primary);
}

.scene-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.scene-name-en {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.scene-desc {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.scene-tag {
  padding: 0.25rem 0.625rem;
  background: var(--color-bg);
  border-radius: 100px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.variable-inputs {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.variable-input {
  margin-bottom: 1.5rem;
}

.variable-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.variable-label .required {
  color: var(--color-accent);
}

.input-field,
.select-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.select-field {
  cursor: pointer;
}

.generate-button {
  width: 100%;
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

.generate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.result-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
}

.result-card {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.text-result pre {
  font-family: 'Noto Sans SC', sans-serif;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.8;
  color: var(--color-text);
}

.image-result {
  width: 100%;
  border-radius: var(--radius-md);
}

.optimized-prompt-section {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
}

.optimized-prompt-section summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 0.75rem;
}

.optimized-prompt-section summary:hover {
  color: var(--color-text);
}

.optimized-prompt {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.optimized-prompt pre {
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 900px) {
  .detail-content {
    grid-template-columns: 1fr;
  }
}
</style>

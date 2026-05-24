<template>
  <div class="scene-list-view" id="scene-list">
    <div class="hero">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        <span>3 个精选场景 · 一句话，一个愿望</span>
      </div>
      <h1>一句话<br>一个愿望</h1>
      <p>精选高质量提示词模板，自动优化，即刻生成。支持图像与文本，让创作更简单。</p>
    </div>

    <div class="filters">
      <div class="filter-tabs" id="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: activeType === 'all' }" 
          @click="activeType = 'all'"
        >
          全部 <span class="count">{{ filteredScenes.length }}</span>
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeType === 'text' }" 
          @click="activeType = 'text'"
        >
          文本 <span class="count">{{ scenes.filter(s => s.type === 'text').length }}</span>
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: activeType === 'image' }" 
          @click="activeType = 'image'"
        >
          图像 <span class="count">{{ scenes.filter(s => s.type === 'image').length }}</span>
        </button>
      </div>
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input 
          id="search-input"
          type="text" 
          v-model="searchQuery"
          placeholder="搜索场景..."
        >
      </div>
    </div>

    <div class="category-scroll">
      <div class="categories">
        <button 
          class="category-chip" 
          :class="{ active: activeCategory === 'all' }" 
          @click="activeCategory = 'all'"
        >
          全部分类
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="category-chip" 
          :class="{ active: activeCategory === cat }" 
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <div class="scenes-grid">
      <div 
        v-for="scene in filteredScenes" 
        :key="scene.id"
        class="scene-card"
        @click="$emit('open-detail', scene)"
      >
        <div class="scene-preview">
          <div class="scene-type-badge" :class="scene.type">
            <svg v-if="scene.type === 'text'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {{ scene.type === 'text' ? '文本' : '图像' }}
          </div>
          <div class="scene-icon" :class="scene.type">
            <svg v-if="scene.type === 'text'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        </div>
        <div class="scene-body">
          <div class="scene-category">{{ scene.category_zh }}</div>
          <h3 class="scene-title">{{ scene.name_zh }}</h3>
          <p class="scene-title-en">{{ scene.name }}</p>
          <p class="scene-desc">{{ scene.description }}</p>
          <div class="scene-tags">
            <span v-for="tag in scene.tags" :key="tag" class="scene-tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredScenes.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
        <path d="M8 8l6 6M14 8l-6 6"/>
      </svg>
      <h3>没有找到匹配的场景</h3>
      <p>尝试调整筛选条件或搜索词</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Scene } from '../types';
import { getScenes } from '../api';

const scenes = ref<Scene[]>([]);
const activeType = ref<'all' | 'text' | 'image'>('all');
const activeCategory = ref<string>('all');
const searchQuery = ref('');

const categories = computed(() => {
  const cats = new Set<string>();
  scenes.value.forEach(s => cats.add(s.category_zh));
  return Array.from(cats);
});

const filteredScenes = computed(() => {
  return scenes.value.filter(scene => {
    const matchType = activeType.value === 'all' || scene.type === activeType.value;
    const matchCategory = activeCategory.value === 'all' || scene.category_zh === activeCategory.value;
    const matchSearch = !searchQuery.value || 
      scene.name_zh.includes(searchQuery.value) ||
      scene.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      scene.description.includes(searchQuery.value);
    return matchType && matchCategory && matchSearch;
  });
});

onMounted(async () => {
  try {
    scenes.value = await getScenes();
  } catch (e) {
    console.error('Failed to load scenes:', e);
  }
});

defineEmits<{
  openDetail: [scene: Scene];
}>();
</script>

<style scoped>
.scene-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
}

.hero {
  text-align: center;
  padding: 2rem 0 3rem;
  animation: fadeIn 0.8s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 1.5rem;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}

.hero h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -0.04em;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary-light) 50%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto 2rem;
}

.filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
  border: 1px solid var(--color-border);
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  color: var(--color-text);
}

.filter-tab.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
}

.filter-tab .count {
  margin-left: 0.375rem;
  opacity: 0.6;
  font-size: 0.75rem;
}

.search-box {
  flex: 1;
  max-width: 300px;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: 0.9375rem;
  background: var(--color-bg-card);
  color: var(--color-text);
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-box input::placeholder {
  color: var(--color-text-muted);
}

.search-box svg {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
}

.category-scroll {
  overflow-x: auto;
  margin: 0 -1.5rem 2rem;
  padding: 0 1.5rem 1rem;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  height: 0;
}

.categories {
  display: flex;
  gap: 0.5rem;
}

.category-chip {
  flex-shrink: 0;
  padding: 0.375rem 0.875rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.category-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.scenes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.scene-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease both;
}

.scene-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow), var(--shadow-card);
}

.scene-preview {
  height: 140px;
  background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-card) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.scene-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 60%);
}

.scene-icon {
  width: 56px;
  height: 56px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.scene-card:hover .scene-icon {
  background: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.scene-icon svg {
  width: 28px;
  height: 28px;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
}

.scene-card:hover .scene-icon svg {
  color: white;
}

.scene-icon.text svg {
  color: var(--color-secondary);
}

.scene-card:hover .scene-icon.text svg {
  color: white;
}

.scene-type-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.625rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 100px;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.scene-type-badge.text {
  color: var(--color-secondary);
}

.scene-body {
  padding: 1rem;
}

.scene-category {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.375rem;
}

.scene-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.scene-title-en {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.scene-desc {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scene-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.scene-tag {
  padding: 0.2rem 0.5rem;
  background: var(--color-bg);
  border-radius: 100px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state svg {
  width: 64px;
  height: 64px;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5rem;
  }

  .scenes-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-tabs {
    order: -1;
  }

  .search-box {
    max-width: none;
  }
}
</style>

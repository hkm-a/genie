<template>
  <div class="app-container">
    <div class="bg-effects">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
    </div>

    <Navbar @navigate="currentView = $event" />

    <main class="main-content">
      <SceneListView 
        v-if="currentView === 'scenes'" 
        @open-detail="selectedScene = $event; currentView = 'detail'" 
      />
      <SceneDetailView 
        v-else-if="currentView === 'detail' && selectedScene" 
        :scene="selectedScene" 
        @back="currentView = 'scenes'" 
      />
      <SettingsView 
        v-else-if="currentView === 'settings'" 
        @back="currentView = 'scenes'" 
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Navbar from './components/Navbar.vue';
import SceneListView from './views/SceneListView.vue';
import SceneDetailView from './views/SceneDetailView.vue';
import SettingsView from './views/SettingsView.vue';

const currentView = ref<'scenes' | 'detail' | 'settings'>('scenes');
const selectedScene = ref<any>(null);
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
}
</style>

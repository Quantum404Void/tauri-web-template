<template>
  <div class="home-page">
    <!-- Hero -->
    <n-card class="hero-card" :bordered="false" :style="{ background: heroGradient }">
      <div class="hero-inner">
        <img src="@/assets/images/logo.png" alt="logo" class="hero-logo" />
        <div class="hero-text">
          <h1 class="hero-title" :style="{ backgroundImage: heroTitleGradient }">
            {{ t('home.title') }}
          </h1>
          <p class="hero-subtitle">{{ t('home.subtitle') }}</p>
          <n-space>
            <n-button type="primary" size="large" @click="$router.push({ name: 'file' })">
              {{ t('home.startBtn') }}
            </n-button>
            <n-button size="large" tag="a" href="https://tauri.app" target="_blank">
              {{ t('home.docsBtn') }}
            </n-button>
          </n-space>
        </div>
      </div>
    </n-card>

    <!-- Feature Grid -->
    <n-grid
      :cols="3"
      :x-gap="16"
      :y-gap="16"
      class="feature-grid"
      responsive="screen"
      :item-responsive="true"
    >
      <n-grid-item v-for="(feat, i) in features" :key="i" span="3 m:1">
        <n-card hoverable size="small">
          <template #header>
            <n-space align="center">
              <n-icon size="20" :color="feat.color">
                <component :is="feat.icon" />
              </n-icon>
              <span>{{ feat.label }}</span>
            </n-space>
          </template>
          <p class="feat-desc">{{ feat.desc }}</p>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- Version badge -->
    <div class="version-row">
      <n-tag type="default" size="small"> {{ t('home.version') }} {{ appVersion }} </n-tag>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useAppStore } from '@/stores/app'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import IconDatabase from '~icons/mdi/database-outline'
import IconFileLock from '~icons/mdi/file-lock-outline'
import IconPuzzle from '~icons/mdi/puzzle-outline'
import IconTranslate from '~icons/mdi/translate'
import IconUpdate from '~icons/mdi/update'
import IconVue from '~icons/mdi/vuejs'

const { t } = useI18n()
const appStore = useAppStore()
const { api } = usePlatform()

const appVersion = ref(__APP_VERSION__)

onMounted(async () => {
  try {
    const v = await api.getAppVersion()
    if (v) appVersion.value = v
  } catch {
    // Web mode or app plugin unavailable: use __APP_VERSION__ from define
  }
})

const heroGradient = computed(() =>
  appStore.isDark
    ? 'linear-gradient(135deg, rgba(15,52,96,0.45), rgba(83,52,131,0.35))'
    : 'linear-gradient(135deg, rgba(200,225,255,0.55), rgba(220,200,255,0.40))'
)

const heroTitleGradient = computed(() =>
  appStore.isDark
    ? 'linear-gradient(135deg, #fff, #a0c4ff)'
    : 'linear-gradient(135deg, #1a1a2e, #4a6fa5)'
)

const features = computed(() => [
  { icon: IconVue, color: '#42b883', label: 'Tauri + Vite + Vue', desc: t('home.feature1') },
  { icon: IconPuzzle, color: '#7ec8e3', label: 'Naive UI', desc: t('home.feature2') },
  { icon: IconTranslate, color: '#f5a623', label: 'i18n', desc: t('home.feature3') },
  { icon: IconUpdate, color: '#7ed321', label: 'Auto Update', desc: t('home.feature4') },
  { icon: IconFileLock, color: '#e94560', label: 'File & Crypto', desc: t('home.feature5') },
  { icon: IconDatabase, color: '#bd10e0', label: 'Pinia Persist', desc: t('home.feature6') }
])
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.hero-card {
  border: 1px solid rgba(128, 128, 128, 0.12) !important;
  transition: background 0.3s ease;
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 8px 0;

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

.hero-logo {
  width: 96px;
  height: 96px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #fff, #a0c4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  font-size: 16px;
  opacity: 0.7;
}

.feature-grid {
  width: 100%;
}

.feat-desc {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.6;
}

.version-row {
  text-align: center;
  opacity: 0.5;
}
</style>

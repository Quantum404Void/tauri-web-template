<template>
  <div class="page">
    <n-card :title="t('about.title')">
      <n-space vertical size="large" align="center" style="text-align: center; padding: 8px 0">
        <!-- Logo -->
        <img src="@/assets/images/logo.png" alt="logo" class="about-logo" />
        <div>
          <n-text style="font-size: 22px; font-weight: 700">{{ t('about.name') }}</n-text>
          <br />
          <n-text depth="3" style="font-size: 13px">
            {{ t('about.version') }} {{ appVersion }}
          </n-text>
        </div>
        <n-text depth="2" style="max-width: 480px; line-height: 1.7">
          {{ t('about.desc') }}
        </n-text>
      </n-space>

      <n-divider />

      <!-- 技术栈 -->
      <n-space vertical>
        <n-text strong>{{ t('about.stack') }}</n-text>
        <n-space wrap>
          <n-tag
            v-for="s in stack"
            :key="s.label"
            :color="{ color: s.bg, textColor: '#fff', borderColor: 'transparent' }"
          >
            {{ s.label }}
          </n-tag>
        </n-space>
      </n-space>

      <n-divider />

      <!-- 链接 -->
      <n-space vertical>
        <n-text strong>{{ t('about.links') }}</n-text>
        <n-space wrap>
          <n-button
            v-for="l in links"
            :key="l.label"
            text
            tag="a"
            :href="l.url"
            target="_blank"
            type="primary"
          >
            <template #icon
              ><n-icon><icon-mdi-open-in-new /></n-icon
            ></template>
            {{ l.label }}
          </n-button>
        </n-space>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { onMounted, ref, version as vueVer } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { tauriVersion, api } = usePlatform()

const appVersion = ref(__APP_VERSION__)

onMounted(async () => {
  const v = await api.getAppVersion()
  if (v) appVersion.value = v
})

const stack = [
  { label: `Tauri ${tauriVersion.value || '2'}`, bg: '#ffae00' },
  { label: `Vue ${vueVer}`, bg: '#42b883' },
  { label: `Vite ${__APP_VITE__}`, bg: '#bd34fe' },
  { label: `TypeScript ${__APP_TS__}`, bg: '#3178c6' },
  { label: 'Naive UI', bg: '#18a058' },
  { label: 'Pinia', bg: '#f7b93e' },
  { label: 'vue-i18n', bg: '#e94560' },
  { label: 'Rust', bg: '#dea584' }
]

const links = [
  { label: t('about.tauri'), url: 'https://tauri.app' },
  { label: t('about.vite'), url: 'https://vitejs.dev' },
  { label: t('about.vue'), url: 'https://vuejs.org' },
  { label: t('about.naiveui'), url: 'https://www.naiveui.com' }
]
</script>

<style lang="scss" scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
}

.about-logo {
  width: 88px;
  height: 88px;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}
</style>

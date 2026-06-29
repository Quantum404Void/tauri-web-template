<template>
  <n-config-provider :theme="naiveTheme" :locale="locale" :date-locale="dateLocale">
    <n-message-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <DefaultLayout />
        </n-dialog-provider>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useTheme } from '@/composables/useTheme'
import { setI18nLanguage } from '@/i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAppStore } from '@/stores/app'
import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import { computed, onMounted, onUnmounted, watch } from 'vue'

const appStore = useAppStore()
const { naiveTheme } = useTheme()
const { startThemeSync, stopThemeSync, api } = usePlatform()

const locale = computed(() => (appStore.lang === 'zh' ? zhCN : enUS))
const dateLocale = computed(() => (appStore.lang === 'zh' ? dateZhCN : dateEnUS))

// 语言切换：同步 i18n + 后端 + document
watch(
  () => appStore.lang,
  (l) => {
    setI18nLanguage(l)
    api.setLocale(l)
  },
  { immediate: true }
)

// 主题切换：同步后端
watch(
  () => appStore.theme,
  (theme) => {
    api.setTheme(theme)
  },
  { immediate: true }
)

// OS 主题同步（单例：仅在 App 根组件注册一次）
onMounted(() => {
  startThemeSync((dark) => {
    appStore.setActualDark(dark)
  })
})

onUnmounted(() => {
  stopThemeSync()
})
</script>

<template>
  <div class="page">
    <n-card :title="t('system.title')">
      <n-space vertical size="large">
        <!-- 外观 -->
        <n-form label-placement="left" :label-width="140">
          <n-form-item :label="t('system.theme')">
            <n-radio-group v-model:value="appStore.theme">
              <n-radio-button value="dark">
                <n-space align="center" :size="4">
                  <n-icon><icon-svg-dark /></n-icon>
                  {{ t('system.darkTheme') }}
                </n-space>
              </n-radio-button>
              <n-radio-button value="light">
                <n-space align="center" :size="4">
                  <n-icon><icon-svg-light /></n-icon>
                  {{ t('system.lightTheme') }}
                </n-space>
              </n-radio-button>
              <n-radio-button value="system">
                <n-space align="center" :size="4">
                  <n-icon><icon-mdi-brightness-auto /></n-icon>
                  {{ t('system.systemTheme') }}
                </n-space>
              </n-radio-button>
            </n-radio-group>
          </n-form-item>

          <n-form-item :label="t('system.language')">
            <n-radio-group v-model:value="appStore.lang">
              <n-radio-button value="zh">中文</n-radio-button>
              <n-radio-button value="en">English</n-radio-button>
            </n-radio-group>
          </n-form-item>
        </n-form>

        <n-divider />

        <!-- Tauri 专属设置 -->
        <template v-if="platform === 'tauri'">
          <n-form label-placement="left" :label-width="140">
            <n-form-item :label="t('system.autoLaunch')">
              <n-switch
                v-model:value="appStore.autoLaunch"
                @update:value="applyAutoLaunch"
                :loading="autoLaunchLoading"
              />
            </n-form-item>
            <n-form-item :label="t('system.closeToTray')">
              <n-switch
                v-model:value="appStore.closeToTray"
                @update:value="applyCloseToTray"
                :loading="trayLoading"
              />
            </n-form-item>
          </n-form>
        </template>
        <template v-else>
          <n-alert type="info">{{ t('system.tauriOnly') }}</n-alert>
        </template>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useAppStore } from '@/stores/app'
import { useMessage } from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()
const { platform, api } = usePlatform()

const autoLaunchLoading = ref(false)
const trayLoading = ref(false)

onMounted(async () => {
  if (platform !== 'tauri') return
  try {
    // Read persisted values from Rust backend (which loaded from store file)
    appStore.setAutoLaunch(await api.getAutoLaunchStatus())
    appStore.setCloseToTray(await api.getCloseToTray())
  } catch (e) {
    console.warn('[SystemView] Failed to load settings:', e)
  }
})

async function applyAutoLaunch(val: boolean) {
  autoLaunchLoading.value = true
  try {
    await api.setAutoLaunch(val)
    appStore.setAutoLaunch(val)
    message.success(t('system.applySuccess'))
  } catch (e: unknown) {
    message.error(t('system.applyFailed', { msg: (e as Error)?.message }))
    appStore.setAutoLaunch(!val)
  } finally {
    autoLaunchLoading.value = false
  }
}

async function applyCloseToTray(val: boolean) {
  trayLoading.value = true
  try {
    await api.setCloseToTray(val)
    appStore.setCloseToTray(val)
    message.success(t('system.applySuccess'))
  } catch (e: unknown) {
    message.error(t('system.applyFailed', { msg: (e as Error)?.message }))
    appStore.setCloseToTray(!val)
  } finally {
    trayLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
}
</style>

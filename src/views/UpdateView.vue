<template>
  <div class="page">
    <n-card :title="t('update.title')">
      <template v-if="platform === 'tauri'">
        <n-space vertical size="large">
          <!-- 状态显示 -->
          <n-card size="small" embedded>
            <n-space align="center">
              <n-spin
                v-if="
                  appStore.updateStatus === 'checking' || appStore.updateStatus === 'downloading'
                "
                size="small"
              />
              <n-icon
                v-else-if="
                  appStore.updateStatus === 'available' || appStore.updateStatus === 'ready'
                "
                size="20"
                color="#27ae60"
              >
                <icon-mdi-check-circle-outline />
              </n-icon>
              <n-icon v-else size="20" color="#7ec8e3">
                <icon-mdi-information-outline />
              </n-icon>
              <n-text>{{ statusText }}</n-text>
            </n-space>

            <n-progress
              v-if="appStore.updateStatus === 'downloading'"
              type="line"
              :percentage="appStore.downloadProgress"
              :indicator-placement="'inside'"
              style="margin-top: 12px"
            />
          </n-card>

          <!-- 操作按钮 -->
          <n-space>
            <n-button
              type="primary"
              :loading="appStore.updateStatus === 'checking'"
              :disabled="appStore.updateStatus === 'downloading'"
              @click="checkUpdate"
            >
              <template #icon
                ><n-icon><icon-mdi-refresh /></n-icon
              ></template>
              {{ t('update.checkBtn') }}
            </n-button>
            <n-button
              v-if="appStore.updateStatus === 'available'"
              type="success"
              :loading="isDownloading"
              @click="downloadUpdate"
            >
              <template #icon
                ><n-icon><icon-mdi-download-outline /></n-icon
              ></template>
              {{ t('update.downloadBtn') }}
            </n-button>
            <n-button
              v-if="appStore.updateStatus === 'ready'"
              type="warning"
              @click="installUpdate"
            >
              <template #icon
                ><n-icon><icon-mdi-restart /></n-icon
              ></template>
              {{ t('update.installBtn') }}
            </n-button>
          </n-space>
        </n-space>
      </template>
      <n-alert v-else type="info">{{ t('update.tauriOnly') }}</n-alert>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useAppStore } from '@/stores/app'
import { useMessage } from 'naive-ui'
import { computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = useMessage()
const appStore = useAppStore()
const { platform, api } = usePlatform()

const statusText = computed(() => {
  const s = appStore.updateStatus
  if (s === 'idle') return t('update.status.idle')
  if (s === 'checking') return t('update.status.checking')
  if (s === 'available') return t('update.status.available', { ver: appStore.updateVersion })
  if (s === 'downloading')
    return t('update.status.downloading', { progress: appStore.downloadProgress })
  if (s === 'ready') return t('update.status.ready')
  return ''
})

const isDownloading = computed(() => appStore.updateStatus === 'downloading')

const unsubs: Array<(() => void) | undefined> = []

onMounted(() => {
  if (platform !== 'tauri') return

  unsubs.push(
    api.onUpdateAvailable((info) => {
      appStore.setUpdateStatus('available', info.version)
      message.info(t('update.status.available', { ver: info.version }))
    }),
    api.onDownloadProgress((progress) => {
      appStore.setDownloadProgress(progress.percent)
    }),
    api.onUpdateDownloaded(() => {
      appStore.setUpdateStatus('ready')
      message.success(t('update.status.ready'))
    }),
    api.onUpdateNotAvailable(() => {
      appStore.setUpdateStatus('idle')
      message.info(t('update.status.idle'))
    }),
    api.onUpdateError((msg) => {
      appStore.setUpdateStatus('idle')
      message.error(t('update.error', { msg }))
    })
  )
})

onUnmounted(() => unsubs.forEach((fn) => fn?.()))

function checkUpdate() {
  appStore.setUpdateStatus('checking')
  api.checkUpdate()
}

async function downloadUpdate() {
  appStore.setUpdateStatus('downloading')
  await api.downloadUpdate()
}

function installUpdate() {
  api.installUpdate()
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
}
</style>

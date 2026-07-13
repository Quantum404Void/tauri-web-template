<template>
  <div class="page">
    <n-card :title="t('file.title')">
      <n-space vertical size="large">
        <n-button type="primary" :loading="loading" @click="doOpenFile">
          <template #icon
            ><n-icon><icon-mdi-folder-open-outline /></n-icon
          ></template>
          {{ t('file.openFile') }}
        </n-button>

        <OpenFileViewer
          v-if="openedFile"
          class-name="file-viewer"
          :file="openedFile"
          :file-name="openedFile.name"
          width="100%"
          height="420px"
          fit="contain"
          :toolbar="viewerToolbar"
          :theme="viewerTheme"
          :locale="appStore.lang === 'zh' ? 'zh-CN' : 'en-US'"
          :plugins="viewerPlugins"
        />
        <n-empty v-else :description="t('file.empty')" />
        <n-alert v-if="result" :type="resultType === 'default' ? 'info' : resultType">
          {{ result }}
        </n-alert>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useAppStore } from '@/stores/app'
import { openFile, saveFile } from '@/utils/file'
import {
  archivePlugin,
  fallbackPlugin,
  imagePlugin,
  officePlugin,
  pdfPlugin,
  textPlugin
} from '@open-file-viewer/core'
import '@open-file-viewer/core/style.css'
import { OpenFileViewer } from '@open-file-viewer/vue'
// oxlint-disable-next-line import/default -- Vite provides the default URL export for ?url imports.
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { platform, api } = usePlatform()
const appStore = useAppStore()

const result = ref('')
const resultType = ref<'default' | 'success' | 'error'>('default')
const loading = ref(false)
const openedFile = shallowRef<File>()
const viewerTheme = computed(() => (appStore.isDark ? 'dark' : 'light'))
const viewerToolbar = computed(() => {
  const zh = appStore.lang === 'zh'
  return {
    zoom: true,
    rotate: true,
    download: false,
    fullscreen: true,
    print: true,
    search: true,
    order: [
      'zoom-out',
      'zoom-in',
      'zoom-reset',
      'rotate-right',
      'search',
      'save-file',
      'print',
      'fullscreen'
    ],
    labels: zh
      ? {
          'zoom-out': '缩小',
          'zoom-in': '放大',
          'zoom-reset': '原始大小',
          'rotate-right': '旋转',
          search: '搜索',
          'save-file': '下载',
          print: '打印',
          fullscreen: '全屏'
        }
      : { 'save-file': 'Download' },
    actions: [
      {
        id: 'save-file',
        label: zh ? '下载' : 'Download',
        title: zh ? '保存当前文件' : 'Save current file',
        disabled: () => loading.value,
        onClick: () => void downloadOpenedFile()
      }
    ]
  }
})
const viewerPlugins = [
  imagePlugin(),
  pdfPlugin({ workerSrc: pdfWorkerSrc }),
  officePlugin(),
  archivePlugin(),
  textPlugin(),
  fallbackPlugin()
]

function setResult(text: string, type: typeof resultType.value = 'default') {
  result.value = text
  resultType.value = type
}

async function wrap(fn: () => Promise<void>) {
  loading.value = true
  try {
    await fn()
  } catch (e: unknown) {
    const canceled = (e as { name?: string })?.name === 'AbortError'
    setResult(
      canceled ? t('file.canceled') : t('file.failed', { msg: (e as Error)?.message }),
      canceled ? 'default' : 'error'
    )
  } finally {
    loading.value = false
  }
}

function downloadOpenedFile() {
  wrap(async () => {
    const file = openedFile.value
    if (!file) return
    await saveFile(file, { fileName: file.name }, api)
    setResult(t('file.saved'), 'success')
  })
}

function doOpenFile() {
  wrap(async () => {
    // Tauri 环境用原生对话框 + fs 插件读文件
    if (platform === 'tauri') {
      const res = await api.openFileDialog({
        filters: [
          { name: 'Text / JSON', extensions: ['txt', 'json', 'md', 'csv', 'log'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })
      if (res.canceled || !res.filePaths[0]) {
        setResult(t('file.canceled'))
        return
      }
      const filePath = res.filePaths[0]
      const fileName = filePath.split(/[\\/]/).pop() ?? filePath
      const bytes = await api.readFileBytes(filePath)
      openedFile.value = new File([Uint8Array.from(bytes).buffer], fileName)
      setResult(t('file.opened', { name: fileName, size: bytes.length }), 'success')
      return
    }

    // Web 环境用 input[type=file]
    const picked = await openFile()
    if (!picked) {
      setResult(t('file.canceled'))
      return
    }
    const file = Array.isArray(picked) ? picked[0] : picked
    openedFile.value = file
    setResult(t('file.opened', { name: file.name, size: file.size }), 'success')
  })
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
}

:deep(.file-viewer) {
  --ofv-bg: var(--n-color);
  --ofv-surface: var(--n-color-modal);
  --ofv-surface-muted: var(--n-color-embedded);
  --ofv-border: var(--n-border-color);
  --ofv-text: var(--n-text-color);
  --ofv-text-muted: var(--n-text-color-3);
  --ofv-accent: var(--n-color-target);
  --ofv-button-hover: var(--n-color-hover);
  --ofv-highlight: color-mix(in srgb, var(--n-color-target) 18%, transparent);
  --ofv-shadow: var(--n-box-shadow-1);

  overflow: hidden;
  border-radius: var(--n-border-radius);
}

:deep(.file-viewer .ofv-toolbar) {
  gap: 8px;
  padding: 10px;
}

:deep(.file-viewer .ofv-toolbar button) {
  min-width: 36px;
  min-height: 36px;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;
}

:deep(.file-viewer .ofv-toolbar button:active:not(:disabled)) {
  background: color-mix(in srgb, var(--n-color-target) 24%, transparent);
}

:deep(.file-viewer .ofv-toolbar button:focus-visible),
:deep(.file-viewer .ofv-toolbar input:focus-visible) {
  outline-color: var(--n-color-target);
}

@media (max-width: 640px) {
  :deep(.file-viewer .ofv-toolbar-label) {
    display: none;
  }

  :deep(.file-viewer .ofv-toolbar-search) {
    order: 10;
    flex-basis: 100%;
  }
}
</style>

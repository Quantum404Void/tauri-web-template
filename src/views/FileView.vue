<template>
  <div class="page">
    <n-card :title="t('file.title')">
      <n-space vertical size="large">
        <n-tabs v-model:value="activeTab" type="segment" animated>
          <n-tab-pane name="edit" :tab="t('file.editTab')" />
          <n-tab-pane name="preview" :tab="t('file.previewTab')" />
        </n-tabs>

        <n-form-item v-if="activeTab === 'edit'" :label="t('file.content')">
          <n-input
            v-model:value="content"
            type="textarea"
            :rows="6"
            :placeholder="t('file.placeholder')"
          />
        </n-form-item>
        <OpenFileViewer
          v-else
          class="file-viewer"
          :file="previewFile"
          :file-name="previewFile.name"
          width="100%"
          height="420px"
          fit="contain"
          toolbar
          :theme="viewerTheme"
          :plugins="viewerPlugins"
        />

        <n-space wrap>
          <n-button type="primary" :loading="loading" @click="doSaveText">
            <template #icon
              ><n-icon><icon-mdi-file-document-outline /></n-icon
            ></template>
            {{ t('file.saveText') }}
          </n-button>
          <n-button :loading="loading" @click="doSaveJson">
            <template #icon
              ><n-icon><icon-mdi-code-json /></n-icon
            ></template>
            {{ t('file.saveJson') }}
          </n-button>
          <n-button :loading="loading" @click="doSaveZip">
            <template #icon
              ><n-icon><icon-mdi-zip-box-outline /></n-icon
            ></template>
            {{ t('file.saveZip') }}
          </n-button>
          <n-button secondary :loading="loading" @click="doOpenFile">
            <template #icon
              ><n-icon><icon-mdi-folder-open-outline /></n-icon
            ></template>
            {{ t('file.openFile') }}
          </n-button>
        </n-space>

        <n-card size="small" embedded>
          <template #header>
            <n-space align="center">
              <n-icon><icon-mdi-text-box-outline /></n-icon>
              {{ t('file.result') }}
            </n-space>
          </template>
          <n-text
            :type="resultType"
            style="font-family: monospace; white-space: pre-wrap; font-size: 13px"
          >
            {{ result || t('file.noResult') }}
          </n-text>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import { usePlatform } from '@/composables/usePlatform'
import { useAppStore } from '@/stores/app'
import { FILE_TYPES, openFile, saveFile, saveZip } from '@/utils/file'
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
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { platform, api } = usePlatform()
const appStore = useAppStore()

const content = ref('Hello, Tauri + Vue3!\n这是一个模板文件。')
const result = ref('')
const resultType = ref<'default' | 'success' | 'error'>('default')
const loading = ref(false)
const activeTab = ref('edit')
const openedFile = shallowRef<File>()
const previewFile = computed(
  () => openedFile.value ?? new File([content.value], 'preview.txt', { type: 'text/plain' })
)
const viewerTheme = computed(() => (appStore.isDark ? 'dark' : 'light'))
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

function doSaveText() {
  wrap(async () => {
    await saveFile(content.value, { fileName: 'output.txt', fileType: FILE_TYPES.TEXT }, api)
    setResult(t('file.saved'), 'success')
  })
}

function doSaveJson() {
  wrap(async () => {
    await saveFile(
      JSON.stringify({ content: content.value, timestamp: Date.now() }, null, 2),
      { fileName: 'output.json', fileType: FILE_TYPES.JSON },
      api
    )
    setResult(t('file.saved'), 'success')
  })
}

function doSaveZip() {
  wrap(async () => {
    await saveZip(
      [
        { name: 'readme.txt', data: content.value },
        { name: 'data.json', data: JSON.stringify({ content: content.value }) }
      ],
      'archive.zip',
      api
    )
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
      activeTab.value = 'preview'
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
    activeTab.value = 'preview'
    setResult(t('file.opened', { name: file.name, size: file.size }), 'success')
  })
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
}

.file-viewer {
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
</style>

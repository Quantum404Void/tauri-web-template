<template>
  <div v-if="visible" class="app-search-overlay" @click.self="emit('close')">
    <div class="app-search-modal">
      <div class="search-input-wrapper">
        <n-icon size="20" class="search-icon"><icon-mdi-magnify /></n-icon>
        <input
          ref="inputRef"
          v-model="query"
          class="search-input"
          :placeholder="t('search.placeholder')"
          @keydown="onKey"
        />
        <n-text depth="3" class="search-hint">ESC</n-text>
      </div>
      <div v-if="filtered.length" class="search-results">
        <div
          v-for="r in filtered"
          :key="r.key"
          :class="['search-item', { active: activeIdx === r.idx }]"
          @click="select(r)"
          @mouseenter="activeIdx = r.idx"
        >
          <n-icon size="18"><component :is="r.icon" /></n-icon>
          <span>{{ r.label }}</span>
          <n-text depth="3" class="search-route">{{ r.path }}</n-text>
        </div>
      </div>
      <div v-else-if="query" class="search-empty">
        <n-text depth="3">{{ t('search.noResult') }}</n-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NIcon, NText } from 'naive-ui'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import IconCog from '~icons/mdi/cog-outline'
import IconFile from '~icons/mdi/file-outline'
import IconHome from '~icons/mdi/home-outline'
import IconInfo from '~icons/mdi/information-outline'
import IconLock from '~icons/mdi/lock-outline'
import IconUpdate from '~icons/mdi/update'

import type { Component } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const router = useRouter()
const query = ref('')
const activeIdx = ref(0)
const inputRef = ref<HTMLInputElement>()

interface SearchItem {
  key: string
  label: string
  path: string
  icon: Component
  idx: number
}

const allItems: Omit<SearchItem, 'idx'>[] = [
  { key: 'home', label: 'nav.home', path: '/home', icon: IconHome },
  { key: 'file', label: 'nav.file', path: '/file', icon: IconFile },
  { key: 'crypto', label: 'nav.crypto', path: '/crypto', icon: IconLock },
  { key: 'system', label: 'nav.system', path: '/system', icon: IconCog },
  { key: 'update', label: 'nav.update', path: '/update', icon: IconUpdate },
  { key: 'about', label: 'nav.about', path: '/about', icon: IconInfo }
]

const filtered = computed(() =>
  allItems
    .filter((item) => {
      const q = query.value.toLowerCase()
      return (
        t(item.label).toLowerCase().includes(q) || item.key.includes(q) || item.path.includes(q)
      )
    })
    .map((item, i) => ({ ...item, idx: i, label: t(item.label) }))
)

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') return emit('close')
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, filtered.value.length - 1)
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, 0)
  }
  if (e.key === 'Enter' && filtered.value[activeIdx.value]) {
    select(filtered.value[activeIdx.value])
  }
}

function select(item: SearchItem) {
  router.push({ name: item.key })
  emit('close')
}

function onGlobalKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKey)
  nextTick(() => {
    query.value = ''
    activeIdx.value = 0
    inputRef.value?.focus()
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', onGlobalKey)
})
</script>

<style lang="scss" scoped>
.app-search-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  padding-top: 15vh;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  animation: search-fade-in 0.12s ease;
}

.app-search-modal {
  width: min(520px, 92vw);
  max-height: 360px;
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
  background: var(--n-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--n-border-color);
}

.search-icon {
  opacity: 0.4;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: var(--n-text-color);
  font-family: inherit;

  &::placeholder {
    color: var(--n-text-color-3);
  }
}

.search-hint {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--n-border-color);
}

.search-results {
  max-height: 260px;
  overflow-y: auto;
  padding: 6px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.1s;

  &.active,
  &:hover {
    background: var(--n-color-hover);
  }
}

.search-route {
  margin-left: auto;
  font-size: 12px;
  font-family: monospace;
}

.search-empty {
  padding: 32px;
  text-align: center;
}

@keyframes search-fade-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

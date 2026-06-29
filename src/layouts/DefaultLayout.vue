<template>
  <n-layout has-sider style="height: 100vh">
    <!-- 侧边栏 -->
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      :collapsed="sidebarCollapsed"
      :native-scrollbar="false"
      style="height: 100vh"
    >
      <!-- Logo -->
      <div class="sidebar-logo" @click="appStore.toggleSidebar()">
        <img src="@/assets/images/logo.png" alt="logo" class="logo-img" />
        <span v-if="!sidebarCollapsed" class="logo-text">Tauri Vue</span>
      </div>

      <!-- 导航菜单 -->
      <n-menu
        :collapsed="sidebarCollapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="currentRoute"
        @update:value="handleNav"
      />

      <!-- 底部工具栏 -->
      <div class="sidebar-bottom">
        <n-tooltip placement="right">
          <template #trigger>
            <n-button quaternary circle @click="cycleTheme">
              <template #icon>
                <n-icon>
                  <icon-svg-dark v-if="appStore.theme === 'dark'" />
                  <icon-svg-light v-else-if="appStore.theme === 'light'" />
                  <icon-mdi-brightness-auto v-else />
                </n-icon>
              </template>
            </n-button>
          </template>
          {{ themeTooltip }}
        </n-tooltip>

        <n-tooltip placement="right">
          <template #trigger>
            <n-button quaternary circle @click="switchLang">
              <template #icon>
                <n-icon><icon-mdi-translate /></n-icon>
              </template>
            </n-button>
          </template>
          {{ appStore.lang === 'zh' ? 'English' : '中文' }}
        </n-tooltip>
      </div>
    </n-layout-sider>

    <!-- 主区域 -->
    <n-layout>
      <!-- 顶部标题栏 -->
      <n-layout-header bordered class="app-header">
        <div class="header-left">
          <n-button quaternary circle size="small" @click="appStore.toggleSidebar()">
            <template #icon
              ><n-icon><icon-mdi-menu /></n-icon
            ></template>
          </n-button>
          <n-breadcrumb>
            <n-breadcrumb-item>{{ currentTitle }}</n-breadcrumb-item>
          </n-breadcrumb>
        </div>
        <div class="header-right">
          <n-button quaternary size="small" @click="showSearch = true">
            <template #icon
              ><n-icon><icon-mdi-magnify /></n-icon
            ></template>
            <span class="search-shortcut">Ctrl+K</span>
          </n-button>
          <n-tag v-if="tauriVer" size="small" type="info">Tauri {{ tauriVer }}</n-tag>
          <n-tag size="small" type="success">Vue {{ vueVer }}</n-tag>
        </div>
      </n-layout-header>

      <!-- 内容区 -->
      <n-layout-content :native-scrollbar="false" class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>

    <!-- 全局搜索弹窗 -->
    <AppSearch :visible="showSearch" @close="showSearch = false" />
  </n-layout>
</template>

<script lang="ts" setup>
import { useKeyboard } from '@/composables/useKeyboard'
import { usePlatform } from '@/composables/usePlatform'
import { useResponsive } from '@/composables/useResponsive'
import { useTheme } from '@/composables/useTheme'
import { useAppStore } from '@/stores/app'
import { NIcon } from 'naive-ui'
import { computed, h, ref, version as vueVer } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import IconCog from '~icons/mdi/cog-outline'
import IconFile from '~icons/mdi/file-outline'
import IconHome from '~icons/mdi/home-outline'
import IconInfo from '~icons/mdi/information-outline'
import IconLock from '~icons/mdi/lock-outline'
import IconUpdate from '~icons/mdi/update'

import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'

const { t } = useI18n()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()
const { cycleTheme } = useTheme()
const { isMobile } = useResponsive()
const { tauriVersion } = usePlatform()

const showSearch = ref(false)
const tauriVer = computed(() => tauriVersion.value)

const sidebarCollapsed = computed(() => isMobile() || appStore.sidebarCollapsed)

const currentRoute = computed(() => route.name as string)
const currentTitle = computed(() => (route.name ? t(`nav.${route.name as string}`) : ''))

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = computed<MenuOption[]>(() => [
  { label: t('nav.home'), key: 'home', icon: renderIcon(IconHome) },
  { label: t('nav.file'), key: 'file', icon: renderIcon(IconFile) },
  { label: t('nav.crypto'), key: 'crypto', icon: renderIcon(IconLock) },
  { label: t('nav.system'), key: 'system', icon: renderIcon(IconCog) },
  { label: t('nav.update'), key: 'update', icon: renderIcon(IconUpdate) },
  { label: t('nav.about'), key: 'about', icon: renderIcon(IconInfo) }
])

function handleNav(key: string) {
  router.push({ name: key })
}

function switchLang() {
  appStore.setLang(appStore.lang === 'zh' ? 'en' : 'zh')
}

const themeTooltip = computed(() => {
  if (appStore.theme === 'dark') return t('system.lightTheme')
  if (appStore.theme === 'light') return t('system.systemTheme')
  return t('system.darkTheme')
})

useKeyboard([
  {
    key: 'k',
    ctrl: true,
    handler: () => {
      showSearch.value = true
    },
    prevent: true
  },
  { key: 'b', ctrl: true, handler: () => appStore.toggleSidebar(), prevent: true }
])
</script>

<style lang="scss" scoped>
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid var(--n-border-color);
  min-height: 56px;

  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    color: var(--n-text-color);
  }
}

.sidebar-bottom {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.app-header {
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-shortcut {
  font-size: 11px;
  opacity: 0.45;
  margin-left: 4px;
}

.app-content {
  padding: 24px;
  height: calc(100vh - 56px);

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

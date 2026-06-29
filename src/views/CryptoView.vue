<template>
  <div class="page">
    <n-card :title="t('crypto.title')">
      <n-space vertical size="large">
        <n-grid :cols="2" :x-gap="16" responsive="screen" :item-responsive="true">
          <n-grid-item span="2 m:1">
            <n-form-item :label="t('crypto.inputLabel')">
              <n-input
                v-model:value="inputText"
                type="textarea"
                :rows="5"
                :placeholder="t('crypto.inputPlaceholder')"
              />
            </n-form-item>
          </n-grid-item>
          <n-grid-item span="2 m:1">
            <n-form-item :label="t('crypto.passwordLabel')">
              <n-input
                v-model:value="password"
                type="password"
                show-password-on="mousedown"
                :placeholder="t('crypto.passwordPlaceholder')"
                @input="onPasswordInput"
              />
              <template v-if="strength">
                <div class="strength-bar">
                  <div
                    :class="['strength-fill', strength.strength]"
                    :style="{ width: strength.score + '%' }"
                  />
                </div>
                <n-text :type="strengthType" style="font-size: 12px">
                  {{ t('crypto.strength') }}: {{ t('crypto.' + strength.strength) }}
                </n-text>
              </template>
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <n-space>
          <n-button type="primary" :loading="loading" @click="doEncrypt">
            <template #icon
              ><n-icon><icon-mdi-lock-outline /></n-icon
            ></template>
            {{ t('crypto.encryptBtn') }}
          </n-button>
          <n-button type="warning" :loading="loading" @click="doDecrypt">
            <template #icon
              ><n-icon><icon-mdi-lock-open-outline /></n-icon
            ></template>
            {{ t('crypto.decryptBtn') }}
          </n-button>
          <n-button secondary :disabled="!resultText" @click="copyResult">
            <template #icon
              ><n-icon><icon-mdi-content-copy /></n-icon
            ></template>
            {{ t('common.copy') }}
          </n-button>
        </n-space>

        <n-card size="small" embedded>
          <template #header>{{ t('crypto.result') }}</template>
          <n-scrollbar style="max-height: 160px">
            <n-text style="font-family: monospace; font-size: 12px; word-break: break-all">
              {{ resultText || '—' }}
            </n-text>
          </n-scrollbar>
        </n-card>
      </n-space>
    </n-card>
  </div>
</template>

<script lang="ts" setup>
import {
  encrypt as encryptText,
  decrypt as decryptText,
  checkPasswordStrength
} from '@/utils/crypto'
import { useMessage } from 'naive-ui'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const message = useMessage()

const inputText = ref('')
const password = ref('')
const resultText = ref('')
const loading = ref(false)
const strength = ref<ReturnType<typeof checkPasswordStrength> | null>(null)

const strengthType = computed(() => {
  if (!strength.value) return 'default' as const
  return ({ weak: 'error', medium: 'warning', strong: 'success' } as const)[strength.value.strength]
})

function onPasswordInput() {
  strength.value = password.value ? checkPasswordStrength(password.value) : null
}

async function doEncrypt() {
  if (!inputText.value || !password.value) {
    message.warning(t('crypto.emptyInput'))
    return
  }
  loading.value = true
  try {
    resultText.value = await encryptText(inputText.value, password.value)
    message.success(t('common.success'))
  } catch (e: unknown) {
    message.error(t('crypto.failed', { msg: (e as Error)?.message }))
  } finally {
    loading.value = false
  }
}

async function doDecrypt() {
  if (!inputText.value || !password.value) {
    message.warning(t('crypto.emptyInput'))
    return
  }
  loading.value = true
  try {
    resultText.value = await decryptText(inputText.value, password.value)
    message.success(t('common.success'))
  } catch (e: unknown) {
    message.error(t('crypto.failed', { msg: (e as Error)?.message }))
  } finally {
    loading.value = false
  }
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(resultText.value)
    message.success(t('common.copied'))
  } catch {
    message.error(t('common.error'))
  }
}
</script>

<style lang="scss" scoped>
.page {
  max-width: 700px;
  margin: 0 auto;
}

.strength-bar {
  height: 4px;
  background: rgba(128, 128, 128, 0.2);
  border-radius: 2px;
  margin: 6px 0 4px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;

  &.weak {
    background: #e74c3c;
  }
  &.medium {
    background: #f39c12;
  }
  &.strong {
    background: #27ae60;
  }
}
</style>

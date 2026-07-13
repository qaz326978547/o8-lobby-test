<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  currentLocale: string
}>()

const emit = defineEmits<{
  'toggle-locale': []
}>()

const { t } = useI18n()
</script>

<template>
  <header class="app-header">
    <img class="app-header__logo" src="/assets/images/logo/logo.png" alt="O8" />
    <div class="app-header__actions">
      <button
        class="app-header__btn"
        type="button"
        :aria-label="t('common.accessibility.changeLanguage')"
        @click="emit('toggle-locale')"
      >
        <span class="app-header__locale-label">{{ currentLocale === 'zh-TW' ? 'EN' : '中' }}</span>
      </button>
      <!-- <button
        class="app-header__btn"
        type="button"
        :aria-label="t('common.accessibility.openMenu')"
      >
        <img src="/assets/images/icons/menu.png" :alt="t('common.accessibility.openMenu')" />
      </button> -->
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;

  &__logo {
    height: 32px;
    width: auto;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;

    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }

  &__locale-label {
    color: #666;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}
</style>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  isVisible: boolean
}>()

const { t } = useI18n()

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div v-show="isVisible" class="floating-top-button-wrapper">
    <button
      type="button"
      class="floating-top-button"
      :aria-label="t('common.actions.backToTop')"
      @click="scrollToTop"
    >
      <img src="/assets/images/icons/scroll-up.png" alt="" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.floating-top-button {
  position: fixed;
  right: 16px;
  bottom: 24px;
  pointer-events: auto;

  img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
}
</style>

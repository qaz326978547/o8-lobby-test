<template>
  <div class="empty-state">
    <img class="empty-state__image" :src="props.imageSrc" alt="" />
    <p class="empty-state__message">{{ displayMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    imageSrc?: string
    message?: string
  }>(),
  {
    imageSrc: '/assets/images/no-data.png',
  },
)

const { t } = useI18n()
const displayMessage = computed(() => props.message ?? t('home.search.emptyState'))
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;

  &__image {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  &__message {
    margin-top: 12px;
    font-size: 13px;
    color: #888;
    text-align: center;
  }
}
</style>

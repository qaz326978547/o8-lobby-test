<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const { t } = useI18n()

const launchUrl = sessionStorage.getItem('ugs_game_launch_url') ?? ''

function onBack() {
  sessionStorage.removeItem('ugs_game_launch_url')
  router.push('/')
}
</script>

<template>
  <div class="game-frame-view">
    <div class="game-frame-view__header">
      <button type="button" class="game-frame-view__back" @click="onBack">
        ← {{ t('common.actions.back') }}
      </button>
    </div>
    <iframe v-if="launchUrl" :src="launchUrl" class="game-frame-view__iframe" frameborder="0" />
    <template v-else>
      <EmptyState />
      <div class="game-frame-view__no-url">
        <button type="button" class="game-frame-view__no-url-back" @click="onBack">
          {{ t('common.actions.back') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.game-frame-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: transparent;

  &__header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    padding: 0 16px;
  }

  &__back {
    color: #fff;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    position: absolute;
    top: 16px;
    left: 16px;
  }

  &__iframe {
    flex: 1;
    width: 100%;
    border: 0;
  }

  &__no-url {
    display: flex;
    justify-content: center;
    padding: 24px;
  }

  &__no-url-back {
    color: #fff;
    background: #333;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 8px 20px;
    border-radius: 4px;
  }
}
</style>

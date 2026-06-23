<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { GamePlatformItem } from '@/data/platforms'

defineProps<{
  platforms: GamePlatformItem[]
  activePlatformId: string
}>()

const emit = defineEmits<{
  'open-search': []
  'select-platform': [id: string]
}>()

const { t } = useI18n()
</script>

<template>
  <nav class="game-platform-nav">
    <ul class="game-platform-nav__list">
      <li
        v-for="item in platforms"
        :key="item.id"
        class="game-platform-nav__item"
        :class="{ 'game-platform-nav__item--active': item.id === activePlatformId }"
        @click="emit('select-platform', item.id)"
      >
        <img
          :src="item.imagePath"
          :alt="item.isDiscover ? t('home.navigation.discover') : item.name"
        />
        <span class="game-platform-nav__label">
          {{ item.isDiscover ? t('home.navigation.discover') : item.name }}
        </span>
      </li>
    </ul>
    <button
      type="button"
      class="game-platform-nav__search"
      :aria-label="t('common.accessibility.searchGames')"
      @click="emit('open-search')"
    >
      <img src="/assets/images/icons/search.png" :alt="t('common.accessibility.searchGames')" />
    </button>
  </nav>
</template>

<style scoped lang="scss">
.game-platform-nav {
  display: flex;
  align-items: center;
  padding: 8px 0 8px 0;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  overflow: hidden;

  &__list {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex: 1;
    list-style: none;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 8px;
    cursor: pointer;
    flex-shrink: 0;
    min-width: 56px;
    transition: background 0.2s;

    img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    &--active {
      background: rgba(174, 134, 64, 0.12);
    }
  }

  &__label {
    font-size: 11px;
    color: #666;
    white-space: nowrap;

    .game-platform-nav__item--active & {
      color: #ae8640;
      font-weight: 600;
    }
  }

  &__search {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
    margin-right: 8px;
    background: none;
    border: none;
    cursor: pointer;

    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }
}
</style>

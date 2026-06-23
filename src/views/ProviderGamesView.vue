<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobby'
import { resolveGameImagePath } from '@/utils/url'
import { resolveProviderDisplay } from '@/utils/provider'
import AppHeader from '@/components/AppHeader.vue'
import GameCard from '@/components/GameCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const lobbyStore = useLobbyStore()

const code = route.params.code as string

const currentLocale = computed(() => locale.value)
function onToggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'
}

const display = computed(() =>
  resolveProviderDisplay(
    code,
    lobbyStore.LobbyGameProviders,
    lobbyStore.searchResult?.providers.items ?? [],
  ),
)

const gameCards = computed(() =>
  lobbyStore.LobbyGameList.filter((g) => g.providercode === code).map((game, i) => ({
    id: game.id,
    name: game.name,
    imagePath: resolveGameImagePath(game.iconurl, i),
    value: 0,
    capsuleColor: 'red' as const,
  })),
)
</script>

<template>
  <div class="provider-games-view">
    <AppHeader :current-locale="currentLocale" @toggle-locale="onToggleLocale" />
    <div class="provider-games-view__container">
      <div class="provider-games-view__header">
        <button
          type="button"
          class="provider-games-view__back"
          :aria-label="t('common.actions.back')"
          @click="() => { lobbyStore.searchPanelShouldRestore = true; router.push('/') }"
        >
          ←
        </button>
        <img
          v-if="display.iconPath"
          :src="display.iconPath"
          class="provider-games-view__provider-icon"
          alt=""
        />
        <span class="provider-games-view__title">{{ display.name }}</span>
      </div>

      <EmptyState v-if="gameCards.length === 0" />
      <div v-else class="provider-games-view__grid">
        <GameCard
          v-for="g in gameCards"
          :key="g.id"
          :image-path="g.imagePath"
          :name="g.name"
          :value="g.value"
          :capsule-color="g.capsuleColor"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.provider-games-view {
  min-height: 100vh;
  background: #fff;
}

.provider-games-view__container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding: 0 15px 32px;

  @media (min-width: 576px) {
    max-width: 540px;
  }

  @media (min-width: 768px) {
    max-width: 720px;
  }
}

.provider-games-view__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.provider-games-view__back {
  font-size: 20px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
  line-height: 1;
}

.provider-games-view__provider-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
}

.provider-games-view__title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.provider-games-view__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>

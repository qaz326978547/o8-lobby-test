<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobby'
import { resolveGameImagePath } from '@/utils/url'
import { GAME_TYPE_CODE_TO_ID } from '@/data/gameTypes'
import { launchGame } from '@/utils/gameLaunch'
import { getTokenFromSession } from '@/utils/tokenSession'
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

const gameTypeName = computed(
  () => lobbyStore.searchResult?.gameTypes.items.find((item) => item.code === code)?.name ?? code,
)

const gameTypeId = computed(() => GAME_TYPE_CODE_TO_ID[code])

const gameCards = computed(() =>
  lobbyStore.LobbyGameList.filter((game) => {
    const matchByTypeId =
      gameTypeId.value !== undefined && Number(game.gametype) === gameTypeId.value
    const matchByTypeName =
      game.gametypename === gameTypeName.value || game.gametypename === code
    return matchByTypeId || matchByTypeName
  }).map((game, i) => ({
    id: game.id,
    name: game.name,
    imagePath: resolveGameImagePath(game.iconurl, i),
    value: 0,
    capsuleColor: 'red' as const,
  })),
)

function onClickGame(gameId: string) {
  const game = lobbyStore.LobbyGameList.find((g) => g.id === gameId)
  if (!game) return
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  launchGame(game, token, import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? '', router.push)
}
</script>

<template>
  <div class="game-type-games-view">
    <AppHeader :current-locale="currentLocale" @toggle-locale="onToggleLocale" />
    <div class="game-type-games-view__container">
      <div class="game-type-games-view__header">
        <button
          type="button"
          class="game-type-games-view__back"
          :aria-label="t('common.actions.back')"
          @click="() => router.push('/')"
        >
          ←
        </button>
        <span class="game-type-games-view__title">{{ gameTypeName }}</span>
      </div>

      <EmptyState v-if="gameCards.length === 0" />
      <div v-else class="game-type-games-view__grid">
        <GameCard
          v-for="g in gameCards"
          :key="g.id"
          :image-path="g.imagePath"
          :name="g.name"
          :value="g.value"
          :capsule-color="g.capsuleColor"
          @click="onClickGame(g.id)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-type-games-view {
  min-height: 100vh;
  background: #fff;
}

.game-type-games-view__container {
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

.game-type-games-view__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.game-type-games-view__back {
  font-size: 20px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
  line-height: 1;
}

.game-type-games-view__title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.game-type-games-view__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>

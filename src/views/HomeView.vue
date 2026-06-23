<template>
  <div class="home-page">
    <AppHeader :current-locale="currentLocale" @toggle-locale="onToggleLocale" />
    <HeroBanner />
    <div class="container">
      <div class="nav-wrapper">
        <GamePlatformNav
          :platforms="navItems"
          :active-platform-id="selectedProviderCode ?? 'Discover'"
          @open-search="isSearchOpen = true"
          @select-platform="onSelectPlatform"
        />
        <SearchPanel :is-open="isSearchOpen" :tags="searchTags" @close="isSearchOpen = false" />
      </div>
      <template v-if="selectedProviderCode !== null">
        <EmptyState v-if="providerGameCards.length === 0" />
        <div v-else class="provider-games">
          <div class="provider-games__grid">
            <GameCard
              v-for="g in providerGameCards"
              :key="g.id"
              :image-path="g.imagePath"
              :name="g.name"
              :value="g.value"
              :capsule-color="g.capsuleColor"
            />
          </div>
        </div>
      </template>
      <template v-else>
        <GameSection
          :title-key="'home.sections.hotGames'"
          :pages="carouselPages"
          :gameType="'hotGames'"
        />
        <GameSection
          :title-key="'home.sections.newGames'"
          :pages="carouselPages"
          :gameType="'newGames'"
        />
      </template>
    </div>
    <FloatingTopButton :is-visible="isFloatingVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import type { GamePlatformItem } from '@/data/platforms'
import { resolveIconUrl, resolveGameImagePath } from '@/utils/url'
import { carouselPages } from '@/data/games'
import type { GameCard as GameCardData } from '@/data/games'
import type { SearchTag } from '@/components/SearchPanel.vue'
import type { LobbyGroup } from '@/apis/interface/lobby'
import AppHeader from '@/components/AppHeader.vue'
import HeroBanner from '@/components/HeroBanner.vue'
import GamePlatformNav from '@/components/GamePlatformNav.vue'
import SearchPanel from '@/components/SearchPanel.vue'
import GameSection from '@/components/GameSection.vue'
import GameCard from '@/components/GameCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import FloatingTopButton from '@/components/FloatingTopButton.vue'
import { useLobbyStore } from '@/stores/lobby'

const route = useRoute()
const lobbyStore = useLobbyStore()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value)

const isSearchOpen = ref(false)
const selectedProviderCode = ref<string | null>(null)
const scrollY = ref(0)
const isFloatingVisible = computed(() => scrollY.value > 0)

const searchTags: SearchTag[] = [
  { id: 'atg', type: 'provider', label: 'ATG' },
  { id: 'ag-live', type: 'provider', label: 'AG Live' },
  { id: 'war-god', type: 'provider', label: '戰神賽特' },
  { id: 'slots', type: 'category', label: 'home.search.tags.slots' },
]

function onToggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'
}

function onSelectPlatform(id: string) {
  selectedProviderCode.value = id === 'Discover' ? null : id
}

const providerGameCards = computed<GameCardData[]>(() => {
  if (!selectedProviderCode.value) return []
  return lobbyStore.LobbyGameList.filter((g) => g.providercode === selectedProviderCode.value).map(
    (game, i) => ({
      id: game.id,
      name: game.name,
      imagePath: resolveGameImagePath(game.iconurl, i),
      value: 0,
      capsuleColor: 'red' as const,
    }),
  )
})

const selectedProviderName = computed<string>(() => {
  const item = navItems.value.find((i) => i.id === selectedProviderCode.value)
  return item?.name ?? selectedProviderCode.value ?? ''
})

// ─── Nav items ───────────────────────────────────────────────────────────────

const DISCOVER_NAV_ITEM: GamePlatformItem = {
  id: 'Discover',
  name: 'Discover',
  imagePath: '/assets/images/icons/discover.png',
  isDiscover: true,
}

const navItems = computed<GamePlatformItem[]>(() => {
  const providers =
    lobbyStore.lobbyData?.Lobby.Data.groups.find((g) => g.code === 'All')?.gameproviders ?? []
  return [
    DISCOVER_NAV_ITEM,
    ...providers.map((p) => ({
      id: p.code,
      name: p.shortname || p.name,
      imagePath: resolveIconUrl(p.iconurl),
      isDiscover: false,
    })),
  ]
})

// ─── T025: GameCard adapter ───────────────────────────────────────────────────

function toGameCardPages(groups: LobbyGroup[]): GameCardData[][] {
  const allGames = groups.flatMap((g) => g.games)
  console.log('toGameCardPages', allGames.length, allGames)
  if (allGames.length === 0) return carouselPages

  const pages: GameCardData[][] = []
  for (let i = 0; i < allGames.length; i += 4) {
    pages.push(
      allGames.slice(i, i + 4).map((game, j) => ({
        id: game.id,
        name: game.name,
        imagePath: resolveGameImagePath(game.iconurl, i + j),
        value: 0,
        capsuleColor: 'red' as const,
      })),
    )
  }
  return pages
}

// ─── T026: gamePages computed — API data with fallback to mock ────────────────

const gamePages = computed<GameCardData[][]>(() => {
  if (lobbyStore.LobbyGameGroup.length > 0) {
    return toGameCardPages(lobbyStore.LobbyGameGroup)
  }
  return carouselPages
})

// ─── T023 + T024 + T027: onMounted — token → fetch → fallback ────────────────

onMounted(async () => {
  if (lobbyStore.searchPanelShouldRestore) {
    isSearchOpen.value = true
    lobbyStore.searchPanelShouldRestore = false
  }

  const tokenStr = typeof route.query.token === 'string' ? route.query.token : null
  console.log('GamePages1', gamePages.value)
  if (tokenStr) {
    lobbyStore.setToken(tokenStr)
    try {
      await lobbyStore.fetchLobbyData()
    } catch {
      console.log('GamePages', gamePages.value)
      // API 失敗時 gamePages 自動 fallback 至 carouselPages
    }
  }

  const handler = () => {
    scrollY.value = window.scrollY
  }
  window.addEventListener('scroll', handler, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handler))
})
</script>

<style scoped lang="scss">
.home-page {
  position: relative;
}

.nav-wrapper {
  position: relative;
}

.provider-games {
  padding: 12px 0;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 15px;
  padding-left: 15px;
  position: relative;
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;

  @media (min-width: 576px) {
    max-width: 540px;
  }

  @media (min-width: 768px) {
    max-width: 720px;
  }

  @media (min-width: 992px) {
    max-width: 960px;
  }

  @media (min-width: 1200px) {
    max-width: 1140px;
  }
}
</style>

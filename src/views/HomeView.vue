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
      <!-- 搜尋結果模式（優先） -->
      <template v-if="lobbyStore.searchResultMode && lobbyStore.searchResult">
        <div v-if="lobbyStore.isSearching" class="search-results__loading">
          {{ t('home.search.searching') }}
        </div>
        <EmptyState v-else-if="!hasAnySearchResults" />
        <template v-else>
          <!-- 遊戲 -->
          <div v-if="searchGames.length > 0" class="search-results__section">
            <div class="search-results__section-title">{{ t('home.search.sections.games') }}</div>
            <div class="search-results__grid">
              <GameCard
                v-for="(game, i) in searchGames"
                :key="game.id"
                :image-path="resolveGameImagePath(game.iconurl, i)"
                :name="game.name"
                :value="0"
                capsule-color="red"
                @click="onClickSearchGame(game.id)"
              />
            </div>
          </div>
          <!-- 遊戲商 -->
          <div v-if="resolvedSearchProviders.length > 0" class="search-results__section">
            <div class="search-results__section-title">
              {{ t('home.search.sections.providers') }}
            </div>
            <div
              v-for="p in resolvedSearchProviders"
              :key="p.code"
              class="search-results__provider-item"
              @click="router.push(`/search/provider/${p.code}`)"
            >
              <img
                v-if="p.iconPath"
                :src="p.iconPath"
                class="search-results__provider-icon"
                alt=""
              />
              <span class="search-results__provider-name">{{ p.name }}</span>
            </div>
          </div>
          <!-- 遊戲類別 -->
          <div v-if="searchGameTypes.length > 0" class="search-results__section">
            <div class="search-results__section-title">
              {{ t('home.search.sections.gameTypes') }}
            </div>
            <div class="search-results__chips">
              <span
                v-for="gt in searchGameTypes"
                :key="gt.code"
                class="search-results__chip"
                @click="router.push(`/search/game-type/${gt.code}`)"
                >{{ gt.name }}</span
              >
            </div>
          </div>
        </template>
      </template>

      <!-- Provider 篩選（次優先） -->
      <template v-else-if="selectedProviderCode !== null">
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
              @click="onClickProviderGame(g.id)"
            />
          </div>
        </div>
      </template>

      <!-- Discover 預設（最低優先） -->
      <template v-else>
        <!-- Hot Games: API data → clickable carousel; no data → GameSection mock -->
        <section v-if="hotGames.length > 0" class="game-section">
          <div class="game-section__header">
            <img class="game-section__icon" src="/assets/images/icons/hotGames.png" alt="" />
            <h2 class="game-section_title">{{ t('home.sections.hotGames') }}</h2>
          </div>
          <div ref="hotCarouselRef" class="game-section__carousel">
            <div
              class="game-section__slides"
              :style="{ transform: `translateX(-${hotCurrentPage * 100}%)` }"
            >
              <div v-for="(page, idx) in hotGamePages" :key="idx" class="game-section__grid">
                <GameCard
                  v-for="card in page"
                  :key="card.id"
                  :image-path="card.imagePath"
                  :name="card.name"
                  :value="card.value"
                  :capsule-color="card.capsuleColor"
                  @click="onClickHotGame(card.id)"
                />
              </div>
            </div>
          </div>
          <div class="game-section__indicators">
            <div
              v-for="(_, idx) in hotGamePages"
              :key="idx"
              class="game-section__progress-bar"
              :class="{ 'game-section__progress-bar--active': idx === hotCurrentPage }"
            />
          </div>
        </section>
        <GameSection
          v-else
          :title-key="'home.sections.hotGames'"
          :pages="carouselPages"
          game-type="hotGames"
        />

        <!-- New Games: API data → clickable carousel; no data → GameSection mock -->
        <section v-if="newGames.length > 0" class="game-section">
          <div class="game-section__header">
            <img class="game-section__icon" src="/assets/images/icons/newGames.png" alt="" />
            <h2 class="game-section_title">{{ t('home.sections.newGames') }}</h2>
          </div>
          <div ref="newCarouselRef" class="game-section__carousel">
            <div
              class="game-section__slides"
              :style="{ transform: `translateX(-${newCurrentPage * 100}%)` }"
            >
              <div v-for="(page, idx) in newGamePages" :key="idx" class="game-section__grid">
                <GameCard
                  v-for="card in page"
                  :key="card.id"
                  :image-path="card.imagePath"
                  :name="card.name"
                  :value="card.value"
                  :capsule-color="card.capsuleColor"
                  @click="onClickNewGame(card.id)"
                />
              </div>
            </div>
          </div>
          <div class="game-section__indicators">
            <div
              v-for="(_, idx) in newGamePages"
              :key="idx"
              class="game-section__progress-bar"
              :class="{ 'game-section__progress-bar--active': idx === newCurrentPage }"
            />
          </div>
        </section>
        <GameSection
          v-else
          :title-key="'home.sections.newGames'"
          :pages="carouselPages"
          game-type="newGames"
        />
      </template>
    </div>
    <FloatingTopButton :is-visible="isFloatingVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { GamePlatformItem } from '@/data/platforms'
import { resolveIconUrl, resolveGameImagePath } from '@/utils/url'
import { resolveProviderDisplay } from '@/utils/provider'
import { carouselPages } from '@/data/games'
import type { GameCard as GameCardData } from '@/data/games'
import type { SearchTag } from '@/components/SearchPanel.vue'
import type { LobbyGroup, Game } from '@/apis/interface/lobby'
import AppHeader from '@/components/AppHeader.vue'
import HeroBanner from '@/components/HeroBanner.vue'
import GamePlatformNav from '@/components/GamePlatformNav.vue'
import SearchPanel from '@/components/SearchPanel.vue'
import GameSection from '@/components/GameSection.vue'
import GameCard from '@/components/GameCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import FloatingTopButton from '@/components/FloatingTopButton.vue'
import { useLobbyStore } from '@/stores/lobby'
import { saveTokenToSession, getTokenFromSession } from '@/utils/tokenSession'
import { launchGame } from '@/utils/gameLaunch'

const route = useRoute()
const router = useRouter()
const lobbyStore = useLobbyStore()
const { locale, t } = useI18n()
const currentLocale = computed(() => locale.value)

const isSearchOpen = ref(false)
const selectedProviderCode = ref<string | null>(null)
const scrollY = ref(0)
const isFloatingVisible = computed(() => scrollY.value > 0)

const searchTags = computed<SearchTag[]>(() => [
  { id: 'atg', label: 'ATG', searchValue: 'ATG' },
  { id: 'ag-live', label: 'AG Live', searchValue: 'AG Live' },
  { id: 'war-god', label: '戰神賽特', searchValue: '戰神賽特' },
  { id: 'slots', label: t('home.search.tags.slots'), searchValue: 'Slot' },
])

function onToggleLocale() {
  locale.value = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'
}

function onSelectPlatform(id: string) {
  lobbyStore.clearSearchResult()
  selectedProviderCode.value = id === 'Discover' ? null : id
}

// ─── Search result computed ───────────────────────────────────────────────────

const searchGames = computed(() => lobbyStore.searchResult?.games.items ?? [])
const searchProviders = computed(() => lobbyStore.searchResult?.providers.items ?? [])
const searchGameTypes = computed(() => lobbyStore.searchResult?.gameTypes.items ?? [])
const hasAnySearchResults = computed(
  () =>
    searchGames.value.length > 0 ||
    searchProviders.value.length > 0 ||
    searchGameTypes.value.length > 0,
)
const resolvedSearchProviders = computed(() =>
  searchProviders.value.map((p) =>
    resolveProviderDisplay(p.code, lobbyStore.LobbyGameProviders, searchProviders.value),
  ),
)

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

function onClickProviderGame(gameId: string) {
  const game = lobbyStore.LobbyGameList.find((g) => g.id === gameId)
  if (!game) return
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  launchGame(game, token, import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? '', router.push)
}

function onClickSearchGame(gameId: string) {
  const game = lobbyStore.LobbyGameList.find((g) => g.id === gameId)
  if (!game) return
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  launchGame(game, token, import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? '', router.push)
}

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

// ─── Hot/New API carousel ─────────────────────────────────────────────────────

const hotCurrentPage = ref(0)
const newCurrentPage = ref(0)
const hotCarouselRef = ref<HTMLElement | null>(null)
const newCarouselRef = ref<HTMLElement | null>(null)
let hotIntervalId: ReturnType<typeof setInterval> | undefined
let newIntervalId: ReturnType<typeof setInterval> | undefined
let hotTouchStartX = 0
let hotTouchStartY = 0
let newTouchStartX = 0
let newTouchStartY = 0

const hotGames = computed<Game[]>(
  () => lobbyStore.lobbyData?.Lobby.Data.groups.find((g) => g.code === 'Hot')?.games ?? [],
)
const newGames = computed<Game[]>(
  () => lobbyStore.lobbyData?.Lobby.Data.groups.find((g) => g.code === 'New')?.games ?? [],
)

function gamesToCardPages(games: Game[], pageSize = 4): GameCardData[][] {
  const pages: GameCardData[][] = []
  for (let i = 0; i < games.length; i += pageSize) {
    pages.push(
      games.slice(i, i + pageSize).map((game, j) => ({
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

const hotGamePages = computed<GameCardData[][]>(() =>
  hotGames.value.length > 0 ? gamesToCardPages(hotGames.value) : carouselPages,
)
const newGamePages = computed<GameCardData[][]>(() =>
  newGames.value.length > 0 ? gamesToCardPages(newGames.value) : carouselPages,
)

function onClickDiscoverGame(game: Game) {
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  launchGame(game, token, import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? '', router.push)
}

function onClickHotGame(cardId: string) {
  const game = hotGames.value.find((g) => g.id === cardId)
  if (!game) return
  onClickDiscoverGame(game)
}

function onClickNewGame(cardId: string) {
  const game = newGames.value.find((g) => g.id === cardId)
  if (!game) return
  onClickDiscoverGame(game)
}

function startHotAutoPlay() {
  clearInterval(hotIntervalId)
  hotIntervalId = setInterval(() => {
    hotCurrentPage.value = (hotCurrentPage.value + 1) % hotGamePages.value.length
  }, 5000)
}

function startNewAutoPlay() {
  clearInterval(newIntervalId)
  newIntervalId = setInterval(() => {
    newCurrentPage.value = (newCurrentPage.value + 1) % newGamePages.value.length
  }, 5000)
}

function onHotTouchStart(e: TouchEvent) {
  hotTouchStartX = e.touches[0]?.clientX ?? 0
  hotTouchStartY = e.touches[0]?.clientY ?? 0
}
function onHotTouchMove(e: TouchEvent) {
  const dx = Math.abs((e.touches[0]?.clientX ?? hotTouchStartX) - hotTouchStartX)
  const dy = Math.abs((e.touches[0]?.clientY ?? hotTouchStartY) - hotTouchStartY)
  if (dx > dy) e.preventDefault()
}
function onHotTouchEnd(e: TouchEvent) {
  const deltaX = (e.changedTouches[0]?.clientX ?? hotTouchStartX) - hotTouchStartX
  if (Math.abs(deltaX) < 50) return
  hotCurrentPage.value =
    deltaX < 0
      ? (hotCurrentPage.value + 1) % hotGamePages.value.length
      : (hotCurrentPage.value - 1 + hotGamePages.value.length) % hotGamePages.value.length
  startHotAutoPlay()
}

function onNewTouchStart(e: TouchEvent) {
  newTouchStartX = e.touches[0]?.clientX ?? 0
  newTouchStartY = e.touches[0]?.clientY ?? 0
}
function onNewTouchMove(e: TouchEvent) {
  const dx = Math.abs((e.touches[0]?.clientX ?? newTouchStartX) - newTouchStartX)
  const dy = Math.abs((e.touches[0]?.clientY ?? newTouchStartY) - newTouchStartY)
  if (dx > dy) e.preventDefault()
}
function onNewTouchEnd(e: TouchEvent) {
  const deltaX = (e.changedTouches[0]?.clientX ?? newTouchStartX) - newTouchStartX
  if (Math.abs(deltaX) < 50) return
  newCurrentPage.value =
    deltaX < 0
      ? (newCurrentPage.value + 1) % newGamePages.value.length
      : (newCurrentPage.value - 1 + newGamePages.value.length) % newGamePages.value.length
  startNewAutoPlay()
}

watch(hotCarouselRef, (el) => {
  if (el) {
    el.addEventListener('touchstart', onHotTouchStart, { passive: true })
    el.addEventListener('touchmove', onHotTouchMove, { passive: false })
    el.addEventListener('touchend', onHotTouchEnd, { passive: true })
    startHotAutoPlay()
  }
})

watch(newCarouselRef, (el) => {
  if (el) {
    el.addEventListener('touchstart', onNewTouchStart, { passive: true })
    el.addEventListener('touchmove', onNewTouchMove, { passive: false })
    el.addEventListener('touchend', onNewTouchEnd, { passive: true })
    startNewAutoPlay()
  }
})

onUnmounted(() => {
  clearInterval(hotIntervalId)
  clearInterval(newIntervalId)
  hotCarouselRef.value?.removeEventListener('touchstart', onHotTouchStart)
  hotCarouselRef.value?.removeEventListener('touchmove', onHotTouchMove)
  hotCarouselRef.value?.removeEventListener('touchend', onHotTouchEnd)
  newCarouselRef.value?.removeEventListener('touchstart', onNewTouchStart)
  newCarouselRef.value?.removeEventListener('touchmove', onNewTouchMove)
  newCarouselRef.value?.removeEventListener('touchend', onNewTouchEnd)
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

// ─── onMounted — token session 流程（Phase 11）────────────────────────────────
// 優先順序：URL token > sessionStorage token > 無 token（不呼叫 API）

onMounted(async () => {
  const urlToken = typeof route.query.token === 'string' ? route.query.token : null
  const effectiveToken = urlToken ?? getTokenFromSession()

  if (effectiveToken) {
    lobbyStore.setToken(effectiveToken)
    try {
      await lobbyStore.fetchLobbyData()
      if (urlToken) {
        // 成功後存 session 並移除 URL token（保留其他 query，不重整頁面）
        saveTokenToSession(urlToken)
        const query = { ...route.query }
        delete query.token
        router.replace({ query })
      }
    } catch {
      // API 失敗：首頁保持 Discover mock，不崩潰
    }
  }
  // 無 token → 不呼叫 API，Discover mock 正常顯示

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

.search-results {
  &__loading {
    padding: 32px 0;
    text-align: center;
    color: #888;
    font-size: 14px;
  }

  &__section {
    padding: 16px 0 8px;

    & + & {
      border-top: 1px solid #f0f0f0;
    }
  }

  &__section-title {
    font-size: 13px;
    font-weight: 600;
    color: #888;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  &__provider-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      opacity: 0.7;
    }
  }

  &__provider-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: contain;
    flex-shrink: 0;
    background: #f5f5f5;
  }

  &__provider-abbr {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #666;
    flex-shrink: 0;
  }

  &__provider-name {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #666;
    border-radius: 8px;
    background: #e0e0e0;
    padding: 8px 16px;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    background: #f0f0f0;
    border-radius: 16px;
    padding: 6px 14px;
    font-size: 13px;
    color: #444;
    cursor: pointer;

    &:active {
      background: #e0e0e0;
    }
  }
}

.game-section {
  padding: 16px;

  &_title {
    font-size: 18px;
    color: #1a1a1a;
  }

  &__icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    object-fit: contain;
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  &__carousel {
    min-height: 240px;
    overflow: hidden;
  }

  &__slides {
    display: flex;
    transition: transform 0.3s ease;
  }

  &__grid {
    flex: 0 0 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  &__indicators {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  &__progress-bar {
    flex: 1;
    max-width: 40px;
    height: 3px;
    background: rgba(174, 134, 64, 0.2);
    border-radius: 2px;
    transition: background 0.3s ease;

    &--active {
      background: #ae8640;
    }
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

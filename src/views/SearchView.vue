<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobby'
import { resolveGameImagePath } from '@/utils/url'
import { resolveProviderDisplay } from '@/utils/provider'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const lobbyStore = useLobbyStore()

const keyword = ref<string>(typeof route.query.keyword === 'string' ? route.query.keyword : '')

const searchGames = computed(() => lobbyStore.searchResult?.games.items ?? [])
const searchProviders = computed(() => lobbyStore.searchResult?.providers.items ?? [])
const searchGameTypes = computed(() => lobbyStore.searchResult?.gameTypes.items ?? [])

const providerDisplays = computed(() =>
  searchProviders.value.map((p) => ({
    code: p.code,
    display: resolveProviderDisplay(p.code, lobbyStore.LobbyGameProviders, searchProviders.value),
  })),
)

const hasAnyResults = computed(
  () =>
    searchGames.value.length > 0 ||
    searchProviders.value.length > 0 ||
    searchGameTypes.value.length > 0,
)

const DEFAULT_TAGS = [
  { id: 'atg', label: 'ATG', type: 'provider' as const },
  { id: 'ag-live', label: 'AG Live', type: 'provider' as const },
  { id: 'war-god', label: '戰神賽特', type: 'provider' as const },
  { id: 'slots', label: 'home.search.tags.slots', type: 'category' as const },
]

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(keyword, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    router.replace({ path: '/search', query: val ? { keyword: val } : {} })
    lobbyStore.searchLobby({
      lobbyPath: 'mobile',
      token: lobbyStore.token ?? '',
      keyword: val,
    })
  }, 300)
})

onMounted(() => {
  if (keyword.value) {
    lobbyStore.searchLobby({
      lobbyPath: 'mobile',
      token: lobbyStore.token ?? '',
      keyword: keyword.value,
    })
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="search-view">
    <div class="search-view__container">
      <div class="search-view__bar">
        <button type="button" class="search-view__back" @click="router.push('/')">✕</button>
        <input
          v-model="keyword"
          class="search-view__input"
          type="text"
          :placeholder="t('home.search.placeholder')"
          autofocus
        />
        <button v-if="keyword" type="button" class="search-view__clear" @click="keyword = ''">
          {{ t('home.search.clear') }}
        </button>
      </div>

      <div v-if="lobbyStore.isSearching" class="search-view__status">
        {{ t('home.search.searching') }}
      </div>

      <template v-else-if="keyword">
        <div v-if="searchGames.length > 0" class="search-view__section">
          <div class="search-view__section-title">{{ t('home.search.sections.games') }}</div>
          <div class="search-view__games-grid">
            <div v-for="(game, i) in searchGames" :key="game.id" class="search-view__game-card">
              <img
                :src="resolveGameImagePath(game.iconurl, i)"
                :alt="game.name"
                class="search-view__game-img"
              />
              <span class="search-view__game-name">{{ game.name }}</span>
            </div>
          </div>
        </div>

        <div v-if="providerDisplays.length > 0" class="search-view__section">
          <div class="search-view__section-title">{{ t('home.search.sections.providers') }}</div>
          <div
            v-for="item in providerDisplays"
            :key="item.code"
            class="search-view__provider-item"
            @click="
              router.push(`/search/provider/${item.code}?keyword=${encodeURIComponent(keyword)}`)
            "
          >
            <img
              v-if="item.display.iconPath"
              :src="item.display.iconPath"
              class="search-view__provider-icon"
              alt=""
            />
            <div v-else class="search-view__provider-icon-placeholder" />
            <span class="search-view__provider-name">{{ item.display.name }}</span>
          </div>
        </div>

        <div v-if="searchGameTypes.length > 0" class="search-view__section">
          <div class="search-view__section-title">{{ t('home.search.sections.gameTypes') }}</div>
          <div class="search-view__game-types">
            <span
              v-for="gt in searchGameTypes"
              :key="gt.code"
              class="search-view__game-type-chip"
              @click="
                router.push(`/search/game-type/${gt.code}?keyword=${encodeURIComponent(keyword)}`)
              "
              >{{ gt.name }}</span
            >
          </div>
        </div>

        <EmptyState v-if="!hasAnyResults" />
      </template>

      <div v-else class="search-view__default-tags">
        <span v-for="tag in DEFAULT_TAGS" :key="tag.id" class="search-view__tag">
          {{ tag.type === 'category' ? t(tag.label) : tag.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  background: #fff;
}

.search-view__container {
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

.search-view__bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #f0f0f0;
}

.search-view__back {
  font-size: 18px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  flex-shrink: 0;
  line-height: 1;
}

.search-view__input {
  flex: 1;
  border: none;
  padding: 4px 0;
  font-size: 15px;
  color: #1a1a1a;
  outline: none;
  background: none;

  &::placeholder {
    color: #aaa;
  }
}

.search-view__clear {
  font-size: 13px;
  color: #ae8640;
  font-weight: 600;
  white-space: nowrap;
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}

.search-view__status {
  margin-top: 16px;
  font-size: 13px;
  color: #888;
  text-align: center;
  padding: 32px 0;
}

.search-view__section {
  margin-top: 20px;
}

.search-view__section-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.search-view__games-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.search-view__game-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-view__game-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}

.search-view__game-name {
  display: block;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #ae8640;
}

.search-view__provider-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
}

.search-view__provider-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
}

.search-view__provider-icon-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}

.search-view__provider-name {
  font-size: 14px;
  color: #1a1a1a;
}

.search-view__game-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-view__game-type-chip {
  background: #f0f0f0;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
}

.search-view__default-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.search-view__tag {
  background: #f0f0f0;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 13px;
  color: #444;
}
</style>

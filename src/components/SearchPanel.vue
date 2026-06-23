<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useLobbyStore } from '@/stores/lobby'
import { resolveGameImagePath } from '@/utils/url'
import { resolveProviderDisplay } from '@/utils/provider'
import GameCard from '@/components/GameCard.vue'
import EmptyState from '@/components/EmptyState.vue'

export interface SearchTag {
  id: string
  type: 'provider' | 'category'
  label: string
}

defineProps<{
  isOpen: boolean
  tags: SearchTag[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()
const router = useRouter()
const lobbyStore = useLobbyStore()
const keyword = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let isRestoringKeyword = false

// ─── Search result computed ────────────────────────────────────────────────────

const searchGames = computed(() => lobbyStore.searchResult?.games.items ?? [])
const searchProviders = computed(() => lobbyStore.searchResult?.providers.items ?? [])
const searchGameTypes = computed(() => lobbyStore.searchResult?.gameTypes.items ?? [])
const hasAnyResults = computed(
  () =>
    searchGames.value.length > 0 ||
    searchProviders.value.length > 0 ||
    searchGameTypes.value.length > 0,
)
const resolvedProviders = computed(() =>
  searchProviders.value.map((p) =>
    resolveProviderDisplay(p.code, lobbyStore.LobbyGameProviders, searchProviders.value),
  ),
)

// ─── Keyword watcher ──────────────────────────────────────────────────────────

watch(keyword, (val) => {
  // Skip store sync and API call when restoring keyword on mount
  if (isRestoringKeyword) {
    isRestoringKeyword = false
    return
  }
  lobbyStore.searchKeyword = val
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    lobbyStore.searchLobby({ lobbyPath: 'mobile', token: lobbyStore.token ?? '', keyword: val })
  }, 300)
})

onMounted(() => {
  if (lobbyStore.searchKeyword) {
    isRestoringKeyword = true
    keyword.value = lobbyStore.searchKeyword
  }
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

// ─── Actions ──────────────────────────────────────────────────────────────────

function onClose() {
  if (debounceTimer) clearTimeout(debounceTimer)
  keyword.value = ''
  lobbyStore.searchKeyword = ''
  lobbyStore.searchResult = null
  emit('close')
}

function onProviderClick(code: string) {
  router.push(`/search/provider/${code}`)
}

function onGameTypeClick(code: string) {
  router.push(`/search/game-type/${code}`)
}
</script>

<template>
  <div v-if="isOpen">
    <Teleport to="body">
      <div class="search-panel__overlay" @click="onClose" />
    </Teleport>
    <div class="search-panel" @click.stop>
      <div class="search-panel__bar">
        <input
          v-model="keyword"
          class="search-panel__input"
          type="text"
          :placeholder="t('home.search.placeholder')"
          autofocus
        />
        <button type="button" class="search-panel__clear" @click="onClose">
          {{ t('home.search.clear') }}
        </button>
        <img class="search-panel__icon" src="/assets/images/icons/search.png" alt="" />
      </div>

      <!-- Keyword present: inline results -->
      <div v-if="keyword" class="search-panel__results">
        <div v-if="lobbyStore.isSearching" class="search-panel__loading">
          {{ t('home.search.searching') }}
        </div>
        <EmptyState v-else-if="!hasAnyResults" />
        <template v-else>
          <!-- Games -->
          <div v-if="searchGames.length > 0" class="search-panel__section">
            <div class="search-panel__section-title">{{ t('home.search.sections.games') }}</div>
            <div class="search-panel__games-grid">
              <GameCard
                v-for="(game, i) in searchGames"
                :key="game.id"
                :image-path="resolveGameImagePath(game.iconurl, i)"
                :name="game.name"
                :value="0"
                capsule-color="red"
              />
            </div>
          </div>

          <!-- Providers -->
          <div v-if="resolvedProviders.length > 0" class="search-panel__section">
            <div class="search-panel__section-title">
              {{ t('home.search.sections.providers') }}
            </div>
            <div
              v-for="p in resolvedProviders"
              :key="p.code"
              class="search-panel__provider-item"
              @click="onProviderClick(p.code)"
            >
              <img
                v-if="p.iconPath"
                :src="p.iconPath"
                class="search-panel__provider-icon"
                alt=""
              />
              <span class="search-panel__provider-name">{{ p.name }}</span>
            </div>
          </div>

          <!-- Game Types -->
          <div v-if="searchGameTypes.length > 0" class="search-panel__section">
            <div class="search-panel__section-title">
              {{ t('home.search.sections.gameTypes') }}
            </div>
            <div class="search-panel__tags">
              <span
                v-for="gt in searchGameTypes"
                :key="gt.code"
                class="search-panel__tag search-panel__tag--clickable"
                @click="onGameTypeClick(gt.code)"
              >{{ gt.name }}</span>
            </div>
          </div>
        </template>
      </div>

      <!-- No keyword: default tags -->
      <div v-else class="search-panel__tags">
        <span v-for="tag in tags" :key="tag.id" class="search-panel__tag">
          {{ tag.type === 'category' ? t(tag.label) : tag.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-panel__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: var(--z-overlay, 100);
}

.search-panel {
  position: absolute;
  top: 0;
  left: -15px;
  right: -15px;
  z-index: var(--z-panel, 101);
  background: #fff;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (min-width: 576px) {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: 100vw;
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

  @media (min-width: 1400px) {
    max-width: 1320px;
  }

  &__bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f5f5f5;
    border-radius: 24px;
    padding: 10px 16px;
  }

  &__input {
    flex: 1;
    border: none;
    background: none;
    font-size: 14px;
    color: #1a1a1a;
    outline: none;

    &::placeholder {
      color: #aaa;
    }
  }

  &__clear {
    font-size: 13px;
    color: #ae8640;
    font-weight: 600;
    white-space: nowrap;
    background: none;
    border: none;
    cursor: pointer;
  }

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
    opacity: 0.5;
  }

  &__results {
    margin-top: 14px;
    overflow-y: auto;
    max-height: calc(100vh - 80px);
  }

  &__loading {
    padding: 24px 0;
    text-align: center;
    font-size: 14px;
    color: #aaa;
  }

  &__section {
    margin-bottom: 20px;
  }

  &__section-title {
    font-size: 12px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  &__games-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  &__provider-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }
  }

  &__provider-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 6px;
  }

  &__provider-name {
    font-size: 14px;
    color: #1a1a1a;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  &__tag {
    background: #f0f0f0;
    border-radius: 16px;
    padding: 6px 14px;
    font-size: 13px;
    color: #444;

    &--clickable {
      cursor: pointer;

      &:active {
        background: #e0e0e0;
      }
    }
  }
}
</style>

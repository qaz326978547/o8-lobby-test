import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  ILobbyResponse,
  LobbyGroup,
  Game,
  GameProvider,
  Player,
  SearchLobbyParams,
  LobbySearchResponse,
} from '@/apis/interface/lobby'
import { LobbyApi } from '@/apis/lobby'

export const useLobbyStore = defineStore('lobby', () => {
  // ─── State ──────────────────────────────────────────────────────────────────

  const token = ref<string | null>(null)
  const lobbyData = ref<ILobbyResponse | null>(null)
  const searchResult = ref<LobbySearchResponse | null>(null)
  const isSearching = ref(false)
  const searchKeyword = ref<string>('')
  const searchResultMode = ref<boolean>(false)
  const searchError = ref<string | null>(null)

  // ─── Actions ────────────────────────────────────────────────────────────────

  function setToken(t: string): void {
    token.value = t
  }

  async function fetchLobbyData(
    lobbyPath: 'mobile' | 'desktop' | 'O8_Mobile_Lobby_test' = 'O8_Mobile_Lobby_test',
  ): Promise<void> {
    if (!token.value) return
    const result = await LobbyApi.getLobbyData(lobbyPath, token.value)
    if (result) {
      lobbyData.value = result
    }
  }

  async function searchLobby(params: SearchLobbyParams): Promise<void> {
    if (!params.keyword.trim()) {
      searchResult.value = {
        keyword: '',
        games: { items: [], offset: 0, totalCount: 0, hasMore: false },
        providers: { items: [], offset: 0, totalCount: 0, hasMore: false },
        gameTypes: { items: [], offset: 0, totalCount: 0, hasMore: false },
      }
      return
    }
    isSearching.value = true
    try {
      const result = await LobbyApi.searchLobby(params)
      if (result) searchResult.value = result
    } finally {
      isSearching.value = false
    }
  }

  // ─── Computed ───────────────────────────────────────────────────────────────

  const LobbyGameGroup = computed<LobbyGroup[]>(() => {
    if (!lobbyData.value) return []
    return lobbyData.value.Lobby.Data.groups
      .filter((g) => g.isvisible)
      .sort((a, b) => a.order - b.order)
  })

  const LobbyGameList = computed<Game[]>(() => {
    const games: Game[] = []
    LobbyGameGroup.value.forEach((group) => {
      games.push(...group.games)
    })
    return games
  })

  const LobbyGameProviders = computed<GameProvider[]>(() => {
    const providers: GameProvider[] = []
    LobbyGameGroup.value.forEach((group) => {
      group.gameproviders.forEach((provider) => {
        if (!providers.find((p) => p.code === provider.code)) {
          providers.push(provider)
        }
      })
    })
    return providers
  })

  const playerData = computed<Player | null>(() => {
    if (!lobbyData.value) return null
    return lobbyData.value.Player
  })

  // 現階段不接 UI
  const balanceText = computed<string | null>(() => {
    if (!lobbyData.value) return null
    return lobbyData.value.Balance
  })

  // 現階段不接 UI
  const currencySymbol = computed<string | null>(() => {
    if (!lobbyData.value) return null
    return lobbyData.value.CurrencySymbol
  })

  const iframeUnsupportedProviders = computed<string[]>(() => {
    return lobbyData.value?.IframeUnsupportedGameProviders ?? []
  })

  const supportHttpOnlyProviders = computed<string[]>(() => {
    return lobbyData.value?.SupportHttpOnlyGameProviders ?? []
  })

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function shouldOpenByRedirect(game: Game): boolean {
    if (!game.supportiframe) return true
    if (iframeUnsupportedProviders.value.includes(game.providercode)) return true
    const configs = lobbyData.value?.Lobby.Data.configurations
    if (configs?.iframeunsupportedgameproviders.includes(game.providercode)) return true
    return false
  }

  async function executeSearch(keyword: string): Promise<void> {
    if (!keyword.trim()) return
    searchKeyword.value = keyword
    await searchLobby({ lobbyPath: 'mobile', token: token.value ?? '', keyword })
    searchResultMode.value = true
  }

  function clearSearchResult(): void {
    searchResult.value = null
    searchResultMode.value = false
    searchKeyword.value = ''
  }

  function searchNextPage(segment: 'games' | 'providers' | 'gameTypes'): number {
    const seg = searchResult.value?.[segment]
    if (!seg) return 0
    return seg.offset + seg.items.length
  }

  return {
    token,
    lobbyData,
    searchResult,
    isSearching,
    searchKeyword,
    searchResultMode,
    searchError,
    setToken,
    fetchLobbyData,
    searchLobby,
    executeSearch,
    clearSearchResult,
    LobbyGameGroup,
    LobbyGameList,
    LobbyGameProviders,
    playerData,
    balanceText,
    currencySymbol,
    iframeUnsupportedProviders,
    supportHttpOnlyProviders,
    shouldOpenByRedirect,
    searchNextPage,
  }
})

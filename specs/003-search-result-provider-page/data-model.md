# 資料模型：搜尋結果頁與遊戲商遊戲列表頁

**分支**：`003-search-result-provider`  
**日期**：2026-06-21

---

## 一、UI State 實體

### 1.1 HomeView 新增狀態

```ts
// 現有（不變）
const isSearchOpen = ref<boolean>(false)
const scrollY = ref<number>(0)
const isFloatingVisible = computed(() => scrollY.value > 0)

// 新增
const selectedProviderCode = ref<string | null>(null)

// 新增計算屬性
const navItems = computed<GamePlatformItem[]>(() => {
  const allGroup = lobbyStore.lobbyData?.Lobby.Data.groups.find(g => g.code === 'All')
  const apiProviders = (allGroup?.gameproviders ?? []).map(providerToNavItem)
  return [DISCOVER_NAV_ITEM, ...apiProviders]
})

// 平整陣列（非分頁），使用自訂 grid 顯示（DEC-007）
const providerGameCards = computed<GameCard[]>(() => {
  if (!selectedProviderCode.value) return []
  return lobbyStore.LobbyGameList
    .filter(g => g.providercode === selectedProviderCode.value)
    .map((game, i) => ({
      id: game.id,
      name: game.name,
      imagePath: resolveGameImagePath(game.iconurl, i),  // DEC-003
      value: 0,
      capsuleColor: 'red' as const,
    }))
})
```

### 1.2 SearchView 狀態

```ts
const keyword = ref<string>('')   // 初始化：route.query.keyword ?? ''
// lobbyStore.searchResult 作為唯讀資料來源
// lobbyStore.isSearching 作為載入狀態
```

路由：`/search?keyword={keyword}`

### 1.3 ProviderGamesView 狀態

```ts
import { resolveProviderDisplay } from '@/utils/provider'

const code = route.params.code as string
const keyword = route.query.keyword as string | undefined ?? ''

// 供應商顯示資料（優先 LobbyGameProviders → searchResult → code fallback）
const display = computed(() =>
  resolveProviderDisplay(
    code,
    lobbyStore.LobbyGameProviders,
    lobbyStore.searchResult?.providers.items ?? [],
  )
)
const games = computed(() =>
  lobbyStore.LobbyGameList.filter(g => g.providercode === code)
)
```

路由：`/search/provider/:code?keyword={keyword}`

### 1.4 GameTypeGamesView 狀態

```ts
import { GAME_TYPE_CODE_TO_ID } from '@/data/gameTypes'

const code = route.params.code as string    // 例：'Slot'
const keyword = route.query.keyword as string | undefined ?? ''

const gameTypeName = computed(() =>
  lobbyStore.searchResult?.gameTypes.items.find(t => t.code === code)?.name ?? code
)

// mapping 查表（例：Slot → 0）
const gameTypeId = computed(() => GAME_TYPE_CODE_TO_ID[code])

// 篩選策略：mapping 精確匹配 OR gametypename fallback
const games = computed(() =>
  lobbyStore.LobbyGameList.filter((game) => {
    const matchByTypeId =
      gameTypeId.value !== undefined &&
      Number(game.gametype) === gameTypeId.value
    const matchByTypeName =
      game.gametypename === gameTypeName.value ||
      game.gametypename === code
    return matchByTypeId || matchByTypeName
  })
)
```

路由：`/search/game-type/:code?keyword={keyword}`

---

## 二、執行期資料映射

### 2.1 `GameProvider` → `GamePlatformItem`

```ts
import type { GameProvider } from '@/apis/interface/lobby'
import type { GamePlatformItem } from '@/data/platforms'
import { resolveIconUrl } from '@/utils/url'

function providerToNavItem(p: GameProvider): GamePlatformItem {
  return {
    id: p.code,
    name: p.shortname || p.name,
    imagePath: resolveIconUrl(p.iconurl),
    isDiscover: false,
  }
}
```

### 2.2 Discover 固定導覽項目

```ts
const DISCOVER_NAV_ITEM: GamePlatformItem = {
  id: 'Discover',
  name: 'Discover',          // GamePlatformNav 顯示時使用 i18n key home.navigation.discover
  imagePath: '/assets/images/icons/discover.png',
  isDiscover: true,
}
```

### 2.3 `Game` → `GameCard`（provider 篩選頁用）

```ts
import type { Game } from '@/apis/interface/lobby'
import type { GameCard } from '@/data/games'
import { resolveIconUrl } from '@/utils/url'

function gameToCard(game: Game): GameCard {
  return {
    id: game.id,
    name: game.name,
    imagePath: resolveIconUrl(game.iconurl),
    value: 0,
    capsuleColor: 'red',
  }
}

function toGameCardPagesFromGames(games: Game[], pageSize = 4): GameCard[][] {
  const pages: GameCard[][] = []
  for (let i = 0; i < games.length; i += pageSize) {
    pages.push(games.slice(i, i + pageSize).map(gameToCard))
  }
  return pages
}
```

---

## 三、Mock 資料結構

### 3.1 `carouselPages`（3 頁）

```ts
// src/data/games.ts
export const carouselPages: GameCard[][] = [gameCards, [...gameCards], [...gameCards]]
```

每頁 4 張，使用 `GameCard-1~4.png`。用於 Discover 狀態的 hotGames / newGames mock 輪播。

---

## 四、路由對應表

| 路由 | View 元件 | 主要資料來源 |
|------|----------|-------------|
| `/` | `HomeView.vue` | `carouselPages`（Discover）或 `LobbyGameList`（provider filter） |
| `/search?keyword=` | `SearchView.vue` | `lobbyStore.searchResult` |
| `/search/provider/:code?keyword=` | `ProviderGamesView.vue` | `LobbyGameList` filter by `providercode` |
| `/search/game-type/:code?keyword=` | `GameTypeGamesView.vue` | `LobbyGameList` filter by `String(gametype)` |

---

## 五、工具函式

### `resolveIconUrl` + `resolveGameImagePath`（`src/utils/url.ts`）

```ts
// URL 正規化工具（不決定 fallback）
export function resolveIconUrl(iconurl: string | null | undefined): string {
  if (!iconurl) return ''
  if (iconurl.startsWith('//')) return `https:${iconurl}`
  return iconurl
}

// 遊戲卡片圖片工具（URL 正規化 + fallback 循環）
const GAME_CARD_FALLBACK_IMAGES = [
  '/assets/images/games/GameCard-1.png',
  '/assets/images/games/GameCard-2.png',
  '/assets/images/games/GameCard-3.png',
  '/assets/images/games/GameCard-4.png',
]
export function resolveGameImagePath(iconurl: string | null | undefined, idx: number): string {
  const resolved = resolveIconUrl(iconurl)
  return resolved || GAME_CARD_FALLBACK_IMAGES[idx % GAME_CARD_FALLBACK_IMAGES.length]
}
```

**職責**：
- `resolveIconUrl` — 只做 URL 正規化，空白回傳空字串（FR-025）。
- `resolveGameImagePath` — 遊戲卡片專用，fallback 至 `GameCard-1~4.png`（依 idx 輪替）。
- `no-data.png` 只給 EmptyState，禁止做遊戲卡片或 provider icon fallback（禁止事項 #14 #15）。

### `resolveProviderDisplay`（`src/utils/provider.ts`）

```ts
// 供應商顯示資料：優先 LobbyGameProviders → searchResult → code fallback
export function resolveProviderDisplay(
  code: string,
  lobbyProviders: GameProvider[],
  searchProviders: ProviderSearchItem[],
): ProviderDisplay
```

### `GAME_TYPE_CODE_TO_ID`（`src/data/gameTypes.ts`）

```ts
// 現階段 6 種（依截圖確認）
export const GAME_TYPE_CODE_TO_ID: Record<string, number> = {
  Slot: 0, TableGame: 1, LiveDealer: 2, Lobby: 3, Instant: 4, Fishing: 12,
}
```

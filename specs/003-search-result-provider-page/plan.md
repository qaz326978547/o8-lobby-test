# 實作計畫：搜尋結果頁與遊戲商遊戲列表頁

**分支**：`003-search-result-provider` | **日期**：2026-06-21 | **規格**：[spec.md](./spec.md)

**輸入**：功能規格來自 `specs/003-search-result-provider-page/spec.md`

---

## 摘要

本功能在現有 O8 Mobile Game Lobby UI Demo 上新增以下能力：

1. **首頁「發現」預設狀態**：GamePlatformNav 第一項固定為 Discover，顯示 3 頁 × 4 張 mock 輪播（hotGames / newGames）。
2. **GamePlatformNav API 資料整合**：Discover 後的供應商清單從 `All.gameproviders` 動態載入，取代靜態 mock 資料。
3. **首頁 Provider 篩選**：點擊供應商後在首頁（`/`）顯示該供應商遊戲列表，不導向子路由。
4. **SearchPanel inline 結果**：展開搜尋框仍在首頁（路由 `/`），輸入關鍵字後在 overlay 下方可捲動區域顯示搜尋結果（三段分區）；**不導航至 `/search`**。
5. **三個路由**：`/search`（stub，避免 deep link 404）、`/search/provider/:code`、`/search/game-type/:code`。
6. **新頁面**：`SearchView.vue`（stub 元件）、`ProviderGamesView.vue`（供應商遊戲頁，返回 `/`）、`GameTypeGamesView.vue`（遊戲類型頁，返回 `/`）。
7. **共用工具與元件**：`resolveIconUrl` 提取至 `src/utils/url.ts`，新增 `EmptyState.vue`。

---

## 技術環境

**語言／版本**：TypeScript 5.x、Vue 3.x

**主要依賴**：Vue 3 Composition API、Pinia、Vue Router 4、vue-i18n（legacy: false）、SCSS（sass-embedded）

**儲存**：N/A（純前端 SPA，狀態在 Pinia store）

**測試**：無自動化測試框架（manual E2E 驗收，per quickstart.md）

**目標平台**：行動裝置瀏覽器（主驗收寬度 390px，容器 max-width 768px）

**專案類型**：web-app（Vue 3 SPA）

**效能目標**：路由切換 < 200ms（lazy import）

**限制**：不引入新的大型 UI library；不破壞 001/002 已完成功能；`npm run build` 零 TypeScript 錯誤

---

## 憲法檢查

*閘門：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| Vue 3 Composition API + `<script setup lang="ts">` | ✅ | 所有新元件遵守 |
| 不使用大型 UI library（Element Plus 等） | ✅ | 無新引入 |
| 不使用 Tailwind CSS | ✅ | 全 SCSS scoped |
| mobile-first 390px / max-width 768px | ✅ | 新 views 同 HomeView 容器規則 |
| vue-i18n legacy: false | ✅ | 延用現有 i18n instance |
| 所有 UI 文字使用 i18n key | ✅ | 新增 3 個 i18n key |
| gamePlatform / games 名稱不需 i18n | ✅ | 遵守 |
| `npm run build` 零 TypeScript 錯誤 | ✅ | 每 phase 結束驗證 |
| 不把 no-data.png 當圖片 fallback | ✅ | resolveIconUrl 只做 URL 正規化；遊戲卡片 fallback 用 GameCard-1~4.png；no-data.png 只給 EmptyState |
| 不使用 non-null assertion（`!`）存取 groups | ✅ | 全部使用 `?.` 與 `?? []` |
| 不修改 GameCard.vue / GameSection.vue / HeroBanner.vue 核心視覺 | ✅ | 此三元件不在修改範圍 |
| 不重寫 HomeView.vue（最小改動） | ✅ | 僅新增 state + computed + watcher |
| 不在 runtime code 硬編碼 token 或 UGS domain | ✅ | token 來自 URL query；API base 來自 env |

**Phase 1 設計後重新確認**：✅ 所有合約均符合上述原則。

---

## 專案結構

### 規格文件（本功能）

```text
specs/003-search-result-provider-page/
├── plan.md              ← 本文件
├── spec.md              ← 功能規格
├── research.md          ← Phase 0 技術決策
├── data-model.md        ← Phase 1 資料模型
├── quickstart.md        ← Phase 1 驗收指南
├── contracts/
│   ├── EmptyState.md
│   ├── SearchView.md
│   ├── ProviderGamesView.md
│   └── GameTypeGamesView.md
└── tasks.md             ← Phase 2 任務（/speckit-tasks 產出）
```

### 原始碼異動清單

**新增**：
```text
src/utils/url.ts                        ← resolveIconUrl（URL 正規化）+ resolveGameImagePath（遊戲卡片 fallback）
src/utils/provider.ts                   ← resolveProviderDisplay 供應商顯示資料共用工具
src/data/gameTypes.ts                   ← GAME_TYPE_CODE_TO_ID 常數映射表
src/components/EmptyState.vue           ← 空狀態元件
src/views/SearchView.vue                ← 搜尋結果頁
src/views/ProviderGamesView.vue         ← 供應商遊戲列表頁
src/views/GameTypeGamesView.vue         ← 遊戲類型列表頁
```

**修改（最小改動）**：
```text
src/apis/interface/lobby.ts             ← Game 介面新增 gametypename?: string
src/data/games.ts                       ← carouselPages: 2頁 → 3頁
src/router/index.ts                     ← 新增 3 條路由
src/locales/zh-TW.ts                   ← 新增 3 個 i18n key
src/locales/en-US.ts                   ← 新增 3 個 i18n key（同步）
src/components/GamePlatformNav.vue      ← 新增 select-platform emit + li @click
src/components/SearchPanel.vue          ← debounce watcher → searchLobby（不 router.push）；新增可捲動 inline 結果區域（三段分區 + EmptyState）；keyword 即時同步 lobbyStore.searchKeyword；onMounted 從 store 還原 keyword
src/views/HomeView.vue                  ← selectedProviderCode + navItems + providerGameCards
```

---

## Phase 1：Foundation（基礎建設）

**目標**：完成不影響現有 UI 的基礎設施，確保新舊功能可並行。

### 任務

#### T001 新增 `src/utils/url.ts`

新建檔案，匯出 `resolveIconUrl`：

```ts
export function resolveIconUrl(iconurl: string | null | undefined): string {
  if (!iconurl) return ''
  if (iconurl.startsWith('//')) return `https:${iconurl}`
  return iconurl
}
```

同時在 `src/utils/url.ts` 新增 `resolveGameImagePath`，供遊戲卡片圖片 fallback 使用：

```ts
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

**職責分離**：
- `resolveIconUrl` 只做 URL 正規化（空值 → `''`，`//` → `https:`），**不決定 fallback 圖片**。
- `resolveGameImagePath` 在 URL 正規化後，若仍為空，依 index 輪替 `GameCard-1~4.png` 作為 fallback。
- `no-data.png` 只給 `EmptyState` 元件，**不得用於遊戲卡片或 provider icon fallback**。

更新 `src/views/HomeView.vue`：
- 移除 local `resolveIconUrl` 函式定義。
- 改用 `import { resolveIconUrl, resolveGameImagePath } from '@/utils/url'`。
- `toGameCardPages`（處理 API 遊戲）與 `providerGameCards`（處理 provider 篩選遊戲）的圖片映射改用 `resolveGameImagePath(game.iconurl, i)`。

更新 `src/components/SearchPanel.vue`：
- 移除 local `resolveIconUrl` 函式定義。
- 改為 `import { resolveIconUrl } from '@/utils/url'`。

#### T001b 更新 `src/apis/interface/lobby.ts` — 補充 `gametypename` 欄位

`Game` 介面新增可選欄位（API 實際回傳此欄位，原介面定義不完整）：

```ts
gametypename?: string
```

此欄位為 `GameTypeGamesView` 篩選的 fallback 使用（DEC-001、DEC-011）。

#### T001c 新增 `src/data/gameTypes.ts`

新建檔案，匯出 `GAME_TYPE_CODE_TO_ID` 常數：

```ts
export const GAME_TYPE_CODE_TO_ID: Record<string, number> = {
  Slot: 0,
  TableGame: 1,
  LiveDealer: 2,
  Lobby: 3,
  Instant: 4,
  Fishing: 12,
}
```

**限制**：現階段只支援上述 6 種遊戲類型（依設計稿截圖確認）。
不得先加入 `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery` 等截圖未使用的類型（DEC-015）。

#### T001d 新增 `src/utils/provider.ts`

新建檔案，匯出 `resolveProviderDisplay` 共用工具：

```ts
import type { GameProvider, ProviderSearchItem } from '@/apis/interface/lobby'
import { resolveIconUrl } from '@/utils/url'

export interface ProviderDisplay {
  code: string
  name: string
  iconPath: string
}

export function resolveProviderDisplay(
  code: string,
  lobbyProviders: GameProvider[],
  searchProviders: ProviderSearchItem[],
): ProviderDisplay {
  // 第一優先：All.gameproviders / LobbyGameProviders
  const fromLobby = lobbyProviders.find(p => p.code === code)
  if (fromLobby) {
    return {
      code,
      name: fromLobby.shortname || fromLobby.name || code,
      iconPath: resolveIconUrl(fromLobby.iconurl),
    }
  }
  // 第二優先：searchResult.providers.items
  const fromSearch = searchProviders.find(p => p.code === code)
  if (fromSearch) {
    return {
      code,
      name: fromSearch.shortname || fromSearch.name || code,
      iconPath: resolveIconUrl(fromSearch.iconurl),
    }
  }
  // 第三優先：純文字 fallback
  return { code, name: code, iconPath: '' }
}
```

**規則（DEC-014）**：
- `iconPath` 為空字串時：template 中以 `v-if="display.iconPath"` 控制是否渲染 `<img>`，顯示 name 文字佔位。
- `no-data.png` 不可作為 provider icon fallback（禁止事項 #15）。
- 此函式用於 **SearchPanel overlay**（provider 搜尋結果 card）和 **ProviderGamesView**（頁首 provider 資訊）；SearchView 為 stub，不使用此函式。

#### T002 修正 `carouselPages` 為 3 頁

```ts
// src/data/games.ts
export const carouselPages: GameCard[][] = [gameCards, [...gameCards], [...gameCards]]
```

#### T003 新增路由

```ts
// src/router/index.ts
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@/views/HomeView.vue') },
    { path: '/search', component: () => import('@/views/SearchView.vue') },
    { path: '/search/provider/:code', component: () => import('@/views/ProviderGamesView.vue') },
    { path: '/search/game-type/:code', component: () => import('@/views/GameTypeGamesView.vue') },
  ],
})
```

#### T004 新增 i18n keys

`src/locales/zh-TW.ts`（在 `search` 下新增）：
```ts
title: '搜尋',
emptyState: 'Woo...這裡暫時沒有東西',
```
`common.actions` 下新增：
```ts
back: '返回',
```

`src/locales/en-US.ts`（同步結構）：
```ts
title: 'Search',
emptyState: 'Woo... Nothing here yet',
```
`common.actions` 下新增：
```ts
back: 'Back',
```

#### T005 新增 `src/components/EmptyState.vue`

Props（均為選用，有預設值）：

```ts
const props = withDefaults(defineProps<{
  imageSrc?: string
  message?: string
}>(), {
  imageSrc: '/assets/images/no-data.png',
})
const { t } = useI18n()
const displayMessage = computed(() => props.message ?? t('home.search.emptyState'))
```

- `imageSrc` 預設 `/assets/images/no-data.png`（EmptyState 專用，不代表此圖為任何 fallback）。
- `message` 未傳入時，元件內以 `t('home.search.emptyState')` 提供預設文字。
- 呼叫方可省略兩個 props（使用預設），也可個別覆寫。

樣式：置中容器（`flex-direction: column`、`align-items: center`），圖片 80px × 80px，文字 13px `#888`，上下 padding 32px。

---

## Phase 2：HomeView 重構

**目標**：整合 API provider 資料至 GamePlatformNav，實作 selectedProviderCode 篩選邏輯。

### 任務

#### T006 更新 `GamePlatformNav.vue`

新增 emit 與 `<li>` click handler（不改變現有視覺）：

```ts
const emit = defineEmits<{
  'open-search': []
  'select-platform': [id: string]
}>()
```

Template 中 `<li>` 加入：
```html
@click="emit('select-platform', item.id)"
```

**i18n 顯示規則（D1 — constitution §七.12）**：渲染每個 item 的顯示文字時，必須根據 `item.isDiscover` 切換：
```html
{{ item.isDiscover ? t('home.navigation.discover') : item.name }}
```
不得直接顯示 `item.name`（其值為固定英文字串 `'Discover'`），否則 zh-TW 使用者將看到英文字。

#### T007 更新 `HomeView.vue` — navItems computed

```ts
import { resolveIconUrl } from '@/utils/url'
import type { GamePlatformItem } from '@/data/platforms'

const DISCOVER_NAV_ITEM: GamePlatformItem = {
  id: 'Discover',
  name: 'Discover',   // data key only; display text must use t('home.navigation.discover')
  imagePath: '/assets/images/icons/discover.png',
  isDiscover: true,
}

const navItems = computed<GamePlatformItem[]>(() => {
  const allGroup = lobbyStore.lobbyData?.Lobby.Data.groups.find(g => g.code === 'All')
  const apiItems: GamePlatformItem[] = (allGroup?.gameproviders ?? []).map(p => ({
    id: p.code,
    name: p.shortname || p.name,
    imagePath: resolveIconUrl(p.iconurl),
    isDiscover: false,
  }))
  return [DISCOVER_NAV_ITEM, ...apiItems]
})
```

Template 更新：
```html
<GamePlatformNav
  :platforms="navItems"
  :active-platform-id="selectedProviderCode ?? 'Discover'"
  @open-search="isSearchOpen = true"
  @select-platform="onSelectPlatform"
/>
```

移除 `import { platforms } from '@/data/platforms'`。

#### T008 更新 `HomeView.vue` — selectedProviderCode + 條件內容

新增狀態與 handler：
```ts
const selectedProviderCode = ref<string | null>(null)

function onSelectPlatform(id: string) {
  selectedProviderCode.value = id === 'Discover' ? null : id
}

const providerGameCards = computed<GameCard[]>(() => {
  if (!selectedProviderCode.value) return []
  return lobbyStore.LobbyGameList
    .filter(g => g.providercode === selectedProviderCode.value)
    .map((game, i) => ({
      id: game.id,
      name: game.name,
      imagePath: resolveGameImagePath(game.iconurl, i),
      value: 0,
      capsuleColor: 'red' as const,
    }))
})

const selectedProviderName = computed<string>(() => {
  const item = navItems.value.find(i => i.id === selectedProviderCode.value)
  return item?.name ?? selectedProviderCode.value ?? ''
})
```

Template 條件顯示（替換原 GameSection 區塊）：

**不使用 `<GameSection :title-key="''">` 以避免 i18n warning**。Provider 篩選狀態改用獨立 grid block，不修改 `GameSection.vue`。

```html
<!-- Provider 篩選狀態：自訂 grid（不修改 GameSection.vue / GameCard.vue） -->
<template v-if="selectedProviderCode !== null">
  <EmptyState v-if="providerGameCards.length === 0" />
  <div v-else class="provider-games">
    <div class="provider-games__grid">
      <!-- GameCard.vue 現有 prop 介面，不修改元件 -->
      <GameCard v-for="g in providerGameCards" :key="g.id" :game="g" />
    </div>
  </div>
</template>

<!-- Discover 預設狀態 -->
<template v-else>
  <GameSection
    :title-key="'home.sections.hotGames'"
    :pages="gamePages"
    gameType="hotGames"
  />
  <GameSection
    :title-key="'home.sections.newGames'"
    :pages="gamePages"
    gameType="newGames"
  />
</template>
```

SCSS 新增（HomeView `<style scoped>`）：
```scss
.provider-games {
  padding: 12px 0;
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}
```

新增 import：
```ts
import EmptyState from '@/components/EmptyState.vue'
import GameCard from '@/components/GameCard.vue'
import type { Game } from '@/apis/interface/lobby'
import { resolveIconUrl, resolveGameImagePath } from '@/utils/url'
```

#### T008b 更新 `src/stores/lobby.ts` — 新增 SearchPanel 狀態還原欄位

Lobby store 新增兩個欄位，用於子頁返回後 HomeView 自動重開 SearchPanel（見 FR-008、FR-013、FR-018）：

```ts
// 在 lobby store 的 state 中新增：
searchKeyword: ref<string>(''),
searchPanelShouldRestore: ref<boolean>(false),
```

**作用**：
- `searchKeyword`：SearchPanel 每次 keyword 變更時同步寫入（`lobbyStore.searchKeyword = val`）；HomeView 重掛後可從 store 讀回 keyword。
- `searchPanelShouldRestore`：子頁（ProviderGamesView / GameTypeGamesView）返回前設為 `true`；HomeView `onMounted` 偵測到此 flag 後，自動執行 `isSearchOpen = true`、`keyword = lobbyStore.searchKeyword`，再清除 flag（`lobbyStore.searchPanelShouldRestore = false`）。

HomeView `onMounted` 加入還原邏輯（**最小改動**，不重寫 HomeView）：
```ts
onMounted(() => {
  // ... 現有 onMounted 邏輯 ...
  if (lobbyStore.searchPanelShouldRestore) {
    isSearchOpen.value = true
    lobbyStore.searchPanelShouldRestore = false
    // keyword 由 SearchPanel 在 onMounted 自行從 lobbyStore.searchKeyword 讀取
  }
})
```

**邊界條件**：若 `lobbyStore.searchKeyword` 為空（store 已遺失），SearchPanel 以空 keyword 展開，不崩潰。

---

## Phase 3：SearchPanel 重構

**目標**：SearchPanel 負責展開搜尋框（overlay UI）、呼叫搜尋 API、在 overlay 下方可捲動區域顯示三段搜尋結果（inline）；**不導航至 `/search`**。

### 任務

#### T009 更新 `SearchPanel.vue`

**Script 修改**：

```ts
import { useLobbyStore } from '@/stores/lobby'
import { resolveIconUrl, resolveGameImagePath } from '@/utils/url'
import { resolveProviderDisplay } from '@/utils/provider'
import { useRouter } from 'vue-router'

const lobbyStore = useLobbyStore()
const router = useRouter()

// debounce watcher 改為呼叫 searchLobby（不 router.push 至 /search）
// 同時同步 keyword 至 store，供子頁返回後 HomeView 還原使用（FR-008）
watch(keyword, (val) => {
  lobbyStore.searchKeyword = val  // 即時同步，不 debounce（state restore 用）
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    lobbyStore.searchLobby({
      lobbyPath: 'mobile',
      token: lobbyStore.token ?? '',
      keyword: val,
    })
  }, 300)
})

// onMounted：若 searchPanelShouldRestore 已由 HomeView 消費，keyword 從 store 還原
// （HomeView 負責設定 isSearchOpen；SearchPanel 在 mount 後讀 keyword）
onMounted(() => {
  if (lobbyStore.searchKeyword) {
    keyword.value = lobbyStore.searchKeyword
  }
})

const searchGames = computed(() => lobbyStore.searchResult?.games.items ?? [])
const searchProviders = computed(() => lobbyStore.searchResult?.providers.items ?? [])
const searchGameTypes = computed(() => lobbyStore.searchResult?.gameTypes.items ?? [])
const hasAnyResults = computed(() =>
  searchGames.value.length > 0 || searchProviders.value.length > 0 || searchGameTypes.value.length > 0
)
```

**Template 修改**：在搜尋列（`search-panel__bar`）下方、Tags 區域上方，新增可捲動搜尋結果區域：
- `v-if="keyword && isSearching"` → 載入狀態
- `v-else-if="keyword && !hasAnyResults"` → `<EmptyState />`
- `v-else-if="keyword"` → 三段結果（games 2欄 grid、providers list、gameTypes chips）
  - provider 點擊 → `router.push('/search/provider/:code?keyword=' + keyword)`
  - gameType 點擊 → `router.push('/search/game-type/:code?keyword=' + keyword)`
- `v-else` → Tags 預設狀態

搜尋結果區域需設 `overflow-y: auto`，高度約 `calc(100vh - [搜尋列高度])`，可捲動。

---

## Phase 4：新 View 實作

**目標**：實作 SearchView（stub）、ProviderGamesView、GameTypeGamesView 三個新頁面。

### 任務

#### T010 新增 `src/views/SearchView.vue`（stub）

> **架構調整（2026-06-22）**：搜尋結果改為在 SearchPanel overlay inline 顯示，本元件僅作 stub。

```vue
<template><div /></template>
<script setup lang="ts"></script>
```

保留路由定義，避免直接訪問 `/search` 時出現 404。

#### T011 新增 `src/views/ProviderGamesView.vue`

參考 contracts/ProviderGamesView.md 規格。

**關鍵邏輯**：
- `code = route.params.code as string`
- `keyword = route.query.keyword as string ?? ''`
- `display = computed(() => resolveProviderDisplay(code, lobbyStore.LobbyGameProviders, lobbyStore.searchResult?.providers.items ?? []))`
  - 優先從 `LobbyGameProviders`（`All.gameproviders`）取得 name + iconPath
  - fallback 至 `searchResult.providers.items`
  - icon 空字串時顯示 name 文字佔位（`v-if="display.iconPath"` 控制 img），不使用 `no-data.png`
- `games = computed(() => lobbyStore.LobbyGameList.filter(g => g.providercode === code))`
- 頁面頂部：`<AppHeader />`（O8 logo + 語系 icon），import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺（per FR-009）
- 頁首列：返回按鈕（← icon）+ provider icon（`v-if="display.iconPath"` 控制 img）+ `display.value.name`（或空時 `code`）
- 返回：先設 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`（FR-013、DEC-016）
- 遊戲顯示：2欄 grid，`GameCard.vue` 元件；圖片使用 `resolveGameImagePath(game.iconurl, i)` 處理 fallback（DEC-003）
- 無遊戲：`<EmptyState />`（props 預設值生效）

#### T012 新增 `src/views/GameTypeGamesView.vue`

參考 contracts/GameTypeGamesView.md 規格。

**關鍵邏輯**：

```ts
import { GAME_TYPE_CODE_TO_ID } from '@/data/gameTypes'

const code = route.params.code as string
const keyword = route.query.keyword as string ?? ''

const gameTypeName = computed(() =>
  lobbyStore.searchResult?.gameTypes.items.find(t => t.code === code)?.name ?? code
)

const gameTypeId = computed(() => GAME_TYPE_CODE_TO_ID[code])

const gameTypeGames = computed(() => {
  return lobbyStore.LobbyGameList.filter((game) => {
    const matchByTypeId =
      gameTypeId.value !== undefined &&
      Number(game.gametype) === gameTypeId.value

    const matchByTypeName =
      game.gametypename === gameTypeName.value ||
      game.gametypename === code

    return matchByTypeId || matchByTypeName
  })
})
```

**篩選策略（DEC-011）**：
1. 先從 `GAME_TYPE_CODE_TO_ID` 查 `code`（例：`Slot → 0`）。
2. **第一優先**：`Number(game.gametype) === gameTypeId`（數字精確匹配）。
3. **Fallback**：`game.gametypename === gameTypeName.value || game.gametypename === code`。
4. 禁止只使用 `String(game.gametype) === code`（`"Slot"` 無法命中數字 `0`）。

**限制（嚴格）**：
- `GAME_TYPE_CODE_TO_ID` 現階段只含 `Slot/TableGame/LiveDealer/Lobby/Instant/Fishing`（6 種）。
- 不加入 `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery`（截圖未使用）。
- 不呼叫新 API；不新增 `gameTypeCode` query 參數。
- `gameTypes.items[].gamecount` 僅為數量提示；前端顯示遊戲數可能少於此值（API 限制）。

- 頁面頂部：`<AppHeader />`（O8 logo + 語系 icon），import from `@/components/AppHeader.vue`，不修改 AppHeader.vue 核心視覺（per FR-014）
- 頁首列：返回按鈕（← icon）+ `gameTypeName.value` 標題
- 返回：先設 `lobbyStore.searchPanelShouldRestore = true`，再執行 `router.push('/')`（FR-018、DEC-016）
- 遊戲顯示：2欄 grid，`GameCard.vue`；圖片使用 `resolveGameImagePath(game.iconurl, i)`
- 無遊戲：`<EmptyState />`（props 預設值生效）

---

## Phase 5：驗證

**目標**：確認零 TS 錯誤、手動 E2E 驗收。

### 任務

#### T013 Build 驗證

```bash
npm run build
```

預期：零 TypeScript 錯誤，零 ESLint 錯誤。

#### T014 手動 E2E 驗收

依照 `specs/003-search-result-provider-page/quickstart.md` 逐一確認 SC-001 ~ SC-012。

---

## 複雜度追蹤

無憲法違規。所有新元件均符合 Vue 3 Composition API、SCSS scoped、vue-i18n、mobile-first 原則。

---

## 設計決策索引

詳細決策依據見 `specs/003-search-result-provider-page/research.md`：

| 決策 | 摘要 |
|------|------|
| DEC-001 | `Game.gametype` 為 number；API 實際回傳 `gametypename?: string`，需補入介面；篩選優先用 `GAME_TYPE_CODE_TO_ID` 映射，fallback `gametypename` |
| DEC-002 | GamePlatformNav 資料來源為 `All.gameproviders`，非 `LobbyGameProviders` |
| DEC-003 | `resolveIconUrl` 只做 URL 正規化（空白→空字串）；遊戲卡片圖片 fallback 由 `resolveGameImagePath` 處理；`no-data.png` 只給 EmptyState |
| DEC-004 | SearchPanel 重構：watcher 改呼叫 `searchLobby()`；新增三段結果 inline 顯示（overlay 可捲動）；**不**導航至 `/search`（2026-06-22 調整） |
| DEC-005 | `carouselPages` 補第 3 頁 |
| DEC-006 | GamePlatformNav 新增 `select-platform` emit |
| DEC-007 | HomeView provider 篩選使用自訂 grid（`providerGameCards: GameCard[]`，不修改 GameSection.vue） |
| DEC-008 | 新增 3 條路由（lazy import） |
| DEC-009 | ~~SearchView 使用 `router.replace` 更新 URL~~（已棄用：SearchView 改為 stub，搜尋結果 inline 在 SearchPanel）（2026-06-22） |
| DEC-010 | ProviderGamesView 使用 `resolveProviderDisplay`：LobbyGameProviders → searchResult → code fallback；icon 空時顯示文字，不用 no-data.png |
| DEC-011 | GameTypeGamesView：`GAME_TYPE_CODE_TO_ID` 映射（6 種）+ `gametypename` fallback；禁止只用 `String(gametype)===code` |
| DEC-012 | EmptyState props 均選用：`imageSrc` 預設 `/assets/images/no-data.png`，`message` 預設 i18n `home.search.emptyState` |
| DEC-013 | 新增 3 個 i18n key |
| DEC-014 | `resolveProviderDisplay` 共用工具在 `src/utils/provider.ts`，優先順序：LobbyGameProviders → searchResult.providers → code 文字 |
| DEC-015 | `GAME_TYPE_CODE_TO_ID` 在 `src/data/gameTypes.ts`，現階段 6 種（Slot/TableGame/LiveDealer/Lobby/Instant/Fishing）|
| DEC-016 | 子頁（ProviderGamesView、GameTypeGamesView）返回按鈕：①設 `lobbyStore.searchPanelShouldRestore = true`，②執行 `router.push('/')`；HomeView `onMounted` 偵測 flag 後自動展開 SearchPanel 並從 `lobbyStore.searchKeyword` 還原 keyword，SearchPanel `onMounted` 讀 `lobbyStore.searchKeyword` 還原輸入框；使用 `router.push('/')` 而非 `router.back()` 確保 deep link 進入後的確定性（2026-06-22 調整：目標從 `/search?keyword=` 改為 `/`；F1 還原機制同日確認）|

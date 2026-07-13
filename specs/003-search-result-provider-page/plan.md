# 實作計畫：搜尋結果頁與遊戲商遊戲列表頁

**分支**：`003-search-result-provider` | **日期**：2026-06-21 | **規格**：[spec.md](./spec.md)

**輸入**：功能規格來自 `specs/003-search-result-provider-page/spec.md`

---

## 摘要

本功能在現有 O8 Mobile Game Lobby UI Demo 上新增以下能力：

1. **首頁「發現」預設狀態**：GamePlatformNav 第一項固定為 Discover，顯示 3 頁 × 4 張 mock 輪播（hotGames / newGames）。
2. **GamePlatformNav API 資料整合**：Discover 後的供應商清單從 `All.gameproviders` 動態載入，取代靜態 mock 資料。
3. **首頁 Provider 篩選**：點擊供應商後在首頁（`/`）顯示該供應商遊戲列表，不導向子路由。
4. **搜尋結果顯示於首頁主內容區**：展開搜尋框仍在首頁（路由 `/`）；SearchPanel overlay 只負責輸入與觸發，**不顯示搜尋結果**；使用者按 Enter / 點搜尋 icon / 點 tag 後，`lobbyStore.executeSearch(keyword)` 被呼叫，SearchPanel 關閉，`searchResultMode = true`；首頁 GamePlatformNav 下方主內容區顯示三段搜尋結果（取代 Discover 輪播或 provider 篩選）；**不導航至 `/search`**；GamePlatformNav 全程保留可見。
5. **三個路由**：`/search`（stub，避免 deep link 404）、`/search/provider/:code`、`/search/game-type/:code`。
6. **新頁面**：`SearchView.vue`（stub 元件）、`ProviderGamesView.vue`（供應商遊戲頁，返回 `/`）、`GameTypeGamesView.vue`（遊戲類型頁，返回 `/`）。
7. **共用工具與元件**：`resolveIconUrl` 提取至 `src/utils/url.ts`，新增 `EmptyState.vue`。
8. **API base path 調整**：不再使用 `/ugs-api`；dev proxy 改為代理 `/api`；lobby path 由 `mobile` 改為 `O8_Mobile_Lobby_test`；最終請求為 `/api/lobby/O8_Mobile_Lobby_test?token=...`（初始化）與 `/api/lobby/O8_Mobile_Lobby_test/search?...`（搜尋）。
9. **Token sessionStorage 保存**：URL token 優先 → 初始化成功後存入 `sessionStorage`（TTL 24 小時）並移除 URL token；sessionStorage fallback；過期不呼叫 API；token utility 在 `src/utils/tokenSession.ts`。
10. **遊戲啟動**：`resolveGameLaunchUrl` 以 `game.url` 優先組完整 launchUrl（補 `VITE_UGS_FRONTEND_ORIGIN`）；`supportiframe === true` → `/game-frame` iframe；`supportiframe === false` → `window.location.href`；`GameFrameView.vue` 為新 iframe 頁。
11. **Hot/New API 群組整合**：`O8_Mobile_Lobby_test` 回傳含 Hot/New group；首頁熱門遊戲、新品推薦優先使用 API 資料（有 API 遊戲時支援 `launchGame()`）；無資料時 fallback mock；`LobbyGameList` 改為只取 `All.games`（避免重複）；輪播過場改為 slide 效果。

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
src/utils/tokenSession.ts               ← token sessionStorage utility（saveTokenToSession / getTokenFromSession / clearTokenFromSession）
src/utils/gameLaunch.ts                 ← resolveGameLaunchUrl + launchGame helper
src/data/gameTypes.ts                   ← GAME_TYPE_CODE_TO_ID 常數映射表
src/components/EmptyState.vue           ← 空狀態元件
src/views/SearchView.vue                ← 搜尋結果頁（stub）
src/views/ProviderGamesView.vue         ← 供應商遊戲列表頁
src/views/GameTypeGamesView.vue         ← 遊戲類型列表頁
src/views/GameFrameView.vue             ← iframe 遊戲啟動頁（/game-frame）
```

**修改（最小改動）**：
```text
src/apis/interface/lobby.ts             ← Game 介面新增 gametypename?: string、url?: string
src/data/games.ts                       ← carouselPages: 2頁 → 3頁
src/router/index.ts                     ← 新增 4 條路由（含 /game-frame）
src/locales/zh-TW.ts                   ← 新增 i18n key（back、backToHome 等）
src/locales/en-US.ts                   ← 新增 i18n key（同步）
src/components/GamePlatformNav.vue      ← 新增 select-platform emit + li @click
src/components/SearchPanel.vue          ← Enter / 搜尋 icon click / tag click 觸發 executeSearch()；搜尋完成後 overlay 關閉；不在 overlay 內顯示搜尋結果；keyword 即時同步 lobbyStore.searchKeyword；X 關閉只關閉 overlay 不清除首頁結果
src/views/HomeView.vue                  ← selectedProviderCode + navItems + providerGameCards；searchResultMode 優先順序主內容切換；onMounted token session 流程；API 遊戲卡片 click 使用 launchGame()
vite.config.ts                          ← proxy /api → https://frontendwebsite.ugsdev.com；移除 /ugs-api proxy
.env.development                        ← VITE_UGS_API_BASE=（空），VITE_UGS_FRONTEND_ORIGIN=https://frontendwebsite.ugsdev.com
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
- 此函式用於 **HomeView 首頁主內容區**（搜尋結果「遊戲商」區塊）和 **ProviderGamesView**（頁首 provider 資訊）；SearchView 為 stub，不使用此函式。

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

#### T008b 更新 `src/stores/lobby.ts` — 新增搜尋結果模式狀態與 actions

Lobby store 新增以下欄位與 actions（見 FR-035~FR-040、spec.md §Session 2026-06-23）：

```ts
// 在 lobby store 的 state 中新增：
const searchKeyword = ref<string>('')
const searchResultMode = ref<boolean>(false)
const searchError = ref<string | null>(null)
// 移除：searchPanelShouldRestore（改由 searchResultMode 承擔跨頁搜尋結果保留）
```

**新增 actions**：

```ts
// executeSearch：封裝搜尋觸發邏輯（供 SearchPanel 呼叫）
async function executeSearch(keyword: string) {
  if (!keyword.trim()) return
  searchKeyword.value = keyword
  await searchLobby({ lobbyPath: 'O8_Mobile_Lobby_test', token: token.value ?? '', keyword })
  searchResultMode.value = true
}

// clearSearchResult：清除搜尋結果模式（點 Discover / provider 時呼叫）
function clearSearchResult() {
  searchResult.value = null
  searchResultMode.value = false
  searchKeyword.value = ''
}
```

**各欄位作用**：
- `searchKeyword`：SearchPanel input 即時同步寫入（`lobbyStore.searchKeyword = val`）；供 HomeView 顯示搜尋結果時的標籤使用。
- `searchResultMode`：`true` 時首頁主內容顯示搜尋結果（優先於 selectedProviderCode 和 Discover 輪播）；子頁返回後自動保留，首頁直接顯示結果，不重新呼叫 API。
- `searchError`：搜尋失敗時存錯誤訊息；目前可 `null`，供後續 UI 錯誤處理使用。

**HomeView `onMounted` 調整**（**最小改動**，不重寫 HomeView）：
- 移除原有 `if (lobbyStore.searchPanelShouldRestore)` 邏輯
- 首頁主內容由 `lobbyStore.searchResultMode` 控制，不需要 onMounted 特殊處理
- `lobbyStore.searchResultMode` 為 reactive，Vue template 自動偵測並更新顯示

**邊界條件**：若 `lobbyStore.searchResult` 為 `null` 且 `searchResultMode === true`（store 遺失），首頁 template 可自動降為 Discover 預設（template guard：`v-if="searchResultMode && searchResult"`），不崩潰。

---

## Phase 3：SearchPanel 搜尋輸入 UI

**目標**：SearchPanel overlay 只負責輸入與觸發；**不在 overlay 內顯示搜尋結果**。搜尋觸發後，overlay 關閉，首頁主內容區顯示搜尋結果。

### 任務

#### T009 更新 `SearchPanel.vue`

**SearchTag 介面更新**：

```ts
export interface SearchTag {
  id: string
  label: string        // 顯示文字（可 i18n）
  searchValue: string  // 傳給 API 的關鍵字（固定英文/字串）
}
```

**Script 修改**：

```ts
import { useLobbyStore } from '@/stores/lobby'
import { useRouter } from 'vue-router'

const lobbyStore = useLobbyStore()
const router = useRouter()
const keyword = ref('')

// 只即時同步 keyword 至 store，不呼叫 API（禁止 debounce 自動觸發 API）
watch(keyword, (val) => {
  lobbyStore.searchKeyword = val
})

// 搜尋觸發函式（Enter / 搜尋 icon / tag 三種事件共用）
async function triggerSearch(searchValue: string) {
  if (!searchValue.trim()) return
  keyword.value = searchValue
  await lobbyStore.executeSearch(searchValue)  // 設 searchResultMode = true
  emit('close')  // 關閉 SearchPanel overlay
}

// Enter 鍵 handler
function onKeyEnter() {
  triggerSearch(keyword.value)
}

// 搜尋 icon 點擊 handler
function onSearchIconClick() {
  triggerSearch(keyword.value)
}

// Tag 點擊 handler（使用 tag.searchValue，非 tag.label）
function onTagClick(tag: SearchTag) {
  triggerSearch(tag.searchValue)
}

// X 關閉：只關閉 overlay，不清除首頁搜尋結果（searchResultMode 不受影響）
function onClose() {
  keyword.value = ''
  lobbyStore.searchKeyword = ''
  emit('close')
}
```

**Template 修改**：SearchPanel overlay 只顯示搜尋列與預設 tags，**不顯示三段搜尋結果**：

```html
<div class="search-panel__bar">
  <input
    v-model="keyword"
    class="search-panel__input"
    :placeholder="t('home.search.placeholder')"
    autofocus
    @keyup.enter="onKeyEnter"
  />
  <button type="button" class="search-panel__clear" @click="onClose">
    {{ t('home.search.clear') }}
  </button>
  <img
    class="search-panel__icon"
    src="/assets/images/icons/search.png"
    alt=""
    @click="onSearchIconClick"
  />
</div>

<!-- 預設 tags（始終顯示，不切換為搜尋結果） -->
<div class="search-panel__tags">
  <span
    v-for="tag in tags"
    :key="tag.id"
    class="search-panel__tag search-panel__tag--clickable"
    @click="onTagClick(tag)"
  >{{ tag.label }}</span>
</div>
```

**移除**：原有的 `v-if="keyword"` 搜尋結果分支（games grid、providers list、gameTypes chips、EmptyState）全數從 SearchPanel 移除；這些 UI 移至首頁主內容區（T008b + HomeView template 修改）。

**HomeView searchTags 定義更新**（`src/views/HomeView.vue`）：

```ts
const searchTags: SearchTag[] = [
  { id: 'atg', label: 'ATG', searchValue: 'ATG' },
  { id: 'ag-live', label: 'AG Live', searchValue: 'AG Live' },
  { id: 'war-god', label: '戰神賽特', searchValue: '戰神賽特' },
  { id: 'slots', label: t('home.search.tags.slots'), searchValue: 'Slot' },
]
```

**HomeView 主內容區更新**（三段優先順序）：

```html
<!-- 搜尋結果模式（優先） -->
<template v-if="lobbyStore.searchResultMode && lobbyStore.searchResult">
  <div v-if="lobbyStore.isSearching" class="search-results__loading">...</div>
  <EmptyState v-else-if="!hasAnySearchResults" />
  <template v-else>
    <!-- 遊戲 / 遊戲商 / 遊戲類別三段 -->
  </template>
</template>

<!-- Provider 篩選（次優先） -->
<template v-else-if="selectedProviderCode !== null">
  <EmptyState v-if="providerGameCards.length === 0" />
  <div v-else class="provider-games">...</div>
</template>

<!-- Discover 預設（最低優先） -->
<template v-else>
  <GameSection title-key="home.sections.hotGames" :pages="gamePages" gameType="hotGames" />
  <GameSection title-key="home.sections.newGames" :pages="gamePages" gameType="newGames" />
</template>
```

**onSelectPlatform 更新**：點擊 provider 時呼叫 `clearSearchResult()` 清除搜尋模式：
```ts
function onSelectPlatform(id: string) {
  lobbyStore.clearSearchResult()
  selectedProviderCode.value = id === 'Discover' ? null : id
}
```

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
- 返回：直接執行 `router.push('/')`（FR-013、DEC-016）；返回後 `lobbyStore.searchResultMode` 仍為 `true`，首頁主內容自動顯示搜尋結果；SearchPanel **不自動展開**；若 `searchResult === null`，首頁回到 Discover 預設
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
- 返回：直接執行 `router.push('/')`（FR-018、DEC-016）；返回後 `lobbyStore.searchResultMode` 仍為 `true`，首頁主內容自動顯示搜尋結果；SearchPanel **不自動展開**；若 `searchResult === null`，首頁回到 Discover 預設
- 遊戲顯示：2欄 grid，`GameCard.vue`；圖片使用 `resolveGameImagePath(game.iconurl, i)`
- 無遊戲：`<EmptyState />`（props 預設值生效）

---

## Phase 6：API base 調整與 Token sessionStorage（2026-06-25 新增）

**目標**：將前端 API 呼叫從 `/ugs-api/api/...` 改為 `/api/...`；實作 token sessionStorage 保存與 URL 移除流程。

### 任務

#### T_ENV 更新 `.env.development`

```env
VITE_UGS_API_BASE=
VITE_UGS_FRONTEND_ORIGIN=https://frontendwebsite.ugsdev.com
```

- `VITE_UGS_API_BASE` 空字串 → axios 以相對路徑請求（配合 dev proxy `/api` 轉發）。
- `VITE_UGS_FRONTEND_ORIGIN` 供 `resolveGameLaunchUrl` 補齊 `game.url` 相對路徑。

#### T_VITE 更新 `vite.config.ts`

```ts
server: {
  proxy: {
    '/api': {
      target: 'https://frontendwebsite.ugsdev.com',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

移除（或停用）原有 `/ugs-api` proxy 設定。`/gamelauncher` 不需本地 proxy（遊戲連結直接以 `VITE_UGS_FRONTEND_ORIGIN` 組成完整外部 URL，不依賴 proxy）。

#### T_TOKEN 新增 `src/utils/tokenSession.ts`

```ts
const TOKEN_STORAGE_KEY = 'ugs_lobby_token'
const TOKEN_EXPIRE_MS = 24 * 60 * 60 * 1000

interface StoredToken { token: string; expiresAt: number }

export function saveTokenToSession(token: string): void {
  const data: StoredToken = { token, expiresAt: Date.now() + TOKEN_EXPIRE_MS }
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data))
}

export function getTokenFromSession(): string | null {
  const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (!raw) return null
  const data = JSON.parse(raw) as StoredToken
  if (Date.now() > data.expiresAt) {
    clearTokenFromSession()
    return null
  }
  return data.token
}

export function clearTokenFromSession(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}
```

#### T_INIT 更新 `src/views/HomeView.vue` onMounted — token session 流程

```ts
onMounted(async () => {
  // 1. URL token 優先
  const urlToken = typeof route.query.token === 'string' ? route.query.token : null

  // 2. sessionStorage fallback
  const effectiveToken = urlToken ?? getTokenFromSession()

  if (effectiveToken) {
    lobbyStore.setToken(effectiveToken)
    try {
      await lobbyStore.fetchLobbyData()
      // 3. 成功後存 session + 移除 URL token
      if (urlToken) {
        saveTokenToSession(urlToken)
        const query = { ...route.query }
        delete query.token
        router.replace({ query })  // 不觸發頁面重整
      }
    } catch {
      // API 失敗：首頁保持 Discover mock，不崩潰
    }
  }
  // 4. 無 token → 不呼叫 API，Discover mock 正常顯示

  // scroll handler（保留原有）
  const handler = () => { scrollY.value = window.scrollY }
  window.addEventListener('scroll', handler, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', handler))
})
```

---

## Phase 7：遊戲啟動（Game Launch + GameFrameView）（2026-06-25 新增）

**目標**：實作 `resolveGameLaunchUrl`、`launchGame` helper、`GameFrameView.vue`，以及各遊戲卡片的 click 整合。

### 任務

#### T_LAUNCH 新增 `src/utils/gameLaunch.ts`

```ts
import type { Game } from '@/apis/interface/lobby'

export function resolveGameLaunchUrl(
  game: Game,
  token: string,
  frontendOrigin: string,
): string {
  let url = game.url ?? ''

  if (!url) {
    // fallback：手組 /gamelauncher
    url = `/gamelauncher?token=${token}&gpcode=${game.providercode}&gcode=${game.code}&fromlobby=true`
  }

  // {TOKEN} placeholder 替換
  url = url.replace('{TOKEN}', token)

  // protocol-relative → https:
  if (url.startsWith('//')) return `https:${url}`

  // 絕對 URL → 直接使用
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  // 相對路徑 → 補 frontendOrigin
  return `${frontendOrigin}${url}`
}

export function launchGame(
  game: Game,
  token: string,
  frontendOrigin: string,
  push: (path: string) => void,
): void {
  const launchUrl = resolveGameLaunchUrl(game, token, frontendOrigin)
  if (game.supportiframe) {
    sessionStorage.setItem('ugs_game_launch_url', launchUrl)
    push('/game-frame')
  } else {
    window.location.href = launchUrl
  }
}
```

#### T_FRAME 新增 `src/views/GameFrameView.vue`

頁面結構：
```
GameFrameView
├── GameFrameHeader
│   └── 返回首頁按鈕（← 或 i18n backToHome）→ router.push('/')，清除 ugs_game_launch_url
└── iframe（src = sessionStorage.getItem('ugs_game_launch_url')）
    └── 無 launchUrl → <EmptyState /> + 返回首頁按鈕
```

SCSS：
```scss
.game-frame-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.game-frame-view__header {
  flex-shrink: 0;
  // header height ~48px
}
.game-frame-view__iframe {
  flex: 1;
  width: 100%;
  border: 0;
}
```

**限制**：header 不顯示玩家/餘額/幣別；不修改 `AppHeader.vue`。

#### T_ROUTE_FRAME 更新 `src/router/index.ts` — 新增 `/game-frame`

```ts
{ path: '/game-frame', component: () => import('@/views/GameFrameView.vue') },
```

#### T_CLICK 更新各遊戲卡片 click handler

- `src/views/HomeView.vue`（provider 篩選遊戲列表）：`<GameCard @click="launchGame(apiGame, ...)">`
- `src/views/ProviderGamesView.vue`：同上
- `src/views/GameTypeGamesView.vue`：同上
- `src/views/HomeView.vue`（搜尋結果 games 區塊）：若 `game.url` 缺失，先查 `lobbyStore.LobbyGameList` 取完整 game 再 launch

**Discover mock 輪播卡片**：使用 `GameCard` 原有行為，無真實 `game.url`，現階段不套用 `launchGame`。

---

## Phase 13：Lobby Path 調整、Hot/New API 群組整合、輪播 Slide 效果（2026-07-02 新增）

**目標**：1. 統一 lobby API path 為 `O8_Mobile_Lobby_test`；2. 首頁 Hot/New 輪播改為 API 資料優先（mock fallback）並支援遊戲啟動；3. `LobbyGameList` 改為只取 `All.games`；4. 輪播過場改為 slide 效果。

### 任務

#### T035 更新 `src/stores/lobby.ts` — executeSearch lobby path

`executeSearch` 中 `searchLobby` 呼叫的 `lobbyPath` 由 `'mobile'` 改為 `'O8_Mobile_Lobby_test'`（`fetchLobbyData` 預設值已設為 `'O8_Mobile_Lobby_test'`，無需修改）：

```ts
async function executeSearch(keyword: string): Promise<void> {
  if (!keyword.trim()) return
  searchKeyword.value = keyword
  await searchLobby({ lobbyPath: 'O8_Mobile_Lobby_test', token: token.value ?? '', keyword })
  searchResultMode.value = true
}
```

#### T036 更新 `src/stores/lobby.ts` — LobbyGameList 來源改為 All.games

`LobbyGameList` computed 由「所有可見群組的遊戲」改為只取 `All` group 的遊戲，避免 Hot/New 遊戲在 provider 篩選與遊戲類別篩選結果中重複：

```ts
const LobbyGameList = computed<Game[]>(() => {
  if (!lobbyData.value) return []
  const allGroup = lobbyData.value.Lobby.Data.groups
    .filter((g) => g.isvisible)
    .find((g) => g.code === 'All')
  return allGroup?.games ?? []
})
```

**禁止 non-null assertion**；`All` group 不存在時回傳空陣列，ProviderGamesView 與 GameTypeGamesView 顯示 EmptyState，不崩潰。

#### T037 更新 `src/views/HomeView.vue` — Hot/New 遊戲頁面 computed

新增 `hotGames` 與 `newGames` computed（直接取 group games，不走 LobbyGameList）：

```ts
const hotGames = computed<Game[]>(() =>
  lobbyStore.lobbyData?.Lobby.Data.groups.find((g) => g.code === 'Hot')?.games ?? []
)
const newGames = computed<Game[]>(() =>
  lobbyStore.lobbyData?.Lobby.Data.groups.find((g) => g.code === 'New')?.games ?? []
)
```

新增 `gamesToCardPages(games: Game[], pageSize = 4): GameCardData[][]` helper（或修改 `toGameCardPages` 使其接受 `Game[]`），將 API 遊戲轉換為分頁 `GameCardData[][]`：

```ts
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
      }))
    )
  }
  return pages
}

const hotGamePages = computed<GameCardData[][]>(() =>
  hotGames.value.length > 0 ? gamesToCardPages(hotGames.value) : carouselPages
)
const newGamePages = computed<GameCardData[][]>(() =>
  newGames.value.length > 0 ? gamesToCardPages(newGames.value) : carouselPages
)
```

#### T038 更新 `src/views/HomeView.vue` — Hot/New 遊戲卡片 click handler（API 資料時）

由於 `GameSection.vue` props 不得修改，有 API 遊戲時，HomeView template 使用**獨立輪播區塊**（不經由 `<GameSection>`）渲染，以支援 `@click`；mock fallback 時仍使用 `<GameSection>`：

```html
<!-- 熱門遊戲：有 API 資料 → 獨立輪播（支援 click）；無資料 → GameSection mock -->
<template v-if="hotGames.length > 0">
  <div class="game-section">
    <div class="game-section__header">
      <img class="game-section__icon" src="/assets/images/icons/hotGames.png" alt="" />
      <h2 class="game-section_title">{{ t('home.sections.hotGames') }}</h2>
    </div>
    <div ref="hotCarouselRef" class="game-section__carousel">
      <div :key="hotCurrentPage" class="game-section__grid slide-page">
        <GameCard
          v-for="(game, i) in hotCurrentPageGames"
          :key="game.id"
          :image-path="resolveGameImagePath(game.iconurl, i)"
          :name="game.name"
          :value="0"
          capsule-color="red"
          @click="onClickDiscoverGame(game)"
        />
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
  </div>
</template>
<GameSection v-else :title-key="'home.sections.hotGames'" :pages="carouselPages" gameType="hotGames" />
```

（New 輪播同樣結構，使用 `newCurrentPage`、`newGamePages`、`onClickDiscoverGame`。）

新增 handler：
```ts
function onClickDiscoverGame(game: Game) {
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  launchGame(game, token, import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? '', router.push)
}
```

需要額外的 `hotCurrentPage`、`newCurrentPage` 狀態與對應的 auto-play/touch gesture 邏輯（與 `GameSection.vue` 邏輯相同，但在 HomeView 內實作），因 GameSection 內部封裝了這些 state。

**Mock fallback 時**：`<GameSection>` 的 `GameCard` 無 click handler（GameSection.vue 不修改），點擊無反應（符合規格，mock 資料無真實 `Game` 物件）。

#### T039 更新 `src/components/GameSection.vue` — 輪播過場改為 slide

將 `<Transition name="fade" mode="out-in">` 改為 CSS slide 效果：

```html
<!-- 移除 Transition wrapper，改用純 CSS transform slide -->
<div ref="carouselRef" class="game-section__carousel">
  <div class="game-section__slides" :style="{ transform: `translateX(-${currentPage * 100}%)` }">
    <div v-for="(page, idx) in pages" :key="idx" class="game-section__grid">
      <GameCardComponent v-for="card in page" :key="card.id" ... />
    </div>
  </div>
</div>
```

SCSS 變更：
```scss
.game-section__carousel {
  overflow: hidden;  // 隱藏非當前頁
}
.game-section__slides {
  display: flex;
  transition: transform 0.3s ease;  // 平滑滑動
}
.game-section__grid {
  flex: 0 0 100%;  // 每頁佔 100% 寬度
}

/* 移除 fade 相關 CSS */
/* .fade-enter-active, .fade-leave-active, .fade-enter-from, .fade-leave-to */
```

**保留**：自動播放（5 秒 setInterval）、觸控手勢（touchstart/touchmove/touchend 邏輯不變）、分頁指示器視覺；props 介面不變。

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
| DEC-004 | SearchPanel 職責收窄（2026-06-23 修正）：overlay 只負責輸入與觸發；**禁止 debounce 或 input change 自動呼叫 API**；僅 Enter / 搜尋 icon click / tag click 三種事件呼叫 `executeSearch()`；搜尋完成後 overlay 關閉、`searchResultMode = true`；三段搜尋結果移至首頁主內容區顯示；**不在 overlay 顯示結果**；**不導航至 `/search`** |
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
| DEC-016 | 子頁（ProviderGamesView、GameTypeGamesView）返回按鈕（2026-06-23 修正）：只執行 `router.push('/')`，**不設任何 flag**；返回後 `lobbyStore.searchResultMode` 仍保留 `true`，首頁 template reactive 偵測並直接顯示搜尋結果；SearchPanel overlay **不自動展開**；使用 `router.push('/')` 而非 `router.back()` 確保 deep link 進入後的確定性；若 `searchResult === null`（store 遺失），首頁回到 Discover 預設，不崩潰 |
| DEC-017 | API base path 由 `/ugs-api/api` 改為 `/api`（2026-06-25）：前端 proxy 由 `/ugs-api` 改為 `/api`；axios baseURL 由 `VITE_UGS_API_BASE` 控制（空字串則請求相對於當前 origin）；確保 Network request 為 `/api/lobby/mobile?...` |
| DEC-018 | Token sessionStorage 策略（2026-06-25）：URL token 優先 → 初始化成功 → 存入 `sessionStorage`（24hr TTL）→ 移除 URL token（`replaceState` 不重整）；sessionStorage fallback；過期清除不呼叫 API；不使用 `localStorage` 避免長期保留 |
| DEC-019 | Token URL 移除以 `window.history.replaceState` 或 `router.replace`（2026-06-25）：確保 token 不長期暴露在 URL；其他 query 參數保留；不觸發路由重新掛載 |
| DEC-020 | `resolveGameLaunchUrl`（2026-06-25）：`game.url` 優先；相對路徑補 `VITE_UGS_FRONTEND_ORIGIN`；protocol-relative 補 `https:`；`{TOKEN}` placeholder 替換；`game.url` 不存在才 fallback 手組 `/gamelauncher?...` |
| DEC-021 | supportiframe 分流（2026-06-25）：`true` → `sessionStorage.setItem('ugs_game_launch_url', url)` + `router.push('/game-frame')`（launchUrl 不入 route query 以免 token 暴露）；`false` → `window.location.href = url` |
| DEC-022 | `GameFrameView` 以 `sessionStorage` 取得 launchUrl（2026-06-25）：避免 token 出現在 route query；直接訪問 `/game-frame` 時若無 launchUrl 顯示 EmptyState，不崩潰 |
| DEC-023 | 搜尋結果 game item 缺 `url` → 回查 `LobbyGameList`（2026-06-25）：search result 的 `GameSearchItem` 可能比完整 `Game` 少欄位；以 `code + providercode` 在 `LobbyGameList` 查完整 game 資料再 launch |
| DEC-024 | 統一 lobby API path 為 `O8_Mobile_Lobby_test`（2026-07-02）：`fetchLobbyData` 預設值已更新；`executeSearch` 的 `searchLobby` 呼叫同步改為 `'O8_Mobile_Lobby_test'`；path 不硬編碼於多處，保持單一變更點 |
| DEC-025 | `LobbyGameList` 改為只取 `All.games`（2026-07-02）：`O8_Mobile_Lobby_test` 回傳 Hot/New/All 群組；若 LobbyGameList 仍從所有可見群組彙整，provider 篩選和 gametype 篩選會有重複遊戲；改為只取 `All.games`；Hot/New 群組從 `lobbyData.value.Lobby.Data.groups.find(g => g.code === 'Hot/New')` 直接取，不走 LobbyGameList；`All` 不存在時回傳空陣列，不崩潰（禁止 non-null assertion） |
| DEC-026 | Hot/New 輪播 API-first 設計（2026-07-02）：有 API 遊戲資料時，HomeView 使用獨立輪播區塊（不經由 `<GameSection>`）以支援 `@click` → `launchGame`；API 無資料時 fallback 使用 `<GameSection>` + mock `carouselPages`（mock 遊戲不可點擊啟動，符合規格）；GameSection.vue props 不修改 |
| DEC-027 | 輪播過場改為 CSS slide（2026-07-02）：移除 `<Transition name="fade">`；改以 `display:flex` + `transition: transform 0.3s ease` 實作；`currentPage` 變化時 `translateX(-N*100%)` 做平滑左右滑動；自動播放與觸控手勢邏輯不變；fade 相關 CSS class 全部移除 |

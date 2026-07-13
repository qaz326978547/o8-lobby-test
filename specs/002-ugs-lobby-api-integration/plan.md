# 實作計畫：UGS Lobby API 串接

**分支**：`002-ugs-lobby-api-integration` | **日期**：2026-06-17 | **規格**：[spec.md](./spec.md)

**輸入**：功能規格來自 `specs/002-ugs-lobby-api-integration/spec.md`

---

## 摘要

將 O8 手機版遊戲大廳 UI Demo（001）逐步串接 UGS Lobby API，分五個 Phase 推進，
每個 Phase 皆可獨立驗收，且不得破壞前一階段的既有行為。

核心方向：
- API base 以 `VITE_UGS_API_BASE` 環境變數控制，業務程式碼不出現任何 domain 硬編碼。
- `/ugs-api` 是本專案目前選用的 proxy base path（非 API 文件規定），
  透過 Vite dev proxy 在本機將其轉發至 `https://frontendwebsite.ugsdev.com`。
  API 文件原始 endpoint 使用 `{UgsFrontendWebsiteUrl}` 表示 base。
- `token` 從 URL query string 取得，不可硬編碼。
- 首頁遊戲資料優先使用 API 回傳的 `Lobby.Data.groups`，無資料時 fallback 至 mock。
- 玩家 / 餘額 / 幣別資料先存 store，現階段不接 UI。
- 搜尋與遊戲啟動列入規格，可後續階段實作。

---

## 技術環境

**語言／版本**：TypeScript 5.x（Vue 3 + Vite 專案）

**主要依賴**：Vue 3（Composition API）、Pinia、Vue Router、vue-i18n、axios、SCSS

**儲存**：N/A（前端 SPA，無後端資料庫）

**測試**：尚未設定測試框架（參見憲法 TODO(TEST_FRAMEWORK)）；以瀏覽器手動驗收為主

**目標平台**：現代行動裝置瀏覽器（Chrome / Safari）；本機開發以 Vite dev server

**專案類型**：mobile-first web-app（SPA）

**效能目標**：首頁 Lobby API 呼叫完成後，遊戲卡片應在正常網路環境下於 2 秒內渲染完成

**限制**：
- 不破壞 001 UI Demo 的任何既有視覺與互動
- 不新增玩家資訊、餘額、幣別 UI
- 不在 `src/` 中出現 domain 硬編碼或固定 proxy path 字串
- `npm run build` 必須在每個 Phase 完成後通過

**範圍／規模**：5 個主要來源檔案需修改；新增 1 個 store action、2 個 API 函式、
若干 computed 與 1 個 helper；不新增頁面或主要元件

---

## 憲法檢查

*依據 `.specify/memory/constitution.md` v2.1.0*
*閘門：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

### Phase 0（研究前）閘門

| 憲法原則 | 本功能符合狀況 | 狀態 |
|---------|--------------|------|
| 一、專案目標 — 第一階段不包含 API 串接 | 002 是第二階段，明確超出 001 範圍，為預期擴展 | ✅ 合規 |
| 二、核心技術 — Composition API、`<script setup lang="ts">` | 所有修改皆在現有架構下，不引入新框架 | ✅ 合規 |
| 二、核心技術 — 第一階段不引入 Pinia | 001 不用 Pinia；002 使用已存在的 `src/stores/lobby.ts` | ✅ 合規 |
| 三、視覺還原 — 不破壞 001 視覺 | API 串接加 fallback 機制，API 失敗時保持 mock 顯示 | ✅ 合規 |
| 四、素材使用 — 圖片路徑正確 | `game.iconurl` 優先，mock 圖片保留為 fallback | ✅ 合規 |
| 五、元件與資料結構 — 不重寫元件 | 以 adapter 橋接 API 型別與現有 GameCard props | ✅ 合規 |
| 八、規格驅動開發 — 先規格再實作 | 本計畫在規格完成後產出，遵循流程 | ✅ 合規 |
| 九、品質驗證 — `npm run build` 零 error | 每個 Phase 驗收必須通過 build | ✅ 合規 |

**閘門結論**：無違規，可進入 Phase 1 設計。

### Phase 1（設計後）重新確認

FR-011 fallback 機制確保 001 UI Demo 在 API 失敗或 token 缺失時不受破壞；
所有新增 computed 與 helper 不影響現有 template 渲染邏輯。**合規。**

---

## 專案結構

### 規格文件（本功能）

```text
specs/002-ugs-lobby-api-integration/
├── plan.md              # 本文件
├── research.md          # Phase 0 輸出
├── data-model.md        # Phase 1 輸出
├── quickstart.md        # Phase 1 輸出
├── contracts/           # Phase 1 輸出
│   ├── LobbyStore.ts
│   ├── LobbyApi.ts
│   └── GameCardAdapter.ts
└── tasks.md             # /speckit-tasks 指令產出
```

### 需修改的原始碼

```text
vite.config.ts                      # Phase 1：proxy 改為 /ugs-api + rewrite
.env                                # Phase 1：統一 env 變數名稱，移除硬編碼值
.env.development（新增）             # Phase 1：本機開發用 VITE_UGS_API_BASE=/ugs-api

src/
├── apis/
│   ├── https.ts                    # Phase 1：baseURL 改為 VITE_UGS_API_BASE
│   ├── lobby.ts                    # Phase 1：移除硬編碼 token，補搜尋 / 啟動函式骨架
│   └── interface/
│       └── lobby.ts                # Phase 1：補搜尋 interface
├── stores/
│   └── lobby.ts                    # Phase 2：token state、fetch action、computed 修正
└── views/
    └── HomeView.vue                # Phase 3：token from URL、API 資料接 UI
```

### 不修改的檔案

```text
src/components/GameCard.vue       # props 介面不動（adapter 橋接）
src/components/GameSection.vue    # pages prop 型別不動
src/components/AppHeader.vue      # 不動
src/components/HeroBanner.vue     # 不動
src/components/GamePlatformNav.vue# 不動
src/components/FloatingTopButton.vue # 不動
src/data/games.ts                 # 保留 mock fallback（carouselPages）
src/data/platforms.ts             # 保留平台 mock 資料
src/router/                       # 不動
```

> **注意**：`src/components/SearchPanel.vue` 於 Phase 4 修改，以串接搜尋 API 結果三段 UI。
> `src/locales/` 於 Phase 4 新增搜尋結果相關 i18n keys。

**結構決策**：採單一 SPA 結構，直接修改現有 `src/` 目錄下的檔案，
不新增頁面目錄或獨立子專案。

---

## Phase 1：API 基礎建設修正（不動 UI）

### 目標

讓 API 呼叫結構正確，消除安全風險與設定錯誤；全程不修改任何 UI 相關程式碼。

### `vite.config.ts`

**現況問題**：proxy key 為 `/api`，無 rewrite 規則，未涵蓋 `/gamelauncher`

**修改方向**：
- proxy key 改為 `/ugs-api`（本專案選用的 proxy base path）
- 加入 `rewrite: path => path.replace(/^\/ugs-api/, '')`，將前綴去除後轉發
- 一個 proxy entry 統一涵蓋 `/api/lobby/*`（大廳、搜尋）與 `/gamelauncher`（啟動遊戲）

```ts
// 示意（非逐字實作）
proxy: {
  '/ugs-api': {
    target: 'https://frontendwebsite.ugsdev.com',
    changeOrigin: true,
    secure: false,
    rewrite: path => path.replace(/^\/ugs-api/, ''),
  },
}
```

### `.env` 與 `.env.development`

**現況問題**：
- `.env` 含 `VITE_API_BASE_URL`，但 `https.ts` 讀 `VITE_API_BASE`（名稱不符）
- 無區分本機與正式環境的 env 檔

**修改方向**：
- `.env`：移除 `VITE_API_BASE_URL`，新增 `VITE_UGS_API_BASE=`（值為空，由 CI/CD 或本機 env 注入）
- `.env.development`（新增）：`VITE_UGS_API_BASE=/ugs-api`

> Vite 載入規則：`.env.development` 優先於 `.env`，本機 dev server 自動使用 `/ugs-api`。

### `src/apis/https.ts`

**現況問題**：
- DEV 時 baseURL 硬編碼 `/api`
- production fallback 硬編碼 `https://frontendwebsite.ugsdev.com/api`
- 讀取的 env 變數名稱與 `.env` 不符

**修改方向**：
- 移除 DEV / production 分岐邏輯
- baseURL 統一使用 `import.meta.env.VITE_UGS_API_BASE`
- 不保留任何 domain 或 path 硬編碼

### `src/apis/lobby.ts`

**現況問題**：
- `token` 硬編碼（嚴重安全風險）
- `getLobbyData` 無 token 參數
- URL path `/lobby/${lobbyPath}` 缺少 `/api/` 前綴
- 無搜尋函式、無遊戲啟動函式

**修改方向**：
- `getLobbyData(lobbyPath: string, token: string)` — 接收 token，路徑改為 `/api/lobby/${lobbyPath}`
- 新增 `searchLobby(params: SearchLobbyParams): Promise<LobbySearchResponse | false>`
  — 路徑 `/api/lobby/${lobbyPath}/search`
- 新增 `getGameLaunchUrl(params: GameLaunchParams): string`
  — 回傳組合好的 URL 字串，路徑 `/gamelauncher`

> `/gamelauncher` 不在 `/api/` 下，但在 `/ugs-api` proxy 涵蓋範圍內：
> 請求 `{VITE_UGS_API_BASE}/gamelauncher?...` → rewrite 後 → `{target}/gamelauncher?...`

### `src/apis/interface/lobby.ts`

**現況問題**：缺少搜尋相關 interface

**新增 interface**（詳見 `data-model.md`）：
- `PaginationResult<T>`
- `LobbySearchResponse`
- `GameSearchItem`、`ProviderSearchItem`、`GameTypeSearchItem`
- `SearchLobbyParams`、`GameLaunchParams`

### Phase 1 驗收

1. `npm run build` 零 TypeScript error
2. `grep -r "frontendwebsite.ugsdev.com" dist/` → 無結果
3. `grep -r "frontendwebsite.ugsdev.com\|/ugs-api\|NQtu8t0" src/` → 無結果
4. dev server 啟動後帶 `?token=test`，Network tab 可見 `/ugs-api/api/lobby/mobile?token=test`

---

## Phase 2：Store 強化（不動 UI）

### 目標

Store 成為完整資料中心；加入 token 管理、fetch action 與正確過濾排序邏輯；
全程不修改 View 或 Component。

### `src/stores/lobby.ts` 修改清單

**新增 state**：
- `token: ref<string | null>(null)`

**新增 actions**：
- `setToken(t: string)` — 保存 token
- `fetchLobbyData(lobbyPath = 'mobile')` — 從 store 取 token 呼叫 API；
  token 為 null 時直接 return，不呼叫 API

**修正 computed**：

| computed | 現況 | 修正後 |
|----------|------|--------|
| `LobbyGameGroup` | 未過濾、未排序 | `filter(g => g.isvisible).sort((a,b) => a.order - b.order)` |
| `LobbyGameList` | 含隱藏 group 的遊戲；`any[]` | 從 `LobbyGameGroup` 取；型別 `Game[]` |
| `LobbyGameProviders` | `any[]` | 型別 `GameProvider[]`，去重邏輯不變 |

**新增 computed（存 store，不接 UI）**：
- `balanceText: computed(() => lobbyData.value?.Balance ?? null)`
- `currencySymbol: computed(() => lobbyData.value?.CurrencySymbol ?? null)`
- `iframeUnsupportedProviders: computed(() => lobbyData.value?.IframeUnsupportedGameProviders ?? [])`
- `supportHttpOnlyProviders: computed(() => lobbyData.value?.SupportHttpOnlyGameProviders ?? [])`

**現有 `playerData`**：確認型別為 `Player | null`，無需修改邏輯

**新增 helper**：
```ts
function shouldOpenByRedirect(game: Game): boolean {
  const configUnsupported =
    lobbyData.value?.Lobby.Data.configurations.iframeunsupportedgameproviders ?? []
  return (
    game.supportiframe === false ||
    iframeUnsupportedProviders.value.includes(game.providercode) ||
    configUnsupported.includes(game.providercode)
  )
}
```

**Store action stub（Phase 4 填入邏輯）**：
- `searchLobby(params: SearchLobbyParams)` — 此 Phase 建空 stub

### Phase 2 驗收

1. `npm run build` 零 TypeScript error
2. console 手動：`lobbyStore.setToken('xxx')` → `lobbyStore.fetchLobbyData()` → Network 有請求
3. 無 token 時：`lobbyStore.fetchLobbyData()` → Network 無請求
4. Pinia devtools：`LobbyGameGroup` 只含 `isvisible: true`，依 `order` 排序
5. Pinia devtools：`Player`、`Balance`、`CurrencySymbol` 有值，畫面 UI 無變化
6. console：`lobbyStore.shouldOpenByRedirect(game)` 回傳正確 boolean

---

## Phase 3：首頁 UI 串接（謹慎修改 HomeView）

### 目標

將 `Lobby.Data.groups[].games` 接到遊戲卡片輪播，保留 mock fallback；
謹慎修改 `HomeView.vue`，不大改元件。

### `src/views/HomeView.vue` 修改清單

**1. 取得 token（替換現有邏輯）**：
```ts
// 使用 Vue Router 或直接讀 URL（取決於 router 是否有傳 query）
const token = new URLSearchParams(window.location.search).get('token')
```

**2. 呼叫 store（替換 `onMounted` 中的 API 呼叫）**：
```ts
onMounted(async () => {
  if (token) {
    lobbyStore.setToken(token)
    await lobbyStore.fetchLobbyData()
  }
  // scroll listener 維持不動
})
```

**3. API 資料橋接（新增 adapter，不改 GameSection props）**：

Adapter 將 `LobbyGroup[]` 轉換為 `GameCard[][]`（每頁 4 張，與輪播結構一致）：

```ts
function toGameCardPages(groups: LobbyGroup[]): GameCard[][] {
  const games = groups.flatMap(g => g.games)
  const pages: GameCard[][] = []
  for (let i = 0; i < games.length; i += 4) {
    pages.push(
      games.slice(i, i + 4).map(game => ({
        id: game.id,
        name: game.name,
        imagePath: game.iconurl || '/assets/images/games/GameCard-1.png',
        value: 0,               // API 無此欄位，暫設 0
        capsuleColor: 'red' as const,  // API 無此欄位，暫設 red
      }))
    )
  }
  return pages.length > 0 ? pages : carouselPages
}
```

**4. computed 決定輪播資料來源**：
```ts
const apiGroups = computed(() => lobbyStore.LobbyGameGroup)
const gamePages = computed(() =>
  apiGroups.value.length > 0 ? toGameCardPages(apiGroups.value) : carouselPages
)
```
> `hotGamesPages` / `newGamesPages` 改為使用 `gamePages`，fallback 保持 `carouselPages`

**5. 移除 debug log**：移除 `console.log` 四行

**不做的事**：
- 不修改 `GameSection.vue` / `GameCard.vue` 的 props 或樣式
- 不新增玩家資訊、餘額或幣別 UI
- 不一次重寫 `HomeView.vue`

### `iconurl` protocol-relative URL 處理

`game.iconurl` 可能為 `//photo.o8-game.com/...`。現代瀏覽器在 HTTPS 頁面下，
protocol-relative URL 自動以 HTTPS 載入，通常無需額外處理。
若測試環境為 HTTP，可在 adapter 中強制加前綴：
```ts
imagePath: game.iconurl
  ? game.iconurl.startsWith('//') ? `https:${game.iconurl}` : game.iconurl
  : '/assets/images/games/GameCard-1.png'
```

### Phase 3 驗收

1. `npm run build` 零 TypeScript error
2. 帶 `?token=xxx`：Network 有 Lobby API 請求；遊戲卡片顯示 API `game.name` 與 `iconurl` 圖片
3. 不帶 token：無 API 請求；頁面顯示 mock 卡片，視覺與 001 Demo 一致
4. API 失敗（斷網或 401）：頁面 fallback 至 mock；console 無未捕捉錯誤
5. 既有 UI Demo 互動（輪播、搜尋面板、語系切換）維持正常
6. 頁面 UI 無玩家名稱、餘額、幣別顯示

---

## Phase 4：搜尋 API 串接

### 目標

搜尋框接上 UGS Search API；三段結果分區呈現；空 keyword 顯示空結果。

### 修改清單

- `src/apis/lobby.ts`：完善 `searchLobby` 函式（Phase 1 骨架 → 完整實作）
- `src/stores/lobby.ts`：實作 `searchLobby` store action（stub → 完整邏輯），新增搜尋結果 state
- 搜尋結果 UI（待 Phase 4 開始前確認設計方向）

### 關鍵規則

- query params 只能包含文件定義的參數：
  `token`、`keyword`、`pageSize`、`gamesOffset`、`providersOffset`、`gameTypesOffset`
- 不加 `providerCode`、`gameTypeCode` 或其他文件未定義的參數
- 空 keyword → 不呼叫 API，直接 return 空結果（三段皆空）
- `gamecount` 僅顯示數量，不作為遊戲清單資料來源
- 分頁 offset 計算：`nextOffset = prevOffset + items.length`

### Phase 4 驗收

1. `npm run build` 零 TypeScript error
2. 輸入 `slot`：Network 有 `/ugs-api/api/lobby/mobile/search?token=xxx&keyword=slot`
3. 搜尋結果三段分區：games / providers / gameTypes
4. 空 keyword：三段皆空，不顯示遊戲清單
5. `hasMore === true`：下一頁 offset = 前次 offset + 前次 items.length
6. query string 無未定義參數

---

## Phase 5：遊戲啟動

### 目標

遊戲卡片點擊後組合啟動 URL，依 `shouldOpenByRedirect` 決定開啟方式。

### 關鍵設計

啟動 URL 格式：
```
{VITE_UGS_API_BASE}/gamelauncher?token={token}&gpcode={game.providercode}&gcode={game.code}&betlimitid={betlimitid}&lang={lang}
```

- `betlimitid`：無值時帶空字串 `betlimitid=`（不省略參數）
- `lang` fallback：`Player.lang` → `i18n.locale` → `zh-TW`
- 開啟方式：
  - `shouldOpenByRedirect(game) === true` → `window.location.href = launchUrl`
  - `shouldOpenByRedirect(game) === false` → iframe（尚未實作時保留 TODO，不破壞 build）

### 待確認（Phase 5 開始前）

- `/gamelauncher` 回傳行為（302 redirect / 回傳 HTML / 回傳 URL）
- `SupportHttpOnlyGameProviders` 前端處理方式

### Phase 5 驗收

1. `npm run build` 零 TypeScript error
2. 點擊遊戲卡片：URL 或 console 可見啟動 URL 格式正確
3. `shouldOpenByRedirect === true`：使用 `window.location.href` 跳轉
4. `gpcode` 對應 `game.providercode`、`gcode` 對應 `game.code`
5. `betlimitid=`（空字串，不省略）

---

## 風險與待確認事項

### 已知風險

| 風險 | 嚴重度 | 緩解方式 |
|------|--------|----------|
| `GameCard.value` 與 `capsuleColor` API 無對應欄位 | 🟡 中 | Phase 3 adapter 暫設預設值；後續確認是否隱藏或調整 UI |
| `iconurl` 為 protocol-relative URL（`//...`） | 🟡 中 | adapter 中加 `https:` 前綴處理；需在 HTTPS 環境測試 |
| Token 短效，無 refresh 機制 | 🟡 中 | 過期後 fallback 至 mock；不自動重取 |
| API `groups[].code` 固定值未確認 | 🟡 中 | Phase 3 前確認，影響 group → GameSection 標題的精準對應 |

### 待後端確認

| 事項 | 阻擋哪個 Phase |
|------|--------------|
| `groups[].code` 固定值（`Hot`、`New` 等） | Phase 3 精準對應 group 標題 |
| `/gamelauncher` 回傳行為 | Phase 5 |
| `SupportHttpOnlyGameProviders` 前端處理方式 | Phase 5 |
| `gametype` 數字 enum 對照 | Phase 4 展示 gameType 名稱 |

---

## 各 Phase 不應做的事

| Phase | 禁止事項 |
|-------|----------|
| Phase 1 | 修改任何 Vue 元件或 store；修改 `HomeView.vue` |
| Phase 2 | 修改 `HomeView.vue` 或任何元件；在 store computed 中接 UI |
| Phase 3 | 修改 `GameCard.vue` / `GameSection.vue` 的 props；新增玩家 / 餘額 / 幣別 UI；重寫整個 `HomeView.vue` |
| Phase 4 | 新增 API 文件未定義的 query 參數；把空 keyword 當全部遊戲查詢；把 `gamecount` 當遊戲清單 |
| Phase 5 | 未確認 `/gamelauncher` 行為前實作複雜 iframe modal；實作 `SupportHttpOnlyGameProviders`（待確認） |
| 全程 | 硬編碼 token；在 `src/` 中寫死 domain 或 `/ugs-api`；破壞 001 UI Demo 視覺 |

# UI 合約：ProviderGamesView.vue

**元件路徑**：`src/views/ProviderGamesView.vue`  
**路由**：`/search/provider/:code`（keyword query 為選用，不影響邏輯）  
**日期**：2026-06-21（更新：2026-06-23）

---

## 路由 Props

| 來源 | 名稱 | 型別 | 用途 |
|------|------|------|------|
| `route.params.code` | `code` | `string` | 供應商代碼（providercode） |
| `route.query.keyword` | `keyword` | `string \| undefined` | 選用：由上游攜帶，本頁不主動使用；不以此呼叫 API |

---

## 資料來源

```ts
import { resolveProviderDisplay } from '@/utils/provider'
import { resolveGameImagePath } from '@/utils/url'

const code = route.params.code as string
const keyword = route.query.keyword as string | undefined ?? ''

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

const gameCards = computed(() =>
  games.value.map((game, i) => ({
    id: game.id,
    name: game.name,
    imagePath: resolveGameImagePath(game.iconurl, i),
    value: 0,
    capsuleColor: 'red' as const,
  }))
)
```

---

## `resolveProviderDisplay` 優先順序（DEC-014）

1. **第一優先**：`lobbyStore.LobbyGameProviders`（來自 `All.gameproviders`）中相同 code
   - name：`shortname || name || code`
   - icon：`resolveIconUrl(iconurl)`（空字串時顯示文字佔位）

2. **第二優先**：`lobbyStore.searchResult?.providers.items` 中相同 code
   - name：`shortname || name || code`
   - icon：`resolveIconUrl(iconurl)`

3. **第三優先**：純文字 fallback `{ code, name: code, iconPath: '' }`

**icon 空字串時**：`v-if="display.iconPath"` 控制是否渲染 `<img>`，顯示 `display.name` 文字佔位。
**不使用 `no-data.png` 作為 provider icon fallback（禁止事項 #15）。**

---

## 入口

使用者從首頁 `/` 的**主內容區搜尋結果**（`searchResultMode === true`）中點擊 provider，導航至本頁。SearchPanel overlay **不**直接提供此入口（搜尋結果已移至首頁主內容區）。

---

## 頁面結構

```
ProviderGamesView
├── <AppHeader />（O8 logo + 語系 icon；不修改 AppHeader.vue 核心視覺）
├── 頁首列
│   ├── 返回按鈕（← 圖示）→ router.push('/')
│   ├── [display.iconPath 非空] → <img> provider icon
│   └── 頁面標題：display.name
└── 內容區
    ├── [有遊戲] → 遊戲卡片 Grid（2欄）
    │   └── GameCard.vue（不修改 props / 核心視覺）
    └── [無遊戲] → <EmptyState />（使用 props 預設值）
```

---

## 導航行為

| 動作 | 結果 |
|------|------|
| 點擊返回（←）| `router.push('/')` |
| 點擊遊戲卡片 | 呼叫 `launchGame(game, token, frontendOrigin, router.push)` |

**返回行為（2026-06-23 修正）**：返回按鈕只執行 `router.push('/')`，**不設定任何 flag**。返回後，`lobbyStore.searchResultMode` 仍為 `true`（store 保留），首頁 template reactive 偵測後直接在主內容區顯示搜尋結果；**SearchPanel overlay 不自動展開**；**未重新呼叫 API**（Network tab 確認）。若 `lobbyStore.searchResult` 為 `null`（store 已遺失），首頁顯示 Discover 預設，不崩潰。

**遊戲卡片點擊行為（2026-06-25 新增）**：

```ts
import { launchGame } from '@/utils/gameLaunch'
import { getTokenFromSession } from '@/utils/tokenSession'

function onGameClick(game: Game) {
  const token = lobbyStore.token ?? getTokenFromSession() ?? ''
  const frontendOrigin = import.meta.env.VITE_UGS_FRONTEND_ORIGIN ?? ''
  launchGame(game, token, frontendOrigin, router.push)
}
```

- `game.url` 存在：使用 `resolveGameLaunchUrl` 組完整 launchUrl。
- `game.url` 為 `/gamelauncher?...`（相對路徑）：補 `VITE_UGS_FRONTEND_ORIGIN` 前綴。
- `game.supportiframe === true`：暫存 `sessionStorage.ugs_game_launch_url`，導向 `/game-frame`。
- `game.supportiframe === false`：`window.location.href = launchUrl`。
- launchUrl **不出現在 route query**。

---

## i18n Keys 使用

| Key | 用途 |
|-----|------|
| `home.search.emptyState` | EmptyState 預設 message（由 EmptyState 元件內部使用） |
| `common.actions.back` | 返回按鈕 aria-label |

---

## 禁止事項

- 不以 `route.query.keyword` 呼叫搜尋 API（此頁為靜態篩選）。
- 不新增 providerCode query 參數呼叫 API。
- 不使用 `no-data.png` 作為遊戲圖片或 provider icon fallback。
- 不顯示玩家資訊或餘額。
- 不修改 `GameCard.vue` props 或核心視覺。

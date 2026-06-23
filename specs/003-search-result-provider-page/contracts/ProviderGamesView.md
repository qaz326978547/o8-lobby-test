# UI 合約：ProviderGamesView.vue

**元件路徑**：`src/views/ProviderGamesView.vue`  
**路由**：`/search/provider/:code?keyword={keyword}`  
**日期**：2026-06-21（更新：2026-06-22）

---

## 路由 Props

| 來源 | 名稱 | 型別 | 用途 |
|------|------|------|------|
| `route.params.code` | `code` | `string` | 供應商代碼（providercode） |
| `route.query.keyword` | `keyword` | `string \| undefined` | 保留的搜尋關鍵字（由 SearchPanel 傳入，現階段未用於返回導航） |

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

使用者從首頁 `/` 的 **SearchPanel overlay** 搜尋結果中點擊 provider，導航至本頁。

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
| 點擊返回（←）| ① `lobbyStore.searchPanelShouldRestore = true` → ② `router.push('/')` |
| 點擊遊戲卡片 | Phase 5 實作（預留結構） |

**SearchPanel 狀態還原**：返回前設定 `searchPanelShouldRestore = true`，HomeView `onMounted` 偵測此 flag 後自動展開 SearchPanel，從 `lobbyStore.searchKeyword` 還原輸入框 keyword，`searchResult` 保留於 store 直接顯示，不重新呼叫 API。若 store 狀態已遺失，SearchPanel 以空 keyword 展開，不崩潰。

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

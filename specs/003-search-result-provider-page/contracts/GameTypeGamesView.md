# UI 合約：GameTypeGamesView.vue

**元件路徑**：`src/views/GameTypeGamesView.vue`  
**路由**：`/search/game-type/:code?keyword={keyword}`  
**日期**：2026-06-21（更新：2026-06-22）

---

## 路由 Props

| 來源 | 名稱 | 型別 | 用途 |
|------|------|------|------|
| `route.params.code` | `code` | `string` | 遊戲類型代碼，例：`Slot` |
| `route.query.keyword` | `keyword` | `string \| undefined` | 保留的搜尋關鍵字（由 SearchPanel 傳入，現階段未用於返回導航） |

---

## 資料來源

```ts
import { GAME_TYPE_CODE_TO_ID } from '@/data/gameTypes'
import { resolveGameImagePath } from '@/utils/url'

const code = route.params.code as string
const keyword = route.query.keyword as string | undefined ?? ''

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

const gameCards = computed(() =>
  gameTypeGames.value.map((game, i) => ({
    id: game.id,
    name: game.name,
    imagePath: resolveGameImagePath(game.iconurl, i),
    value: 0,
    capsuleColor: 'red' as const,
  }))
)
```

---

## 篩選策略（DEC-011）

**前提**：`route.params.code` 例如 `Slot`（字串），`game.gametype` 例如 `0`（數字）。

| 步驟 | 條件 | 說明 |
|------|------|------|
| 1 | `GAME_TYPE_CODE_TO_ID[code]` → `gameTypeId` | 查映射表，例：`Slot → 0` |
| 2（優先）| `Number(game.gametype) === gameTypeId` | 數字精確匹配 |
| 3（fallback）| `game.gametypename === gameTypeName \|\| game.gametypename === code` | 文字 fallback |

**不得只用** `String(game.gametype) === code`（`"Slot"` 無法命中 `0`）。

---

## 現階段支援的 gameType（DEC-015）

| code | gametype 數值 |
|------|-------------|
| Slot | 0 |
| TableGame | 1 |
| LiveDealer | 2 |
| Lobby | 3 |
| Instant | 4 |
| Fishing | 12 |

**不支援** `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery`（截圖未使用）。

---

## 入口

使用者從首頁 `/` 的 **SearchPanel overlay** 搜尋結果中點擊 gameType，導航至本頁。

---

## 頁面結構

```
GameTypeGamesView
├── <AppHeader />（O8 logo + 語系 icon；不修改 AppHeader.vue 核心視覺）
├── 頁首列
│   ├── 返回按鈕（← 圖示）→ router.push('/')
│   └── 頁面標題：gameTypeName.value
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

- 不新增 gameTypeCode query 參數呼叫 API。
- 不把 `gameTypes.items[].gamecount` 當作已取得的遊戲清單。
- 前端顯示遊戲數可能少於 `gamecount`（API 限制，正常行為）。
- 不使用 `no-data.png` 作為遊戲圖片 fallback。
- 不使用 non-null assertion（`!`）在 `searchResult?.gameTypes.items.find(...)`。
- 不修改 `GameCard.vue` props 或核心視覺。
- 不添加 `Sports`、`Card`、`CardLobby`、`FishingLobby`、`Lottery` 至映射表。

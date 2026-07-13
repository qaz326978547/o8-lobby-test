# 資料模型：UGS Lobby API 串接

**功能分支**：`002-ugs-lobby-api-integration`
**日期**：2026-06-17

---

## API 回應實體

### ILobbyResponse

Lobby API（`GET {VITE_UGS_API_BASE}/api/lobby/{lobbyPath}?token={token}`）的完整回應。

```ts
interface ILobbyResponse {
  LobbyTemplateCode: string
  Lobby: Lobby
  Player: Player
  PlayerToken: string
  SupportHttpOnlyGameProviders: string[]    // 存 store，行為待後端確認
  IframeUnsupportedGameProviders: string[]  // 啟動遊戲 iframe 判斷用
  HasOperatorGame: boolean
  AIHidePlayerBalance: boolean
  AutoResize: boolean
  Balance: string                           // 存 store，不接 UI
  FavIconBase: string
  CurrencySymbol: string                    // 存 store，不接 UI
  IsPreview: boolean
}
```

---

### Lobby / LobbyData

```ts
interface Lobby {
  Data: LobbyData
}

interface LobbyData {
  groups: LobbyGroup[]                      // 核心資料，首頁遊戲呈現來源
  configurations: LobbyConfigurations       // iframe 設定
  lobbyid: string
  lobbypath: string
  brandlogourl: string
  pagetitle: string
  cdnroot: string
  lobbyplatformtype: number                 // enum 待確認
  css: string
  iconres: string[]
  currencies: Currency[]
  bonuscampaigns: unknown[]
  jackpotwinners: unknown[]
  bigwinners: unknown[]
  jackpotgroups: unknown[]
}

interface LobbyConfigurations {
  iframeunsupportedgameproviders: string[]  // iframe 判斷用
  httponlysupportedgameproviders: string[]  // 存 store，行為待後端確認
}
```

---

### LobbyGroup

遊戲群組，首頁主要資料來源。

```ts
interface LobbyGroup {
  code: string          // 群組代碼，固定值待確認（如 'Hot'、'New'、'All'）
  name: string          // 群組顯示名稱
  order: number         // 排序依據，前端依此由小到大排序
  isvisible: boolean    // 前端必須過濾：只顯示 true 的 group
  games: Game[]         // 遊戲卡片資料
  gameproviders: GameProvider[]  // 遊戲供應商列表（如 UI 需要）
  subgroups: unknown[]
  banners: unknown[]
  gamelaunchtype: number   // enum 待確認
  supportedelements: unknown[]
}
```

**使用規則**：
1. 只顯示 `isvisible === true` 的 group
2. 依 `order` 由小到大排序
3. 排序後的 `LobbyGameGroup` computed 為首頁 UI 的唯一資料來源

---

### Game

遊戲卡片主要資料。

```ts
interface Game {
  id: string                // 遊戲唯一識別
  name: string              // 遊戲名稱（顯示於卡片）
  code: string              // 啟動遊戲用：作為 gcode
  providercode: string      // 啟動遊戲用：作為 gpcode；iframe 判斷用
  providername: string      // 供應商名稱
  providershortname: string // 供應商簡稱
  iconurl: string           // 遊戲卡片圖片 URL（優先使用，fallback 用 mock 圖）
  previewiconurl: string    // 預覽圖，如需要
  videourl: string          // 預覽影片，如需要
  description: string
  url: string
  demourl: string
  ruleurl: string
  tags: unknown[]
  markers: unknown[]
  browsertype: string
  browserincompatible: boolean
  isactive: boolean         // 是否啟用
  isrestricted: boolean     // 是否受限制
  supporttestplayer: boolean
  popupwidth: number
  popupheight: number
  betlimits: unknown[]
  urls: unknown[]
  gametype: number          // 遊戲類型代碼，enum 待確認
  ugsgameid: string
  supportquickfundin: boolean
  supportiframe: boolean    // iframe 判斷用
  istgpgame: boolean
}
```

**圖片來源規則**：
- 優先：`game.iconurl`（可能為 `//domain/path` protocol-relative URL）
- Fallback：`/assets/images/games/GameCard-*.png`

---

### Player

玩家資料。**現階段存 store，不接 UI。**

```ts
interface Player {
  id: string
  brandcode: string
  username: string
  lang: string           // 啟動遊戲時作為 lang 參數的第一優先來源
  cur: string            // 存 store，不接 UI
  cursym: string         // 存 store，不接 UI
  bal: number            // 存 store，不接 UI
  istestplayer: boolean
  token: string
  tokenid: string
  encryptedtokenid: string
  status: number
  loginurl: string
  playercode: string
  hasexceeddailyturnover: boolean
  showquickfundinicon: boolean
  isproxywallet: boolean
  idletokenminutes: number
}
```

---

### GameProvider

遊戲供應商。

```ts
interface GameProvider {
  code: string
  name: string
  shortname: string
  iconurl: string
}
```

**去重規則**：跨 group 合併時依 `code` 去重。

---

### Currency

```ts
interface Currency {
  cur: string
  symbol: string
}
```

---

## 搜尋 API 實體

### LobbySearchResponse

搜尋 API（`GET {VITE_UGS_API_BASE}/api/lobby/{lobbyPath}/search`）回應。

```ts
interface LobbySearchResponse {
  keyword: string
  games: PaginationResult<GameSearchItem>
  providers: PaginationResult<ProviderSearchItem>
  gameTypes: PaginationResult<GameTypeSearchItem>
}
```

---

### PaginationResult<T>

三段搜尋結果共用的分頁結構。

```ts
interface PaginationResult<T> {
  items: T[]
  offset: number
  totalCount: number
  hasMore: boolean    // true 時可載入下一頁
}
```

**分頁計算**：`nextOffset = offset + items.length`

---

### GameSearchItem

搜尋結果中的遊戲項目。

```ts
interface GameSearchItem {
  id: string
  name: string
  code: string
  providercode: string
  iconurl: string
}
```

---

### ProviderSearchItem

搜尋結果中的供應商項目。

```ts
interface ProviderSearchItem {
  code: string
  name: string
  shortname: string
  iconurl: string
}
```

---

### GameTypeSearchItem

搜尋結果中的遊戲類型項目。

```ts
interface GameTypeSearchItem {
  code: string
  name: string
  gamecount: number   // 僅代表數量，不代表已取得該類型所有遊戲
}
```

**重要限制**：`gamecount` 不可作為遊戲清單來源；
API 文件未定義「依 gameType code 取得遊戲列表」的 endpoint。

---

## API 呼叫參數

### SearchLobbyParams

```ts
interface SearchLobbyParams {
  lobbyPath: string
  token: string
  keyword: string
  pageSize?: number         // 預設 20，上限 100
  gamesOffset?: number      // 預設 0
  providersOffset?: number  // 預設 0
  gameTypesOffset?: number  // 預設 0
}
```

**限制**：只能使用以上欄位，不得新增 `providerCode`、`gameTypeCode` 等文件未定義的參數。

---

### GameLaunchParams

```ts
interface GameLaunchParams {
  token: string
  gpcode: string      // 來自 game.providercode
  gcode: string       // 來自 game.code
  betlimitid?: string // 無值時傳空字串 ''
  lang?: string       // fallback：Player.lang → i18n.locale → 'zh-TW'
}
```

---

## Store 狀態

### LobbyStore state

```ts
// 現有
const lobbyData = ref<ILobbyResponse | null>(null)

// 新增
const token = ref<string | null>(null)
```

### LobbyStore computed（現有 + 新增）

| computed | 型別 | 說明 |
|----------|------|------|
| `LobbyGameGroup` | `LobbyGroup[]` | 已過濾（isvisible）、已排序（order） |
| `LobbyGameList` | `Game[]` | 從 LobbyGameGroup 取 games，不含隱藏 group |
| `LobbyGameProviders` | `GameProvider[]` | 跨 group 合併去重 |
| `playerData` | `Player \| null` | 存 store，不接 UI |
| `balanceText` | `string \| null` | 存 store，不接 UI |
| `currencySymbol` | `string \| null` | 存 store，不接 UI |
| `iframeUnsupportedProviders` | `string[]` | 啟動遊戲 iframe 判斷用 |
| `supportHttpOnlyProviders` | `string[]` | 行為待確認，先存 store |

---

## Mock Fallback 資料

保留於 `src/data/games.ts` 的 `carouselPages`（`GameCard[][]`），
在無 token 或 API 失敗時作為首頁遊戲卡片的 fallback 資料來源。

```ts
// src/data/games.ts（不修改）
export const carouselPages: GameCard[][] = [gameCards, [...gameCards]]
```

---

## Adapter：`Game` → `GameCard`

用於 Phase 3 的橋接函式，不修改任何元件。

```ts
// 輸入：LobbyGroup[]（已過濾排序）
// 輸出：GameCard[][]（每頁 4 張）
function toGameCardPages(groups: LobbyGroup[]): GameCard[][] {
  const games = groups.flatMap(g => g.games)
  const pages: GameCard[][] = []
  for (let i = 0; i < games.length; i += 4) {
    pages.push(
      games.slice(i, i + 4).map(game => ({
        id: game.id,
        name: game.name,
        imagePath: game.iconurl
          ? (game.iconurl.startsWith('//') ? `https:${game.iconurl}` : game.iconurl)
          : '/assets/images/games/GameCard-1.png',
        value: 0,                       // API 無此欄位，暫設 0
        capsuleColor: 'red' as const,   // API 無此欄位，暫設 red
      }))
    )
  }
  return pages.length > 0 ? pages : carouselPages
}
```

**已知差異**：`value` 與 `capsuleColor` 在 API `Game` 中無直接對應欄位。
此差異已記錄；後續確認產品是否需要調整 UI 或隱藏這些欄位。

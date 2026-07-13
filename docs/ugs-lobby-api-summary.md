# UGS Lobby API 串接摘要

> 本文件由 `docs/api/FrontendIntegrationGuide.html` 摘要整理，供 Spec Kit / Claude Code / 前端開發參考。
> 若本文件與原始 API 文件有衝突，以原始 API 文件為準。

---

## 1. 串接模式

本專案採用「前後端分離」模式。

合作方擁有自己的前端頁面，前端不使用 UGS 原本的大廳頁面，而是自行呼叫 UGS API 取得：

- 大廳資料
- 遊戲分類
- 遊戲列表
- 搜尋結果
- 遊戲啟動 URL

整體流程：

1. 合作方後端向 Brand API 取得 Brand Token。
2. 合作方後端使用 Brand Token 呼叫 AuthorizePlayer API。
3. AuthorizePlayer 回傳玩家的 `authtoken`。
4. 合作方後端將 `authtoken` 帶到自己的前端網址，例如：

```txt
https://your-frontend.example.com/mobile?token={authtoken}
```

5. 前端從 URL query string 取得 `token`。
6. 前端呼叫 UGS Lobby API 時，每支 API 都必須帶上 `token` query string。

---

## 2. Token 規則

### 2.1 token 是什麼？

前端 API 使用的 `token` 是：

```txt
AuthorizePlayer 回傳的 authtoken
```

不是：

```txt
client_credentials access_token
brand token
tokenid
encryptedtokenid
```

### 2.2 token 使用方式

同一個 `token` 可重複用在：

```txt
大廳列表 API
搜尋 API
啟動遊戲 API
```

### 2.3 token 限制

- `token` 是短效 / 單次授權 token。
- 目前沒有 refresh token 機制。
- 如果 token 過期或無效，前端應顯示授權失敗狀態，或導回入口頁重新取得 token。
- 前端不可硬編碼 token。
- token 應從 URL query string 取得。

---

## 3. API Base 與 Infra Proxy

本專案決定由 infra proxy 轉發，因此前端 production runtime 不應直接打：

```txt
https://frontendwebsite.ugsdev.com
```

前端應使用同網域相對路徑：

```txt
/ugs-api
```

例如：

```txt
/ugs-api/api/lobby/mobile?token=xxx
/ugs-api/api/lobby/mobile/search?token=xxx&keyword=slot
/ugs-api/gamelauncher?token=xxx&gpcode=TPG&gcode=777_Slot
```

infra 需將：

```txt
/ugs-api/*
```

轉發到：

```txt
https://frontendwebsite.ugsdev.com/*
```

---

## 4. 本機開發 Proxy

Vite dev server 應使用 proxy 模擬 infra 轉發。

建議設定：

```ts
server: {
  proxy: {
    '/ugs-api': {
      target: 'https://frontendwebsite.ugsdev.com',
      changeOrigin: true,
      secure: false,
      rewrite: path => path.replace(/^\/ugs-api/, ''),
    },
  },
}
```

這樣本機呼叫：

```txt
http://localhost:5173/ugs-api/api/lobby/mobile?token=xxx
```

會被轉發為：

```txt
https://frontendwebsite.ugsdev.com/api/lobby/mobile?token=xxx
```

---

## 5. API 一：取得大廳資料

### 5.1 Endpoint

前端呼叫：

```txt
GET /ugs-api/api/lobby/{lobbyPath}?token={token}
```

實際 UGS endpoint：

```txt
GET {UgsFrontendWebsiteUrl}/api/lobby/{lobbyPath}?token={token}
```

### 5.2 Path params

| 欄位        | 說明                                     |
| ----------- | ---------------------------------------- |
| `lobbyPath` | 大廳路徑，例如 `mobile`、`desktop`、`o8` |

### 5.3 Query params

| 欄位    | 必填 | 說明                             |
| ------- | ---- | -------------------------------- |
| `token` | 是   | AuthorizePlayer 回傳的 authtoken |

### 5.4 用途

取得整個大廳資料，包含：

- Banner 輪播
- 分類頁籤
- 熱門遊戲 / 新品推薦 / 所有遊戲等區塊
- 遊戲卡片清單
- 遊戲商
- 玩家資料
- 幣別
- iframe 支援設定

### 5.5 現階段前端主要使用資料

現階段首頁主要使用：

```ts
response.Lobby.Data.groups
```

用於：

- 分類區塊
- 遊戲卡片
- 遊戲供應商列表，如需要
- 熱門遊戲 / 新品推薦 / 所有遊戲等 group

### 5.6 現階段先存 store，但不使用 UI 的資料

以下資料可以先保存到 store，但目前不要接到畫面，也不要新增 UI：

```ts
response.Player
response.Balance
response.CurrencySymbol
```

用途規劃：

| 資料                                          | 現階段處理方式             |
| --------------------------------------------- | -------------------------- |
| `Player`                                      | 先存 store，不顯示玩家資訊 |
| `Balance`                                     | 先存 store，不顯示餘額     |
| `CurrencySymbol`                              | 先存 store，不顯示幣別     |
| `Player.cur` / `Player.cursym` / `Player.bal` | 先存 store，不使用         |

限制：

- 不要新增錢包 UI。
- 不要新增玩家資訊 UI。
- 不要修改 Header 顯示玩家名稱或餘額。
- 不要因為 API 回傳玩家資料就主動改動現有 UI Demo。

---

## 6. `Lobby.Data.groups` 使用規則

前端應：

1. 只顯示 `isvisible === true` 的 group。
2. 依 `order` 由小到大排序。
3. 使用 `group.name` 顯示分類名稱。
4. 使用 `group.code` 作為分類 key。
5. 使用 `group.games` 渲染遊戲卡片。
6. 使用 `group.gameproviders` 整理遊戲供應商列表，如現階段 UI 需要。

範例：

```ts
const visibleGroups = response.Lobby.Data.groups
  .filter((group) => group.isvisible)
  .sort((a, b) => a.order - b.order)
```

---

## 7. `Lobby.Data.groups[].games[]` 使用規則

遊戲卡片主要使用欄位：

| 欄位                | 用途                    |
| ------------------- | ----------------------- |
| `id`                | 遊戲唯一識別            |
| `name`              | 遊戲名稱                |
| `code`              | 啟動遊戲時作為 `gcode`  |
| `providercode`      | 啟動遊戲時作為 `gpcode` |
| `providername`      | 遊戲供應商名稱          |
| `providershortname` | 遊戲供應商簡稱          |
| `iconurl`           | 遊戲圖片                |
| `previewiconurl`    | 預覽圖片，如需要        |
| `videourl`          | 預覽影片，如需要        |
| `gametype`          | 遊戲類型代碼            |
| `supportiframe`     | 是否支援 iframe 啟動    |
| `isactive`          | 是否啟用                |
| `isrestricted`      | 是否受限制              |

現階段首頁 UI 優先使用：

```ts
game.name
game.iconurl
game.code
game.providercode
game.providername
game.providershortname
```

`supportiframe` 目前先列入啟動遊戲規格，等實作遊戲啟動時使用。

---

## 8. API 二：搜尋

### 8.1 Endpoint

前端呼叫：

```txt
GET /ugs-api/api/lobby/{lobbyPath}/search
```

實際 UGS endpoint：

```txt
GET {UgsFrontendWebsiteUrl}/api/lobby/{lobbyPath}/search
```

### 8.2 Query params

| 欄位              | 必填 | 型別   | 說明                             |
| ----------------- | ---- | ------ | -------------------------------- |
| `token`           | 是   | string | AuthorizePlayer 回傳的 authtoken |
| `keyword`         | 否   | string | 搜尋關鍵字                       |
| `pageSize`        | 否   | number | 每段每頁筆數，預設 20，上限 100  |
| `gamesOffset`     | 否   | number | games 段起始位置，預設 0         |
| `providersOffset` | 否   | number | providers 段起始位置，預設 0     |
| `gameTypesOffset` | 否   | number | gameTypes 段起始位置，預設 0     |

### 8.3 搜尋範圍

一個 `keyword` 會同時搜尋三種資料：

```txt
games       遊戲
providers   遊戲供應商 / 遊戲商
gameTypes   遊戲類型
```

搜尋結果不會混成同一個陣列，而是分三段回傳：

```ts
{
  keyword: string
  games: PaginationResult<GameSearchItem>
  providers: PaginationResult<ProviderSearchItem>
  gameTypes: PaginationResult<GameTypeSearchItem>
}
```

---

## 9. 搜尋分頁規則

每一段都是相同分頁結構：

```ts
{
  items: T[]
  offset: number
  totalCount: number
  hasMore: boolean
}
```

三段分頁互相獨立：

```txt
gamesOffset
providersOffset
gameTypesOffset
```

當某一段 `hasMore === true` 時，下一頁 offset 應為：

```ts
nextOffset = offset + items.length
```

例如：

```ts
const nextGamesOffset = result.games.offset + result.games.items.length
```

---

## 10. 空 keyword 行為

依 API 文件：

```txt
keyword 為空字串時，三段皆回傳空結果
```

也就是：

```ts
{
  games: {
    items: [],
    totalCount: 0,
    hasMore: false
  },
  providers: {
    items: [],
    totalCount: 0,
    hasMore: false
  },
  gameTypes: {
    items: [],
    totalCount: 0,
    hasMore: false
  }
}
```

注意：

```txt
空 keyword 不是查全部遊戲。
```

前端不可把空 keyword 當成全部遊戲列表 API。

---

## 11. 搜尋 gameTypes 的限制

搜尋結果中的 `gameTypes.items` 可能包含：

```ts
{
  code: 'Slot',
  name: 'Slot',
  gamecount: 234
}
```

其中 `gamecount` 只代表該類型底下有多少遊戲。

目前 API 文件沒有定義：

```txt
用 gameType code 查該類型全部遊戲的 API
```

因此前端不可自行新增：

```txt
gameTypeCode
gameType
providerCode
```

等文件沒有定義的 query 參數。

如果產品需要「點擊 Slot 類型後取得 234 款遊戲」，需請後端補 API 文件。

---

## 12. API 三：啟動遊戲

### 12.1 Endpoint

前端呼叫：

```txt
GET /ugs-api/gamelauncher
```

實際 UGS endpoint：

```txt
GET {UgsFrontendWebsiteUrl}/gamelauncher
```

### 12.2 Query params

| 欄位         | 必填 | 說明                                     |
| ------------ | ---- | ---------------------------------------- |
| `token`      | 是   | AuthorizePlayer 回傳的 authtoken         |
| `gpcode`     | 是   | 遊戲供應商代碼，來自 `game.providercode` |
| `gcode`      | 是   | 遊戲代碼，來自 `game.code`               |
| `betlimitid` | 否   | 下注限制 ID，沒有時可傳空字串            |
| `lang`       | 否   | 語系，例如 `zh-TW`                       |

### 12.3 欄位對應

```ts
gpcode = game.providercode
gcode = game.code
```

範例：

```ts
const query = new URLSearchParams({
  token,
  gpcode: game.providercode,
  gcode: game.code,
  betlimitid: '',
  lang: playerLang || currentLocale || 'zh-TW',
})

const launchUrl = `/ugs-api/gamelauncher?${query.toString()}`
```

### 12.4 啟動遊戲必要資料

啟動遊戲正常運作主要需要：

| 資料             | 來源                             | 是否必要 |
| ---------------- | -------------------------------- | -------- |
| `token`          | URL query / store                | 必要     |
| `gpcode`         | `game.providercode`              | 必要     |
| `gcode`          | `game.code`                      | 必要     |
| `lang`           | `Player.lang` 或目前 i18n locale | 建議     |
| `betlimitid`     | 遊戲設定 / 空字串                | 視情況   |
| `Player`         | API response                     | 非必要   |
| `Balance`        | API response                     | 非必要   |
| `CurrencySymbol` | API response                     | 非必要   |

因此：

- `Player` 可用於取得 `lang` fallback，但不是啟動遊戲核心必要資料。
- `Balance` / `CurrencySymbol` 不影響啟動遊戲。
- 現階段可先存 store，不接 UI。

---

## 13. iframe / redirect 判斷

iframe 支援設定需要列入規格，因為啟動遊戲時會使用。

### 13.1 需保存的資料

```ts
response.IframeUnsupportedGameProviders
response.Lobby.Data.configurations.iframeunsupportedgameproviders
game.supportiframe
```

也可先保存：

```ts
response.SupportHttpOnlyGameProviders
response.Lobby.Data.configurations.httponlysupportedgameproviders
```

但 `SupportHttpOnlyGameProviders` 的具體前端行為，文件沒有完整說明，需列為待確認。

### 13.2 判斷規則

當使用者點擊遊戲卡片準備啟動遊戲時，需判斷該遊戲是否支援 iframe。

若符合任一條件，應使用整頁跳轉：

```ts
game.supportiframe === false
```

或：

```ts
IframeUnsupportedGameProviders.includes(game.providercode)
```

或：

```ts
Lobby.Data.configurations.iframeunsupportedgameproviders.includes(game.providercode)
```

建議 helper：

```ts
function shouldOpenByRedirect(game: Game) {
  const globalUnsupported = lobbyData.value?.IframeUnsupportedGameProviders ?? []

  const configUnsupported =
    lobbyData.value?.Lobby.Data.configurations.iframeunsupportedgameproviders ?? []

  return (
    game.supportiframe === false ||
    globalUnsupported.includes(game.providercode) ||
    configUnsupported.includes(game.providercode)
  )
}
```

### 13.3 啟動方式

如果 `shouldOpenByRedirect(game) === true`：

```ts
window.location.href = launchUrl
```

如果支援 iframe：

```ts
// 可使用 iframe modal / iframe page 載入 launchUrl
```

若目前 UI 尚未實作 iframe modal：

- 可以先保留 TODO。
- 不得破壞 build。
- 不得自行新增未定義的 iframe UI 流程。
- 若現階段產品尚未要求「進入遊戲」，只需先將 iframe 判斷列入規格與 store helper。

---

## 14. 錯誤處理

### 14.1 token 缺失

若 URL 沒有 `token`：

- 不呼叫 UGS API。
- 顯示錯誤狀態，或保留 mock fallback。
- 不可使用硬編碼 token。

### 14.2 token 無效 / 過期

可能情境：

- API 回傳 401。
- API 回傳 Player unauthorized。
- 大廳列表或搜尋回傳空資料。

處理方式：

- 顯示授權失敗。
- 或導回合作方入口頁，由後端重新 AuthorizePlayer 取得新 token。

### 14.3 CORS

本專案由 infra proxy 解決 CORS。

前端不要在 production runtime 直接打 UGS domain。

---

## 15. 前端建議檔案責任

### 15.1 `src/apis/https.ts`

責任：

- 建立 axios instance。
- API base 使用：

```ts
import.meta.env.VITE_UGS_API_BASE || '/ugs-api'
```

- 不要 production fallback 到 UGS domain。
- 保留 `$http`、`asyncDo`、`isResponseOK`。

---

### 15.2 `src/apis/interface/lobby.ts`

責任：

- 定義 `ILobbyResponse`。
- 定義 `LobbyData`、`LobbyGroup`、`Game`、`Player`。
- 補搜尋 API interface：
  - `LobbySearchResponse`
  - `PaginationResult<T>`
  - `GameSearchItem`
  - `ProviderSearchItem`
  - `GameTypeSearchItem`

---

### 15.3 `src/apis/lobby.ts`

責任：

- `getLobbyData(lobbyPath, token)`
- `searchLobby(params)`
- `getGameLaunchUrl(params)`

不可：

- 硬編碼 token。
- 使用文件沒有定義的 query 參數。

---

### 15.4 `src/stores/lobby.ts`

責任：

- 保存 `token`。
- 保存 `lobbyData`。
- 保存 `Player`、`Balance`、`CurrencySymbol`，但本階段不接 UI。
- 保存 iframe 支援設定。
- 提供 `fetchLobbyData` action。
- 提供 `searchLobby` action。
- 提供整理後 computed：
  - `LobbyGameGroup`
  - `LobbyGameList`
  - `LobbyGameProviders`
  - `playerData`
  - `balanceText`
  - `currencySymbol`
  - `iframeUnsupportedProviders`
  - `supportHttpOnlyGameProviders`

- 提供 `shouldOpenByRedirect(game)` helper。

---

### 15.5 `src/views/HomeView.vue`

責任：

- 從 URL query string 取得 token。
- 呼叫 store action 取得 lobby data。
- API 有資料時優先使用 API 資料。
- API 無資料或 token 缺失時，可保留 mock fallback。
- 不要大幅破壞既有 UI Demo。
- 現階段不要顯示玩家資訊、餘額、幣別。

---

## 16. 現階段使用與不使用範圍

### 16.1 現階段要接 UI 的資料

```ts
Lobby.Data.groups
Lobby.Data.groups[].games
Lobby.Data.groups[].gameproviders
```

用途：

- 分類
- 遊戲卡片
- 遊戲商列表，如 UI 需要

### 16.2 現階段先存 store，但不接 UI

```ts
Player
Balance
CurrencySymbol
Player.cur
Player.cursym
Player.bal
SupportHttpOnlyGameProviders
```

### 16.3 現階段列入規格，啟動遊戲時會用

```ts
IframeUnsupportedGameProviders
Lobby.Data.configurations.iframeunsupportedgameproviders
game.supportiframe
game.providercode
game.code
```

---

## 17. 不可做的事情

- 不可硬編碼 token。
- 不可 production runtime 直接打 `https://frontendwebsite.ugsdev.com`。
- 不可把空 keyword 當成查全部遊戲。
- 不可自行新增 `providerCode` / `gameTypeCode` 篩選 API。
- 不可把 `gameTypes.items[].gamecount` 當成已取得遊戲清單。
- 不可因為 API 回傳 `Player` / `Balance` / `CurrencySymbol` 就新增玩家資訊或錢包 UI。
- 不可一次重寫 UI Demo。
- 不可用替代圖片掩蓋素材路徑錯誤。

---

## 18. 待後端確認事項

1. `groups[].code` 可能有哪些固定值？
   - 例如 `All`、`Hot`、`New`、`Recommend`、`Slot`？

2. `gametype` number 的完整 enum 是什麼？
   - 目前實際回傳看過 `gametype: 0` 對應 `Slot`，但文件沒有完整對照。

3. `gamelaunchtype` 的 enum 對照是什麼？

4. `lobbyplatformtype` 的 enum 對照是什麼？

5. `SupportHttpOnlyGameProviders` 前端應如何處理？
   - redirect？
   - iframe 禁用？
   - 新視窗？
   - 其他？

6. 點擊 `gameTypes.items` 後，若要取得該類型底下所有遊戲，是否會提供額外 API？

7. 點擊 `providers.items` 後，若要取得該供應商底下所有遊戲，是否會提供額外 API？

8. `/gamelauncher` 回傳行為是：
   - 直接 302 redirect？
   - 回傳 HTML？
   - 回傳 URL？
   - 或依遊戲商不同而不同？

---

## 19. 建議驗收項目

- `npm run build` 無 TypeScript error。
- production code 沒有硬編碼 `https://frontendwebsite.ugsdev.com`。
- token 不存在時，不會呼叫 API。
- token 存在時，會呼叫：

```txt
/ugs-api/api/lobby/mobile?token=xxx
```

- `Lobby.Data.groups` 會依 `isvisible` 過濾。

- `Lobby.Data.groups` 會依 `order` 排序。

- 遊戲卡片資料可由 `groups[].games` 產生。

- 搜尋 `slot` 時，能顯示：
  - `games.items`
  - `providers.items`
  - `gameTypes.items`

- 搜尋空字串時，顯示空結果，不當成全部遊戲。

- `games.hasMore === true` 時，下一頁 offset 使用：

```ts
offset + items.length
```

- 點擊遊戲時，產生：

```txt
/ugs-api/gamelauncher?token=xxx&gpcode={providercode}&gcode={code}
```

- iframe 不支援的 provider 使用整頁跳轉。
- `Player`、`Balance`、`CurrencySymbol` 已保存於 store，但現階段不顯示於 UI。

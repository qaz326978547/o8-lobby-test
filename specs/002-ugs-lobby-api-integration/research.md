# 研究報告：UGS Lobby API 串接

**功能分支**：`002-ugs-lobby-api-integration`
**日期**：2026-06-17

---

## 1. API Base 架構決策

**Decision**：前端 API base 以 `VITE_UGS_API_BASE` 環境變數控制，業務程式碼不寫死任何路徑或 domain。

**Rationale**：
- API 文件使用 `{UgsFrontendWebsiteUrl}` 表示原始 base，不規定前端使用何種路徑。
- 本專案選用 `/ugs-api` 作為本機開發的 proxy base path，透過 Vite dev proxy 轉發至
  `https://frontendwebsite.ugsdev.com`；正式環境由 infra 負責同樣的轉發。
- 若未來 infra 改變 proxy path 或決定直連 UGS domain，只需修改 `.env` 的
  `VITE_UGS_API_BASE` 值，`src/` 業務程式碼不需任何變更。

**Alternatives considered**：
- 直接寫死 `https://frontendwebsite.ugsdev.com` — 否決；production CORS 問題，無法切換環境。
- 將 proxy path 寫入 `https.ts` 業務程式碼 — 否決；環境切換需改業務程式碼。

---

## 2. Token 管理策略

**Decision**：`token` 從 URL query string（`?token=`）取得，存入 Pinia store，
供後續所有 API 呼叫複用；不可硬編碼。

**Rationale**：
- API 文件明確指出 token 來自 AuthorizePlayer 回傳的 `authtoken`，由合作方後端帶入 URL。
- 前端只需讀取 URL 中的 `token` 參數，不需自行產生或刷新。
- 硬編碼 token 在 source code 中是嚴重安全風險，token 過期後所有 API 呼叫失效。

**Alternatives considered**：
- localStorage / sessionStorage 快取 — 否決；token 為短效單次授權，不適合持久化。
- Header 傳遞（Bearer token）— 否決；API 文件規定以 query string 傳遞。

---

## 3. Vite Proxy 設計

**Decision**：使用單一 `/ugs-api` proxy key + `rewrite: path => path.replace(/^\/ugs-api/, '')` 涵蓋所有 UGS API 路徑。

**Rationale**：
- API 的兩類路徑：`/api/lobby/*`（大廳、搜尋）與 `/gamelauncher`（啟動遊戲），
  皆在同一個 target domain 下。
- 統一用 `/ugs-api` 前綴，rewrite 後完整路徑分別為：
  - `/ugs-api/api/lobby/mobile?token=xxx` → `{target}/api/lobby/mobile?token=xxx`
  - `/ugs-api/gamelauncher?token=xxx&...` → `{target}/gamelauncher?token=xxx&...`
- 單一 proxy entry 比多個 entry 更易維護，且避免 `/gamelauncher` 被遺漏。

**Alternatives considered**：
- 兩個 proxy entry（`/api` 和 `/gamelauncher`）— 否決；容易漏配，且語意不清楚。
- 不使用 rewrite（舊的 `/api` proxy）— 否決；`/gamelauncher` 不在 `/api/` 下，無法統一涵蓋。

---

## 4. `LobbyGameGroup` 過濾與排序

**Decision**：
- `filter(group => group.isvisible)` — 只顯示 `isvisible === true` 的 group
- `sort((a, b) => a.order - b.order)` — 依 `order` 由小到大排序

**Rationale**：
- API 文件明確說明前端應遵守 `isvisible` 與 `order` 規則。
- 目前 `LobbyGameGroup` computed 未做過濾排序，可能顯示後端標記為隱藏的 group。

---

## 5. `GameCard` Props 橋接策略

**Decision**：在 `HomeView.vue` 中建立 `toGameCardPages` adapter 函式，將 API `Game[]`
轉為 `GameCard[][]`，保持 `GameCard.vue` 的現有 props 不變。

**Rationale**：
- `GameCard.vue` 的 props（`imagePath`、`name`、`value`、`capsuleColor`）與 001 UI Demo
  已驗收的視覺高度耦合，直接修改 props 有破壞 001 的風險。
- `value` 與 `capsuleColor` 在 API 中無直接對應欄位；adapter 暫設預設值（`value: 0`、
  `capsuleColor: 'red'`），後續依產品需求調整。
- Adapter 放置於 `HomeView.vue` 的 `<script setup>` 中（或 `src/utils/` 獨立函式），
  不修改任何元件。

**Alternatives considered**：
- 修改 `GameCard.vue` 直接接受 `iconurl` — 否決；改 props 有破壞 001 的風險。
- 新增 `ApiGameCard.vue` 元件 — 否決；不必要的重複，超出本 Phase 範圍。

---

## 6. 搜尋 API 分頁策略

**Decision**：三段（`games`、`providers`、`gameTypes`）使用各自獨立的 offset 參數；
下一頁 offset = `prevOffset + items.length`。

**Rationale**：
- API 文件定義三段分頁互相獨立，`hasMore` 各自判斷。
- 使用 `offset + items.length` 而非固定 page size 是因為每次回傳的 `items.length`
  可能小於 `pageSize`（最後一頁）。

---

## 7. 空 Keyword 行為

**Decision**：keyword 為空字串時，不呼叫搜尋 API，直接回傳空結果（三段皆空）。

**Rationale**：
- API 文件明確指出空 keyword 回傳空結果，不代表全部遊戲。
- 前端不應把空 keyword 當「查詢所有遊戲」使用，避免錯誤使用語意。

---

## 8. `iconurl` Protocol-Relative URL 處理

**Decision**：在 adapter 中對 `//` 開頭的 `iconurl` 加上 `https:` 前綴。

**Rationale**：
- API 回傳的 `iconurl` 可能為 `//photo.o8-game.com/...`（protocol-relative URL）。
- 雖然現代瀏覽器在 HTTPS 頁面下能自動以 HTTPS 載入，但明確加上前綴可避免
  本機 HTTP 開發環境或混合內容政策問題。

---

## 9. 待確認事項（不阻擋 Phase 1、Phase 2）

| 待確認 | 影響 | 阻擋階段 |
|--------|------|----------|
| `groups[].code` 固定值 | 精準對應 group 與 GameSection 標題 | Phase 3 |
| `/gamelauncher` 回傳行為 | 決定整頁跳轉 vs iframe 實作方式 | Phase 5 |
| `SupportHttpOnlyGameProviders` 處理方式 | 確定特定 provider 的開啟行為 | Phase 5 |
| `gametype` 數字 enum 對照 | 搜尋結果 gameType 名稱顯示 | Phase 4 |

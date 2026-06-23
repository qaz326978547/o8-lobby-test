# Quickstart 驗收指南：搜尋結果頁與遊戲商遊戲列表頁

**日期**：2026-06-21  
**參考設計稿**：`reference/Home-1.png`、`reference/Home-2.png`、`reference/Search-1.png`、`reference/Search-2.png`

---

## 前置條件

```bash
npm run dev       # 啟動開發伺服器（http://localhost:5173）
```

若需真實 API 資料，需在 URL 提供有效 token：  
`http://localhost:5173/?token=<valid-token>`

無 token 時，首頁顯示 mock 輪播，搜尋 API 呼叫將失敗（正常行為）。

---

## SC-001：首頁「發現」預設狀態

**操作**：開啟 `http://localhost:5173/`（不帶 token）

**預期結果**：
- [ ] GamePlatformNav 第一項為「發現」（或 "Discover" in en-US），高亮顯示。
- [ ] 下方顯示「熱門遊戲」與「新品推薦」兩個 GameSection。
- [ ] 每個 GameSection 輪播有 **3 頁**（左右滑動可見 3 頁）。
- [ ] 每頁 4 張遊戲卡片（GameCard-1~4.png）。
- [ ] 不顯示 EmptyState。

---

## SC-002：GamePlatformNav 顯示 API 供應商

**前提**：帶有效 token `/?token=xxx`，等待 lobby API 回應。

**預期結果**：
- [ ] 「發現」之後出現多個供應商 item（來自 API `All.gameproviders`）。
- [ ] 供應商名稱顯示 shortname 或 name。
- [ ] 供應商圖示正常載入（無破圖，resolveIconUrl 處理 `//` 開頭）。
- [ ] 若 API 無資料，只顯示「發現」（不崩潰）。

---

## SC-003：首頁 Provider 篩選

**前提**：API 已載入（帶 token）

**操作**：點擊 GamePlatformNav 中某個供應商（如 ATG）

**預期結果**：
- [ ] URL 停留在 `/`（不導航至子路由）。
- [ ] 「發現」高亮消失，點擊的供應商高亮。
- [ ] 熱門遊戲 / 新品推薦 mock 輪播消失。
- [ ] 顯示該供應商的遊戲清單（來自 LobbyGameList 過濾）。
- [ ] 若該供應商無遊戲 → 顯示 EmptyState。

**清除選擇**：點擊「發現」
- [ ] 回到 mock 輪播狀態。
- [ ] 「發現」重新高亮。

---

## SC-004：搜尋欄位展開

**操作**：點擊 GamePlatformNav 右側搜尋 icon

**預期結果**：
- [ ] SearchPanel overlay 在 `/` 展開（畫面遮罩 + 搜尋面板浮現）。
- [ ] URL 停留在 `/`。
- [ ] 面板預設顯示 tags（ATG、AG Live、戰神賽特、電子）。
- [ ] 輸入框自動 focus。

---

## SC-005：SearchPanel inline 搜尋結果

**操作**：在展開的 SearchPanel 輸入關鍵字（如 "atg"）

**預期結果**（debounce 300ms 後）：
- [ ] URL **不變**，仍停留在 `/`（DevTools Network 確認 URL 未變更）。
- [ ] SearchPanel overlay 下方出現可捲動搜尋結果區域（`overflow-y: auto`）。
- [ ] 有搜尋結果時：顯示「遊戲」/「遊戲商」/「遊戲類型」三個區塊（inline）；結果多時可向下捲動，不超出 viewport。
- [ ] 只有部分區塊有資料時：無資料的區塊完全不顯示（標題 + 內容均隱藏）。
- [ ] 搜尋中：顯示載入文字（「搜尋中...」），不顯示舊結果。
- [ ] 無結果時：顯示 EmptyState（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」，in overlay），三段標題均不顯示。

---

## SC-006：SearchPanel X 關閉按鈕

**前提**：SearchPanel 已展開（含或不含搜尋結果）

**操作**：點擊 SearchPanel X 關閉按鈕

**預期結果**：
- [ ] keyword 清除、store 搜尋狀態清除。
- [ ] SearchPanel 關閉，overlay 消失。
- [ ] URL **仍為 `/`**，首頁正常顯示。
- [ ] 不導航至其他路由。

---

## SC-007：供應商子頁

**前提**：在 SearchPanel overlay 有供應商結果

**操作**：點擊一個供應商結果（如 ATG）

**預期結果**：
- [ ] 導航至 `/search/provider/ATG?keyword=atg`。
- [ ] 頁首顯示供應商名稱（ATG）。
- [ ] 顯示該供應商遊戲卡片 grid（2 欄）。
- [ ] 無遊戲時顯示 EmptyState。

**返回**：點擊 ← 按鈕
- [ ] 回到 `/`（首頁）。
- [ ] **SearchPanel 自動重新展開**（via `searchPanelShouldRestore` flag）。
- [ ] keyword 從 `lobbyStore.searchKeyword` 還原，搜尋結果直接顯示於 overlay（**未重新呼叫 API**，Network tab 確認）。
- [ ] 若 store keyword 為空，SearchPanel 以空 keyword 展開，不崩潰。

---

## SC-008：遊戲類型子頁

**前提**：在 SearchPanel overlay 有遊戲類型結果

**操作**：點擊一個遊戲類型結果

**預期結果**：
- [ ] 導航至 `/search/game-type/{code}?keyword=xxx`。
- [ ] 頁首顯示遊戲類型名稱。
- [ ] 顯示符合篩選條件的遊戲卡片 grid（優先：`GAME_TYPE_CODE_TO_ID[code]` 映射數字 ID 與 `Number(game.gametype)` 精確匹配；fallback：`game.gametypename === gameType.name` 或 `game.gametypename === code`）。
- [ ] 無遊戲時顯示 EmptyState。

**返回**：點擊 ← 按鈕
- [ ] 回到 `/`（首頁）。
- [ ] **SearchPanel 自動重新展開**（via `searchPanelShouldRestore` flag）。
- [ ] keyword 從 `lobbyStore.searchKeyword` 還原，搜尋結果直接顯示於 overlay（**未重新呼叫 API**，Network tab 確認）。
- [ ] 若 store keyword 為空，SearchPanel 以空 keyword 展開，不崩潰。

---

## SC-009：EmptyState 元件顯示

**觸發方式 A**：SearchView 輸入無匹配結果的關鍵字（需 token + API）  
**觸發方式 B**：ProviderGamesView 供應商無遊戲  
**觸發方式 C**：GameTypeGamesView 無匹配遊戲

**預期結果**：
- [ ] 顯示 `/assets/images/no-data.png` 圖片（80px × 80px）。
- [ ] 顯示「Woo...這裡暫時沒有東西」（zh-TW）。
- [ ] 無遊戲卡片顯示。

---

## SC-010：Build 驗證

```bash
npm run build
```

**預期結果**：
- [ ] 零 TypeScript 錯誤。
- [ ] 零 ESLint 錯誤（如有 lint script）。
- [ ] 輸出無 missing i18n key 警告。

---

## SC-011：i18n 語系切換

**操作**：在首頁切換語系（Header 語系 icon）

**預期結果**：
- [ ] 「發現」↔「Discover」正確切換。
- [ ] 搜尋 placeholder 正確切換。
- [ ] 供應商名稱（ATG 等）不因語系切換而改變。
- [ ] 遊戲名稱不因語系切換而改變。
- [ ] EmptyState 文字正確切換（zh-TW：「Woo...這裡暫時沒有東西」/ en-US："Woo... Nothing here yet"）。

---

## SC-012：舊有功能回歸確認

**操作**：在首頁進行以下驗證

**預期結果**：
- [ ] HeroBanner 正常顯示（無視覺變化）。
- [ ] AppHeader 語系切換仍正常運作。
- [ ] FloatingTopButton 在捲動後仍正常顯示。
- [ ] 舊有 mock 輪播（Discover 狀態）視覺與 001 一致。

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

## SC-005：SearchPanel 輸入不觸發 API

**操作**：在展開的 SearchPanel 輸入關鍵字（如 "atg"）

**預期結果**：
- [ ] URL **不變**，仍停留在 `/`。
- [ ] DevTools → Network tab：**無搜尋 API 請求**（輸入文字本身不觸發 API）。
- [ ] SearchPanel overlay 內只顯示 input + tags，**不顯示搜尋結果**。
- [ ] 首頁主內容（Discover 輪播或 provider 篩選）**仍照常顯示**在 overlay 後方（尚未觸發搜尋）。

---

## SC-006：SearchPanel 觸發搜尋（Enter / 搜尋 icon / tag）

**操作 A（Enter）**：在 SearchPanel 輸入 keyword 後按 Enter  
**操作 B（搜尋 icon）**：點擊 SearchPanel 內搜尋 icon  
**操作 C（tag）**：點擊預設 tag（如「ATG」）

**預期結果（三種操作共同）**：
- [ ] DevTools Network：搜尋 API 被呼叫一次（`/api/lobby/O8_Mobile_Lobby_test/search?token=...&keyword=...`，不含 `/ugs-api`）。
- [ ] SearchPanel overlay **自動關閉**（不需手動點 X）。
- [ ] 首頁主內容區（GamePlatformNav 下方）顯示搜尋結果三段（遊戲 / 遊戲商 / 遊戲類別），URL **仍為 `/`**。
- [ ] GamePlatformNav **仍保留可見**在搜尋結果上方。
- [ ] 操作 C 額外確認：顯示的 keyword 為 tag 的 `searchValue`，例如點「電子」tag → API 呼叫 keyword 為 `Slot`，非 `電子`。

---

## SC-006b：SearchPanel X 關閉按鈕

**前提**：SearchPanel 已展開，且首頁**已在搜尋結果模式**（先前執行過搜尋）

**操作**：點擊 SearchPanel X 關閉按鈕（非搜尋 icon，是關閉 overlay 的 X）

**預期結果**：
- [ ] SearchPanel overlay 關閉，overlay 消失。
- [ ] 首頁主內容區搜尋結果**仍然顯示**（X 按鈕**不清除** `searchResultMode`）。
- [ ] URL **仍為 `/`**。
- [ ] 不導航至其他路由。

---

## SC-007：供應商子頁

**前提**：首頁已在搜尋結果模式（`searchResultMode = true`），搜尋結果「遊戲商」區塊有資料

**操作**：點擊首頁主內容區搜尋結果中的供應商（如 ATG）

**預期結果**：
- [ ] 導航至 `/search/provider/ATG`（URL 確認）。
- [ ] 頁首顯示供應商名稱（ATG）。
- [ ] 顯示該供應商遊戲卡片 grid（2 欄）。
- [ ] 無遊戲時顯示 EmptyState。

**返回**：點擊 ← 按鈕
- [ ] 回到 `/`（首頁）。
- [ ] 首頁主內容區**直接顯示搜尋結果**（`searchResultMode` 仍 `true`）；**SearchPanel 不自動展開**。
- [ ] GamePlatformNav **仍保留可見**。
- [ ] Network tab：**無新 API 請求**（未重新呼叫搜尋 API）。
- [ ] 若 store 搜尋狀態已遺失（`searchResult === null`），首頁顯示 Discover 預設，不崩潰。

---

## SC-008：遊戲類別子頁

**前提**：首頁已在搜尋結果模式，搜尋結果「遊戲類別」區塊有資料

**操作**：點擊首頁主內容區搜尋結果中的遊戲類別 tag

**預期結果**：
- [ ] 導航至 `/search/game-type/{code}`（URL 確認）。
- [ ] 頁首顯示遊戲類別名稱。
- [ ] 顯示符合篩選條件的遊戲卡片 grid（優先：`GAME_TYPE_CODE_TO_ID[code]` 映射數字 ID 與 `Number(game.gametype)` 精確匹配；fallback：`game.gametypename === gameType.name` 或 `game.gametypename === code`）。
- [ ] 無遊戲時顯示 EmptyState。

**返回**：點擊 ← 按鈕
- [ ] 回到 `/`（首頁）。
- [ ] 首頁主內容區**直接顯示搜尋結果**（`searchResultMode` 仍 `true`）；**SearchPanel 不自動展開**。
- [ ] GamePlatformNav **仍保留可見**。
- [ ] Network tab：**無新 API 請求**。
- [ ] 若 store 搜尋狀態已遺失（`searchResult === null`），首頁顯示 Discover 預設，不崩潰。

---

## SC-009：首頁搜尋結果主內容區顯示

**前提**：觸發搜尋後（任一觸發方式），SearchPanel overlay 已關閉

**預期結果（有結果）**：
- [ ] 首頁 GamePlatformNav 下方主內容顯示搜尋結果（URL 仍 `/`）。
- [ ] 有資料的區塊選擇性顯示：「遊戲」（2欄 grid）、「遊戲商」（list）、「遊戲類別」（chips）。
- [ ] 無資料的區塊**完全不顯示**（標題 + 內容均隱藏）。
- [ ] GamePlatformNav **仍保留可見**在搜尋結果上方。

**預期結果（無結果）**：
- [ ] 顯示 EmptyState（`/assets/images/no-data.png` + 「Woo...這裡暫時沒有東西」）於主內容區。
- [ ] 三段標題均不顯示。
- [ ] GamePlatformNav **仍保留可見**。

---

## SC-009b：EmptyState 元件顯示

**觸發方式 A**：搜尋關鍵字無匹配結果（需 token + API）  
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

---

## SC-013：API base path 驗證

**操作**：帶 token 開啟首頁，開啟 DevTools > Network tab

**預期結果**：
- [ ] Lobby 初始化 request URL 為 `/api/lobby/O8_Mobile_Lobby_test?token=xxx`（**不含 `/ugs-api`**）。
- [ ] 搜尋 request URL 為 `/api/lobby/O8_Mobile_Lobby_test/search?token=xxx&keyword=...`。
- [ ] Network tab **不出現** `/ugs-api/api/...` 任何請求。

---

## SC-014：Token URL 移除與 sessionStorage 保存

**操作**：帶 `?token=xxx` 開啟首頁，等待 lobby API 回傳

**預期結果**：
- [ ] 初始化 API 成功後，瀏覽器網址列 `token` query 消失（URL 變乾淨），**不觸發頁面重整**。
- [ ] DevTools > Application > Session Storage：`ugs_lobby_token` key 存在，值含 `token` 與 `expiresAt` 欄位。
- [ ] `expiresAt` 約為現在時間 + 24 小時。

---

## SC-015：sessionStorage token fallback

**前提**：`ugs_lobby_token` 已存於 sessionStorage（SC-014 驗證後）

**操作**：手動移除 URL token 後重整頁面（直接 F5 / Reload）

**預期結果**：
- [ ] DevTools Network：Lobby 初始化 API 仍被呼叫（以 sessionStorage token）。
- [ ] 首頁 GamePlatformNav provider 正常顯示（代表 API 成功）。

---

## SC-016：Token 過期行為

**操作**：DevTools > Application > Session Storage，將 `ugs_lobby_token` 的 `expiresAt` 改為過去時間（例如 `1`），重整頁面

**預期結果**：
- [ ] DevTools Network：Lobby 初始化 API **不被呼叫**。
- [ ] 首頁正常顯示 Discover mock 輪播，**不崩潰**。
- [ ] Session Storage 中 `ugs_lobby_token` 被清除。

---

## SC-017：遊戲啟動（supportiframe === true）

**前提**：已有 lobby 資料，API 有 `game.supportiframe === true` 的遊戲（如 provider 篩選列表）

**操作**：點擊遊戲卡片

**預期結果**：
- [ ] 路由跳至 `/game-frame`（URL 確認）。
- [ ] `/game-frame` 頁面頂部有 header，左上角有返回首頁按鈕。
- [ ] iframe 佔滿剩餘畫面，`src` 為完整遊戲 URL（以 `VITE_UGS_FRONTEND_ORIGIN` 補齊的絕對 URL）。
- [ ] URL bar **不包含** launchUrl 或 token。
- [ ] DevTools > Application > Session Storage：`ugs_game_launch_url` 存在，值為完整 launchUrl。

**返回**：點擊返回首頁按鈕
- [ ] 回到 `/`，首頁正常顯示（依 searchResultMode / selectedProviderCode 決定內容）。

---

## SC-018：遊戲啟動（supportiframe === false）

**前提**：已有 lobby 資料，API 有 `game.supportiframe === false` 的遊戲

**操作**：點擊遊戲卡片

**預期結果**：
- [ ] 瀏覽器執行 `window.location.href` 整頁導向外部遊戲 URL（離開 SPA）。
- [ ] **不**進入 `/game-frame` 路由。
- [ ] 外部 URL 以 `https://frontendwebsite.ugsdev.com` 開頭（或 game.url 指定的絕對 URL）。

---

## SC-019：GameFrameView 直接訪問不崩潰

**操作**：直接在瀏覽器輸入 `http://localhost:5173/game-frame`（無 sessionStorage launchUrl）

**預期結果**：
- [ ] 頁面正常顯示，**不崩潰**。
- [ ] 顯示 EmptyState（no-data.png + 「Woo...這裡暫時沒有東西」）或錯誤提示。
- [ ] 頁面有返回首頁按鈕，點擊後回到 `/`。

---

## SC-020：game.url 補齊驗證

**操作**：DevTools > Sources > breakpoint on `resolveGameLaunchUrl`，或觀察 `/game-frame` iframe src

**預期結果**：
- [ ] `game.url = /gamelauncher?token=xxx&...` → 完整 URL = `https://frontendwebsite.ugsdev.com/gamelauncher?token=xxx&...`
- [ ] `game.url` 以 `https://` 開頭 → 直接使用，不重複補前綴。
- [ ] `game.url` 為 `//example.com/...` → 補成 `https://example.com/...`。

---

## SC-036：Hot/New 輪播使用 API 遊戲資料（2026-07-02 新增）

**前提**：使用 `O8_Mobile_Lobby_test` 回傳包含 `code: "Hot"` 及 `code: "New"` 群組的 token

**操作**：帶 token 開啟首頁，等待 lobby API 回傳

**預期結果**：
- [ ] 首頁「熱門遊戲」區塊顯示 Hot group 的遊戲卡片（圖片、名稱來自 API），**不顯示 mock 遊戲**。
- [ ] 首頁「新品推薦」區塊顯示 New group 的遊戲卡片（來自 API），**不顯示 mock 遊戲**。
- [ ] 點擊 Hot/New 遊戲卡片 → 執行 `launchGame`（`supportiframe === true` 進 `/game-frame`，`false` 整頁跳轉）。
- [ ] DevTools Network **無額外** providerCode 或 gameTypeCode 請求。

---

## SC-037：Hot/New 輪播 API 無資料時 fallback（2026-07-02 新增）

**前提**：使用不含 Hot/New 群組的 lobby path（或 mock 回傳空 groups）

**操作**：帶 token 開啟首頁

**預期結果**：
- [ ] 首頁「熱門遊戲」仍顯示 mock 輪播（`carouselPages`），**不崩潰**，**不顯示空白**。
- [ ] 首頁「新品推薦」同上。
- [ ] Mock 遊戲卡片點擊**無 launch 行為**（正常，mock 無真實 Game 物件）。

---

## SC-038：輪播 slide 過場效果（2026-07-02 新增）

**操作**：在首頁（Hot/New/其他輪播區塊）等待自動翻頁（約 5 秒）或左右滑動

**預期結果**：
- [ ] 頁面切換為**水平滑動**（左右方向），**無淡入淡出效果**。
- [ ] 過場動畫平滑（約 300ms `ease` 效果）。
- [ ] 分頁指示器隨頁面切換更新。
- [ ] 觸控左右滑動仍可操作。

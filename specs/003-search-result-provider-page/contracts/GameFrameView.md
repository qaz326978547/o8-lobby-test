# UI 合約：GameFrameView.vue

**元件路徑**：`src/views/GameFrameView.vue`  
**路由**：`/game-frame`（無 route params；launchUrl 以 sessionStorage 傳遞）  
**日期**：2026-06-25

---

## 路由 Props

| 來源 | 名稱 | 用途 |
|------|------|------|
| `sessionStorage.getItem('ugs_game_launch_url')` | `launchUrl` | iframe src；不放在 route query 以避免 token 暴露 |

---

## 資料來源

```ts
const launchUrl = sessionStorage.getItem('ugs_game_launch_url')
```

- 若 `launchUrl` 為 `null` 或空字串：顯示 `<EmptyState />` + 返回首頁按鈕，不崩潰。
- `launchUrl` 應為完整絕對 URL（由 `resolveGameLaunchUrl` 在進入前組成）。

---

## 頁面結構

```
GameFrameView
├── GameFrameHeader（或簡單 header div）
│   └── 返回首頁按鈕（i18n: common.actions.back 或 common.actions.backToHome）
│       → router.push('/') + sessionStorage.removeItem('ugs_game_launch_url')
└── 內容區
    ├── [有 launchUrl] → <iframe :src="launchUrl" />
    └── [無 launchUrl] → <EmptyState /> + 返回首頁按鈕
```

---

## Header 規則

- 左上角顯示返回首頁按鈕（文字或 icon）。
- 返回按鈕使用 i18n key：`common.actions.back`（現有）或新增 `common.actions.backToHome`（`zh-TW: 返回首頁`，`en-US: Back to Home`）。
- **不**顯示 Player / Balance / CurrencySymbol。
- **不**修改既有 `AppHeader.vue`（可另建 `GameFrameHeader` 元件）。

---

## iframe 規則

- `src`：`sessionStorage.getItem('ugs_game_launch_url')`。
- `width`：100%。
- `height`：`calc(100vh - <header height>)`（建議 header 高度約 48px）。
- `border`：0。
- `frameborder`：0。
- 無 `allow` 限制（遊戲可能需要 fullscreen、camera 等）。

---

## 導航行為

| 動作 | 結果 |
|------|------|
| 點擊返回首頁（header 按鈕）| `router.push('/')` + `sessionStorage.removeItem('ugs_game_launch_url')` |
| 直接訪問 `/game-frame`（無 sessionStorage）| 顯示 EmptyState + 返回首頁按鈕，不崩潰 |

---

## 入口

- 呼叫方在 `launchGame()` 中執行：
  ```ts
  sessionStorage.setItem('ugs_game_launch_url', launchUrl)
  router.push('/game-frame')
  ```
- 僅由 `game.supportiframe === true` 的遊戲卡片點擊觸發。
- **不**由首頁 Discover mock 輪播觸發（mock 無真實 `game.url`）。

---

## SCSS 結構（參考）

```scss
.game-frame-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.game-frame-view__header {
  flex-shrink: 0;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: #1a1a1a;
}

.game-frame-view__back {
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.game-frame-view__iframe {
  flex: 1;
  width: 100%;
  border: 0;
}
```

---

## i18n Keys 使用

| Key | 用途 |
|-----|------|
| `common.actions.back` | 返回首頁按鈕（現有 key） |
| `common.actions.backToHome`（選用新增）| 返回首頁文字（zh-TW: 返回首頁，en-US: Back to Home） |
| `home.search.emptyState` | EmptyState 預設 message（由 EmptyState 元件內部使用） |

---

## 禁止事項

- 不在 route query 攜帶 launchUrl 或 token（用 sessionStorage 傳遞）。
- 不顯示玩家資訊、餘額、幣別。
- 不修改 `AppHeader.vue` 核心視覺。
- 無 launchUrl 時不崩潰（顯示 EmptyState）。
- 不硬編碼 `https://frontendwebsite.ugsdev.com`（launchUrl 在進入前已由 `resolveGameLaunchUrl` 組成）。

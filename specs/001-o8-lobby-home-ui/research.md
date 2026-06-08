# 研究摘要：O8 手機版遊戲大廳首頁 UI Demo

**功能分支**：`001-o8-lobby-home-ui`
**日期**：2026-06-04

---

## 1. SCSS 預處理器

**決策**：安裝 `sass-embedded` 作為 Vite dev dependency

**理由**：`sass-embedded` 是 Dart Sass 的 Node.js embedded 版本，Vite 官方文件推薦；
比舊版 `node-sass`（LibSass）更新、更快，且與 Vite 8 完全相容。安裝後 Vite 自動識別
`.scss` 副檔名，無需額外 Vite plugin 設定。

**替代方案**：`sass`（純 JS Dart Sass）— 功能相同但稍慢；被排除因 `sass-embedded` 更優。

**安裝指令**：`npm install -D sass-embedded`

---

## 2. vue-i18n 版本與設定

**決策**：`vue-i18n@^11`，使用 `legacy: false`（Composition API 模式）

**理由**：vue-i18n v10+ 為 Vue 3 官方 i18n 解決方案；`legacy: false` 啟用
Composition API 相容模式（`useI18n()`），符合憲法第七章要求。v11 穩定支援 Vue 3.5。

**替代方案**：`vue-i18n@9`（舊版穩定版）— 功能相同，但 v11 具有更好的 TypeScript 型別支援。

**安裝指令**：`npm install vue-i18n`

**設定模式**：
```ts
// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import zhTW from './zh-TW'
import enUS from './en-US'

export const i18n = createI18n({
  legacy: false,
  locale: 'zh-TW',
  fallbackLocale: 'en-US',
  messages: { 'zh-TW': zhTW, 'en-US': enUS }
})
```

---

## 3. 遊戲平台導覽列水平滑動

**決策**：CSS `overflow-x: auto` + `display: flex` + `-webkit-overflow-scrolling: touch`

**理由**：純 CSS 實作，無需 JavaScript。`overflow-x: auto` 僅在內容超出時啟用水平捲軸；
`-webkit-overflow-scrolling: touch` 提供 iOS Safari 慣性捲動效果。搜尋按鈕使用
`flex-shrink: 0` 固定於右側，不隨列表滑動消失。隱藏 scrollbar 樣式（`scrollbar-width: none`）
保持視覺整潔。

**防止整頁橫向捲動**：導覽列容器 `overflow-x: hidden` 搭配 `width: 100%` 於外層容器，
確保滑動效果限制在導覽列元件內部。

---

## 4. 遊戲卡片輪播（3 秒 Fade）

**決策**：JavaScript `setInterval` + CSS `opacity` transition

**理由**：僅需在兩頁間切換，無手勢翻頁需求（Phase 1 spec 明確排除）。`setInterval` 足夠
簡單可靠。Fade 效果以 CSS `transition: opacity 0.4s ease` 實作，避免 slide 動畫造成
卡片佈局計算複雜度。

**實作要點**：
- 兩頁資料以陣列呈現：`pages: GameCard[][]`
- `currentPage` ref 追蹤目前頁碼（0-based index）
- `onUnmounted` 清除 interval 防止 memory leak
- 兩個區塊（HotGames / NewGames）各自獨立持有 `currentPage` 與 interval

**Fade 實作**：使用 Vue `Transition` component + CSS `v-enter-active` / `v-leave-active`，
或直接以 `v-show` + CSS class 切換 `opacity: 0 → 1`。

---

## 5. 回到頂部浮動按鈕

**決策**：`window.addEventListener('scroll', ...)` 監聽 `scrollY > 0`

**理由**：最直接的實作方式，無需第三方套件。`scrollY > 0` 即觸發按鈕顯示，符合 spec
「捲動後才出現」的需求。點擊後使用 `window.scrollTo({ top: 0, behavior: 'smooth' })` 
平滑回頂。

**實作要點**：
- `onMounted` 添加 scroll listener；`onUnmounted` 移除
- `const isVisible = ref(false)` 控制顯示狀態
- 按鈕以 `position: fixed` 定位於主內容容器右下方
- 主內容容器需 `position: relative` 以作為定位參考

---

## 6. 搜尋面板遮罩

**決策**：`position: fixed` overlay + `z-index` 分層

**理由**：搜尋面板需浮於整頁所有元件上方。以 `position: fixed; inset: 0` 的半透明遮罩
覆蓋整頁，搜尋面板置於遮罩上方（更高 z-index 或同層後置）。點擊遮罩觸發關閉事件，
搜尋面板本身攔截點擊事件防止冒泡關閉。

**z-index 規劃**：
- 頁面內容：z-index 0（預設）
- 搜尋遮罩：z-index 100
- 搜尋面板：z-index 101
- 浮動按鈕：z-index 50

---

## 7. 資產清查

### 確認可用資產

| 用途 | 檔案路徑 | 狀態 |
|------|----------|------|
| O8 Logo | `public/assets/images/logo/logo.png` | ✅ |
| Hero Banner | `public/assets/images/banner/banner.png` | ✅ |
| 平台 ATG | `public/assets/images/gamePlatform/ATG.png` | ✅ |
| 平台 BT | `public/assets/images/gamePlatform/BT.png` | ✅ |
| 平台 DB | `public/assets/images/gamePlatform/DB.png` | ✅ |
| 平台 FC | `public/assets/images/gamePlatform/FC.png` | ✅ |
| 平台 US（USTM） | `public/assets/images/gamePlatform/USTM.png` | ✅ |
| 遊戲卡片 1–4 | `public/assets/images/games/GameCard-{1-4}.png` | ✅ |
| 發現 nav icon | `public/assets/images/icons/discover.png` | ✅ |
| Header 選單 icon | `public/assets/images/icons/menu.png` | ✅ |
| 回到頂部 icon | `public/assets/images/icons/scroll-up.png` | ✅ |
| 卡片趨勢方向 icon | `public/assets/images/icons/arrow-up.png` | ✅ |

### 待確認資產

| 用途 | 現有檔案 | 說明 |
|------|----------|------|
| `new.png` 用途 | `public/assets/images/icons/new.png` | 視覺功能未確認；可能為「新品推薦」區塊裝飾 icon |
| `subtract.png` 用途 | `public/assets/images/icons/subtract.png` | 視覺功能未確認；可能為搜尋面板關閉／清除 icon |

### 缺少資產

| 用途 | 說明 |
|------|------|
| AG Live 平台圖片 | AG Live 僅出現於搜尋面板 tags，非導覽列項目；以文字「AG Live」顯示即可，不需圖片 |
| 搜尋按鈕 icon | 導覽列右側搜尋按鈕需要搜尋圖示；待確認是否為 `subtract.png` 或需補充素材 |
| 語系切換 icon | Header 右側語系切換 icon 未見獨立圖片；需確認使用文字標籤（「中」/「EN」）或補充素材 |

---

## 8. 元件責任確認

| 元件 | 職責 | 狀態管理 |
|------|------|----------|
| `App.vue` | RouterView + 全域樣式 import | 無 |
| `HomeView.vue` | 頁面容器、組合所有元件、頁面層級 scrollY 監聽 | `isSearchOpen`, `scrollY` |
| `AppHeader.vue` | Logo、選單 icon、語系切換 | emit `toggle-locale` |
| `HeroBanner.vue` | 靜態 Banner | 無 |
| `GamePlatformNav.vue` | 平台列表水平滑動、「發現」選中、搜尋按鈕 | emit `open-search` |
| `SearchPanel.vue` | 遮罩 + 搜尋框 + tags、開關 | props `isOpen`, emit `close` |
| `GameSection.vue` | 區塊標題 + 輪播容器 + 指示器 | `currentPage`, interval |
| `GameCard.vue` | 圖片 + footer + 膠囊 | 無（純展示） |
| `FloatingTopButton.vue` | 按鈕顯示隱藏、回頂操作 | props `isVisible` 或 internal |

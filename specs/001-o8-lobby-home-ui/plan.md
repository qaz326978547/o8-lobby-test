# 實作計畫：O8 手機版遊戲大廳首頁 UI Demo

**分支**：`001-o8-lobby-home-ui` | **日期**：2026-06-04 | **規格**：[spec.md](spec.md)

**輸入**：功能規格 `specs/001-o8-lobby-home-ui/spec.md`

---

## 摘要

依照 `reference/o8-mobile-home-search-reference.png` 在現有 Vue 3 + Vite + TypeScript 專案
基礎上，實作 O8 遊戲大廳手機版首頁純前端 UI Demo。技術重點為：SCSS 樣式還原、vue-i18n
雙語支援、遊戲平台導覽列水平滑動、遊戲卡片 3 秒 fade 自動輪播、搜尋面板開關，以及
scrollY 觸發的回到頂部浮動按鈕。

---

## 技術環境

**語言／版本**：TypeScript ~6.0、Vue 3.5、Vite 8

**主要依賴**：
- `vue-router@^5`（已安裝，首頁使用 `/` 路由）
- `vue-i18n@^11`（需安裝，Composition API legacy: false 模式）
- `sass-embedded`（需安裝，Vite SCSS 預處理器）
- `pinia@^3`（已安裝於 scaffold，Phase 1 不使用，僅保留掛載）

**容器架構決策**：採 Bootstrap 5 斷點容器（非固定 768px），`AppHeader` 與 `HeroBanner`
為全寬元件置於容器外；`SearchPanel` 與 `GamePlatformNav` 共用 `.nav-wrapper` 於容器內。

**儲存**：N/A（純靜態 mock data，無持久化）

**測試**：N/A（本階段無測試框架，以瀏覽器手動驗收為主）

**目標平台**：現代行動裝置瀏覽器（Chrome/Safari）+ 桌面瀏覽器（置中展示模式）

**專案類型**：web-app（SPA 前端）

**效能目標**：60fps 動畫、首頁視覺載入無明顯延遲（靜態資產，無 API）

**限制**：
- 主內容容器最大寬度 768px
- 主要驗收寬度 390px
- 禁用 Tailwind CSS
- 禁用大型 UI Component Library
- Phase 1 不使用 Pinia 管理狀態

**範圍／規模**：1 個頁面、7 個元件、2 個語系、6 個靜態 mock platform、8 張 mock game card

---

## 憲法檢查

*閘門：Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. Component-First | ✅ 通過 | 7 個 SFC 各司其職，業務邏輯由 composable 或 local ref 管理 |
| II. Type Safety | ✅ 通過 | 所有 props 以 `defineProps<T>()` 宣告，mock data 以 interface 型別化 |
| III. State Management Discipline | ✅ 通過 | Phase 1 不使用 Pinia；搜尋、語系、輪播皆以 local `ref`/`reactive` 管理 |
| IV. Mobile-First UI | ✅ 通過 | 390px 為主要驗收寬度，max-width 768px，O8 參考圖為設計基準 |
| V. Simplicity & YAGNI | ✅ 通過 | 無超出 Phase 1 範圍的抽象；3 秒輪播以 setInterval 實作即可 |

> **注意**：`main.ts` 已由 create-vue scaffold 掛載 `createPinia()`。Phase 1 不建立新
> Pinia store，現有 `counter.ts` 為 scaffold 佔位，不涉及本功能實作。

**Phase 1 重新確認**：✅ 設計符合所有原則，無違規需記錄。

---

## 專案結構

### 規格文件（本功能）

```text
specs/001-o8-lobby-home-ui/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究摘要
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 驗收指引
├── contracts/           # Phase 1 元件介面契約
│   ├── GameCard.ts
│   ├── GameSection.ts
│   ├── GamePlatformNav.ts
│   └── SearchPanel.ts
└── tasks.md             # Phase 2 由 /speckit-tasks 產出
```

### 原始碼（repository root）

```text
src/
├── assets/
│   └── styles/
│       ├── main.scss          # 全域樣式入口（import _variables, _reset）
│       ├── _variables.scss    # Design tokens：色彩、圓角、陰影、z-index
│       └── _reset.scss        # CSS reset + 基礎排版
├── components/
│   ├── AppHeader.vue          # Header：Logo + 選單 icon + 語系切換 icon
│   ├── HeroBanner.vue         # 靜態 Banner 圖片
│   ├── GamePlatformNav.vue    # 水平滑動平台導覽列 + 搜尋按鈕
│   ├── SearchPanel.vue        # 搜尋面板（遮罩 + 搜尋框 + tags）
│   ├── GameSection.vue        # 遊戲區塊（標題 + 輪播 + 指示器）
│   ├── GameCard.vue           # 遊戲卡片（圖片 + footer + 膠囊）
│   └── FloatingTopButton.vue  # 回到頂部浮動按鈕（scrollY > 0 顯示）
├── data/
│   ├── platforms.ts           # GamePlatform mock data
│   └── games.ts               # GameCard mock data（含兩頁結構）
├── locales/
│   ├── index.ts               # vue-i18n instance（legacy: false）
│   ├── zh-TW.ts               # 繁體中文翻譯
│   └── en-US.ts               # 英文翻譯
├── router/
│   └── index.ts               # `/` → HomeView（已存在，需加路由）
├── views/
│   └── HomeView.vue           # 首頁容器：.home-page（全寬）→ AppHeader/HeroBanner（全寬）+ .container（Bootstrap 5）→ nav-wrapper/GameSection ×2；FloatingTopButton 獨立 fixed
├── App.vue                    # 根元件（僅 RouterView + 全域樣式 import）
└── main.ts                    # 入口（Vue + Pinia + Router + i18n 掛載）
```

**結構決策**：採單專案結構（無 backend/frontend 分層）。`src/data/` 集中管理 mock data；
`src/locales/` 集中管理 i18n；樣式責任依元件歸屬分配至各 `.vue` 的 `<style scoped lang="scss">`。

---

## 複雜度追蹤

> 無憲法違規，不需記錄。

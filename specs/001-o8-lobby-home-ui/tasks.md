---
description: "O8 手機版遊戲大廳首頁 UI Demo 任務清單"
---

# 任務清單：O8 手機版遊戲大廳首頁 UI Demo

**輸入**：設計文件來自 `specs/001-o8-lobby-home-ui/`

**前置文件**：plan.md（必要）、spec.md（必要）、data-model.md、contracts/、research.md

**測試**：本階段無自動化測試框架，以瀏覽器手動驗收為主（詳見 quickstart.md）

**組織原則**：任務依使用者情境分組，確保每個情境可獨立實作、獨立測試、獨立展示。

## 格式說明

- **[P]**：可與其他 [P] 任務並行（不同檔案，無未完成的相依）
- **[US?]**：對應 spec.md 中的使用者情境編號
- 每個任務描述含完整檔案路徑

## 路徑慣例

- 元件：`src/components/`
- 頁面：`src/views/`
- 樣式：`src/assets/styles/`
- 語系：`src/locales/`
- 資料：`src/data/`

---

## Phase 1：Setup（共用基礎設施）

**目的**：安裝依賴、建立樣式架構、多語系、mock data、更新入口設定。
所有 Setup 任務完成後，Foundational Phase 才能開始。

- [x] T001 安裝 `vue-i18n` 與 `sass-embedded`：執行 `npm install vue-i18n` 與 `npm install -D sass-embedded`
- [x] T002 [P] 建立 `src/assets/styles/_variables.scss`：定義 CSS variables（主題金色 `--color-gold: #AE8640`、紅色膠囊 `--color-capsule-red: #CE2727`、綠色膠囊 `--color-capsule-green: #35BD13`、`--z-overlay: 100`、`--z-panel: 101`、`--z-float: 50`、共用圓角、陰影）
- [x] T003 [P] 建立 `src/assets/styles/_reset.scss`：CSS reset、`*, *::before, *::after { box-sizing: border-box }`、`body` 基礎字型與背景、`img { max-width: 100%; display: block }`
- [x] T004 建立 `src/assets/styles/main.scss`：`@use './_variables'` 與 `@use './_reset'`
- [x] T005 [P] 建立 `src/locales/zh-TW.ts`：匯出包含以下所有 key 的 messages 物件：`home.navigation.discover`（發現）、`home.sections.hotGames`（熱門遊戲）、`home.sections.newGames`（新品推薦）、`home.search.placeholder`（遊戲、遊戲商、類型）、`home.search.clear`（清除）、`home.search.tags.slots`（電子）、`common.actions.backToTop`（回到頂部）、`common.accessibility.openMenu`（開啟選單）、`common.accessibility.searchGames`（搜尋遊戲）、`common.accessibility.changeLanguage`（切換語言）
- [x] T006 [P] 建立 `src/locales/en-US.ts`：與 `zh-TW.ts` 完全相同的 key 結構，填入對應英文：`Discover`、`Hot Games`、`New Releases`、`Games, Providers, Categories`、`Clear`、`Slots`、`Back to top`、`Open menu`、`Search games`、`Change language`
- [x] T007 建立 `src/locales/index.ts`：`import { createI18n } from 'vue-i18n'`；`export const i18n = createI18n({ legacy: false, locale: 'zh-TW', fallbackLocale: 'en-US', messages: { 'zh-TW': zhTW, 'en-US': enUS } })`
- [x] T008 [P] 建立 `src/data/platforms.ts`：定義並匯出 `GamePlatformItem[]`，依序包含：`{ id: 'discover', name: 'discover', imagePath: '/assets/images/icons/discover.png', isDiscover: true }`，以及 `ATG`（`ATG.png`）、`BT`（`BT.png`）、`DB`（`DB.png`）、`FC`（`FC.png`）、`US`（`name: 'US', imagePath: '/assets/images/gamePlatform/USTM.png'`）；所有路徑大小寫須與 `public/assets/images/` 實際檔案完全一致
- [x] T009 [P] 建立 `src/data/games.ts`：定義 `GameCard` 介面（`id`, `name`, `imagePath`, `value`, `capsuleColor: 'red' | 'green'`）；匯出 `const gameCards: GameCard[]`（4 張：`gods-of-glory`/`GameCard-1.png`/100/red、`coins-and-cannons`/`GameCard-2.png`/100/red、`fortune-pandas`/`GameCard-3.png`/100/red、`last-man-standing`/`GameCard-4.png`/70/green）；匯出 `const carouselPages: GameCard[][] = [gameCards, gameCards]`（兩頁使用相同資料的獨立陣列）
- [x] T010 更新 `src/main.ts`：`import { i18n } from '@/locales'`；在 `app.use(createPinia())` 之後加入 `app.use(i18n)`（保留既有 Pinia + Router 掛載）
- [x] T011 更新 `src/router/index.ts`：新增路由 `{ path: '/', component: () => import('@/views/HomeView.vue') }`

**Checkpoint**：Setup 完成 — 依賴已安裝，樣式架構、多語系、mock data 與路由已就緒。

---

## Phase 2：Foundational（阻斷性前置任務）

**目的**：建立所有使用者情境共用的頁面容器與根元件，完成後 Phase 3+ 可並行實作。

**⚠️ 重要**：以下任務完成前，任何使用者情境實作均不得開始。

- [x] T012 更新 `src/App.vue`：移除 scaffold 佔位內容，template 改為 `<RouterView />`；`<style>` 中加入 `@import '@/assets/styles/main.scss'`；設定 `body { background: #1a1a2e }` 或其他深色外層背景（對應 viewport > 768px 時的容器外側背景）
- [x] T013 建立 `src/views/HomeView.vue`：`<script setup lang="ts">` 中引入 `useI18n`；template 包含 `.home-page` 根容器（`position: relative`，全寬）；`AppHeader` 與 `HeroBanner` 為 `.home-page` 的直接子元素（全寬，不受 container 限制）；`.container` 使用 Bootstrap 5 斷點（max-width: 540/720/960/1140/1320px，對應 576/768/992/1200/1400px）包裹 `.nav-wrapper`（含 `GamePlatformNav` + `SearchPanel`）與兩個 `GameSection`；`FloatingTopButton` 置於 `.container` 外

**Checkpoint**：Foundation 就緒 — 頁面容器存在，可開始各情境實作。

---

## Phase 3：使用者情境 1 — 首頁預設狀態瀏覽（優先級：P1）🎯 MVP

**目標**：在 390px 寬度下完整呈現所有靜態視覺元件，外觀接近參考圖左側。

**獨立測試**：開啟首頁，在約 390px 寬度下確認 Header、Banner、導覽列、兩個遊戲區塊、浮動按鈕（暫時顯示）全部可見；將瀏覽器拉寬至 1200px 確認容器 ≤ 768px 置中。

### 使用者情境 1 實作

- [x] T014 [P] [US1] 建立 `src/components/AppHeader.vue`：`.app-header`（`display: flex; justify-content: space-between; align-items: center`），左側 `<img src="/assets/images/logo/logo.png" alt="O8">`；右側兩個按鈕：menu button（`<img src="/assets/images/icons/menu.png" :alt="$t('common.accessibility.openMenu')" :aria-label="$t('common.accessibility.openMenu')">`，Phase 1 僅顯示不可點擊）；語系切換按鈕（**文字標籤方案**：`zh-TW` 時按鈕顯示文字 `EN`，`en-US` 時顯示 `中`，代表切換至另一語系；`:aria-label="$t('common.accessibility.changeLanguage')"`；emit `'toggle-locale'` 於 T026 實作，此任務按鈕暫不綁定 click）；`<style scoped lang="scss">`
- [x] T015 [P] [US1] 建立 `src/components/HeroBanner.vue`：`.hero-banner`（`width: 100%; overflow: hidden`），`<img src="/assets/images/banner/banner.png" :alt="'O8 Banner'" style="width: 100%; object-fit: cover; display: block">`；高度與裁切比例參考 `reference/o8-mobile-home-search-reference.png`；`<style scoped lang="scss">`
- [x] T016 [P] [US1] 建立 `src/components/GamePlatformNav.vue`：props `platforms: GamePlatformItem[]`、`activePlatformId: string`；搜尋按鈕圖片：**先視覺確認 `public/assets/images/icons/subtract.png` 是否為搜尋 icon（若確認是則使用，若非搜尋用途則暫以 `<span>🔍</span>` 替代或確認正確檔名）**；搜尋按鈕必須加上 `:aria-label="$t('common.accessibility.searchGames')"`；「發現」項目文字來自 `$t('home.navigation.discover')`；platform 圖片使用 `item.imagePath`，`alt` 使用 `item.name`；`activePlatformId === 'discover'` 時「發現」顯示選中樣式；`<style scoped lang="scss">`
- [x] T017 [P] [US1] 建立 `src/components/GameCard.vue`：props `imagePath: string`、`name: string`、`value: number`、`capsuleColor: 'red' | 'green'`；`.game-card` 包含 `.game-card__image`（`<img :src="imagePath" :alt="name">`，`alt` 直接使用遊戲名稱 prop，不需 i18n）；`.game-card__footer`（`background: #AE8640`，`display: flex; align-items: center`）；`.game-card__title`（`flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`）；`.game-card__capsule`（`:style="{ background: capsuleColor === 'red' ? '#CE2727' : '#35BD13' }"`）；`<img src="/assets/images/icons/arrow-up.png" alt="">` 裝飾性 icon（`alt=""` 為空，視覺裝飾不需輔助說明）；`<style scoped lang="scss">`
- [x] T018 [P] [US1] 建立 `src/components/GameSection.vue`：props `titleKey: string`、`gameType: string`、`pages: GameCard[][]`；標題列（`.game-section__header`）含 icon（`<img :src="\`/assets/images/icons/${props.gameType}.png\`" alt="">`）與標題（`$t(titleKey)`）；`.game-section__grid`（`display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px`）靜態顯示 `pages[0]` 的 4 張 `<GameCard>`；輪播邏輯於 US5 實作；`<style scoped lang="scss">`
- [x] T019 [P] [US1] 建立 `src/components/FloatingTopButton.vue`：props `isVisible: boolean`（Phase 1 由 HomeView 傳入 `true`，US6 改為 scroll 控制）；**固定 wrapper 架構**（確保 > 768px viewport 時按鈕不超出容器）：外層 `.floating-top-button-wrapper`（`position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: min(100vw, 768px); pointer-events: none; z-index: 50`）；內層 `.floating-top-button`（`position: absolute; right: 16px; bottom: 24px; pointer-events: auto`）；`v-show="isVisible"`；內含 `<img src="/assets/images/icons/scroll-up.png" alt="">`（裝飾性 icon）；`:aria-label="$t('common.actions.backToTop')"`；`@click` 暫為空（US6 實作）；`<style scoped lang="scss">`
- [x] T020 [US1] 在 `src/views/HomeView.vue` 組合所有元件：`.home-page` 根容器下，`AppHeader` 與 `HeroBanner` 為全寬直接子元素；`.container` 包裹 `.nav-wrapper`（含 `GamePlatformNav` + `SearchPanel`）、第一個 `GameSection`（`:title-key="'home.sections.hotGames'" :pages="hotGamesPages" :game-type="'hotGames'"`）、第二個 `GameSection`（`:title-key="'home.sections.newGames'" :pages="newGamesPages" :game-type="'newGames'"`）；`FloatingTopButton`（`:is-visible="true"` 暫時常駐）置於 `.container` 之後；在 `<script setup>` 中從 `@/data/platforms` 匯入 `platforms`，從 `@/data/games` 匯入 `carouselPages` 並指定 `const hotGamesPages = carouselPages` 與 `const newGamesPages = carouselPages`
- [ ] T021 [US1] 瀏覽器驗收 US1：DevTools 寬度 390px，確認 Header / Banner / 導覽列 / 兩個遊戲區塊 / 浮動按鈕可見，版面接近參考圖左側；拉寬至 1200px 確認容器 ≤ 768px 置中，外側顯示背景色；600px 寬度確認無破版

**Checkpoint**：使用者情境 1 完成 — 首頁靜態 UI 可完整展示，可獨立驗收。

---

## Phase 4：使用者情境 2 — 搜尋面板開啟與關閉（優先級：P1）

**目標**：點擊搜尋按鈕後顯示遮罩與搜尋面板，可透過遮罩或清除操作關閉。

**獨立測試**：點擊搜尋按鈕確認面板出現；點擊遮罩確認關閉；點擊清除確認關閉。

### 使用者情境 2 實作

- [x] T022 [US2] 建立 `src/components/SearchPanel.vue`：props `isOpen: boolean`、`tags: SearchTag[]`（`SearchTag = { id: string; type: 'provider' | 'category'; label: string }`），emit `'close'`；template 以 `v-if="isOpen"` 控制整體顯示；`.search-panel__overlay`（`position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100`，`@click="emit('close')"`）；`.search-panel`（`position: fixed; top: 0; left: 50%; transform: translateX(-50%); width: min(100vw, 768px); z-index: 101; background: #fff`），包含：搜尋框（`<input :placeholder="$t('home.search.placeholder')">`）、清除文字（`<button @click="emit('close')">{{ $t('home.search.clear') }}</button>`）、搜尋 icon；tags 列表（`type === 'provider'` 直接顯示 `tag.label`；`type === 'category'` 顯示 `$t(tag.label)`）；`<style scoped lang="scss">`；`@click.stop` 加在 `.search-panel` 上防止事件冒泡至 overlay
- [x] T023 [US2] 更新 `src/views/HomeView.vue`：新增 `const isSearchOpen = ref(false)`；定義 `const searchTags: SearchTag[] = [{ id: 'atg', type: 'provider', label: 'ATG' }, { id: 'ag-live', type: 'provider', label: 'AG Live' }, { id: 'war-god', type: 'provider', label: '戰神賽特' }, { id: 'slots', type: 'category', label: 'home.search.tags.slots' }]`；加入 `<SearchPanel :is-open="isSearchOpen" :tags="searchTags" @close="isSearchOpen = false" />`
- [x] T024 [US2] 更新 `src/components/GamePlatformNav.vue`：加入 `emit('open-search')`；搜尋按鈕加上 `@click="emit('open-search')"` 與 `flex-shrink: 0`（確認 `:aria-label="$t('common.accessibility.searchGames')"` 已在 T016 設定）；在 `HomeView.vue` 監聽 `@open-search="isSearchOpen = true"`
- [ ] T025 [US2] 瀏覽器驗收 US2：點擊搜尋按鈕確認遮罩與面板出現；placeholder 為「遊戲、遊戲商、類型」；tags 顯示 ATG、AG Live、戰神賽特、電子（共四項）；點擊遮罩關閉；點擊清除關閉；面板清晰可操作

**Checkpoint**：使用者情境 2 完成 — 搜尋面板開關可獨立驗收。

---

## Phase 5：使用者情境 3 — 語系切換（優先級：P2）

**目標**：Header 語系按鈕可切換 zh-TW ↔ en-US，指定文字即時更新。

**獨立測試**：切換語系確認 10 組文字更新；gamePlatform 與 games 名稱維持不變。

### 使用者情境 3 實作

- [x] T026 [US3] 更新 `src/components/AppHeader.vue`：語系切換按鈕加上 `@click="emit('toggle-locale')"`；按鈕文字以 prop `currentLocale: string` 決定顯示（`currentLocale === 'zh-TW'` 顯示 `EN`，否則顯示 `中`）；emit `'toggle-locale'`
- [x] T027 [US3] 更新 `src/views/HomeView.vue`：`const { locale } = useI18n()`；`const currentLocale = computed(() => locale.value)`；監聽 `@toggle-locale="locale.value = locale.value === 'zh-TW' ? 'en-US' : 'zh-TW'"`；傳入 `:current-locale="currentLocale"` 至 `AppHeader`
- [ ] T028 [US3] 瀏覽器驗收 US3：切換至 en-US 確認「發現」→ Discover、「熱門遊戲」→ Hot Games、「新品推薦」→ New Releases、placeholder → `Games, Providers, Categories`、「清除」→ Clear、「電子」→ Slots、「回到頂部」→ Back to top；ATG、BT、DB、FC、US、AG Live、遊戲名稱維持不變；切回 zh-TW 恢復正確

**Checkpoint**：使用者情境 3 完成 — 語系切換可獨立驗收。

---

## Phase 6：使用者情境 4 — 導覽列水平滑動（優先級：P2）

**目標**：平台導覽列可水平滑動，搜尋按鈕固定，整頁不產生橫向捲動。

**獨立測試**：390px 寬度下滑動導覽列，確認水平滑動、搜尋按鈕固定、頁面不橫向捲動。

### 使用者情境 4 實作

- [x] T029 [US4] 更新 `src/components/GamePlatformNav.vue` SCSS：`.game-platform-nav { display: flex; overflow: hidden }`；`.game-platform-nav__list { display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; flex: 1; scrollbar-width: none; &::-webkit-scrollbar { display: none } }`；搜尋按鈕容器加 `flex-shrink: 0`
- [ ] T030 [US4] 瀏覽器驗收 US4：DevTools 手機模式（390px）模擬觸控滑動導覽列，確認水平滑動；頁面無橫向捲動；搜尋按鈕在任意滑動位置固定可見可點擊

**Checkpoint**：使用者情境 4 完成 — 導覽列水平滑動可獨立驗收。

---

## Phase 7：使用者情境 5 — 遊戲卡片自動輪播（優先級：P2）

**目標**：熱門遊戲與新品推薦各自每 3 秒 fade 自動輪播，指示器同步，兩區塊獨立計時。

**獨立測試**：靜候 3 秒確認兩區塊各自切換至第 2 頁（fade 效果）再循環回第 1 頁，指示器 active 正確。

### 使用者情境 5 實作

- [x] T031 [US5] 更新 `src/components/GameSection.vue`：`<script setup>` 中加入 `const currentPage = ref(0)`；`onMounted(() => { intervalId = setInterval(() => { currentPage.value = (currentPage.value + 1) % props.pages.length }, 5000) })`、`onUnmounted(() => clearInterval(intervalId))`；template 改為依 `props.pages[currentPage]` 渲染 4 張 `<GameCard>`（使用 `:key="currentPage"` 觸發 Transition）
- [x] T032 [US5] 在 `src/components/GameSection.vue` 加入 fade transition：卡片 grid 外層包裹 `<Transition name="fade">`；`<style scoped>` 加入 `.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease }` `.fade-enter-from, .fade-leave-to { opacity: 0 }`；或使用 `v-show` + CSS class 切換；確保容器有固定 `min-height` 避免切換時版面跳動
- [x] T033 [US5] 在 `src/components/GameSection.vue` 加入輪播進度條指示器：`.game-section__indicators`（`display: flex; justify-content: center`），依 `props.pages.length` 渲染矩形 `<div class="game-section__progress-bar">`；`:class="{ 'game-section__progress-bar--active': index === currentPage }"`；SCSS：`flex: 1; max-width: 40px; height: 3px; border-radius: 2px; background: rgba(174,134,64,0.2)`；active 時 `background: #AE8640`；加 `transition: background 0.3s ease`
- [ ] T034 [US5] 瀏覽器驗收 US5：靜候 3 秒確認兩區塊各自 fade 切換至第 2 頁，指示器 dot 更新；再 3 秒循環回第 1 頁；footer 色 `#AE8640`、紅色膠囊 `#CE2727`、綠色膠囊 `#35BD13`；Coins-And-Cannons 名稱省略號截斷不擠壓膠囊

**Checkpoint**：使用者情境 5 完成 — 自動輪播可獨立驗收。

---

## Phase 8：使用者情境 6 — 回到頂部浮動按鈕（優先級：P3）

**目標**：頁面初始隱藏按鈕，捲動後（scrollY > 0）顯示，點擊平滑回頂。

**獨立測試**：開啟首頁確認無按鈕；向下捲動確認按鈕於容器右下方出現；點擊確認平滑回頂且按鈕消失。

### 使用者情境 6 實作

- [x] T035 [US6] 更新 `src/components/FloatingTopButton.vue`：加入 `@click="window.scrollTo({ top: 0, behavior: 'smooth' })"`；確認 T019 的 wrapper 架構（`position: fixed; left: 50%; transform: translateX(-50%); width: min(100vw, 768px)`）已正確實作，確保 > 768px viewport 下按鈕不超出容器右側；`v-show="isVisible"` 已在 T019 設定，此任務確認其正確運作
- [x] T036 [US6] 更新 `src/views/HomeView.vue`：`const scrollY = ref(0)`；`const isFloatingVisible = computed(() => scrollY.value > 0)`；`onMounted(() => { const handler = () => { scrollY.value = window.scrollY }; window.addEventListener('scroll', handler, { passive: true }); onUnmounted(() => window.removeEventListener('scroll', handler)) })`；將 `FloatingTopButton` 的 `:is-visible` 從暫時的 `true` 改為 `:is-visible="isFloatingVisible"`
- [ ] T037 [US6] 瀏覽器驗收 US6：確認頁面初始無按鈕（scrollY = 0）；向下捲動後按鈕出現於主內容容器右下方；點擊後頁面平滑回頂，按鈕消失；在 390px 與 768px 寬度下各自確認按鈕不錯位至容器外側

**Checkpoint**：使用者情境 6 完成 — 回到頂部功能可獨立驗收。

---

## Phase 9：Polish 與品質驗收

**目的**：確保建置通過，視覺還原度達標，記錄剩餘差異。

- [x] T038 [P] 執行 `npm run type-check`，修正所有 TypeScript 型別錯誤（確認所有 `defineProps<T>()` 型別正確、無隱式 `any`、所有 i18n key 字串正確）
- [ ] T039 執行 `npm run build`，確認零 TypeScript error 完成；開啟瀏覽器 console 確認無圖片載入失敗（HTTP 404）與無 i18n key 裸露（畫面顯示 `home.sections.hotGames` 等原始 key 字串表示 i18n 設定有誤）
- [ ] T040 與 `reference/o8-mobile-home-search-reference.png` 比對，記錄所有可見視覺差異於 `specs/001-o8-lobby-home-ui/quickstart.md` 的「視覺差異追蹤」區塊，作為後續微調依據

---

## 相依與執行順序

### Phase 相依關係

- **Setup（Phase 1）**：無相依，立即可開始；T002/T003/T005/T006/T008/T009 可並行
- **Foundational（Phase 2）**：須等 Setup 全部完成 — 阻斷所有 US 任務
- **US1（Phase 3）**：須等 Foundational 完成；T014–T019 可並行；T020 須等 T014–T019 全部完成
- **US2（Phase 4）**：須等 US1 完成（需 HomeView + GamePlatformNav 基礎）
- **US3（Phase 5）**：須等 US1 完成（需 AppHeader 基礎）；可與 US2/US4/US5/US6 並行
- **US4（Phase 6）**：須等 US1 完成（需 GamePlatformNav 基礎）；可與 US2/US3/US5/US6 並行
- **US5（Phase 7）**：須等 US1 完成（需 GameSection 基礎）；可與 US2/US3/US4/US6 並行
- **US6（Phase 8）**：須等 US1 完成（需 FloatingTopButton 基礎）；可與 US2/US3/US4/US5 並行
- **Polish（Phase 9）**：須等所有使用者情境完成

### 使用者情境相依關係

- **US1（P1）**：可於 Foundation 完成後立即開始，無其他 US 相依
- **US2（P1）**：相依 US1（HomeView + GamePlatformNav 存在）
- **US3（P2）**：相依 US1（AppHeader 存在）；可與 US2/US4/US5/US6 並行
- **US4（P2）**：相依 US1（GamePlatformNav 存在）；可與 US2/US3/US5/US6 並行
- **US5（P2）**：相依 US1（GameSection 存在）；可與 US2/US3/US4/US6 並行
- **US6（P3）**：相依 US1（FloatingTopButton 存在）；可與 US2/US3/US4/US5 並行

### 各情境內部執行順序

- US1：T014–T019 並行 → T020 → T021
- US2：T022 → T023 → T024 → T025
- US3：T026 → T027 → T028
- US4：T029 → T030
- US5：T031 → T032 → T033 → T034
- US6：T035 → T036 → T037

---

## 並行範例

### Phase 1 Setup 並行執行

```
# 可同時進行：
Task T002: 建立 _variables.scss
Task T003: 建立 _reset.scss
Task T005: 建立 zh-TW.ts
Task T006: 建立 en-US.ts
Task T008: 建立 platforms.ts
Task T009: 建立 games.ts
```

### Phase 3 US1 元件並行建立

```
# 所有元件可同時建立（各自獨立檔案）：
Task T014: 建立 AppHeader.vue
Task T015: 建立 HeroBanner.vue
Task T016: 建立 GamePlatformNav.vue
Task T017: 建立 GameCard.vue
Task T018: 建立 GameSection.vue
Task T019: 建立 FloatingTopButton.vue
# 等所有元件完成後：
Task T020: 組合 HomeView.vue
```

### US1 完成後的並行實作

```
Thread A: US2（搜尋面板）  T022 → T023 → T024 → T025
Thread B: US3（語系切換）  T026 → T027 → T028
Thread C: US4（水平滑動）  T029 → T030
Thread D: US5（輪播）      T031 → T032 → T033 → T034
Thread E: US6（回到頂部）  T035 → T036 → T037
```

---

## 實作策略

### MVP 優先（僅使用者情境 1）

1. 完成 Phase 1：Setup
2. 完成 Phase 2：Foundational（⚠️ 阻斷所有 US）
3. 完成 Phase 3：使用者情境 1
4. **停止並驗收**：390px 寬度確認靜態首頁視覺方向正確
5. 確認後繼續推進互動功能

### 遞增交付

1. Setup + Foundational → 基礎就緒
2. US1 → 靜態首頁 → 視覺驗收（MVP）
3. US2 → 搜尋互動 → 獨立驗收
4. US3 → 語系切換 → 獨立驗收
5. US4 → 水平滑動 → 獨立驗收
6. US5 → 自動輪播 → 獨立驗收
7. US6 → 回到頂部 → 獨立驗收
8. Polish → 建置驗證 + 視覺差異記錄

---

## 備注

- `[P]` 任務 = 不同檔案、無未完成相依，可並行
- `[US?]` 對應 spec.md 中的使用者情境
- US1 是所有後續 US 的基礎，必須完整完成後才可進入其他 US
- `subtract.png` 作為搜尋按鈕 icon 需視覺確認（T016 有說明），若確認非搜尋圖示則改用備案
- FloatingTopButton 採固定 wrapper 架構（T019）確保 > 768px viewport 時按鈕位置正確
- 語系切換按鈕採文字標籤方案（T014）：`zh-TW` → 顯示 `EN`，`en-US` → 顯示 `中`

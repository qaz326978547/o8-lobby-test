<!--
同步影響報告（Sync Impact Report）
====================================
版本變更：2.0.0 → 2.1.0
升版類型：MINOR — 於「三、視覺還原原則」新增第 7 條，明確規定主要內容
          容器響應式寬度上限（max-width: 768px）與置中展示規則。

修改章節：
  - 原 I. Component-First → 新 五、元件與資料結構原則（完全重寫）
  - 原 II. Type Safety → 合併至 二、核心技術原則（完全重寫）
  - 原 III. State Management Discipline → 合併至 二、核心技術原則（完全重寫）
  - 原 IV. Mobile-First UI → 新 三、視覺還原原則（完全重寫）
  - 原 V. Simplicity & YAGNI → 合併至 二、核心技術原則（完全重寫）
  - 原 Development Standards → 合併至 二、核心技術原則（重寫）
  - 原 Development Workflow → 新 八、規格驅動開發與文件同步原則（重寫）

新增章節：
  - 一、專案目標與第一階段範圍（全新）
  - 六、SCSS 樣式實作原則（全新）
  - 七、多語系 i18n 實作原則（全新，含完整 translation key 規格）
  - 九、品質驗證與完成標準（全新）

範本一致性檢查：
  ✅ .specify/templates/plan-template.md — Constitution Check 區塊以
     "[Gates determined based on constitution file]" 動態參照，無需更新。
  ✅ .specify/templates/spec-template.md — 需求與驗收標準結構與新原則相容。
  ✅ .specify/templates/tasks-template.md — 分階段任務結構與規格驅動流程相容。
  ⚠ .specify/templates/commands/ — 目錄不存在，略過。

待確認項目（Deferred TODOs）：
  - TODO(TEST_FRAMEWORK)：尚未設定測試框架，第九章品質驗證中的
    自動化測試為後續規劃項目。
  - TODO(RATIFICATION_DATE)：本次憲法由專案擁有者（Bean）於 2026-06-04 更新。
-->

# O8 Mobile Game Lobby UI Demo 專案憲法

> 本憲法為本專案所有規格（specification）、計畫（plan）、任務（tasks）
> 與實作（implementation）的最高開發原則。所有規格、計畫、任務、分析報告
> 與使用者可閱讀的專案文件，皆須使用繁體中文（zh-TW）撰寫。

---

## 一、專案目標與第一階段範圍

本專案為 O8 遊戲大廳手機版首頁純前端 UI Demo。

第一階段目標是依照設計參考圖：

`reference/o8-mobile-home-search-reference.png`

使用 Vue 3 + Vite + TypeScript 實作高還原度的手機版畫面。

參考圖狀態說明：

- 圖片左側為首頁預設狀態。
- 圖片右側為搜尋面板展開狀態。

第一階段僅包含：

- 首頁預設狀態畫面。
- 搜尋面板展開與關閉的 UI state。
- `zh-TW` 與 `en-US` 的前端語系切換。
- 與參考圖進行視覺比對與微調所需的前端樣式及元件結構。

第一階段明確不包含：

- API 串接。
- Backend 建立。
- 使用者登入、註冊或權限處理。
- 真實遊戲搜尋或資料篩選。
- 真實分類切換資料邏輯。
- 遊戲啟動或跳轉流程。
- Banner API 或輪播功能。
- 後台管理功能。
- 完整桌機版 UI 設計。
- 語系偏好儲存至 API、localStorage 或 URL route。
- 瀏覽器語系自動偵測。

不得自行擴充任何超出第一階段範圍的功能。

---

## 二、核心技術原則

1. 專案必須基於目前已由 Vue 官方 `create-vue` 初始化完成的 Vue 3 + Vite +
   TypeScript 專案持續開發。

2. Vue 元件統一採用：
   - Vue 3 Composition API。
   - `<script setup lang="ts">`。
   - TypeScript 型別定義。

3. 若目前專案已包含 Vue Router，首頁使用 `/` 路由；不得因第一階段需求而額外
   建立不必要的複雜路由架構。

4. 第一階段不引入 Pinia 或其他全域狀態管理工具。搜尋面板開啟狀態與語系切換等
   單頁 UI state，應以區域性 reactive state、`ref` 或適當的輕量方式管理。

5. 不使用 Element Plus、Vuetify、Quasar 或其他大型 UI component library，以避免
   元件預設樣式影響設計稿還原度。

6. 第一階段不得引入 Tailwind CSS。畫面樣式統一使用 SCSS 實作。

7. 專案需引入適用於 Vue 3 的 `vue-i18n`，並以 Composition API 相容模式建立多語系架構。

---

## 三、視覺還原原則

1. 視覺還原度優先於過度抽象化與過早架構擴張。

2. 實作與驗收必須以以下參考圖作為主要依據：

   `reference/o8-mobile-home-search-reference.png`

3. 頁面需優先精準還原以下視覺項目：
   - 手機版整體比例與內容寬度。
   - Header 高度、背景色、Logo 與右側 icon 排列。
   - Banner 圖片高度、裁切方式與呈現位置。
   - 遊戲平台分類導覽列的排列、選中狀態與搜尋按鈕。
   - 「熱門遊戲」與「新品推薦」區塊標題與間距。
   - 兩欄遊戲卡片 Grid。
   - 遊戲圖片、名稱列與數值膠囊標籤。
   - 金色主題色、白色背景、陰影、圓角與邊界細節。
   - 搜尋展開狀態中的深色半透明遮罩。
   - 搜尋面板必須浮於遮罩上方且保持清晰可操作。
   - 右下方浮動回頂部按鈕的位置與樣式。

4. 實作採 mobile-first，主要驗收寬度以約 `390px` 的手機畫面為主。

5. 桌面瀏覽環境只需要將手機版內容容器置中顯示於適當背景中，方便與參考圖比對；
   不得自行延伸完整桌面版設計。

6. 若參考圖中存在無法明確判斷的細節，應選擇最接近參考圖的靜態呈現方式完成初版，
   並於後續列出需確認或補充的項目，不得任意新增功能。

7. 本專案所有第一階段行動版導向頁面，主要內容顯示容器應採響應式置中版型，主要以約
   `390px` 手機寬度進行視覺驗收，並支援延伸至最大寬度 `768px`。當 viewport 寬度大於
   `768px` 時，主要內容容器不得超過 `768px`，應置中顯示於外層背景中。此規則僅為容器
   寬度與展示方式限制，不代表需要額外設計完整桌機版 UI。

---

## 四、素材使用與資產管理原則

1. 實際頁面顯示所需的圖片素材，應優先使用專案內已提供的本機素材，不得自行重新
   產生、重新設計或以不相關圖片替換主要視覺。

2. 目前素材路徑如下：
   - Logo：`public/assets/images/logo/`
   - Banner：`public/assets/images/banner/`
   - 遊戲平台／遊戲廠商圖片：`public/assets/images/gamePlatform/`
   - 遊戲卡片圖片：`public/assets/images/games/`
   - 頁面 icon：`public/assets/images/icons/`

3. 設計參考圖僅作為畫面比對依據，放置於：

   `reference/o8-mobile-home-search-reference.png`

   不得直接將完整參考截圖當成網頁內容使用。

4. 程式碼引用 `public/assets/images/` 中的素材時，必須完全符合既有資料夾名稱
   與檔名大小寫，避免部署至區分大小寫的環境後發生圖片無法載入問題。

5. 若素材不足，應先列出待補充素材清單，並以不妨礙版面實作的方式完成初版；不得
   為了填補素材而任意改變主要視覺方向。

---

## 五、元件與資料結構原則

1. 首頁不得將所有 template、互動與樣式全部集中堆疊於單一 `App.vue` 中。

2. 元件應依畫面責任合理拆分，避免過度拆分，也避免單一元件承擔過多責任。

3. 第一階段可依實際規劃建立下列職責元件或語意相同的元件：
   - 首頁容器，例如 `HomeView.vue`。
   - Header，例如 `AppHeader.vue`。
   - Banner，例如 `HeroBanner.vue`。
   - 遊戲平台導覽列，例如 `GamePlatformNav.vue`。
   - 搜尋面板，例如 `SearchPanel.vue`。
   - 遊戲區塊，例如 `GameSection.vue`。
   - 遊戲卡片，例如 `GameCard.vue`。
   - 浮動回頂部按鈕，例如 `FloatingTopButton.vue`。

4. 重複顯示的遊戲平台資料與遊戲卡片資料必須以 mock data 管理，不得在 template
   中大量複製貼上相同結構。

5. mock data 應清楚區分：
   - `gamePlatform`：遊戲廠商／平台名稱與圖片，例如 `ATG`、`BT`、`DB`、`FC`、
     `US`、`AG Live`。
   - `games`：遊戲名稱、圖片與卡片資料，例如 `Gods Of Glory`、`Coins And Cannons`。
   - 一般 UI 介面文字：不得直接寫入 mock data 作為固定顯示文字，必須透過
     i18n translation key 取得。

6. 第一階段搜尋狀態只需支援：
   - 開啟搜尋面板。
   - 顯示遮罩。
   - 透過指定操作關閉搜尋面板。

   不需實作實際搜尋、篩選結果、輸入比對或資料更新。

---

## 六、SCSS 樣式實作原則

1. 第一階段所有 UI 畫面樣式統一使用 SCSS 實作，不引入 Tailwind CSS 或大型樣式框架。

2. 實作計畫與實作階段需加入 Vite 可使用的 SCSS 預處理器，例如 `sass-embedded`。

3. SCSS class 命名必須依照實際畫面區塊、元件責任或功能語意命名，不得使用：
   - 亂數名稱。
   - 無意義縮寫。
   - 單純以順序命名但無法辨識用途的名稱。
   - 設計工具預設匯出的無語意名稱。
   - 與畫面責任無關的名稱。

4. class 命名應清楚反映區塊用途，例如：
   - `.home-page`
   - `.app-header`
   - `.hero-banner`
   - `.game-platform-nav`
   - `.game-section`
   - `.game-card`
   - `.search-panel`
   - `.floating-top-button`

5. 子元素可依區塊採用一致且易理解的語意命名方式，例如：
   - `.game-card__image`
   - `.game-card__footer`
   - `.game-card__title`
   - `.game-card__score`
   - `.search-panel__input`
   - `.search-panel__tags`
   - `.game-platform-nav__item`
   - `.game-platform-nav__label`

6. 不強制所有樣式必須使用特定命名方法，但同一元件或同一畫面區塊內必須保持
   一致、可讀且具語意的命名邏輯。

7. 僅限真正會跨頁面或跨元件共用的樣式放置於共用樣式資料夾。

8. 共用樣式內容可包含：
   - CSS reset 或基礎樣式。
   - 全域 design tokens。
   - CSS variables。
   - 共用字型設定。
   - 全站背景、文字色、主題金色、遮罩色、共用圓角與共用陰影變數。
   - 確實被多個頁面或元件重複使用的 mixins 或 utility styles。

9. 共用樣式應集中管理於 `src/assets/styles/`，可包含例如：
   - `src/assets/styles/main.scss`
   - `src/assets/styles/_variables.scss`
   - `src/assets/styles/_reset.scss`
   - `src/assets/styles/_mixins.scss`

10. 各頁面或元件專屬的版面、尺寸、間距、圖片定位、遮罩、互動狀態與細節樣式，
    應直接寫於對應 `.vue` 檔案最下方的 `<style scoped lang="scss">`。

11. 樣式責任應依元件歸屬管理，例如：
    - `HomeView.vue`：頁面容器、整體頁面排列、全頁遮罩與頁面層級。
    - `AppHeader.vue`：Header 排列、Logo 與操作 icon。
    - `HeroBanner.vue`：Banner 尺寸與圖片呈現。
    - `GamePlatformNav.vue`：平台分類導覽列與選中狀態。
    - `SearchPanel.vue`：搜尋框、清除操作與搜尋 tags。
    - `GameSection.vue`：區塊標題與遊戲 Grid。
    - `GameCard.vue`：卡片圖片、名稱列與數值膠囊。
    - `FloatingTopButton.vue`：浮動按鈕本身樣式與互動呈現。

12. 不得為了方便，將單一頁面或單一元件專屬樣式全部堆疊至全域 SCSS 檔案中。

13. 僅在樣式確實需要全站生效、處理第三方元件覆寫，或必須跨元件共享且無法由元件
    層級妥善管理時，才可使用非 `scoped` 的全域樣式；使用時必須在規劃或程式碼中
    註明原因。

14. 樣式實作必須避免：
    - 同一組頁面專屬樣式散落於多個全域檔案。
    - 為沒有重用需求的細節樣式建立不必要抽象。
    - 為追求速度而犧牲 class 可讀性。
    - 使用大量無意義 class 名稱導致後續無法精準微調畫面。

---

## 七、多語系 i18n 實作原則

1. 專案從第一階段起即必須引入並使用適用於 Vue 3 的 `vue-i18n` 套件。

2. i18n 必須使用 Vue Composition API 相容模式設定，建立 i18n instance 時使用：

   `legacy: false`

3. 專案從第一階段起即支援以下兩種語系：
   - `zh-TW`：繁體中文，作為預設語系。
   - `en-US`：英文（美式英文）。

4. locale key 與語系檔命名必須統一使用標準大小寫格式 `zh-TW` / `en-US`；
   不得使用 `zh-tw`、`en-us` 或其他不一致格式。

5. 多語系相關檔案應集中管理於 `src/locales/`，至少包含：
   - `src/locales/index.ts`
   - `src/locales/zh-TW.ts`
   - `src/locales/en-US.ts`

6. i18n instance 需於應用程式入口中註冊，並使所有頁面與元件可透過 translation
   key 取得文字。預設載入語系必須為 `zh-TW`。

7. Header 中的語系功能 icon 在第一階段需支援切換 `zh-TW` 與 `en-US` 的前端
   畫面文字。

8. 第一階段語系切換僅限前端 UI state，不需實作 localStorage、API 儲存、URL
   語系 route、瀏覽器語系自動判斷或後端語系同步。

9. 除明確列出的例外資料外，所有顯示於畫面上的使用者介面文字皆不得直接硬編碼
   於 Vue template、script 或一般 mock data 中，必須透過 i18n translation key 取得。

10. 必須使用 i18n translation key 的內容包含但不限於：
    - 功能性分類名稱，例如「發現」／`Discover`。
    - 區塊標題，例如「熱門遊戲」／`Hot Games`、「新品推薦」／`New Releases`。
    - 搜尋欄位 placeholder，例如「遊戲、遊戲商、類型」／`Games, Providers, Categories`。
    - 操作文字，例如「清除」／`Clear`。
    - 類型或功能 tags，例如「電子」／`Slots`。
    - 圖片替代文字 `alt`。
    - 按鈕或操作區塊的 `aria-label`。
    - 其他使用者可閱讀或輔助技術可讀取的介面文字。

11. 以下兩類資料屬於內容名稱或品牌名稱，允許直接由 mock data 提供顯示內容，
    不強制使用 i18n translation key，且切換語系時不需翻譯：
    - `gamePlatform`：遊戲廠商／平台名稱，例如 `ATG`、`BT`、`DB`、`FC`、`US`、
      `AG Live`。
    - `games`：遊戲名稱，例如 `Gods Of Glory`、`Coins And Cannons`、
      `Fortune Pandas`、`Last Man Standing`。

12. 「發現」為功能性分類名稱，不屬於 `gamePlatform` 例外，必須透過 i18n 顯示：
    - `zh-TW`：`發現`
    - `en-US`：`Discover`

13. 搜尋面板中的 tag 必須依資料類型判斷是否翻譯：
    - `ATG`、`AG Live` 等遊戲廠商名稱屬於 `gamePlatform`，可直接由資料顯示且不翻譯。
    - `電子` 等遊戲類型或功能文字必須使用 i18n：
      - `zh-TW`：`電子`
      - `en-US`：`Slots`

14. i18n translation key 必須依頁面與功能語意組織，不得使用中文文字直接作為 key、
    亂數 key、無法理解用途的縮寫 key，或不同語系檔中結構不一致的 key。

15. 首頁初版至少需提供以下 translation keys 及初始文字：

    **zh-TW**：

    | Key | 文字 |
    |-----|------|
    | `home.navigation.discover` | `發現` |
    | `home.sections.hotGames` | `熱門遊戲` |
    | `home.sections.newGames` | `新品推薦` |
    | `home.search.placeholder` | `遊戲、遊戲商、類型` |
    | `home.search.clear` | `清除` |
    | `home.search.tags.slots` | `電子` |
    | `common.actions.backToTop` | `回到頂部` |
    | `common.accessibility.openMenu` | `開啟選單` |
    | `common.accessibility.searchGames` | `搜尋遊戲` |
    | `common.accessibility.changeLanguage` | `切換語言` |

    **en-US**：

    | Key | 文字 |
    |-----|------|
    | `home.navigation.discover` | `Discover` |
    | `home.sections.hotGames` | `Hot Games` |
    | `home.sections.newGames` | `New Releases` |
    | `home.search.placeholder` | `Games, Providers, Categories` |
    | `home.search.clear` | `Clear` |
    | `home.search.tags.slots` | `Slots` |
    | `common.actions.backToTop` | `Back to top` |
    | `common.accessibility.openMenu` | `Open menu` |
    | `common.accessibility.searchGames` | `Search games` |
    | `common.accessibility.changeLanguage` | `Change language` |

16. `zh-TW.ts` 與 `en-US.ts` 必須保持完全相同的 translation key 結構；任何新增
    介面文字都必須同時補齊兩種語系。

17. 新增任何頁面、元件或 UI state 時，都必須檢查：
    - 新增文字是否已建立 i18n translation key。
    - `zh-TW` 與 `en-US` 是否皆有對應文案。
    - 除 `gamePlatform` 與 `games` 例外之外，是否仍存在硬編碼於元件中的顯示文字。
    - `alt` 與 `aria-label` 是否也符合 i18n 規範。

---

## 八、規格驅動開發與文件同步原則

1. 本專案必須遵循 Spec-Driven Development 流程。

2. 第一次功能實作流程應依序進行：
   Constitution → Specification → Clarification → Plan → Tasks → Analyze → Implement。

3. 在需求尚未完成規格化、釐清與一致性檢查之前，不得直接開始大幅修改實作程式碼。

4. 每次新增需求、調整互動或修改視覺呈現時，必須先更新對應的規格文件，再進行
   程式碼修改。

5. 每次需求異動時，必須同步檢查並維護相關文件，包括但不限於：
   - `spec.md`
   - `plan.md`
   - `tasks.md`
   - analyze report 或其他一致性檢查文件。

6. 不得出現文件描述與實際實作範圍不一致的情況。

7. 若在實作過程中發現素材不足、規格衝突或畫面細節無法判斷，應先記錄問題並提出
   待確認項目，不得任意擴充需求或自行決定超出設計稿範圍的功能。

---

## 九、品質驗證與完成標準

1. 每一階段實作完成後，必須執行：
   - `npm run build`
   - 若專案已有 lint script，則必須執行 `npm run lint`

2. 完成結果不得留下：
   - TypeScript error。
   - ESLint error。
   - 明顯瀏覽器 console error。
   - 圖片資源載入失敗。
   - i18n key 缺漏或畫面直接顯示 translation key。
   - 除 `gamePlatform` 與 `games` 例外外的硬編碼 UI 文字。

3. 首頁初版完成時，必須可實際驗證以下畫面與操作：
   - `zh-TW` 首頁預設狀態。
   - `zh-TW` 搜尋面板展開狀態。
   - `en-US` 首頁預設狀態。
   - `en-US` 搜尋面板展開狀態。
   - 搜尋面板可開啟及關閉。
   - 語系可在 `zh-TW` 與 `en-US` 間切換。
   - `gamePlatform` 與 `games` 名稱不因語系切換而被翻譯。
   - 其他介面文字可正確隨語系切換。

4. 視覺驗收必須以 `reference/o8-mobile-home-search-reference.png` 為基準，
   優先確認手機畫面還原度，再進行後續功能擴充。

5. 若初版仍存在與參考圖的視覺差異，應列出明確差異項目，作為下一次 specification
   更新與視覺微調依據。

---

## 治理（Governance）

本憲法為本專案最高開發準則，凌駕於所有其他慣例之上。修訂必須：

1. 更新本文件並依語意版本（Semantic Versioning）遞增版本號。
2. 將相關變動傳遞至 `.specify/templates/` 各範本檔案。
3. 由專案擁有者（Bean）核准後方可生效。

所有 PR 與 Code Review 必須驗證符合本憲法的現行原則。
開發過程如發現規格衝突或範圍疑義，應以本憲法為最終仲裁依據。
執行時期開發指引請參閱 `CLAUDE.md`；本憲法規範架構意圖與不可妥協的原則。

**版本**：2.1.0 | **制定日期**：2026-06-04 | **最後修訂**：2026-06-04

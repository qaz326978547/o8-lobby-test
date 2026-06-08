# 資料模型：O8 手機版遊戲大廳首頁 UI Demo

**功能分支**：`001-o8-lobby-home-ui`
**日期**：2026-06-04

---

## 實體定義

### GamePlatform

遊戲廠商／平台導覽列項目。

```ts
interface GamePlatform {
  id: string            // 唯一識別碼，例如 'atg', 'bt', 'discover'
  name: string          // 畫面顯示名稱（不翻譯），例如 'ATG', 'US'
  imagePath: string     // 圖片路徑，例如 '/assets/images/gamePlatform/ATG.png'
                        // 「發現」項目使用 '/assets/images/icons/discover.png'
  isDiscover: boolean   // 是否為「發現」功能項目（名稱來自 i18n，其餘為 false）
}
```

**驗證規則**：
- `id` 不得重複
- `imagePath` 必須對應 `public/assets/images/` 下實際存在的檔案（大小寫敏感）
- 導覽列順序固定：發現 → ATG → BT → DB → FC → US

**Mock data 來源**：`src/data/platforms.ts`

---

### GameCard

遊戲卡片資料。

```ts
type CapsuleColor = 'red' | 'green'

interface GameCard {
  id: string            // 唯一識別碼，例如 'gods-of-glory'
  name: string          // 遊戲名稱（不翻譯），例如 'Gods-Of-Glory'
  imagePath: string     // 遊戲圖片路徑，例如 '/assets/images/games/GameCard-1.png'
  value: number         // 數值膠囊顯示數字，例如 100
  capsuleColor: CapsuleColor  // 'red' = #CE2727，'green' = #35BD13
}
```

**Phase 1 固定資料**：

| id | name | imagePath | value | capsuleColor |
|----|------|-----------|-------|--------------|
| `gods-of-glory` | `Gods-Of-Glory` | `.../GameCard-1.png` | 100 | red |
| `coins-and-cannons` | `Coins-And-Cannons` | `.../GameCard-2.png` | 100 | red |
| `fortune-pandas` | `Fortune-Pandas` | `.../GameCard-3.png` | 100 | red |
| `last-man-standing` | `Last-Man-Standing` | `.../GameCard-4.png` | 70 | green |

**Mock data 來源**：`src/data/games.ts`

---

### CarouselPage

輪播區塊的單頁資料結構（非獨立實體，由 GameSection 使用）。

```ts
interface CarouselPage {
  cards: GameCard[]     // 固定長度：4 張（2×2 Grid）
}
```

**約束**：
- `cards.length === 4`（Phase 1 固定）
- Phase 1 兩頁皆使用相同的 4 張 GameCard（order 相同），但為獨立陣列物件

---

### SearchTag

搜尋面板標籤，分為「廠商名稱（不翻譯）」與「類型文字（i18n）」兩類。

```ts
type SearchTagType = 'provider' | 'category'

interface SearchTag {
  id: string            // 唯一識別碼
  type: SearchTagType   // 'provider'：不翻譯；'category'：使用 i18n key
  label: string         // type='provider' 時為固定文字；type='category' 時為 i18n key
}
```

**Phase 1 搜尋 tags**：

| id | type | label |
|----|------|-------|
| `atg` | provider | `ATG` |
| `ag-live` | provider | `AG Live` |
| `war-god` | provider | `戰神賽特` |
| `slots` | category | `home.search.tags.slots` |

> `戰神賽特` 屬於 games 資料類別（遊戲名稱），不翻譯，type 設為 provider。

---

## UI State 型別

以下為頁面層級的 reactive state，不持久化。

```ts
// HomeView.vue 層級
interface HomeUIState {
  isSearchOpen: boolean     // 搜尋面板開關
  currentLocale: 'zh-TW' | 'en-US'  // 目前語系
  scrollY: number           // 頁面捲動距離，用於 FloatingTopButton 顯示條件
}

// GameSection.vue 層級（每個區塊各自持有）
interface CarouselState {
  currentPage: number       // 目前頁碼（0-based）
  totalPages: number        // 總頁數（Phase 1 固定為 2）
  autoPlayInterval: number  // 自動輪播間隔（ms），Phase 1 固定 5000
}
```

---

## i18n 訊息結構

`src/locales/zh-TW.ts` 與 `src/locales/en-US.ts` 必須保持相同 key 結構：

```ts
interface Messages {
  home: {
    navigation: {
      discover: string
    }
    sections: {
      hotGames: string
      newGames: string
    }
    search: {
      placeholder: string
      clear: string
      tags: {
        slots: string
      }
    }
  }
  common: {
    actions: {
      backToTop: string
    }
    accessibility: {
      openMenu: string
      searchGames: string
      changeLanguage: string
    }
  }
}
```

---

## 資料關係圖

```
HomeView
├── AppHeader            → emit: toggle-locale（全寬，不受 .container 限制）
├── HeroBanner           （無資料依賴，全寬）
├── .container           （Bootstrap 5 斷點容器）
│   ├── .nav-wrapper
│   │   ├── GamePlatformNav  → data: GamePlatform[]，emit: open-search
│   │   └── SearchPanel      → data: SearchTag[]，props: isOpen，emit: close
│   ├── GameSection (熱門)   → data: CarouselPage[]，prop: gameType='hotGames'
│   │   └── GameCard ×4
│   └── GameSection (新品)   → data: CarouselPage[]，prop: gameType='newGames'
│       └── GameCard ×4
└── FloatingTopButton    → props: isVisible (scrollY > 0)，position: fixed
```

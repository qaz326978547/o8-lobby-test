/**
 * GamePlatformNav 元件介面契約
 * 對應元件：src/components/GamePlatformNav.vue
 */

export interface GamePlatformItem {
  id: string
  /** 畫面顯示名稱（不翻譯），「發現」例外：由 isDiscover=true 判斷從 i18n 取得 */
  name: string
  /** 圖片路徑，對應 public/assets/images/ 下的檔案 */
  imagePath: string
  /** true = 「發現」功能項目，名稱由 i18n key 'home.navigation.discover' 取得 */
  isDiscover: boolean
}

export interface GamePlatformNavProps {
  /** 平台列表，順序即為顯示順序 */
  platforms: GamePlatformItem[]
  /** 目前選中的平台 id */
  activePlatformId: string
}

export interface GamePlatformNavEmits {
  /** 點擊搜尋按鈕時觸發 */
  'open-search': []
}

/**
 * GamePlatformNav 行為契約
 * - 列表可水平滑動，不造成整頁橫向捲動
 * - 搜尋按鈕以 flex-shrink: 0 固定於右側，不隨列表滑動
 * - Phase 1 不因點擊平台而切換遊戲資料
 * - 「發現」預設選中（activePlatformId = 'discover'）
 */

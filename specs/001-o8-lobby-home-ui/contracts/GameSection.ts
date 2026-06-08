/**
 * GameSection 元件介面契約
 * 對應元件：src/components/GameSection.vue
 */

import type { GameCardProps } from './GameCard'

export interface GameSectionProps {
  /** 區塊標題的 i18n key，例如 'home.sections.hotGames' */
  titleKey: string
  /**
   * 遊戲類型識別碼，用於標題列 icon 路徑：`/assets/images/icons/{gameType}.png`
   * Phase 1 允許值：'hotGames' | 'newGames'
   */
  gameType: string
  /**
   * 輪播頁面資料，每個元素為一頁的卡片陣列。
   * Phase 1：固定 2 頁，每頁 4 張。
   */
  pages: GameCardProps[][]
}

/**
 * GameSection 行為契約
 * - 初始顯示 pages[0]
 * - 每隔 5000ms 切換至下一頁（循環）
 * - 頁面切換效果：fade（opacity transition，mode: out-in）
 * - 指示器：矩形進度條（progress bar），數量 = pages.length，active 色 #AE8640，非 active 半透明
 * - 元件 unmount 時必須清除 interval
 */

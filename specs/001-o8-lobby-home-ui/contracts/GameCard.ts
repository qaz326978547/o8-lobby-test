/**
 * GameCard 元件介面契約
 * 對應元件：src/components/GameCard.vue
 */

export type CapsuleColor = 'red' | 'green'

export interface GameCardProps {
  /** 遊戲圖片路徑，對應 public/assets/images/games/ 下的檔案 */
  imagePath: string
  /** 遊戲名稱（不翻譯），超長以省略號截斷，單行顯示 */
  name: string
  /** 數值膠囊顯示的數字 */
  value: number
  /** 膠囊背景色：red = #CE2727，green = #35BD13 */
  capsuleColor: CapsuleColor
}

/**
 * 色碼對應
 * footer 背景：#AE8640
 * red capsule：#CE2727
 * green capsule：#35BD13
 */
export const CAPSULE_COLORS: Record<CapsuleColor, string> = {
  red: '#CE2727',
  green: '#35BD13',
}

export const FOOTER_BG_COLOR = '#AE8640'

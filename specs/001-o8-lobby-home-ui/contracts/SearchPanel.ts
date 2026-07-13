/**
 * SearchPanel 元件介面契約
 * 對應元件：src/components/SearchPanel.vue
 */

export type SearchTagType = 'provider' | 'category'

export interface SearchTag {
  id: string
  /** provider = 廠商名稱（不翻譯）；category = 類型（使用 i18n key） */
  type: SearchTagType
  /** type='provider' 時為固定文字；type='category' 時為 i18n key */
  label: string
}

export interface SearchPanelProps {
  /** 控制面板顯示狀態 */
  isOpen: boolean
  /** 搜尋 tags 列表 */
  tags: SearchTag[]
}

export interface SearchPanelEmits {
  /** 點擊遮罩或清除操作後觸發，由父元件關閉面板 */
  'close': []
}

/**
 * SearchPanel 行為契約
 * - isOpen=true 時顯示：全頁半透明遮罩（z-index 100）+ 搜尋面板（z-index 101）
 * - 搜尋框 placeholder 使用 i18n key 'home.search.placeholder'
 * - 清除文字使用 i18n key 'home.search.clear'
 * - type='provider' 的 tag 直接顯示 label 文字
 * - type='category' 的 tag 使用 $t(label) 翻譯
 * - 點擊遮罩區域 → emit('close')
 * - 點擊清除操作 → emit('close')
 * - Phase 1 不實作實際搜尋或篩選
 */

/**
 * GameCard Adapter 契約
 * 對應實作位置：src/views/HomeView.vue（script setup）或 src/utils/gameCardAdapter.ts
 *
 * 將 API 回傳的 LobbyGroup[] 轉換為 GameCard[][] 供 GameSection 輪播使用。
 * 此 adapter 是唯一允許存取 game.iconurl 並橋接至 GameCard.imagePath 的地方。
 *
 * 設計原則：
 *   - 不修改 GameCard.vue 的 props 型別
 *   - 不修改 GameSection.vue 的 pages 型別（仍為 GameCard[][]）
 *   - protocol-relative iconurl（// 開頭）補上 https: 前綴
 *   - 無 iconurl 時 fallback 至 mock 圖片路徑
 */

import type { LobbyGroup } from '@/apis/interface/lobby'
import type { GameCard } from '@/data/games'
import { carouselPages } from '@/data/games'

/**
 * 將 LobbyGroup[] 轉換為 GameCard[][] (每頁 4 張)
 *
 * @param groups - 已過濾（isvisible）並排序（order）的 LobbyGroup 陣列
 * @returns GameCard[][] 供 GameSection 的 :pages prop 使用；
 *          若 groups 為空，回傳 carouselPages（mock fallback）
 *
 * 已知差異：
 *   - game.value → 暫設 0（API Game 無此欄位）
 *   - game.capsuleColor → 暫設 'red'（API Game 無此欄位）
 *   後續依產品確認調整（可隱藏或另行設計）
 */
export function toGameCardPages(groups: LobbyGroup[]): GameCard[][] {
  const games = groups.flatMap(g => g.games)
  if (games.length === 0) return carouselPages

  const pages: GameCard[][] = []
  for (let i = 0; i < games.length; i += 4) {
    pages.push(
      games.slice(i, i + 4).map(game => ({
        id: game.id,
        name: game.name,
        imagePath: resolveIconUrl(game.iconurl),
        value: 0,
        capsuleColor: 'red' as const,
      })),
    )
  }
  return pages
}

/**
 * 解析 iconurl，確保可被 <img> 正常載入
 *
 * - `//domain/path` → `https://domain/path`
 * - 空字串或 null → mock fallback 路徑
 * - 其他值 → 原樣回傳
 */
function resolveIconUrl(iconurl: string): string {
  if (!iconurl) return '/assets/images/games/GameCard-1.png'
  if (iconurl.startsWith('//')) return `https:${iconurl}`
  return iconurl
}

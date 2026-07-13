/**
 * LobbyApi 模組介面契約
 * 對應實作：src/apis/lobby.ts
 *
 * 所有函式皆使用 VITE_UGS_API_BASE 作為 base，不寫死 domain 或 path。
 * token 必須由呼叫方傳入，不可在此模組中硬編碼。
 */

import type {
  ILobbyResponse,
  LobbySearchResponse,
  SearchLobbyParams,
  GameLaunchParams,
} from '@/apis/interface/lobby'

export namespace LobbyApi {
  /**
   * 取得大廳資料
   *
   * API: GET {VITE_UGS_API_BASE}/api/lobby/{lobbyPath}?token={token}
   *
   * @param lobbyPath - 大廳路徑，預設 'mobile'
   * @param token     - URL query string 取得的 authtoken，不可硬編碼
   * @returns ILobbyResponse 或 false（呼叫失敗時）
   */
  export function getLobbyData(
    lobbyPath: 'mobile' | 'desktop' | 'o8',
    token: string,
  ): Promise<ILobbyResponse | false>

  /**
   * 搜尋遊戲、供應商與遊戲類型
   *
   * API: GET {VITE_UGS_API_BASE}/api/lobby/{lobbyPath}/search
   *
   * query params（只能使用文件定義的參數）：
   *   token, keyword, pageSize, gamesOffset, providersOffset, gameTypesOffset
   *
   * 空 keyword 回傳空結果，不代表全部遊戲。
   *
   * @returns LobbySearchResponse 或 false（呼叫失敗時）
   */
  export function searchLobby(
    params: SearchLobbyParams,
  ): Promise<LobbySearchResponse | false>

  /**
   * 組合遊戲啟動 URL（不發出 HTTP 請求，純 URL 組合）
   *
   * URL 格式：
   *   {VITE_UGS_API_BASE}/gamelauncher?token={token}&gpcode={gpcode}&gcode={gcode}&betlimitid={betlimitid}&lang={lang}
   *
   * - gpcode: game.providercode
   * - gcode:  game.code
   * - betlimitid: 無值時傳空字串
   * - lang: Player.lang → i18n.locale → 'zh-TW'
   *
   * @returns 完整啟動 URL 字串（含 query string）
   */
  export function getGameLaunchUrl(params: GameLaunchParams): string
}

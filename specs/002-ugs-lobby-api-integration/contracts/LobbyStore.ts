/**
 * LobbyStore 介面契約
 * 對應實作：src/stores/lobby.ts
 *
 * Store 是 token 與大廳資料的唯一持有者。
 * Player、Balance、CurrencySymbol 現階段存 store，不接 UI。
 */

import type { ILobbyResponse, LobbyGroup, Game, GameProvider, Player, SearchLobbyParams } from '@/apis/interface/lobby'

// ─── State ────────────────────────────────────────────────

/** 從 URL query string 取得的 authtoken，null 表示未設定 */
declare const token: Ref<string | null>

/** Lobby API 完整回應，null 表示尚未載入 */
declare const lobbyData: Ref<ILobbyResponse | null>

// ─── Computed ─────────────────────────────────────────────

/** 已過濾（isvisible === true）並依 order 排序的遊戲群組 */
declare const LobbyGameGroup: ComputedRef<LobbyGroup[]>

/** 來自 LobbyGameGroup 的所有遊戲（不含隱藏 group） */
declare const LobbyGameList: ComputedRef<Game[]>

/** 跨 group 合併、依 code 去重的遊戲供應商列表 */
declare const LobbyGameProviders: ComputedRef<GameProvider[]>

/** 玩家資料。現階段不接 UI，不顯示玩家名稱或餘額。 */
declare const playerData: ComputedRef<Player | null>

/** 餘額文字。現階段不接 UI。 */
declare const balanceText: ComputedRef<string | null>

/** 幣別符號。現階段不接 UI。 */
declare const currencySymbol: ComputedRef<string | null>

/**
 * iframe 不支援的供應商代碼列表。
 * 來源：response.IframeUnsupportedGameProviders
 * 啟動遊戲時用於 shouldOpenByRedirect 判斷。
 */
declare const iframeUnsupportedProviders: ComputedRef<string[]>

/**
 * 僅支援 HTTP 的供應商代碼列表。
 * 來源：response.SupportHttpOnlyGameProviders
 * 行為待後端確認，先存 store。
 */
declare const supportHttpOnlyProviders: ComputedRef<string[]>

// ─── Actions ──────────────────────────────────────────────

/**
 * 保存 token
 * 應在讀取 URL query string 後立即呼叫。
 */
declare function setToken(t: string): void

/**
 * 以 store 中的 token 呼叫 Lobby API，將結果存入 lobbyData。
 * token 為 null 時不呼叫 API，直接 return。
 *
 * @param lobbyPath - 預設 'mobile'
 */
declare function fetchLobbyData(lobbyPath?: string): Promise<void>

/**
 * 搜尋（stub，Phase 4 完整實作）
 * 空 keyword 時不呼叫 API，直接回傳空結果。
 */
declare function searchLobby(params: SearchLobbyParams): Promise<void>

// ─── Helpers ──────────────────────────────────────────────

/**
 * 判斷遊戲是否應以整頁跳轉方式啟動（而非 iframe）
 *
 * 符合任一條件即回傳 true：
 *   1. game.supportiframe === false
 *   2. IframeUnsupportedGameProviders 包含 game.providercode
 *   3. Lobby.Data.configurations.iframeunsupportedgameproviders 包含 game.providercode
 *
 * 現階段遊戲卡片不需要點擊行為，此 helper 先建立但不觸發。
 */
declare function shouldOpenByRedirect(game: Game): boolean

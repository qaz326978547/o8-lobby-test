export interface ILobbyResponse {
  LobbyTemplateCode: string
  Lobby: Lobby
  Player: Player

  PlayerToken: string
  SupportHttpOnlyGameProviders: string[]
  IframeUnsupportedGameProviders: string[]
  HasOperatorGame: boolean
  AIHidePlayerBalance: boolean
  AutoResize: boolean
  Balance: string
  FavIconBase: string
  CurrencySymbol: string
  IsPreview: boolean
}

export interface Lobby {
  Data: LobbyData
}

export interface LobbyData {
  css: string
  iconres: string[]
  groups: LobbyGroup[]
  currencies: Currency[]
  bonuscampaigns: unknown[]
  jackpotwinners: unknown[]
  bigwinners: unknown[]
  configurations: LobbyConfigurations
  lobbyid: string
  lobbypath: string
  brandlogourl: string
  pagetitle: string
  cdnroot: string
  lobbyplatformtype: number
  jackpotgroups: unknown[]
}

export interface LobbyGroup {
  code: string
  name: string
  order: number
  subgroups: unknown[]
  games: Game[]
  banners: unknown[]
  gamelaunchtype: number
  gameproviders: GameProvider[]
  supportedelements: unknown[]
  isvisible: boolean
}

export interface Game {
  id: string
  name: string
  code: string
  description: string
  providershortname: string
  providercode: string
  providername: string
  url: string
  demourl: string
  ruleurl: string
  iconurl: string
  videourl: string
  previewiconurl: string
  tags: unknown[]
  markers: unknown[]
  browsertype: string
  browserincompatible: boolean
  isactive: boolean
  isrestricted: boolean
  supporttestplayer: boolean
  popupwidth: number
  popupheight: number
  betlimits: unknown[]
  urls: unknown[]
  gametype: number
  gametypename?: string
  ugsgameid: string
  supportquickfundin: boolean
  supportiframe: boolean
  istgpgame: boolean
}

export interface GameProvider {
  code: string
  name: string
  shortname: string
  iconurl: string
}

export interface Currency {
  cur: string
  symbol: string
}

export interface LobbyConfigurations {
  iframeunsupportedgameproviders: string[]
  httponlysupportedgameproviders: string[]
}

export interface Player {
  id: string
  brandcode: string
  username: string
  lang: string
  cur: string
  cursym: string
  bal: number
  istestplayer: boolean
  token: string
  tokenid: string
  encryptedtokenid: string
  status: number
  loginurl: string
  playercode: string
  hasexceeddailyturnover: boolean
  showquickfundinicon: boolean
  isproxywallet: boolean
  idletokenminutes: number
}

// ─── 搜尋 API ────────────────────────────────────────────────────────────────

export interface PaginationResult<T> {
  items: T[]
  offset: number
  totalCount: number
  hasMore: boolean
}

export interface GameSearchItem {
  id: string
  name: string
  code: string
  providercode: string
  iconurl: string
}

export interface ProviderSearchItem {
  code: string
  name: string
  shortname: string
  iconurl: string
}

export interface GameTypeSearchItem {
  code: string
  name: string
  gamecount: number
}

export interface LobbySearchResponse {
  keyword: string
  games: PaginationResult<GameSearchItem>
  providers: PaginationResult<ProviderSearchItem>
  gameTypes: PaginationResult<GameTypeSearchItem>
}

// ─── API 呼叫參數 ─────────────────────────────────────────────────────────────

export interface SearchLobbyParams {
  lobbyPath: string
  token: string
  keyword: string
  pageSize?: number
  gamesOffset?: number
  providersOffset?: number
  gameTypesOffset?: number
}

export interface GameLaunchParams {
  token: string
  gpcode: string
  gcode: string
  betlimitid?: string
  lang?: string
}

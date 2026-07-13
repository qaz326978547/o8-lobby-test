import { $http, isResponseOK, asyncDo } from '@/apis/https'
import type {
  ILobbyResponse,
  LobbySearchResponse,
  SearchLobbyParams,
  GameLaunchParams,
} from '@/apis/interface/lobby'

export namespace LobbyApi {
  export async function getLobbyData(
    lobbyPath: 'mobile' | 'desktop' | 'O8_Mobile_Lobby_test' = 'mobile',
    token: string,
  ): Promise<ILobbyResponse | false> {
    const [err, result] = await asyncDo(
      $http<ILobbyResponse>('get', `/api/lobby/${lobbyPath}`, { token }),
    )
    if (!isResponseOK(err, result) || !result) {
      return false
    }
    return result
  }

  export async function searchLobby(
    params: SearchLobbyParams,
  ): Promise<LobbySearchResponse | false> {
    const { lobbyPath, ...queryParams } = params
    const [err, result] = await asyncDo(
      $http<LobbySearchResponse>('get', `/api/lobby/${lobbyPath}/search`, queryParams),
    )
    if (!isResponseOK(err, result) || !result) {
      return false
    }
    return result
  }

  // Phase 5 完整實作
  export function getGameLaunchUrl(_params: GameLaunchParams): string {
    return ''
  }
}

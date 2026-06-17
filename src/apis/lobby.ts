import { $http, isResponseOK, asyncDo } from '@/apis/https'
import type { ILobbyResponse } from '@/apis/interface/lobby'

export namespace LobbyApi {
  export async function getLobbyData(
    lobbyPath: 'mobile' | 'desktop' | 'o8' = 'mobile',
  ): Promise<ILobbyResponse | false> {
    const token =
      'NQtu8t0MV8SFACLkbB4Uo2vqDCuwO00wiVNcFheehUT4HeVMBMRU9F5pzBTuEqWcleabB8cnnbhS0fmydu6J0nzg41dP08e7bhzsWPZKx0hDAviXHqt9EqX8Epq8X7dJ8'
    const [err, result] = await asyncDo(
      $http<ILobbyResponse>('get', `/lobby/${lobbyPath}`, { token }),
    )
    if (!isResponseOK(err, result) || !result) {
      return false
    }
    console.log('lobby result', result)
    return result
  }
}

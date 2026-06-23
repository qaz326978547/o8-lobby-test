import type { GameProvider, ProviderSearchItem } from '@/apis/interface/lobby'
import { resolveIconUrl } from '@/utils/url'

export interface ProviderDisplay {
  code: string
  name: string
  iconPath: string
}

export function resolveProviderDisplay(
  code: string,
  lobbyProviders: GameProvider[],
  searchProviders: ProviderSearchItem[],
): ProviderDisplay {
  const fromLobby = lobbyProviders.find(p => p.code === code)
  if (fromLobby) {
    return {
      code,
      name: fromLobby.shortname || fromLobby.name || code,
      iconPath: resolveIconUrl(fromLobby.iconurl),
    }
  }
  const fromSearch = searchProviders.find(p => p.code === code)
  if (fromSearch) {
    return {
      code,
      name: fromSearch.shortname || fromSearch.name || code,
      iconPath: resolveIconUrl(fromSearch.iconurl),
    }
  }
  return { code, name: code, iconPath: '' }
}

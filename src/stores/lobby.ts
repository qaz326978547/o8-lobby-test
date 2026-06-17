import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { LobbyGroup, Player, ILobbyResponse } from '@/apis/interface/lobby'

export const useLobbyStore = defineStore('lobby', () => {
  //遊戲大廳資料
  const lobbyData = ref<ILobbyResponse | null>(null)
  //遊戲大廳的遊戲分類
  const LobbyGameGroup = computed(() => {
    if (!lobbyData.value) return []
    return lobbyData.value.Lobby.Data.groups
  })
  //遊戲大廳的遊戲列表
  const LobbyGameList = computed(() => {
    if (!lobbyData.value) return []
    const games: any[] = []
    lobbyData.value.Lobby.Data.groups.forEach((group) => {
      games.push(...group.games)
    })
    return games
  })

  //遊戲大廳的遊戲供應商列表
  const LobbyGameProviders = computed(() => {
    if (!lobbyData.value) return []
    const providers: any[] = []
    lobbyData.value.Lobby.Data.groups.forEach((group) => {
      group.gameproviders.forEach((provider) => {
        if (!providers.find((p) => p.code === provider.code)) {
          providers.push(provider)
        }
      })
    })
    return providers
  })
  //玩家資料
  const playerData = computed(() => {
    if (!lobbyData.value) return null
    return lobbyData.value.Player
  })

  return {
    lobbyData,
    LobbyGameGroup,
    LobbyGameList,
    playerData,
    LobbyGameProviders,
  }
})

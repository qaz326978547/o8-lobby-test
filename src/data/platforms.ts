export interface GamePlatformItem {
  id: string
  name: string
  imagePath: string
  isDiscover: boolean
}

export const platforms: GamePlatformItem[] = [
  {
    id: 'discover',
    name: 'discover',
    imagePath: '/assets/images/icons/discover.png',
    isDiscover: true,
  },
  {
    id: 'atg',
    name: 'ATG',
    imagePath: '/assets/images/gamePlatform/ATG.png',
    isDiscover: false,
  },
  {
    id: 'bt',
    name: 'BT',
    imagePath: '/assets/images/gamePlatform/BT.png',
    isDiscover: false,
  },
  {
    id: 'db',
    name: 'DB',
    imagePath: '/assets/images/gamePlatform/DB.png',
    isDiscover: false,
  },
  {
    id: 'fc',
    name: 'FC',
    imagePath: '/assets/images/gamePlatform/FC.png',
    isDiscover: false,
  },
  {
    id: 'us',
    name: 'US',
    imagePath: '/assets/images/gamePlatform/USTM.png',
    isDiscover: false,
  },
]

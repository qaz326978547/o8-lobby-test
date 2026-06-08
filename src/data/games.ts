export type CapsuleColor = 'red' | 'green'

export interface GameCard {
  id: string
  name: string
  imagePath: string
  value: number
  capsuleColor: CapsuleColor
}

export const gameCards: GameCard[] = [
  {
    id: 'gods-of-glory',
    name: 'Gods-Of-Glory',
    imagePath: '/assets/images/games/GameCard-1.png',
    value: 100,
    capsuleColor: 'red',
  },
  {
    id: 'coins-and-cannons',
    name: 'Coins-And-Cannons',
    imagePath: '/assets/images/games/GameCard-2.png',
    value: 100,
    capsuleColor: 'red',
  },
  {
    id: 'fortune-pandas',
    name: 'Fortune-Pandas',
    imagePath: '/assets/images/games/GameCard-3.png',
    value: 100,
    capsuleColor: 'red',
  },
  {
    id: 'last-man-standing',
    name: 'Last-Man-Standing',
    imagePath: '/assets/images/games/GameCard-4.png',
    value: 70,
    capsuleColor: 'green',
  },
]

export const carouselPages: GameCard[][] = [gameCards, [...gameCards]]

import type { Game } from '@/apis/interface/lobby'

export function resolveGameLaunchUrl(game: Game, token: string, frontendOrigin: string): string {
  let url = game.url

  if (!url) {
    url = `/gamelauncher?token=${token}&gpcode=${game.providercode}&gcode=${game.code}&fromlobby=true`
  }

  url = url.replace('{TOKEN}', token)

  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${frontendOrigin}${url}`
}

export function launchGame(
  game: Game,
  token: string,
  frontendOrigin: string,
  push: (path: string) => void,
): void {
  const launchUrl = resolveGameLaunchUrl(game, token, frontendOrigin)
  if (game.supportiframe) {
    sessionStorage.setItem('ugs_game_launch_url', launchUrl)
    push('/game-frame')
  } else {
    window.location.href = launchUrl
  }
}

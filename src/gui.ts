import { canvas } from "../render"
import { MenuManager } from "./menu"

/** The timer's diameter before the menu's slider adds to it: 40 at the default, as teleport-esp. */
const BASE_SIZE = 18
/** The progress ring's width in pixels at 1080p, as on teleport-esp's and maphack's markers. */
const RING_WIDTH = 2
/** How far the drop shadow reaches out from the portrait, as a fraction of the diameter. */
const SHADOW_FRACTION = 0.1
/** The drop shadow's reach in pixels at the smallest the timer gets. */
const SHADOW_MIN = 2
/** The seconds' height as a fraction of the diameter. */
const TEXT_SCALE = 0.35
/** Tenths appear once the count drops under this many seconds. */
const TENTHS_UNDER = 1

/**
 * The respawn timer by the fountain, drawn as teleport-esp's and maphack's circular timers: the
 * hero's portrait as a disc, the player's color on the rim for the time left, a soft shadow all
 * round and the seconds over it. It fades out over the last second.
 */
export class RespawnGUI {
	public Draw(player: PlayerCustomData, menu: MenuManager) {
		const origin = player.RespawnPosition
		if (origin === undefined) {
			return
		}
		const screen = RendererSDK.WorldToScreen(origin)
		if (screen === undefined || GUIInfo.Contains(screen)) {
			return
		}
		const hero = player.Hero!
		const remaining = this.GetRemainingTime(hero.RespawnTime)
		if (!remaining) {
			return
		}
		const size = Math.round(GUIInfo.ScaleHeight(BASE_SIZE + menu.Size.value))
		const position = screen.SubtractScalar(size / 2).RoundForThis()
		if (GUIInfo.Contains(position)) {
			return
		}
		const maxDuration = hero.MaxRespawnDuration
		canvas.CircleTimer(position, size, {
			texture: hero.TexturePath() ?? ImageData.GetHeroTexture(hero.Name),
			progress: maxDuration > 0 ? Math.min(remaining / maxDuration, 1) : 0,
			color: player.Color,
			ringWidth: Math.max(1, Math.round(GUIInfo.ScaleHeight(RING_WIDTH))),
			shadow: Math.max(Math.round(size * SHADOW_FRACTION), SHADOW_MIN),
			innerShadow: false,
			text: this.GetRemainingText(remaining, menu.FormatTime.value),
			textScale: TEXT_SCALE,
			opacity: Math.min(remaining, 1)
		})
	}

	protected GetRemainingText(remainingTime: number, formatTime: boolean) {
		if (remainingTime > 60) {
			return formatTime
				? Math.formatTime(remainingTime)
				: Math.ceil(remainingTime).toFixed()
		}
		return remainingTime.toFixed(remainingTime < TENTHS_UNDER ? 1 : 0)
	}

	protected GetRemainingTime(rsTime: number) {
		return Math.max(rsTime - GameState.RawGameTime, 0)
	}
}

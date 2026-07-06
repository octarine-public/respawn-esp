import {
	Color,
	GameState,
	GUIInfo,
	ImageData,
	MathSDK,
	PlayerCustomData,
	Rectangle,
	RendererSDK,
	Vector2
} from "github.com/octarine-public/wrapper/index"

import { ModeImage } from "./enum"
import { MenuManager } from "./menu"

const RESPAWN_KIND = RendererSDK.AllocateAnchorKind()

export class RespawnGUI {
	private readonly baseSize = 22
	private readonly position = new Rectangle()
	private readonly baseBoxSize = new Vector2()

	public Draw(player: PlayerCustomData, menu: MenuManager) {
		const position = player.RespawnPosition
		if (position === undefined) {
			return
		}
		const w2s = RendererSDK.WorldToScreen(position)
		if (w2s === undefined || GUIInfo.Contains(w2s)) {
			return
		}
		const hero = player.Hero!, // is checked
			resTime = hero.RespawnTime,
			remaining = this.GetRemainingTime(resTime)
		if (!remaining) {
			return
		}
		if (!this.Update(w2s, menu.Size.value)) {
			return
		}

		const formatTime = menu.FormatTime.value,
			isCircle = menu.ModeImage.SelectedID === ModeImage.Round

		const playerColor = player.Color.Clone(),
			maxDuration = hero.MaxRespawnDuration

		const ratio = this.GetRatio(resTime, maxDuration),
			texture = hero.TexturePath() ?? ImageData.GetHeroTexture(hero.Name)

		const respawnPos = position.Clone(),
			sizeDiv = this.baseBoxSize.DivideScalar(2).FloorForThis()
		RendererSDK.DrawEntityRelative(
			hero.Index,
			RESPAWN_KIND,
			() => {
				const pos = RendererSDK.WorldToScreen(respawnPos)
				if (pos === undefined || GUIInfo.Contains(pos)) {
					return undefined
				}
				return GUIInfo.Contains(pos.Subtract(sizeDiv)) ? undefined : pos
			},
			() => this.Image(texture, ratio, isCircle, remaining, formatTime, playerColor)
		)
	}

	protected Update(w2s: Vector2, additionalSize: number) {
		this.baseBoxSize.SetX(GUIInfo.ScaleWidth(this.baseSize + additionalSize))
		this.baseBoxSize.SetY(GUIInfo.ScaleHeight(this.baseSize + additionalSize))

		const sizeDiv = this.baseBoxSize.DivideScalar(2).FloorForThis()
		if (GUIInfo.Contains(w2s.Subtract(sizeDiv))) {
			return false
		}
		const pos1 = sizeDiv.MultiplyScalar(-1)
		this.position.pos1.CopyFrom(pos1)
		this.position.pos2.CopyFrom(pos1.Add(this.baseBoxSize))
		return true
	}

	protected Image(
		texture: string,
		ratio: number,
		isCircle: boolean,
		remaining: number,
		formatTime: boolean,
		playerColor: Color
	) {
		if (!remaining) {
			return
		}

		const position = this.position
		const alpha = this.GetAlpha(remaining)
		const remText = this.GetRemainingText(remaining, formatTime)

		// image hero
		RendererSDK.Image(
			texture,
			position.pos1,
			isCircle ? 0 : -1,
			position.Size,
			Color.White.SetA(alpha)
		)

		this.DrawOutlinedType(isCircle, ratio, position, playerColor, alpha)
		RendererSDK.TextByFlags(remText, position, Color.White.SetA(alpha), 2)
	}

	protected DrawOutlinedType(
		isCircle: boolean,
		ratio: number,
		position: Rectangle,
		playerColor: Color,
		alpha: number
	) {
		if (alpha < 255) {
			playerColor.SetA(alpha)
		}

		const outline = position.Height / 15
		const border2x2 = GUIInfo.ScaleHeight(2)

		if (!isCircle) {
			RendererSDK.OutlinedRect(
				position.pos1,
				position.Size,
				outline + border2x2,
				playerColor
			)
			return
		}
		RendererSDK.Arc(
			-90,
			100,
			position.pos1,
			position.Size,
			false,
			outline + border2x2,
			playerColor
		)
		RendererSDK.Arc(
			-90,
			ratio,
			position.pos1,
			position.Size,
			false,
			outline + GUIInfo.ScaleHeight(3),
			Color.Black.SetA(alpha)
		)
	}

	protected GetRemainingText(remainingTime: number, formatTime: boolean) {
		if (remainingTime > 60) {
			return formatTime
				? MathSDK.FormatTime(remainingTime)
				: Math.ceil(remainingTime).toFixed()
		}
		return remainingTime.toFixed(remainingTime < 2 ? 1 : 0)
	}

	protected GetRemainingTime(rsTime: number) {
		return Math.max(rsTime - GameState.RawGameTime, 0)
	}

	protected GetRatio(rsTme: number, maxDuration: number) {
		const remainingTime = this.GetRemainingTime(rsTme)
		return Math.max(100 * (remainingTime / maxDuration), 0)
	}

	protected GetAlpha(remaining: number) {
		let alpha = 255
		if (remaining && remaining <= 1) {
			alpha = Math.round(((remaining * 100) / 100) * 255)
		}
		return alpha
	}
}

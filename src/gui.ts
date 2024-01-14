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
		if (!this.Update(w2s, menu.Size.value)) {
			return
		}

		const formatTime = menu.FormatTime.value,
			isCircle = menu.ModeImage.SelectedID === ModeImage.Round

		const hero = player.Hero!, // is checked
			playerColor = player.Color.Clone(),
			resTime = hero.RespawnTime,
			maxDuration = hero.MaxRespawnDuration

		const ratio = this.GetRatio(resTime, maxDuration),
			remaining = this.GetRemainingTime(resTime),
			texture = hero.TexturePath() ?? ImageData.GetHeroTexture(hero.Name)

		this.Image(texture, ratio, isCircle, remaining, formatTime, playerColor)
	}

	protected Update(w2s: Vector2, additionalSize: number) {
		this.baseBoxSize.SetX(GUIInfo.ScaleWidth(this.baseSize + additionalSize))
		this.baseBoxSize.SetY(GUIInfo.ScaleHeight(this.baseSize + additionalSize))

		const sizeDiv = this.baseBoxSize.DivideScalar(2).FloorForThis()
		const position = w2s.SubtractForThis(sizeDiv)

		this.position.pos1.CopyFrom(position)
		this.position.pos2.CopyFrom(position.Add(this.baseBoxSize))
		return !GUIInfo.Contains(this.position.pos1)
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

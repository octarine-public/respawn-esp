import { canvas } from "../render"
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

		const hero = player.Hero!,
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

		canvas.Image(texture, position.pos1, position.Size, {
			color: Color.White.SetA(alpha),

			circle: isCircle
		})

		this.DrawOutlinedType(isCircle, ratio, position, playerColor, alpha)
		canvas.TextIn(remText, position, {
			color: Color.White.SetA(alpha),
			size: position.Height / 2 + 4
		})
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
			canvas.Rect(position.pos1, position.Size, {
				color: Color.fromUint32(0),
				borderColor: playerColor,
				borderWidth: outline + border2x2
			})
			return
		}
		canvas.Circle(position.pos1, position.Size, {
			color: Color.fromUint32(0),
			borderColor: playerColor,
			borderWidth: outline + border2x2,
			start: -90,
			sweep: -360
		})
		canvas.Circle(position.pos1, position.Size, {
			color: Color.fromUint32(0),
			borderColor: Color.Black.SetA(alpha),
			borderWidth: outline + GUIInfo.ScaleHeight(3),
			start: -90,
			sweep: -ratio * 3.6
		})
	}

	protected GetRemainingText(remainingTime: number, formatTime: boolean) {
		if (remainingTime > 60) {
			return formatTime
				? Math.formatTime(remainingTime)
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

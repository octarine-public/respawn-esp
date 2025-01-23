import "./translations"

import {
	DOTAGameState,
	DOTAGameUIState,
	EventsSDK,
	GameRules,
	GameState,
	PlayerCustomData,
	Team
} from "github.com/octarine-public/wrapper/index"

import { TeamState } from "./enum"
import { RespawnGUI } from "./gui"
import { MenuManager } from "./menu"

new (class CRespawnESP {
	private readonly gui = new RespawnGUI()
	private readonly menu = new MenuManager()

	constructor() {
		EventsSDK.on("Draw", this.Draw.bind(this))
	}

	protected get IsPostGame() {
		return (
			GameRules === undefined ||
			GameRules.GameState === DOTAGameState.DOTA_GAMERULES_STATE_POST_GAME
		)
	}

	protected get IsInGameUI() {
		return GameState.UIState === DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME
	}

	public Draw() {
		if (!this.menu.State.value || this.IsPostGame || !this.IsInGameUI) {
			return
		}
		const menu = this.menu
		const arr = PlayerCustomData.Array
		for (let index = arr.length - 1; index > -1; index--) {
			const player = arr[index]
			if (!player.IsValid || player.IsSpectator || !this.StateByTeam(player)) {
				continue
			}
			const hero = player.Hero
			if (hero === undefined || hero.IsAlive) {
				continue
			}
			this.gui.Draw(player, menu)
		}
	}

	protected StateByTeam(player: PlayerCustomData) {
		const teamMenu = this.menu.Team.SelectedID as TeamState,
			isEnemy = player.IsEnemy(),
			stateAlly = teamMenu === TeamState.Ally,
			stateEnemy = teamMenu === TeamState.Enemy
		return (
			!(stateEnemy && !isEnemy) &&
			!(isEnemy && stateAlly && GameState.LocalTeam !== Team.Observer)
		)
	}
})()

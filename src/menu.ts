import {
	ImageData,
	Menu,
	NotificationsSDK,
	ResetSettingsUpdated,
	Sleeper
} from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Size: Menu.Slider
	public readonly Team: Menu.Dropdown
	public readonly State: Menu.Toggle
	public readonly ModeImage: Menu.Dropdown
	public readonly FormatTime: Menu.Toggle

	private readonly visual = Menu.AddEntry("Visual")
	private readonly tree: Menu.Node

	private readonly reset: Menu.Button
	private readonly sleeper = new Sleeper()
	private readonly iconNode = ImageData.Paths.Icons.icon_svg_duration

	constructor() {
		this.tree = this.visual.AddNode(
			"Respawn",
			this.iconNode,
			"Display respawn time hero\nclose to fountain location"
		)

		this.State = this.tree.AddToggle("State", true)

		this.FormatTime = this.tree.AddToggle(
			"Format time",
			true,
			"Show cooldown\nformat time (min:sec)",
			-1,
			ImageData.Paths.Icons.icon_svg_format_time
		)

		this.Team = this.tree.AddDropdown(
			"Team",
			["Allies and enemy", "Only enemy", "Only ally"],
			1
		)

		this.ModeImage = this.tree.AddDropdown("Mode images", ["Circle", "Square"])

		this.Size = this.tree.AddSlider(
			"Additional size",
			22,
			0,
			60,
			0,
			"Additional timer size and icon image"
		)

		this.reset = this.tree.AddButton("Reset settings", "Reset settings on default")
		this.reset.OnValue(() => this.ResetSettings())
	}

	public GameChanged() {
		this.sleeper.FullReset()
	}

	private ResetSettings() {
		if (!this.sleeper.Sleeping("ResetSettings")) {
			this.resetValues()
			this.tree.Update()
			NotificationsSDK.Push(new ResetSettingsUpdated())
			this.sleeper.Sleep(2 * 1000, "ResetSettings")
		}
	}

	private resetValues() {
		this.Size.value = this.Size.defaultValue
		this.State.value = this.State.defaultValue
		this.Team.SelectedID = this.Team.defaultValue
		this.FormatTime.value = this.FormatTime.defaultValue
		this.ModeImage.SelectedID = this.ModeImage.defaultValue
	}
}

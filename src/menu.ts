import { ImageData, Menu } from "github.com/octarine-public/wrapper/index"

export class MenuManager {
	public readonly Size: Menu.Slider
	public readonly Team: Menu.Dropdown
	public readonly State: Menu.Toggle
	public readonly ModeImage: Menu.Dropdown
	public readonly FormatTime: Menu.Toggle

	private readonly visual = Menu.AddEntryDeep(["Visual", "Maphack"])
	private readonly tree: Menu.Node
	private readonly iconNode = ImageData.Icons.icon_svg_duration

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
			ImageData.Icons.icon_svg_format_time
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
	}
}

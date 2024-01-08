export class Snake {

	public index: number;
	public blue_action: number;
	public green_action: number;
	public white_action: number;
	public blue_status: number;
	public green_status: number;
	public white_status: number;
	public hovered = false;
	
	constructor(raw) {
		this.index = raw['index'];
		this.blue_action = raw['blue_action'];
		this.green_action = raw['green_action'];
		this.white_action = raw['white_action'];
		this.blue_status = raw['blue_status'];
		this.green_status = raw['green_status'];
		this.white_status = raw['white_status'];
		// parsing
	}
}
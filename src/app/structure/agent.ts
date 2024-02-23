export class Agent {

	public id: number;
	public idx: number;
	public mode: string;
	public num_agent: number;
	public kill: number;
	public time: number;
	public x: number;
	public y: number;
	public feature;
	public brushed = true;
	// public selected = false;
	// public agent Agent[] = [];
	
	constructor(raw) {
		this.id = raw['id'];
		this.idx = raw['idx'];
		this.mode = raw['mode'];
		this.num_agent = raw['num_agent'];
		this.kill = raw['kill'];
		this.time = raw['time'];
		this.x = raw['x'];
		this.y = raw['y'];
		this.feature = raw['feature'];
		// parsing
	}
}
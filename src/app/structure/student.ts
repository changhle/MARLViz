export class Student {

	public hobby: number;
	public exercise: number;
	public study: number;
	public sleep: number;
	public status: number;
	public class: string;
	public hovered = false;
	
	constructor(raw) {
		this.hobby = raw['hobby'];
		this.exercise = raw['exercise'];
		this.study = raw['study'];
		this.sleep = raw['sleep'];
		this.status = raw['status'];
		this.class = raw['class'];
		// parsing
	}
}
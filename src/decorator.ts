/// <reference path='./node.ts' />

namespace clinamen {

	export class Decorator extends Composite{

		result: any;
		filter: any;
		child: Composite;
		target: Node;

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type = 'decorator';
		}

		addChildren(data:JsonData,nodeIndex:Dict<Node>=null):Node{
			if(data.child!=null){
				this.add(data.child,nodeIndex);
			} else {
				this.child = null;
			}
			return this;
		}

		add(node:JsonData | Composite,nodeIndex:Dict<Node>=null):Node{
			if(!(node instanceof Node)){
				this.child = this.get(node,nodeIndex);
				return this;
			}
			this.child = node;
			return this;
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.child || stack.state===FAILURE){
				return this.failure(stack,agent);
			}
			if(stack.state===SUCCESS){
				return this.success(stack,agent);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

		json(children:boolean = true):JsonData{
			var js:JsonData = super.json(false);
			if(children){
				js.child = this.child.json();
			}
			return js;
		}

	}

	export class Jump extends Decorator{

		targetId:string;

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type='jump';
			this.targetId = data.targetId || null;
		}

		addChildren(data:JsonData,nodeIndex:Dict<Node>=null):Node{
			if(!data.targetId){
				this.child = null;
				return this;
			}
			if(!nodeIndex || !nodeIndex[data.targetId]){
				this.child = null;
				return this;
			}
			this.child = nodeIndex[data.targetId];
			return this;
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.targetId){
				return this.failure(stack,agent);
			}
			if(!this.nodeIndex){
				return this.failure(stack,agent);
			}
			if(!this.child && !this.nodeIndex[this.targetId]){
				return this.failure(stack,agent);
			}
			this.child = this.nodeIndex[this.targetId];
			stack.push(this.child);
			stack.state = RUNNING;
			return RUNNING;
		}

		json():JsonData{
			let js:JsonData = super.json();
			js.targetId = this.targetId;
			return js;
		}

	}


	export class Inverter extends Decorator{

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="inverter";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.child || stack.state===SUCCESS){
				return this.failure(stack,agent);
			}
			if(stack.state===FAILURE){
				return this.success(stack,agent);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

	}


	export class Limit extends Decorator{

		max: number;
		runs: number = 0;
		reset:boolean;

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type = 'limit';
			this.max = data.max || 0;
			this.reset = data.reset || false;
		}

		next(stack:Stack,agent:IAgent=null):number {
			if(!this.child || this.runs>=this.max){
				if(this.reset){
					this.runs = 0;
				}
				return this.failure(stack,agent);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			this.runs++;
			return RUNNING;
		}

		json(){
			var js = super.json();
			js.max = this.max;
			js.runs = this.runs;
			return js;
		}

	}

	//Finds another Agent id


	export class Tester extends Decorator{

		exp:Array<any>;

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type = 'tester';
			this.exp = data.exp || null;
		}

		next(stack:Stack,agent:IAgent=null){
			if(!this.child || stack.state===FAILURE){
				return this.failure(stack,agent);
			}
			if(stack.state===SUCCESS){
				return this.success(stack,agent);
			}
			if(!agent || !this.exp || !agent.test(this.exp)){
				return this.failure(stack,agent)
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

	}


	export class Succeeder extends Decorator {

		next(stack:Stack,agent:IAgent=null):number {
			if(stack.state===RUNNING){
				stack.push(this.child);
				return RUNNING;
			}
			return this.success(stack,agent);
		}

	}

	export class Failer extends Decorator {

		next(stack:Stack,agent:IAgent=null):number {
			if(stack.state===RUNNING){
				stack.push(this.child);
				return RUNNING;
			}
			return this.failure(stack,agent);
		}

	}

	export class RepeatUntilSucceeds extends Decorator {

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="repeatuntilsucceeds";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.child){
				return this.failure(stack,agent);
			}
			if(stack.state===SUCCESS){
				return this.success(stack,agent);
			}
			if(stack.last()._id!=this.child._id){
				stack.push(this.child);
			}
			stack.state = RUNNING;
			return RUNNING;

		}

	}

	export class RepeatUntilFail extends Decorator {

		constructor(data:JsonData,nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="repeatuntilfails";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.child){
				return this.failure(stack,agent);
			}
			if(stack.state===FAILURE){
				return this.failure(stack,agent);
			}
			if(stack.last()._id!=this.child._id){
				stack.push(this.child);
			}
			stack.state = RUNNING;
			return RUNNING;

		}
	}
}

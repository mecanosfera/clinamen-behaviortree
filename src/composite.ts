/// <reference path='./node.ts' />

namespace clinamen {

	export abstract class Composite extends Node{

		children: Array<Composite> = [];

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type = 'composite';
		}

		addChildren(data:JsonData,nodeIndex:Dict<Node>=null):Node{
			if(data.children){
				for(let c of data.children){
					this.add(c,nodeIndex);
				}
			}
			return this;
		}


		add(data:Node | JsonData,nodeIndex:Dict<Node>=null):Node{
			if(!(data instanceof Composite)){
				this.children.push(this.get(data,nodeIndex));
				return this;
			}
			this.children.push(data);
			return this;
		}

	}


	export class Selector extends Composite{

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="selector";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!stack){
				stack = this.stack;
			}
			if(stack.state===SUCCESS){
				return this.success(stack,agent);
			}
			if(this.index>=this.children.length){
				return this.failure(stack,agent);
			}
			var nextNode:Node = this.children[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

	}

	export class Sequence extends Composite{

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="sequence";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!stack){
				stack = this.stack;
			}
			if(stack.state===FAILURE){
				return this.failure(stack,agent);
			}

			if(this.index>=this.children.length){
				return this.success(stack,agent);
			}
			console.log(this.index);
			var nextNode:Node = this.children[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

	}


	export class RandomSelector extends Composite {

		rchildren: Array<Node> = null;

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="randomSelector";

		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.rchildren){
				this.rchildren = shuffle(this.children);
			}
			if(stack.state===SUCCESS){
				this.rchildren = null;
				return this.success(stack,agent);
			}
			if(this.index>=this.children.length){
				this.rchildren = null;
				return this.failure(stack,agent);
			}
			var nextNode:Node = this.rchildren[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

	}

	export class RandomSequence extends Composite {

		rchildren: Array<Node> = null;

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type="randomSequence";
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!this.rchildren){
				this.rchildren = shuffle(this.children);
			}
			if(stack.state===FAILURE){
				this.rchildren = null;
				return this.failure(stack,agent);
			}
			if(this.index>=this.children.length){
				this.rchildren = null;
				return this.success(stack,agent);
			}
			var nextNode:Node = this.rchildren[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

	}
}

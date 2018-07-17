/// <reference path='./node.ts' />

namespace clinamen {

	export abstract class Composite extends Node{

		agent: Agent;
		children: Array<Composite> = [];

		constructor(data){
			super(data);
			this.mainType = 'composite';
			this.type = 'composite';
			this.agent = data.agent || null;
			this.setChildren(data);
		}

		setChildren(data):Node{
			if(data.children){
				for(let c of data.children){
					this.add(c);
				}
			}
			return this;
		}

		setAgent(agent: Agent){
			if(agent!=null){
				this.agent = agent;
				this.agent.childrenIndex[this._id] = this;
				if(this.children!=null){
					for(let c of this.children){
						c.setAgent(agent);
					}
				}
			}
			return this;
		}

		add(node:Node):Node{
			let child: Composite;
			if(!(node instanceof Composite)){
				child = this.nodeConstructor(node);
			}
			child.setAgent(this.agent);
			this.children.push(child);
			return this;
		}

	}


	export class Selector extends Composite{

		constructor(data){
			super(data);
			this.type="selector";
		}


		next(stack:Stack):number{
			if(!stack){
				stack = this.stack;
			}
			if(stack.state===SUCCESS){
				return this.success(stack);
			}
			if(this.index>=this.children.length){
				return this.failure(stack);
			}
			var nextNode:Node = this.children[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

		run():boolean{
			for(let c of this.children){
				if(c.run()){
					return true;
				}
			}
			return false;
		}
	}

	export class Sequence extends Composite{

		constructor(data){
			super(data);
			this.type="sequence";
		}

		next(stack:Stack):number{
			if(!stack){
				stack = this.stack;
			}
			if(stack.state===FAILURE){
				return this.failure(stack);
			}
			if(this.index>=this.children.length){
				return this.success(stack);
			}
			var nextNode:Node = this.children[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

		run(){
			for(let c of this.children){
				if(!c.run()){
					return false;
				}
			}
			return true;
		}
	}


	export class RandomSelector extends Composite {

		rchildren: Array<Node> = null;

		constructor(data){
			super(data);
			this.type="randomSelector";

		}

		next(stack:Stack):number{
			if(!this.rchildren){
				this.rchildren = this.shuffle(this.children);
			}
			if(stack.state===SUCCESS){
				this.rchildren = null;
				return this.success(stack);
			}
			if(this.index>=this.children.length){
				this.rchildren = null;
				return this.failure(stack);
			}
			var nextNode:Node = this.rchildren[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

		run():boolean{
			var rchildren = this.shuffle(this.children);
			for(let c of rchildren){
				if(c.run()){
					return true;
				}
			}
			return false;
		}

	}

	export class RandomSequence extends Composite {

		rchildren: Array<Node> = null;

		constructor(data){
			super(data);
			this.type="randomSequence";
		}

		next(stack:Stack):number{
			if(!this.rchildren){
				this.rchildren = this.shuffle(this.children);
			}
			if(stack.state===FAILURE){
				this.rchildren = null;
				return this.failure(stack);
			}
			if(this.index>=this.children.length){
				this.rchildren = null;
				return this.success(stack);
			}
			var nextNode:Node = this.rchildren[this.index];
			this.index++;
			stack.push(nextNode);
			stack.state = RUNNING;
			return RUNNING;
		}

		run():boolean{
			var rchildren = this.shuffle(this.children);
			for(let c of rchildren){
				if(!c.run()){
					return false;
				}
			}
			return true;
		}

	}
}

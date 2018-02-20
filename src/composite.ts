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
				this.agent.childrenIndex[this.id] = this;
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

		fail(stack:Stack){
			//stack.last().index++;
			return this;
		}

		success(stack:Stack):Node{
			stack.last().index = 0;
			stack.pop();
			if(stack.length>0){
				stack.last().node.success(stack);
			}
			return this;
		}

		next(stack:Stack):Node{
			if(!stack){
				stack = this.stack;
			}
			var index = stack.last().index;
			var previous = stack.last();
			if(index<this.children.length){
				stack.push(this.children[index]);
				previous.index++;
			} else {
				stack.pop();
				if(stack.length>0){
					stack.last().node.fail(stack);
				}
			}
			return this;
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

		success(stack:Stack):Node{
			//stack.last().index++;
			return this;
		}

		fail(stack:Stack):Node{
			stack.pop();
			if(stack.length>0){
				stack.last().node.fail(stack);
			}
			return this;
		}

		next(stack:Stack):Node{
			if(!stack){
				stack = this.stack;
			}
			if(stack.done){
				stack.done = false;
			}
			var previous = stack.last();
			var index = previous.index;
			if(index<this.children.length){
				stack.push(this.children[index]);
				previous.index++;
			} else {
				stack.pop();
				if(stack.length>0){
					stack.last().node.success(stack);
				}
			}
			return this;
		}

		run(){
			console.log(this.children.length);
			for(let c of this.children){
				if(!c.run()){
					return false;
				}
			}
			return true;
		}
	}


	export class RandomSelector extends Composite {

		constructor(data){
			super(data);
			this.type="randomSelector";
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

		constructor(data){
			super(data);
			this.type="randomSequence";
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

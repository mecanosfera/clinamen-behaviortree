class Composite extends Node{

	init(args){
		super.init(args);
		this.mainType = 'composite';
		this.type = 'composite';
		this.temp = args.temp || true;
		this.agent = args.agent || null;
		this.children = [];
		this.setChildren(args);
	}

	setChildren(args){
		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
		return this;
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			this.agent.childrenIndex[this.name] = this;
			if(this.children!=null){
				for(let c of this.children){
					c.setAgent(agent);
				}
			}
		}
		return this;
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Composite)){
			child = this.nodeConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.children.push(child);
		return this;
	}

}


class Selector extends Composite{

	init(args){
		super.init(args);
		this.type="selector";
	}

	fail(stack){
		//stack.last().index++;
		return this;
	}

	success(stack){
		stack.last().index = 0;
		stack.pop();
		if(stack.length>0){
			stack.last().node.success(stack);
		}
		return this;
	}

	next(stack){
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

	run(){

		for(let c of this.children){
			if(c.run()){
				return true;
			}
		}
		return false;
	}
}

class Sequence extends Composite{

	init(args){
		super.init(args);
		this.type="sequence";
	}

	success(stack){
		//stack.last().index++;
		return this;
	}

	fail(stack){
		stack.pop();
		if(stack.length>0){
			stack.last().node.fail(stack);
		}
		return this;
	}

	next(stack){
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


class RandomSelector extends Composite {

	init(args){
		super.init(args);
		this.type="randomSelector";
	}

	run(){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(c.run()){
				return true;
			}
		}
		return false;
	}

}

class RandomSequence extends Composite {

	init(args){
		super.init(args);
		this.type="randomSequence";
	}

	run(){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(!c.run()){
				return false;
			}
		}
		return true;
	}

}

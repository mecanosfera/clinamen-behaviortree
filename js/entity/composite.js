var Node = require('./node.js');

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
			child = this.behaviorConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.children.push(child);
	}
	return this;

}


class Selector extends Composite{

	init(args){
		super.init(args);
		this.type="selector";
	}

	fail(stack){
		stack.last().index++;
		return this;
	}

	success(stack){
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

	run(callstack){
		if(callstack){
			if(this.children.length>0){
				if(callstack.length==0){
					callstack.push({index:0, node: this});
				}
				var index = callstack[callstack.length-1].index;
				while(index<this.children.length){
					callstack.push({index:0,node:this.children[index]});
					callstack[callstack.length-2].index++;
					var res = callstack[callstack.length-2].node.run(callstack);
					if(res.end){
						return {end:true,stack:callstack};
					}
					if(res.value){
						callstack.pop();
						return {end:false,value:true}
					}
				}
				return {end:false, value:false};
			}
		} else {
			for(let c of this.children){
				if(c.run(iterator)){
					return true;
				}
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
		stack.last().index++;
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
		//colocar no repeater também
		if(stack.done){
			stack.done = false;
		}
		var index = stack.last().index;
		var previous = stack.last();
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

	run(callstack){
		if(callstack){
			if(this.children.length>0){
				if(callstack.length==0){
					callstack.push({index:0, node: this});
				}
				var index = callstack[callstack.length-1].index;
				while(index<this.children.length){
					callstack.push({index:0,node:this.children[index]});
					callstack[callstack.length-2].index++;
					var res = callstack[callstack.length-2].node.run(callstack);
					if(res.end){
						return {end:true,stack:res.stack};
					}
					if(res.value){
						callstack.pop();
						return {end: true, stack:callstack};
					}
					if(!res.value){
						callstack.pop();
						return {end:false,value:true}
					}
				}
				return {end:false, value:true};
			}
		} else {
			for(let c of this.children){
				if(!c.run(iterator)){
					return false;
				}
			}
			return true;
		}
	}
}


class RandomSelector extends Composite {

	init(args){
		super.init(args);
		this.type="randomSelector";
	}

	run(iterator=false){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(c.run(iterator)){
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

	run(iterator=false){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(!c.run(iterator)){
				return false;
			}
		}
		return true;
	}

}

module.exports = {
	'Composite'			 : Composite,
	'Selector'			 : Selector,
	'Sequence'			 : Sequence,
	'RandomSelector' : RandomSelector,
	'RandomSequence' : RandomSequence
};

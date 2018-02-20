class Agent extends Node {

	init(args){
		super.init(args);
		this.mainType = 'agent';
		this.type = args.type || 'agent';
		this.template = args.template || this.type;
		this.world = args.world;
		this.childrenIndex = {};

		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
	}

	add(node){
		if(this.children.length==0){
			if(node instanceof Composite){
				this.children.push(node);
			} else {
				this.children.push(this.nodeConstructor(node));
			}
			this.children[0].setAgent(this);
		}
		return this;
	}



	find(filter){
		return this.world.find(filter);
	}


	act(action,value){
		if(this[action]){
			return this[action](value);
		}
		return false;
	}

	wait(){
		return true;
	}

	change(state){
		for(let s in state){
			if(this.prop[s]!=null){
				if(state[s] instanceof Array){
					var v = state[s][1];
					if(v instanceof Object){
						v = this.traverse(v);
					}
					this.prop[s] = this.op[state[s][0]](this.prop[s]+v);
				} else {
					var v = state[s];
					if(v instanceof Object){
						v = this.traverse(v);
					}
					this.prop[s] = v;
				}
			}
		}
		return true;
	}

	next(){
		if(this.stack.length==0){
			this.stack.push(this.children[0]);
		} else {
			this.stack.last().node.next(this.stack);
		}
		return this;
	}

	run(){
		if(this.temp){
			this.res = {};
		}
		if(this.children.length>0){
			return this.children[0].run();
		}
		return false;
	}

	json(){
		var js = super.json();
		js.template = this.template;
		return js;
	}


}

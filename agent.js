class Agent extends Entity{

	init(args){
		super.init(args);
		this.mainType = 'agent';
		this.type = args.type || 'agent';
		this.template = args.template || this.type;
		this.world = args.world || null;

		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
	}

	add(behavior){
		if(behavior instanceof Behavior){
			this.children.push(behavior);
		} else {
			this.children.push(this.behaviorConstructor(behavior));
		}
		this.children[0].setAgent(this);
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


	run(iterator=false){
		if(this.temp){
			this.res = {};
		}
		if(this.children.length>0){
			return this.children[0].run(iterator);
		}
		return false;
	}

	toJson(){
		var js = super.toJson();
		js.template = this.template;
		return js;
	}


}

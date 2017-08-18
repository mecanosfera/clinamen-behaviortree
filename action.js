class Action extends Behavior{

	init(args){
		super.init(args);
		this.mainType = 'action';
		this.type = args.type || 'action';
		this.filter = args.filter || null;
		this.target = args.target || 'self';
		this.act = args.act || 'wait';
		this.value = args.value || null ;
	}

	setChildren(behavior){
		this.children = null;
	}

	add(behavior){
		return false;
	}

	run(iterator = false){
		if(this.target=='self'){
			return this.agent.act(this.act,this.value);
		} else if (this.target=='world'){
			return this.agent.world.act(this.act,this.value);
		} else {
			var t = this.traverse(this.agent, this.target);
			if(t!=null && (t instanceof Object && !(t instanceof Array))){
				return t.act(this.act,this.value);
			}
			return false;
		}
	}

}

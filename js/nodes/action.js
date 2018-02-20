class Action extends Composite {

	init(args){
		super.init(args);
		this.mainType = 'action';
		this.type = args.type || 'action';
		this.filter = args.filter || null;
		this.target = args.target || 'self';
		this.act = args.act || 'wait';
		this.value = args.value || null ;
	}

	setChildren(node){
		this.children = null;
		return this;
	}

	add(node){
		return this;
	}

	next(stack){
		stack.pop();
		if(this.run()){
			stack.done = true;
			stack.last().node.success(stack);
		} else {
			stack.last().node.fail(stack);
		}
		return this;
	}


	run(){
		if(this.target=='self'){
			return this.agent.act(this.act,this.value);
		}
		if (this.target=='world'){
			return this.agent.world.act(this.act,this.value);
		}
		var t = this.traverse(this.agent, this.target);
		if(t!=null && (t instanceof Object && !(t instanceof Array))){
			return t.act(this.act,this.value);
		}
		return false;
	}

	json(){
		var js = super.json();
		js.target = this.target;
		js.filter = this.filter;
		js.act = this.act;
		js.value = this.value;
		return js;
	}

}

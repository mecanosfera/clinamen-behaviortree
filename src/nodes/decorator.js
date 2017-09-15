class Decorator extends Composite{

	init(args){
		super.init(args);
		this.mainType = 'decorator';
		this.type = 'decorator';
		this.result = args.result || null;
		this.filter = args.filter || null;
		this.child = null;
		this.setChildren(args);
	}

	setChildren(behavior){
		if(behavior.child!=null){
			this.add(behavior.child);
		} else {
			this.child = null;
		}
		return this;
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			if(this.child!=null){
				this.child.setAgent(agent);
			}
		}
		return this;
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Node)){
			child = this.nodeConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.child = child;
		return this;
	}

	//arrumar
	traverse(obj,filter){
		var fk = Object.keys(filter);
		var val = obj[fk[0]][filter[fk[0]]];
		if(val!=null){
			if(val instanceof Object && !(val instanceof Array)){
				return this.traverse(val,filter[fk[0]]);
			} else {
				return val;
			}
		}
		return null;

	}

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		if(this.testCondition()){
			stack.push(this.child);
		} else {
			this.fail(stack);
		}
		return this;
	}

	testCondition(){
		return false;
	}

	run(){
		if(!this.child){
			return false;
		}
		if(this.testCondition()){
			return this.child.run();
		}
		return false;
	}

	json(){
		var js = super.json();
		js.child = this.child.json();
		js.filter = this.filter;
		js.result = this.result;
		return js;
	}

}


class Inverter extends Decorator{

	init(args){
		super.init(args);
		this.type="inverter";
	}

	success(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	fail(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){

		if(this.child==null){
			return false;
		}
		return !this.child.run();
	}

}


class Limit extends Decorator{

	init(args){
		super.init(args);
		this.type = 'limit';
		this.max = node.max || 0;
		this.runs = 0;
	}

	testCondition(){
		if(this.runs>=this.max){
			return false;
		}
		this.runs++;
		return true;
	}

	json(){
		var js = super.json();
		js.max = this.max;
		js.runs = this.runs;
		return js;
	}

}


class Find extends Decorator{

		init(args){
			super.init(args);
			this.type="find";
			this.filter = args.filter || {};
			this.scope = args.scope || 'world';
		}

		testCondition(){
			if(this.agent.temp && this.result!=null){
				this.agent.res[this.result] = null;
			}
			var res = null;
			if(this.scope=='world'){
				res = this.agent.world.find(this.filter);
			} else {
				res = this.agent.find(this.filter);
			}
			if(this.result!=null){
				this.agent.res[this.result] = res;
			}
			if(res!=null && this.child!=null){
				return true;
			}
		}

		json(){
			var js = super.json();
			js.scope = this.scope;
			return js;
		}

}

class Condition extends Decorator{

	//{res/prop:?, op:'==', val/res/prop:?}
	init(args){
		super.init(args);
		this.type = 'condition';
	}

	testCondition(){
		var obj = this.agent;
		var k1 = Object.keys(this.filter)[0];
		var k2 = Object.keys(this.filter)[2];
		var v1 = this.traverse(this.agent,{[k1] : this.filter[ Object.keys(this.filter)[0] ]});
		var v2 = this.filter.val || this.traverse(this.agent,{[k2]: this.filter[Object.keys(this.filter)[2]]});

		if(this.op[this.filter.op](v1,v2) && this.child!=null){
			return true;
		}
		return false;
	}

}


class Count extends Decorator {

	//{res/prop:?}
	init(args){
		super.init(args);
		this.type = "count";
	}

	run(iterator=false){
		if(this.agent.temp && this.result!=null){
			this.agent.res[this.result] = null;
		}

		var c = null;
		c = this.traverse(this.agent,this.filter);
		if(c!=null && c instanceof Array){
			if(this.result!=null){
				this.agent.prop[this.result] = c.length;
			}
			if(this.child!=null){
				return this.child.run(iterator);
			} else {
				return false;
			}
		}
		return false;
	}

}

class Succeeder extends Decorator {

	fail(stack){
		return this.success(stack);
	}

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		this.child.run();
		return true;
	}
}

class Failer extends Decorator {

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		return this.fail(stack);
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		this.child.run();
		return false;
	}

}


class Repeater extends Decorator {

	init(args){
		this.max = args.max;
		this.runs = 0;
	}

	fail(stack){
		if(this.max && this.runs<=this.max){
			this.runs = 0;
			stack.pop();
			stack.last().node.fail(stack);
		}
	}

	success(stack){
		if(this.max && this.runs<=this.max){
			this.runs = 0;
			stack.pop();
			stack.last().node.success(stack);
		}
	}


	next(stack){
		if(!this.max){
			stack.push(this.child);
		} else if (this.runs<=this.max){
			stack.push(this.child);
			this.runs++;
		}
		return this;
	}

	run(){
		if(this.child==null){
			return false;
		}
		if(!this.max){
			this.child.run();
		} else {
			if(this.runs<this.max){
				this.child.run();
				this.runs++;
			} else {
				this.runs = 0;
				return this.child.run();
			}
		}
	}

}

class RepeatUntilSucceeds extends Decorator {

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	fail(stack){
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		if(this.child.run()){
			return true;
		}
	}
}

class RepeatUntilFail extends Decorator {

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		if(!this.child.run()){
			return false;
		}
	}
}

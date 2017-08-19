var Composite = request('./composite.js').Composite;

class Decorator extends Composite{

	init(args){
		super.init(args);
		this.mainType = 'decorator';
		this.type = 'decorator';
		this.result = args.result || null;
		this.filter = args.filter || null;
		this.child = null;
		setChildren(args);
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
		if(!(behavior instanceof Behavior)){
			child = this.behaviorConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.child = child;
		return this;
	}

	//arrumar
	traverse(obj,filter){
		var fk = Object.keys(filter);
		if(obj[fk[0]]!=null){
			if(obj[fk[0]] instanceof Object && !(obj[fk[0]] instanceof Array)){
				return this.traverse(obj[fk[0]],filter[fk[0]]);
			} else {
				return obj[fk[0]];
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
		js.filter = JSON.stringify(this.filter);
		js.result = JSON.stringify(this.result);
		return js;
	}

}


class Inverter extends Decorator{

	init(args){
		super.init(args);
		this.type="inverter";
	}

	//ajeitar next e afins

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
		if(this.child==null){
			return false;
		}
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
		this.type = 'test';
	}

	testCondition(){
		var v1 = this.traverse(this.agent,{Object.keys(this.filter)[0]:this.filter[Object.keys(this.filter)[0]]});
		var v2 = this.filter.val || this.traverse(this.agent,{Object.keys(this.filter)[2]:this.filter[Object.keys(this.filter)[2]]});

		if(this.op[this.filter.op](v1,v2) && this.child!=null){
			return true;
		}
		return false;
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

module.exports = {
	'Decorator'	: Decorator,
	'Inverter'	: Inverter,
	'Limit'			: Limit,
	'Condition'	: Condition,
	'Find'			: Find,
	'Count'			: Count
}

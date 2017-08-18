var Composite = request('./composite.js').Composite;

class Decorator extends Behavior{

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
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			if(this.child!=null){
				this.child.setAgent(agent);
			}
		}
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Behavior)){
			child = this.behaviorConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.child = child;
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

	toJson(){
		var js = super.toJson();
		js.child = this.child.toJson();
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

	run(iterator=false){
		if(this.child==null){
			return false;
		}
		return !this.child.run(iterator);
	}

}


class Limit extends Decorator{

	init(args){
		super.init(args);
		this.type = 'limit';
		this.max = node.max || 0;
		this.runs = 0;
	}

	run(iterator=false){
		if(this.child==null){
			return false;
		}
		if(this.runs>=this.max){
			return false;
		}
		this.runs++;
		return this.child.run(iterator);
	}

	toJson(){
		var js = super.toJson();
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

		run(iterator=false){
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
				return this.child.run(iterator);
			}
			return false;
		}

		toJson(){
			var js = super.toJson();
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

	run(iterator=false){
		var v1 = this.traverse(this.agent,{Object.keys(this.filter)[0]:this.filter[Object.keys(this.filter)[0]]});
		var v2 = this.filter.val || this.traverse(this.agent,{Object.keys(this.filter)[2]:this.filter[Object.keys(this.filter)[2]]});

		if(this.op[this.filter.op](v1,v2) && this.child!=null){
			return this.child.run(iterator);
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

module.exports = {
	'Decorator'	:Decorator,
	'Inverter'	:Inverter,
	'Limit'		:Limit,
	'Condition'	:Condition,
	'Find'		:Find,
	'Count'		:Count	
}

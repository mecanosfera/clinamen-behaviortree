/// <reference path='./node.ts' />

namespace clinamen {

	export class Decorator extends Composite{

		result: any;
		filter: any;
		child: Composite;
		target: Node;

		constructor(data){
			super(data);
			this.mainType = 'decorator';
			this.type = 'decorator';
			this.result = data.result || null;
			this.filter = data.filter || {};
			this.target = data.target || null;
			//this.child = null;
			//this.setChildren(data);
		}

		setChildren(data){
			if(data.child!=null){
				this.add(data.child);
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

		add(node){
			var child = node;
			if(!(node instanceof Node)){
				child = this.nodeConstructor(node);
			}
			this.child = child;
			child.setAgent(this.agent);
			return this;
		}

		next(stack:Stack):number{
			if(!this.child || stack.state===FAILURE){
				return this.failure(stack);
			}
			if(stack.state===SUCCESS){
				return this.success(stack);
			}
			if(!this.testCondition()){
				return this.failure(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;

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

	export class Jump extends Decorator{

			childName: string;

			constructor(data){
				super(data);
				this.type="jump";
				this.childName = data.childName;
			}

			next(stack:Stack):number{
				if(!this.child || stack.state===FAILURE){
					return this.failure(stack);
				}
				if(stack.state===SUCCESS){
					return this.success(stack);
				}
				stack.state = RUNNING;
				stack.push(this.child);
				return RUNNING;
			}

			add(node){
				if(node.type){
					if(!node.name || !this.agent.childrenIndex[node.name]){
						return this;
					}
					this.childName = node.name;
					return this;
				}
				if(!node.childName || !this.agent.childrenIndex[node.childName]){
					return this;
				}
				this.childName = node.childName;
				return this;
			}

			find(nodeName){
				if(this.agent.childrenIndex[nodeName]){
					this.child = this.agent.childrenIndex[nodeName];
					return true;
				}
				return false;
			}

			run(){
				if(!this.child || !this.find(this.childName)){
					return false;
				}
				return this.child.run();
			}
	}


	export class Inverter extends Decorator{

		constructor(data){
			super(data);
			this.type="inverter";
		}

		copy(name:string):Inverter{
			return super.copy(name) as Inverter;
		}

		next(stack:Stack):number{
			if(!this.child || stack.state===SUCCESS){
				return this.failure(stack);
			}
			if(stack.state===FAILURE){
				return this.success(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

		run(){
			if(this.child==null){
				return false;
			}
			return !this.child.run();
		}

	}


	export class Limit extends Decorator{

		max: number;
		runs: number = 0;

		constructor(data){
			super(data);
			this.type = 'limit';
			this.max = data.max || 0;
		}

		next(stack:Stack):number {
			if(!this.child || this.runs>=this.max){
				this.runs = 0;
				return this.failure(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			this.runs++;
			return RUNNING;
		}


		json(){
			var js = super.json();
			js.max = this.max;
			js.runs = this.runs;
			return js;
		}

	}

	//Finds another Agent id
	export class Find extends Decorator{

			scope: string;

			constructor(data){
				super(data);
				this.type="find";
				this.scope = data.scope || 'world';
			}

			testCondition(){
				if(!this.result){
					return false;
				}
				var res = null;
				if(this.scope=='world'){
					res = this.agent.world.find(this.filter);
				} else {
					res = this.agent.find(this.filter);
				}
				if(this.result!=null){
					this.agent.prop[this.result] = res;
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

	export class Condition extends Decorator{

		//{res/prop:?, op:'==', val/res/prop:?}
		constructor(data){
			super(data);
			this.type = 'condition';
		}

		testCondition(){
			if(!this.child){
				return false;
			}
			var target = this.target || this.agent;
			if(this.filterEval(this.target,this.filter)){
				return true;
			}
			return false;
		}

	}


	export class Count extends Decorator {

		constructor(data){
			super(data);
			this.type = "count";
		}

		next(stack:Stack):number{
			if(!this.child || stack.state===FAILURE){
				return this.failure(stack);
			}
			if(stack.state===SUCCESS){
				return this.success(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

		count():void{

		}

		run():boolean{
			var target = this.target || this.agent;
			this.result = this.searchChildren(target,this.filter).length;
			if(this.resultProp){
				this.agent.prop[this.resultProp] = this.result;
			} else {
				if(!this.agent.prop[this.name]){
					this.agent.prop[this.name] = {'result':null};
				}
				this.agent.prop[this.name].result = this.result;
			}
			if(!this.child){
				return true;
			}
			return this.child.run();
		}

	}

	export class Succeeder extends Decorator {

		fail(stack){
			return this.success(stack);
		}

		success(stack){
			stack.pop();
			stack.last().node.success(stack);
			return this;
		}

		next_(stack){
			stack.push(this.child);
			return this;
		}

		run(){
			this.child.run();
			return true;
		}
	}

	export class Failer extends Decorator {

		fail(stack){
			stack.pop();
			stack.last().node.fail(stack);
			return this;
		}

		success(stack){
			return this.fail(stack);
		}

		next_(stack){
			stack.push(this.child);
			return this;
		}

		run(){
			this.child.run();
			return false;
		}

	}


	export class Repeater extends Decorator {

		max:number;
		runs:number = 0;

		constructor(data){
			super(data);
			this.max = data.max;
		}

		fail(stack){
			if(this.max && this.runs<=this.max){
				this.runs = 0;
				stack.pop();
				stack.last().node.fail(stack);
			}
			return this;
		}

		success(stack){
			if(this.max && this.runs<=this.max){
				this.runs = 0;
				stack.pop();
				stack.last().node.success(stack);
			}
			return this;
		}


		next_(stack){
			if(!this.max){
				stack.push(this.child);
			} else if (this.runs<=this.max){
				stack.push(this.child);
				this.runs++;
			}
			return this;
		}

		run(){
			if(!this.child){
				return false;
			}
			if(!this.max){
				this.child.run();
			} else {
				this.runs++;
				while(this.runs<this.max){
					this.child.run();
				}
				this.runs = 0;
				return this.child.run();
			}
		}

	}

	export class RepeatUntilSucceeds extends Decorator {

		success(stack){
			stack.pop();
			stack.last().node.success(stack);
			return this;
		}

		fail(stack){
			return this;
		}

		next_(stack){
			stack.push(this.child);
			return this;
		}

		run(){
			if(this.child.run()){
				return true;
			}
		}
	}

	export class RepeatUntilFail extends Decorator {

		fail(stack){
			stack.pop();
			stack.last().node.fail(stack);
			return this;
		}

		success(stack){
			return this;
		}

		next_(stack){
			stack.push(this.child);
			return this;
		}

		run(){
			if(!this.child.run()){
				return false;
			}
		}
	}
}

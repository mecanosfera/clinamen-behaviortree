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

		copyJson(data:JsonData):JsonData {
			var js = this.json(false);
			js._id = this.uuid();
			js.name = data.name || js.name;
			js.child = this.child ? this.child.copyJson() : null;
			return js;
		}

		json(children:boolean = true):JsonData{
			var js:JsonData = super.json(false);
			if(children){
				js.child = this.child.json();
			}
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
				this.childName = data.childName || null;
			}

			setChildren(data){
				this.child = null;
				return this;
			}

			next(stack:Stack):number{
				if(!this.childName || !this.agent.nameIndex[this.childName] || stack.state===FAILURE){
					return this.failure(stack);
				}
				if(stack.state===SUCCESS){
					return this.success(stack);
				}
				stack.state = RUNNING;
				stack.push(this.agent.nameIndex[this.childName]);
				return RUNNING;
			}

			copy(data:JsonData):Jump{
				return super.copy(data) as Jump;
			}

			/*run(){
				if(!this.child || !this.find(this.childName)){
					return false;
				}
				return this.child.run();
			}*/
	}


	export class Inverter extends Decorator{

		constructor(data){
			super(data);
			this.type="inverter";
		}

		copy(data:JsonData):Inverter{
			return super.copy(data) as Inverter;
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
		reset:boolean;

		constructor(data){
			super(data);
			this.type = 'limit';
			this.max = data.max || 0;
			this.reset = data.reset || false;
		}

		next(stack:Stack):number {
			if(!this.child || this.runs>=this.max){
				if(this.reset){
					this.runs = 0;
				}
				return this.failure(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			this.runs++;
			return RUNNING;
		}

		copy(data:JsonData):Limit{
			return super.copy(data) as Limit;
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

			selector:string; //'all','first','last','random'
			test: Filter;

			constructor(data){
				super(data);
				this.type="find";
				this.selector = data.selector || 'first';
				this.test = data.test || null;
			}

			testCondition(){
				if(!this.result){
					return false;
				}
				var res:Array<Agent> = [];
				res = this.agent.world.find(this.filter,this.selector);
				if(this.selector=='all'){
					this.agent.prop[this.result] = [];
					for(let r of res){
						this.agent.prop[this.result].push(r._id);
					}
					return true;
				}
				var agent:Agent = null;
				if(this.selector=='first' && res.length>0){
					agent = res[0] as Agent;
				}
				if(this.selector=='last' && res.length>0){
					agent = res[res.length-1] as Agent;
				}
				if(this.selector=='random' && res.length>0){
					agent = res[0] as Agent;
				}
				this.agent.prop[this.result] = agent;
				return true;
			}

			copy(data:JsonData):Find{
				return super.copy(data) as Find;
			}

			json(children:boolean = false):JsonData{
				var js = super.json(children);
				js.selector = this.selector;
				return js;
			}

	}

	export class Condition extends Decorator{

		constructor(data){
			super(data);
			this.type = 'condition';
		}

		testCondition(){
			if(!this.child){
				return false;
			}
			var target:Agent = !this.target ? this.agent : this.agent.world.agentIndex[this.target._id];
			return this.filterEval(target,this.filter);
		}

	}


	export class Count extends Decorator {

		test: Filter;
		selector: string;

		constructor(data){
			super(data);
			this.type = "count";
			this.test = data.test || null;
			this.selector = data.selector || 'all';
		}

		next(stack:Stack):number{
			if(!this.child || stack.state===FAILURE){
				return this.failure(stack);
			}
			if(stack.state===SUCCESS){
				return this.success(stack);
			}
			if(!this.count()){
				return this.failure(stack);
			}
			stack.state = RUNNING;
			stack.push(this.child);
			return RUNNING;
		}

		count():boolean{
			if(!this.result && !this.test){
				return false;
			}
			var res:number = this.agent.world.find(this.filter,this.selector).length;
			if(this.result){
				this.agent.prop[this.result] = res;
			}
			if(this.test){
				return this.op[this.test.op](res,this.test.val);
			}
			return true;
		}

		run():boolean{

			return false;
		}

	}

	export class Succeeder extends Decorator {

		next(stack:Stack):number {
			if(stack.state===RUNNING){
				stack.push(this.child);
				return RUNNING;
			}
			return this.success(stack);
		}

		run(){
			this.child.run();
			return true;
		}
	}

	export class Failer extends Decorator {

		next(stack:Stack):number {
			if(stack.state===RUNNING){
				stack.push(this.child);
				return RUNNING;
			}
			return this.failure(stack);
		}

		run(){
			this.child.run();
			return false;
		}

	}




	export class RepeatUntilSucceeds extends Decorator {

		constructor(data:JsonData){
			super(data);
			this.type="repeatuntilsucceeds";
		}

		next(stack:Stack):number{
			if(!this.child){
				return this.failure(stack);
			}
			if(stack.state===SUCCESS){
				return this.success(stack);
			}
			if(stack.last()._id!=this.child._id){
				stack.push(this.child);
			}
			stack.state = RUNNING;
			return RUNNING;

		}

		run(){
			if(this.child.run()){
				return true;
			}
		}
	}

	export class RepeatUntilFail extends Decorator {

		constructor(data:JsonData){
			super(data);
			this.type="repeatuntilfails";
		}

		next(stack:Stack):number{
			if(!this.child){
				return this.failure(stack);
			}
			if(stack.state===FAILURE){
				return this.failure(stack);
			}
			if(stack.last()._id!=this.child._id){
				stack.push(this.child);
			}
			stack.state = RUNNING;
			return RUNNING;

		}
	}
}

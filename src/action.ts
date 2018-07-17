/// <reference path='./node.ts' />

namespace clinamen {

	interface ActionValue{
		prop:Array<any> | string;
		val: number | boolean | string;
	}

	export class Action extends Composite {
		target: string;
		act: string;
		value: Filter;

		constructor(data){
			super(data);
			this.mainType = 'action';
			this.type = data.type || 'action';
			this.target = data.target || 'self';
			this.act = data.act || 'wait';
			this.value = data.value || {} ;
		}

		setChildren(node:Node):Node{
			this.children = null;
			return this;
		}

		add(node):Node{
			return this;
		}

		next(stack:Stack):number{
			var res:number;
			if(!this.target){
				res = this.agent.act(this.act,this.value);
			} else if (this.agent.world.agentIndex[this.target]){
				res = this.agent.world.agentIndex[this.target].act(this.act,this.value);
			} else {
				res = FAILURE;
			}
			if(res===FAILURE){
				return this.failure(stack);
			}
			if(res===SUCCESS){
				return this.success(stack);
			}
			stack.state = RUNNING;
			return RUNNING;
		}




		run():boolean{
			return true;
			/*if(this.target=='self'){
				return this.agent.act(this.act,this.value);
			}
			if(this.target=='world'){
				return this.agent.world.act(this.act,this.value);
			}
			if(!this.agent.world.agentIndex[this.target]){
				return false;
			}
			return this.agent.world.agentIndex[this.target].act(this.act,this.value);*/
		}

		copy(data:JsonData):Action {
			return super.copy(data) as Action;
		}

		copyJson(data:JsonData):JsonData{
			var js = this.json(false);
			js._id = this.uuid();
			js.name = data.name || js.name;
			return js;
		}

		json(children:boolean=true):JsonData{
			var js:JsonData = super.json(children);
			js.target = this.target;
			js.act = this.act;
			js.value = this.value;
			return js;
		}

	}
}

import {RUNNING, SUCCESS, FAILURE, Dict, Stack, Node, World, Agent, Composite, Decorator, Selector, Sequence, RandomSelector,RandomSequence,Count,Find,Condition, Limit, Inverter} from "export";

interface ActionValue{
	prop:Array<any> | string;
	val: number | boolean | string;
}

export class Action extends Composite {
	target: string;
	act: string;
	value: ActionValue;
	waitingReponse: boolean = false;

	constructor(data){
		super(data);
		this.mainType = 'action';
		this.type = data.type || 'action';
		this.target = data.target || 'self';
		this.act = data.act || 'wait';
		this.value = data.value || null ;
	}

	setChildren(node:Node):Node{
		this.children = null;
		return this;
	}

	add(node):Node{
		return this;
	}

	tick(stack:Stack):number{
		if(stack.state!==RUNNING){
			stack.pop();
			this.waitingReponse = false;
			return stack.state;
		}
		if(!this.waitingReponse){
			this.waitingReponse = true;
			if(this.target=='self'){
				this.agent.act(this.act,this.value);
			} else if(this.target=='world'){
				this.agent.world.act(this.act,this.value);
			} else {
				if(!this.agent.world.agentIndex[this.target]){
					stack.state = FAILURE;
					stack.pop();
					return FAILURE;
				}
				this.agent.world.agentIndex[this.target].act(this.act,this.value);
			}
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

	json(){
		var js = super.json();
		js.target = this.target;
		js.act = this.act;
		js.value = this.value;
		return js;
	}

}

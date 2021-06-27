/// <reference path='./node.ts' />

namespace clinamen {


	export class Action extends Composite {
		act:string;
		val:any;

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data,nodeIndex);
			this.type = data.type || 'action';
			this.act = data.act || null;
			this.val = data.val || null;
		}

		addChildren(node:Node):Node{
			this.children = null;
			return this;
		}

		add(data:Node | JsonData):Node{
			return this;
		}

		next(stack:Stack,agent:IAgent=null):number{
			if(!agent || !this.act){
				return this.failure(stack,agent);
			}
			let res:number = agent.act(this.act,this.val);
			if(res===FAILURE){
				return this.failure(stack);
			}
			if(res===SUCCESS){
				return this.success(stack);
			}
			stack.state = RUNNING;
			return RUNNING;
		}

		json(children:boolean=true):JsonData{
			var js:JsonData = super.json(children);
			js.act = this.act;
			js.val = this.val;
			return js;
		}

	}
}

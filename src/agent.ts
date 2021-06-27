/// <reference path='./node.ts' />

namespace clinamen {

	export class Agent extends Node implements IAgent {

		blackboard:JsonData;

		constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
			super(data);
			this.blackboard = data.blackboard || {};
			this.stack = new Stack();
			this.nodeIndex = nodeIndex || getIndex();
		}

		test(exp:Array<any>):boolean{
			return test(exp,parseVal,this);
		}

		act(act:string,val:any=null):number{
			switch(act){
				case 'wait':
					return this.wait();
				case 'change':
					return this.change(val);
			}
			return FAILURE;
		}

		wait():number{
			return SUCCESS;
		}

		change(val:JsonData):number{
			for(let k in val){
				if(val[k] instanceof Array){
					this.blackboard[k] = calc(val[k],parseVal,this);
				} else if(val[k] instanceof Object){
					if(!val[k]['self'] || !this.blackboard[val[k]['self']]){
						this.blackboard[k] = null;
					} else {
						this.blackboard[k] = this.blackboard[val[k]['self']];
					}
				} else {
					this.blackboard[k] = val[k];
				}
			}
			return SUCCESS;
		}


		tick(stack:Stack=null):number{
			stack = (stack==null) ? this.stack : stack;
			if(this.children.length==0){
				return FAILURE;
			}
			if(stack.length==0 && stack.state!==IDLE){
				var state:number = stack.state;
				stack.state = IDLE;
				return state;
			}
			if(stack.length==0 && stack.state===IDLE){
				stack.push(this.children[0]);
			}
			var last:Node = stack.last();
			var res:number = last.next(stack,this);
			if(last.type=='action'){
				if(res===SUCCESS || res===RUNNING){
					return res;
				}
			}
			return this.tick(stack);
		}

		json():JsonData{
			let js = super.json();
			js.blackboard = this.blackboard;
			return js;
		}

	}

}

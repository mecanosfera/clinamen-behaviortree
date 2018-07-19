/// <reference path='./node.ts' />

namespace clinamen {

	export class Agent extends Node implements IAgent {

		mem:JsonData;

		constructor(data: NodeData){
			super(data);
			this.mem = data.blackboard || {};
			this.stack = new Stack();
		}

		test(exp:Array<any>):boolean{
			return test(exp,(val:any) => {
				if(val instanceof Object){
					if(!val['mem'] || !this.mem[val['mem']]){
						return null;
					}
					return this.mem[val['mem']];
				}
				return val;
			});
		}

		act(act:string,val:JsonData=null):number{
			switch(act){
				case 'wait':
					return this.wait();
				case 'change':
					return this.change(val);
			}
			return RUNNING;
		}

		wait():number{
			return SUCCESS;
		}

		change(val:JsonData):number{
			for(let k in val){
				this.mem[k] = val;
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
			//return res;
			return this.tick(stack);
		}

		json():JsonData{
			let js = super.json();
			js.mem = this.mem;
			return js;
		}

	}

}

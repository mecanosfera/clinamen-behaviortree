/// <reference path='./node.ts' />

namespace clinamen {

	export class Agent extends Node {
		template: string;
		world: World;
		childrenIndex: Dict<string>;
		//children: Array<Composite> = [];

		constructor(data){
			super(data);
			this.mainType = 'agent';
			this.type = data.type || 'agent';
			this.world = data.world;
			this.childrenIndex = {};
			if(data.children!=null){
				for(let c of data.children){
					this.add(c);
				}
			}
		}

		add(node:Composite):Node{
			if(this.children.length==0){
				if(node instanceof Composite){
					this.children.push(node);
				} else {
					this.children.push(this.nodeConstructor(node));
				}
				(this.children[0] as Composite).setAgent(this);
			}
			return this;
		}

		removeChildIndex(id:string){
			if(this.childrenIndex[id]){
				this.childrenIndex[id] = null;
				delete this.childrenIndex[id];
			}
			return this;
		}

		find(filter){
			return this.world.find(filter);
		}


		act(action:string,value:any):number{
			this.stack.state = RUNNING;
			if(this[action]){
				return this[action](value);
			}
			this.stack.state = FAILURE;
			return FAILURE;
		}

		wait():boolean{
			return true;
		}

		tick(stack:Stack):number{
			if(stack.length==0){
				return stack.state;
			}
			var last:Node = stack.last();
			var res = last.next(stack);
			//if(last.type=='action' && )
			//var res:number = stack.last().next(stack);
		}




		//{prop:['teste','prop'],val}
		//{prop:'teste',val:15}
		//{prop:[['teste','teste2'],'g'],val:16}
		change(val):number{
			var prop = this.prop;
			var propName = val.prop;
			if(val.prop instanceof Array){
					var ob = this.prop;
					for(let p of val.prop[0]){
						if(!ob[p]){
		//					ob[p] = {};
						}
			//			ob = ob[p];
					}
					prop = ob;
					propName = val.prop[1];
			}
			prop[propName] = val.val;

			this.stack.state = SUCCESS;
			return SUCCESS;
		}

		next(stack:Stack=null):number{
			if(this.children.length==0){
				return FAILURE;
			}
			if(this.stack.length==0){
				this.stack.push(this.children[0]);
			}
			return this.stack.next();
		}


		run():boolean{
			if(this.children.length>0){
				return this.children[0].run();
			}
			return false;
		}


		copy():Agent{
			return super.copy() as Agent;
		}

		json(children:boolean=true):JsonData{
			var js:JsonData = super.json();
			js.template = this.template;
			return js;
		}
	}
}

/// <reference path='./node.ts' />

namespace clinamen {

	export class Agent extends Node {
		world: World;
		childrenIndex: Dict<Composite> = {};
		nameIndex: Dict<Composite> = {};
		//children: Array<Composite> = [];

		constructor(data){
			super(data);
			this.mainType = 'agent';
			this.type = data.type || 'agent';
			if(data.children!=null){
				for(let c of data.children){
					this.add(c);
				}
			}
		}

		add(node:Composite):Node{
			var child:Composite;
			if(node instanceof Composite){
				child = node;
			} else {
				child = this.nodeConstructor(node);
			}
			this.children.push(child);
			this.childrenIndex[child._id] = child;
			if(child.name!=child.type){
				this.nameIndex[child.name] = child;
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
			if(this[action]){
				return this[action](value);
			}
			return FAILURE;
		}

		wait():boolean{
			return true;
		}

		tick(stack:Stack):number{
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
			var res:number = last.next(stack);
			if(last.type=='action'){
				if(res===SUCCESS || res===RUNNING){
					return res;
				}
			}
			return this.tick(stack);
		}




		//{prop:['teste','prop'],val}
		//{prop:'teste',val:15}
		//{prop:[['teste','teste2'],'g'],val:16}
		//mudar prop ou outras coisas?
		change(filter:Filter):number{
			if(!filter.create && !this.prop[filter.prop]){
				return FAILURE;
			}
			if(!filter.op){
				this.prop[filter.prop] = filter.val;
				return SUCCESS;
			}
			if(!this.prop[filter.prop]){
				this.prop[filter.prop] = 0;
			}
			if(filter.op==='+'){
				this.prop[filter.prop] += filter.val;
				return SUCCESS;
			}
			if(filter.op==='-'){
				this.prop[filter.prop] -= filter.val as number;
				return SUCCESS;
			}
			if(filter.op==='*'){
				this.prop[filter.prop] *= filter.val as number;
				return SUCCESS;
			}
			if(filter.op==='/'){
				this.prop[filter.prop] /= filter.val as number;
				return SUCCESS;
			}
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


		copy(data:JsonData):Agent{
			return super.copy(data) as Agent;
		}

		json(children:boolean=true):JsonData{
			var js:JsonData = super.json(children);
			return js;
		}
	}
}

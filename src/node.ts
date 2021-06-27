/// <reference path='./interfaces.ts' />
/// <reference path='./util.ts' />
/*/// <reference path='./agent.ts' />
/// <reference path='./composite.ts' />
/// <reference path='./decorator.ts' />
/// <reference path='./action.ts' />*/


namespace clinamen {

  export const FAILURE: number = 0;
  export const SUCCESS: number = 1;
  export const RUNNING: number = 2;
  export const IDLE   : number = 3;
  export const ERROR  : number = 4;

  //creates a global Dict with all the nodes using their ids as index
  let nodeIndex:Dict<Node> = null;

  export function getIndex():Dict<Node>{
    return nodeIndex;
  }

  export function setIndex(nIndex:Dict<Node>):void{
    nodeIndex = nIndex;
  }


  export abstract class Node implements IEntity {
    _id: string;
    type: string = 'node';
    name: string;
    comment:string;
    children: Array<Node> = [];
    stack: Stack = new Stack();
    index: number = 0;
    nodeIndex:Dict<Node>;

    constructor(data:JsonData={},nodeIndex:Dict<Node>=null){
      this.type ='node';
      this._id = data._id || this.uuid();
      this.name = data.name || null;
      this.comment = data.comment || null;
      this.nodeIndex = nodeIndex || getIndex();
      if(this.nodeIndex){
        this.nodeIndex[this._id] = this;
      }
      this.addChildren(data,this.nodeIndex);
    }

    uuid(){
      return ([1e7] as any +-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    }

    get(data:JsonData,nodeIndex:Dict<Node>=null):Composite{
      switch(data.type.toLowerCase()){
        case "selector":
          return new Selector(data,nodeIndex);
        case "sequence":
          return new Sequence(data,nodeIndex);
        case "randomselector":
          return new RandomSelector(data,nodeIndex);
        case "randomsequence":
          return new RandomSequence(data,nodeIndex);
        case "inverter":
          return new Inverter(data,nodeIndex);
        case "limit":
          return new Limit(data,nodeIndex);
        case "tester":
          return new Tester(data,nodeIndex);
        case "jump":
          return new Jump(data,nodeIndex);
        case "succeeder":
          return new Succeeder(data,nodeIndex);
        case "failer":
          return new Failer(data,nodeIndex);
        case "repeatuntilsucceeds":
          return new RepeatUntilSucceeds(data,nodeIndex);
        case "repeatuntilfails":
          return new RepeatUntilFail(data,nodeIndex);
        case "action":
          return new Action(data,nodeIndex);
      }
    }

    add(data:Node | JsonData,nodeIndex:Dict<Node>=null):Node{
			if(!(data instanceof Node)){
				this.children.push(this.get(data,nodeIndex));
				return this;
			}
			this.children.push(data);
			return this;
		}

    addChildren(data:JsonData,nodeIndex:Dict<Node>=null):Node{
			if(data.children){
				for(let c of data.children){
					this.add(c,this.nodeIndex);
				}
			}
			return this;
		}

    remove(_id:string):void{
      for(let i=0;i<this.children.length;i++){
        if(this.children[i]._id===_id){
          this.children.splice(i,1);
          return;
        }
      }
    }

    next(stack:Stack=null,agent:IAgent=null):number{
      return FAILURE;
    }

    success(stack:Stack,agent:IAgent=null):number{
			stack.state = SUCCESS;
			stack.pop();
			this.index = 0;
			return SUCCESS;
		}

		failure(stack:Stack,agent:IAgent=null):number {
			stack.state = FAILURE;
			stack.pop();
			this.index = 0;
			return FAILURE;
		}

		running(stack:Stack,agent:IAgent=null):number{
			stack.state = RUNNING;
			return RUNNING;
		}

    copy():Node{
      return this;
    }


    json(children:boolean=true):JsonData{
      let js:JsonData = {
        _id: this._id,
  			type: this.type,
  			name: this.name,
        comment: this.comment,
  			children: []
  		}
      if(children && this.children!=null){
    		for(let c of this.children){
    			js.children.push(c.json());
    		}
      }
      return js;
    }



  }

}

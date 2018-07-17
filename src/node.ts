/// <reference path='./interfaces.ts' />
/// <reference path='./agent.ts' />
/// <reference path='./world.ts' />
/// <reference path='./composite.ts' />
/// <reference path='./decorator.ts' />
/// <reference path='./action.ts' />

namespace clinamen {

  export const FAILURE: number = 0;
  export const SUCCESS: number = 1;
  export const RUNNING: number = 2;
  export const IDLE   : number = 3;
  export const ERROR  : number = 4;


  export abstract class Node {

    _id: string;
    mainType: string = 'node';
    type: string = 'node';
    name: string;
    prop: Prop = {};
    children: Array<Node> = [];
    stack: Stack = new Stack();
    index: number = 0;
    op: DictOp = {
        "+": 	(a,b)   => {return a+b},
        "-": 	(a,b)   => {return a-b},
        "*": 	(a,b)   => {return a*b},
        "/": 	(a,b)   => {return a/b},
        "%": 	(a,b)   => {return a%b},
        "==": (a,b)   => {return a==b},
        "===":(a,b)   => {return a===b},
        "!=":	(a,b)   => {return a!=b},
        "!==":(a,b)   => {return a!==b},
        ">":	(a,b)   => {return a>b},
        ">=":	(a,b)   => {return a>=b},
        "<":	(a,b)   => {return a<b},
        "<=":	(a,b)   => {return a<=b},
        "&&": (a,b)   => {return a&&b},
        "||": (a,b)   => {return a||b},
        "?" : (a,b,c) => {return a ? b : c;}
    };

    constructor(data: NodeData){
      this.mainType = 'node';
      this.type ='node';
      this._id = data._id || this.uuid();
      this.name = data.name;
      if(data.prop!=null){
  			for(let s in data.prop){
  				this.prop[s] = data.prop[s];
  			}
  		}
    }


    //evaluates a Node object usign a filter
    filterEval(obj:Node,filter:Filter):boolean{
      var propVal;
      //['prop1','prop2','prop3'] = {prop1:{prop2:{prop3:val}}}
      /*if(filter.prop instanceof Array){
        var pval = obj;
        for(let p of filter.prop){
          if(!pval[p]){
            return false;
          }
          pval = pval[p];
        }
        propVal = pval;
      } else {*/
        if(!obj[filter.prop]){
          return false;
        }
        propVal = obj[filter.prop];
      //}
      //if(filter.val instanceof Object){
      //  return this.op[filter.op](propVal,this.filterEval(obj,(filter as Filter).val));
      //}
      return this.op[filter.op](propVal,filter.val);
    }

    searchChildren(obj:Node,filter:Filter):Array<Node>{
      var res: Array<Node> = [];
      for(let n of obj.children){
        if(this.filterEval(n,filter)){
          res.push(n);
        }
      }
      return res;
    }

    traverse(obj,filter={}){
  		var fk = Object.keys(filter);
  		var val = obj[fk[0]][filter[fk[0]]];
  		if(val!=null){
  			if(val instanceof Object && !(val instanceof Array)){
  				return this.traverse(val,filter[fk[0]]);
  			} else {
  				return val;
  			}
  		}
  		return null;

  	}

    uuid(){
      return ([1e7] as any +-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    }


    nodeConstructor(node:JsonData){
      switch(node.type.toLowerCase()){
        case "selector":
          return new Selector(node);
        case "sequence":
          return new Sequence(node);
        case "randomselector":
          return new RandomSelector(node);
        case "randomsequence":
          return new RandomSequence(node);
        case "inverter":
          return new Inverter(node);
        case "limit":
          return new Limit(node);
        case "find":
          return new Find(node);
        /*case "test":
          return new Test(node);*/
        case "count":
          return new Count(node);
        case "condition":
          return new Condition(node);
        case "action":
          return new Action(node);
      }
      return null;
    }

    add(node:Node):Node{
      return this;
    }

    remove(filter: Node | Filter = null):Node{
      if(filter instanceof Node){
        for(let i=0;i<this.children.length;i++){
          if(filter._id && this.children[i]._id==filter._id){
            this.children.splice(i,1);
            return this;
          }
        }
        return this;
      }
      if(!filter){
        if(this['agent'] && this['agent']!=null){
          let agent: Agent = this['agent'] as Agent;
          for(let c of this.children){
            agent.removeChildIndex(c._id);
          }
        }
        this.children = [];
        return this;
      }
      for(let i=this.children.length-1;i>-1;i--){
        if(this.children.length==0){
          return this;
        }
        if(this.filterEval(this.children[i],filter)){
          if(this['agent'] && this['agent']!=null){
            var agent = (this['agent'] as Agent).removeChildIndex(this.children[i]._id);
          }
          this.children.splice(i,1);
        }
      }
      return this;
    }

    next(stack:Stack=null):number{
      return FAILURE;
    }

    success(stack:Stack):number{
			stack.state = SUCCESS;
			stack.pop();
			this.index = 0;
			return SUCCESS;
		}

		failure(stack:Stack):number {
			stack.state = FAILURE;
			stack.pop();
			this.index = 0;
			return FAILURE;
		}

		running(stack:Stack):number{
			stack.state = RUNNING;
			return RUNNING;
		}


    run():boolean{
      return false;
    }

    copy(data:JsonData={}):Node{
      return this.nodeConstructor(this.copyJson(data)) as Node;
    }

    copyJson(data:JsonData={}):JsonData{
      var js = this.json(false);
      js._id = this.uuid();
      js.name = data.name || js.name;
      for(let c of this.children){
          js.push(c.copyJson());
      }
      return js;
    }

    json(children:boolean=true):JsonData{
      var js:JsonData = {
        _id: this._id,
  			type: this.type,
  			name: this.name,
  			prop: this.prop,
  			children: []
  		}
      if(children && this.children!=null){
    		for(let c of this.children){
    			js.children.push(c.json());
    		}
      }
      return js;
    }

    shuffle(ar:Array<any>,copy:boolean=true):Array<any>{
    	var a = ar;
    	if(copy){
    		a = ar.slice(0);
    	}
    	var currentIndex = a.length;
    	var temporaryValue;
    	var randomIndex;

    	while (0 !== currentIndex) {
    	    randomIndex = Math.floor(Math.random() * currentIndex);
    	    currentIndex -= 1;
    	    temporaryValue = a[currentIndex];
    	    a[currentIndex] = a[randomIndex];
    	    a[randomIndex] = temporaryValue;
    	}
    	return a;
    }

  }

  export class Stack {
    private _stack: Array<Node> = [];
    state: number = IDLE;

    push(node:Node):void{
      this._stack.push(node);
    }

    pop():Node{
      return this._stack.pop();
    }

    next():number{
      if(this._stack.length==0){
        return FAILURE;
      }
      return this.last().next(this);
    }

    last():Node{
      if(this._stack.length==0){
        return null;
      }
      return this._stack[this._stack.length-1];
    }

    get length():number{
      return this._stack.length;
    }

  }

}

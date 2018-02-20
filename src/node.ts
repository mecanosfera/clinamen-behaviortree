namespace clinamen {

  export interface Dict{
    [index:string]:any
  }

  export interface NodeData{
    type:string;
    [index:string]:any;
  }

  export interface DictOp{
    [index:string]:Function
  }

  export interface Prop{
    [index:string]: boolean | string | number;
  }

  export interface JsonObj{
    [index:string]:any;
  }


  export class Filter{
    prop: string | Array<string>;
    op: string;
    val: number | string | boolean | null | Filter;

    constructor(f){
      this.prop = f.prop;
      this.op = f.op;
      this.val = f.val;
    }
  }

  export abstract class Node {

    id: string;
    mainType: string = 'node';
    type: string = 'node';
    name: string;
    temp: Dict = {};
    prop: Dict = {};
    running: boolean = false;
    children: Array<Node> = [];
    stack: Stack = new Stack();
    op: DictOp = {
        "+": 	(a,b) => {return a+b},
        "-": 	(a,b) => {return a-b},
        "*": 	(a,b) => {return a*b},
        "/": 	(a,b) => {return a/b},
        "%": 	(a,b) => {return a%b},
        "==": (a,b) => {return a==b},
        "===":(a,b) => {return a===b},
        "!=":	(a,b) => {return a!=b},
        "!==":(a,b) => {return a!==b},
        ">":	(a,b) => {return a>b},
        ">=":	(a,b) => {return a>=b},
        "<":	(a,b) => {return a<b},
        "<=":	(a,b) => {return a<=b},
        "&&": (a,b) => {return a&&b},
        "||": (a,b) => {return a||b}
    };

    constructor(data: Dict={}){
      this.mainType = 'node';
      this.type ='node';
      this.id = data.id || this.uuid();
      this.name = data.name;
      this.temp = data.temp || true;
      this.prop = {};
      this.children = [];
      if(data.prop!=null){
  			for(let s in data.prop){
  				this.prop[s] = data.prop[s];
  			}
  		}
    }


    //evaluates a Node object acording to a filter
    filterEval(obj:Node,f:Filter | Object):boolean{
      var filter: Filter = f instanceof Filter ? f : new Filter(f);
      var propVal;
      if(filter.prop instanceof Array){
        var pval = obj;
        for(let p of filter.prop){
          if(!pval[p]){
            return false;
          }
          pval = pval[p];
        }
        propVal = pval;
      } else {
        if(!obj[filter.prop]){
          return false;
        }
        propVal = obj[filter.prop];
      }
      if(filter.val instanceof Object){
        return this.op[filter.op](propVal,this.filterEval(obj,filter.val));
      }
      return this.op[filter.op](propVal,filter.val);
    }

    searchChildren(obj:Node,f:Filter):Node[]{
      var filter: Filter = f instanceof Filter ? f : new Filter(f);
      var res: Node[] = [];
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


    nodeConstructor(node:NodeData){
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
          if(filter.id && this.children[i].id==filter.id){
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
            agent.removeChildIndex(c.id);
          }
        }
        this.children = [];
        return this;
      }
      let toRemove = [];
      for(let i=0;i<this.children.length;i++){
        if(this.filterEval(this.children[i],filter)){
          toRemove.push(i);
        }
      }
      while(toRemove.length){
        let i = toRemove.pop();
        if(this['agent'] && this['agent']!=null){
          var agent = (this['agent'] as Agent).removeChildIndex(this.children[i].id);
        }
        this.children.splice(i,1);
      }
      return this;
    }

    run():boolean{
      return false;
    }

    next(stack:Stack):Node{
      return this;
    }

    fail(stack:Stack):Node{
      return this;
    }

    success(stack:Stack):Node{
      return this;
    }


    json():JsonObj{
      var js:JsonObj = {
  			type: this.type,
  			name: this.name,
  			prop: this.prop,
        temp: this.temp,
  			children: []
  		}
      if(this.children!=null){
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
    private _stack: any[] = [];
    done: boolean = false;

    push(node:Node, root:boolean = false):void{
      if(this._stack.length==0){
        this.done = false;
        root = true;
      }
      this._stack.push({index:0, node:node, root:root});
    }

    pop():any{
      return this._stack.pop();
    }

    last():any{
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

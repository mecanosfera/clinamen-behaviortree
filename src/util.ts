/// <reference path='./interfaces.ts' />
/// <reference path='./node.ts' />



namespace clinamen{

  export function shuffle(ar:Array<any>,copy:boolean=true):Array<any>{
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

  export function test(exp:Array<any>,func:Function=null,funcParam:any=null):boolean {
    return logical[exp[1]](exp[0] instanceof Array ? test(exp[0],func) : (func!=null ? func(exp[0],funcParam) : exp[0]),exp[2] instanceof Array ? test(exp[2],func) : (func!=null ? func(exp[2],funcParam) : exp[2]));
  }

  export function calc(exp:Array<any>,func:Function=null,funcParam:any=null):any{
    //return op[exp[1]](exp[0],exp[2]);
    return op[exp[1]](exp[0] instanceof Array ? calc(exp[0],func) : (func!=null ? func(exp[0],funcParam) : exp[0]),exp[2] instanceof Array ? calc(exp[2],func) : (func!=null ? func(exp[2],funcParam) : exp[2]));
  }

  export function parseVal(val:any,agent:IAgent){
    if(val instanceof Object){
      if(!val['self'] || !agent.blackboard[val['self']]){
        return null;
      }
      return agent.blackboard[val['self']];
    }
    return val;
  }

  export var logical: DictOp = {
    "==": (a,b):boolean  => {return a==b},
    "===":(a,b):boolean  => {return a===b},
    "!=":	(a,b):boolean  => {return a!=b},
    "!==":(a,b):boolean  => {return a!==b},
    ">":	(a,b):boolean  => {return a>b},
    ">=":	(a,b):boolean  => {return a>=b},
    "<":	(a,b):boolean  => {return a<b},
    "<=":	(a,b):boolean  => {return a<=b},
    "&&": (a,b):boolean  => {return a&&b},
    "||": (a,b):boolean  => {return a||b}
  }

  export var numeric: DictOp = {
    "+": 	(a,b):number   => {return a+b},
    "-": 	(a,b):number   => {return a-b},
    "*": 	(a,b):number   => {return a*b},
    "/": 	(a,b):number   => {return a/b},
    "%": 	(a,b):number   => {return a%b}
  }

  export var op: DictOp = {
      "+": 	(a,b):number   => {return a+b},
      "-": 	(a,b):number   => {return a-b},
      "*": 	(a,b):number   => {return a*b},
      "/": 	(a,b):number   => {return a/b},
      "%": 	(a,b):number   => {return a%b},
      "==": (a,b):boolean  => {return a==b},
      "===":(a,b):boolean  => {return a===b},
      "!=":	(a,b):boolean  => {return a!=b},
      "!==":(a,b):boolean  => {return a!==b},
      ">":	(a,b):boolean  => {return a>b},
      ">=":	(a,b):boolean  => {return a>=b},
      "<":	(a,b):boolean  => {return a<b},
      "<=":	(a,b):boolean  => {return a<=b},
      "&&": (a,b):boolean  => {return a&&b},
      "||": (a,b):boolean  => {return a||b},
      "?" : (a,b,c):any    => {return a ? b : c;}
  };

  export class Stack {
    private _stack:Array<Node> = [];
    state:number = IDLE;

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

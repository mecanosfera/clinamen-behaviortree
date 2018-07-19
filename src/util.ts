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

  //[1,'==',1]
  //['zzz','!==','dddd']
  /*[['a','!=',1],
      '&&',
      [[5,'>=',4],
        '||',
        false
      ]
    ]*/
  export function test(exp:Array<any>,func:Function=null):boolean {
    return logical[exp[1]](exp[0] instanceof Array ? test(exp[0],func) : (func!=null ? func(exp[0]) : exp[0]),exp[2] instanceof Array ? test(exp[2],func) : (func!=null ? func(exp[2]) : exp[2]));
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

class Node {

  constructor(args={}){
    this.init(args);
  }

  init(args){
    this.mainType = 'node';
    this.type ='node';
    this.name = args.name;
    this.temp = args.temp || true;
    this.res = {};
    this.prop = {};
    this.children = [];

    if(args.prop!=null){
			for(let s in args.prop){
				this.prop[s] = args.prop[s];
			}
		}

    this.stack = {
      _stack: [],
      done: false,
      push: function(node){
        if(this._stack.length==0){
          this.done = false;
        }
        this._stack.push({index:0, node:node});
      },
      pop: function(){
        return this._stack.pop();
      },
      last: function(){
        return this._stack[this._stack.length-1];
      }
    };

    Object.definePropert(this.stack,'length',{
      writable: false,
      enumerable: true,
      get: function(){return this.stack._stack.length;}
    });


    this.op = {
    		"+": 	function(a,b){return a+b},
    		"-": 	function(a,b){return a-b},
    		"*": 	function(a,b){return a*b},
    		"/": 	function(a,b){return a/b},
    		"%": 	function(a,b){return a%b},
    		"==": function(a,b){return a==b},
    		"===":function(a,b){return a===b},
    		"!=":	function(a,b){return a!=b},
    		"!==":function(a,b){return a!==b},
    		">":	function(a,b){return a>b},
    		">=":	function(a,b){return a>=b},
    		"<":	function(a,b){return a<b},
    		"<=":	function(a,b){return a<=b},
    		"&&": function(a,b){return a&&b},
    		"||": function(a,b){return a||b}
    };
  }

  remove(filter){
    if(!filter || filter=={}){
      this.children = [];
    } else if (filter) {
      for(let i = this.children.length-1; i>=0; i--){
        var rmv = true;
        for(let p in filter){
          if(!(p in this.children[p]) || this.children[i][p]!=filter[p]){
            rmv = false;
            break;
          }
        }
        if(rmv){
          this.children.splice(i,1);
        }
      }
    }
  }

  run(callstack){
    return false;
  }

  json(){
    var js = {
			type: this.type,
			name: this.name,
			prop: this.prop,
      temp: this.temp,
			children: []
		}
		for(let c of this.children){
			js.children.push(c.json());
		}
    return js;
  }

  nodeConstructor(node){
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
  		case "test":
  			return new Test(node);
  		case "count":
  			return new Count(node);
  		case "condition":
  			return new Condition(node);
  		case "action":
  			return new Action(node);
  	}
  	return null;
  }

  shuffle(ar,copy=true){
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

module.exports = Node;

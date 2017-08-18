class Entity {

  constructor(args={}){
    this.init(args);
  }

  init(args){
    this.name = args.name || null;
    this.mainType = 'entity';
    this.type ='entity';
    this.res = {};
    this.temp = args.temp || true;
    this.children = [];

    this.prop = {};
    if(args.prop!=null){
			for(let s in args.prop){
				this.prop[s] = args.prop[s];
			}
		}

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

  run(iterator=false){
    return false;
  }

  toJson(){
    var js = {
			type: this.type,
			name: this.name,
			prop: JSON.stringify(this.prop),
      temp: this.temp,
			children: []
		}
		for(let c of this.children){
			js.children.push(c.toJson());
		}
    return js;
  }

  behaviorConstructor(node){
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

module.exports = Entity;

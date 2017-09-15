(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.clinamenbt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./src/nodes.js');

},{"./src/nodes.js":2}],2:[function(require,module,exports){
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

    //console.log(args.prop);
    if(args.prop!=null){
			for(let s in args.prop){
				this.prop[s] = args.prop[s];
			}
		}

    this.stack = {
      _stack: [],
      done: false,
      push: function(node,root=false){
        if(this._stack.length==0){
          this.done = false;
          root = true;
        }
        this._stack.push({index:0, node:node, root:root});
      },
      pop: function(){
        return this._stack.pop();
      },
      last: function(){
        return this._stack[this._stack.length-1];
      }
    };

    var stack = this.stack;

    Object.defineProperty(stack,'length',{
      enumerable: true,
      get: function(){return stack._stack.length;}
    });

    this.stack = stack;

    this.nodeConstructor = function(node){

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

  add(node){
    return this;
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
    if(this.children!=null){
  		for(let c of this.children){
  			js.children.push(c.json());
  		}
    }
    return js;
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

class World extends Node{

  init(args){
      super.init(args);
      this.mainType = 'world';
  		this.type = args.type || 'world';
      this.instances = [];
      this.templates = {};
      this.children = [];
      this.started = false;

      if(args.instances!=null){
          for(let i of args.instances){
            this.instances.push(i);
          }
      }

      if(args.templates!=null){
        for(let t of args.templates){
          this.templates[t["name"]] = t;
        }
      }
  }


  start(){
    if(this.children.length==0){
      for(let a of this.instances){
        this.startInstance(a);
      }
      this.started=true;
    }
    return this;
  }

  startInstance(instance){
    if(this.templates[instance.template]){
      var ag = new Agent(this.templates[instance.template]);
      ag.name = instance.name || instance.template;
      ag.template = instance.template;
      ag.world = this;
      if(instance.prop){
        ag.prop = instance.prop;
      }
      this.children.push(ag);
    }
    return this;
  }

  add(args){
    if(args.template){
      this.templates[args.template[name]] = args.template;
    }
    if(args.instance){
      this.instances.push(args.instance);
      if(this.started){
        this.setInstance(args.instance);
      }
    }
    return this;
  }


  run(iterator=false){
    for(let c of this.children){
      c.run(iterator);
    }
    return true;
  }

  find(filter){
    if(filter=={}){
      return this.children;
    } else {
      var r = [];
      for(let c of this.children){

      }
      return r;
      //implement
    }
  }


  json(){
    var js = super.json();
    js.instances = [];
    for(a of this.instances){
      var name = null;
      if(a.name!=null){
        name = a.name;
      }
      js.instances.push({
        template: a.template,
        name: name,
        position: a.position
      });
    }
    js.templates = [];
    for(t in this.templates){
      js.templates.push(this.templates[t]);
    }
    return js;

  }

}

class Agent extends Node {

	init(args){
		super.init(args);
		this.mainType = 'agent';
		this.type = args.type || 'agent';
		this.template = args.template || this.type;
		this.world = args.world;

		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
	}

	add(node){
		if(this.children.length==0){
			if(node instanceof Composite){
				this.children.push(node);
			} else {
				this.children.push(this.nodeConstructor(node));
			}
			this.children[0].setAgent(this);
		}
		return this;
	}



	find(filter){
		return this.world.find(filter);
	}


	act(action,value){
		if(this[action]){
			return this[action](value);
		}
		return false;
	}

	wait(){
		return true;
	}

	change(state){
		for(let s in state){
			if(this.prop[s]!=null){
				if(state[s] instanceof Array){
					var v = state[s][1];
					if(v instanceof Object){
						v = this.traverse(v);
					}
					this.prop[s] = this.op[state[s][0]](this.prop[s]+v);
				} else {
					var v = state[s];
					if(v instanceof Object){
						v = this.traverse(v);
					}
					this.prop[s] = v;
				}
			}
		}
		return true;
	}

	next(){
		if(this.stack.length==0){
			this.stack.push(this.children[0]);
		} else {
			this.stack.last().node.next(this.stack);
		}
		return this;
	}

	run(){
		if(this.temp){
			this.res = {};
		}
		if(this.children.length>0){
			return this.children[0].run();
		}
		return false;
	}

	json(){
		var js = super.json();
		js.template = this.template;
		return js;
	}


}

class Composite extends Node{

	init(args){
		super.init(args);
		this.mainType = 'composite';
		this.type = 'composite';
		this.temp = args.temp || true;
		this.agent = args.agent || null;
		this.children = [];
		this.setChildren(args);
	}

	setChildren(args){
		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
		return this;
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			if(this.children!=null){
				for(let c of this.children){
					c.setAgent(agent);
				}
			}
		}
		return this;
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Composite)){
			child = this.nodeConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.children.push(child);
		return this;
	}

}


class Selector extends Composite{

	init(args){
		super.init(args);
		this.type="selector";
	}

	fail(stack){
		//stack.last().index++;
		return this;
	}

	success(stack){
		stack.last().index = 0;
		stack.pop();
		if(stack.length>0){
			stack.last().node.success(stack);
		}
		return this;
	}

	next(stack){
		if(!stack){
			stack = this.stack;
		}
		var index = stack.last().index;
		var previous = stack.last();
		if(index<this.children.length){
			stack.push(this.children[index]);
			previous.index++;
		} else {
			stack.pop();
			if(stack.length>0){
				stack.last().node.fail(stack);
			}
		}
		return this;
	}

	run(){

		for(let c of this.children){
			if(c.run()){
				return true;
			}
		}
		return false;
	}
}

class Sequence extends Composite{

	init(args){
		super.init(args);
		this.type="sequence";
	}

	success(stack){
		//stack.last().index++;
		return this;
	}

	fail(stack){
		stack.pop();
		if(stack.length>0){
			stack.last().node.fail(stack);
		}
		return this;
	}

	next(stack){
		if(!stack){
			stack = this.stack;
		}
		if(stack.done){
			stack.done = false;
		}
		var previous = stack.last();
		var index = previous.index;
		if(index<this.children.length){
			stack.push(this.children[index]);
			previous.index++;
		} else {
			stack.pop();
			if(stack.length>0){
				stack.last().node.success(stack);
			}
		}
		return this;
	}

	run(){
		console.log(this.children.length);
		for(let c of this.children){
			if(!c.run()){
				return false;
			}
		}
		return true;
	}
}


class RandomSelector extends Composite {

	init(args){
		super.init(args);
		this.type="randomSelector";
	}

	run(){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(c.run()){
				return true;
			}
		}
		return false;
	}

}

class RandomSequence extends Composite {

	init(args){
		super.init(args);
		this.type="randomSequence";
	}

	run(){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(!c.run()){
				return false;
			}
		}
		return true;
	}

}

class Decorator extends Composite{

	init(args){
		super.init(args);
		this.mainType = 'decorator';
		this.type = 'decorator';
		this.result = args.result || null;
		this.filter = args.filter || null;
		this.child = null;
		this.setChildren(args);
	}

	setChildren(behavior){
		if(behavior.child!=null){
			this.add(behavior.child);
		} else {
			this.child = null;
		}
		return this;
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			if(this.child!=null){
				this.child.setAgent(agent);
			}
		}
		return this;
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Node)){
			child = this.nodeConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.child = child;
		return this;
	}

	//arrumar
	traverse(obj,filter){
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

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		if(this.testCondition()){
			stack.push(this.child);
		} else {
			this.fail(stack);
		}
		return this;
	}

	testCondition(){
		return false;
	}

	run(){
		if(!this.child){
			return false;
		}
		if(this.testCondition()){
			return this.child.run();
		}
		return false;
	}

	json(){
		var js = super.json();
		js.child = this.child.json();
		js.filter = this.filter;
		js.result = this.result;
		return js;
	}

}


class Inverter extends Decorator{

	init(args){
		super.init(args);
		this.type="inverter";
	}

	success(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	fail(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){

		if(this.child==null){
			return false;
		}
		return !this.child.run();
	}

}


class Limit extends Decorator{

	init(args){
		super.init(args);
		this.type = 'limit';
		this.max = node.max || 0;
		this.runs = 0;
	}

	testCondition(){
		if(this.runs>=this.max){
			return false;
		}
		this.runs++;
		return true;
	}

	json(){
		var js = super.json();
		js.max = this.max;
		js.runs = this.runs;
		return js;
	}

}


class Find extends Decorator{

		init(args){
			super.init(args);
			this.type="find";
			this.filter = args.filter || {};
			this.scope = args.scope || 'world';
		}

		testCondition(){
			if(this.agent.temp && this.result!=null){
				this.agent.res[this.result] = null;
			}
			var res = null;
			if(this.scope=='world'){
				res = this.agent.world.find(this.filter);
			} else {
				res = this.agent.find(this.filter);
			}
			if(this.result!=null){
				this.agent.res[this.result] = res;
			}
			if(res!=null && this.child!=null){
				return true;
			}
		}

		json(){
			var js = super.json();
			js.scope = this.scope;
			return js;
		}

}

class Condition extends Decorator{

	//{res/prop:?, op:'==', val/res/prop:?}
	init(args){
		super.init(args);
		this.type = 'condition';
	}

	testCondition(){
		var obj = this.agent;
		var k1 = Object.keys(this.filter)[0];
		var k2 = Object.keys(this.filter)[2];
		var v1 = this.traverse(this.agent,{[k1] : this.filter[ Object.keys(this.filter)[0] ]});
		var v2 = this.filter.val || this.traverse(this.agent,{[k2]: this.filter[Object.keys(this.filter)[2]]});

		if(this.op[this.filter.op](v1,v2) && this.child!=null){
			return true;
		}
		return false;
	}

}


class Count extends Decorator {

	//{res/prop:?}
	init(args){
		super.init(args);
		this.type = "count";
	}

	run(iterator=false){
		if(this.agent.temp && this.result!=null){
			this.agent.res[this.result] = null;
		}

		var c = null;
		c = this.traverse(this.agent,this.filter);
		if(c!=null && c instanceof Array){
			if(this.result!=null){
				this.agent.prop[this.result] = c.length;
			}
			if(this.child!=null){
				return this.child.run(iterator);
			} else {
				return false;
			}
		}
		return false;
	}

}

class Succeeder extends Decorator {

	fail(stack){
		return this.success(stack);
	}

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		this.child.run();
		return true;
	}
}

class Failer extends Decorator {

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		return this.fail(stack);
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		this.child.run();
		return false;
	}

}


class Repeater extends Decorator {

	init(args){
		this.max = args.max;
		this.runs = 0;
	}

	fail(stack){
		if(this.max && this.runs<=this.max){
			this.runs = 0;
			stack.pop();
			stack.last().node.fail(stack);
		}
	}

	success(stack){
		if(this.max && this.runs<=this.max){
			this.runs = 0;
			stack.pop();
			stack.last().node.success(stack);
		}
	}


	next(stack){
		if(!this.max){
			stack.push(this.child);
		} else if (this.runs<=this.max){
			stack.push(this.child);
			this.runs++;
		}
		return this;
	}

	run(){
		if(this.child==null){
			return false;
		}
		if(!this.max){
			this.child.run();
		} else {
			if(this.runs<this.max){
				this.child.run();
				this.runs++;
			} else {
				this.runs = 0;
				return this.child.run();
			}
		}
	}

}

class RepeatUntilSucceeds extends Decorator {

	success(stack){
		stack.pop();
		stack.last().node.success(stack);
		return this;
	}

	fail(stack){
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		if(this.child.run()){
			return true;
		}
	}
}

class RepeatUntilFail extends Decorator {

	fail(stack){
		stack.pop();
		stack.last().node.fail(stack);
		return this;
	}

	success(stack){
		return this;
	}

	next(stack){
		stack.push(this.child);
		return this;
	}

	run(){
		if(!this.child.run()){
			return false;
		}
	}
}

class Action extends Composite {

	init(args){
		super.init(args);
		this.mainType = 'action';
		this.type = args.type || 'action';
		this.filter = args.filter || null;
		this.target = args.target || 'self';
		this.act = args.act || 'wait';
		this.value = args.value || null ;
	}

	setChildren(node){
		this.children = null;
		return this;
	}

	add(node){
		return this;
	}

	next(stack){
		stack.pop();
		if(this.run()){
			stack.done = true;
			stack.last().node.success(stack);
		} else {
			stack.last().node.fail(stack);
		}
		return this;
	}


	run(){
		if(this.target=='self'){
			return this.agent.act(this.act,this.value);
		} else if (this.target=='world'){
			return this.agent.world.act(this.act,this.value);
		} else {
			var t = this.traverse(this.agent, this.target);
			if(t!=null && (t instanceof Object && !(t instanceof Array))){
				return t.act(this.act,this.value);
			}
			return false;
		}
	}

	json(){
		var js = super.json();
		js.target = this.target;
		js.filter = this.filter;
		js.act = this.act;
		js.value = this.value;
		return js;
	}

}

module.exports = {
	'Node'					 			: Node,
	'World'					 			: World,
	'Agent'					 			: Agent,
	'Composite'			 			: Composite,
	'Selector'			 			: Selector,
	'Sequence'			 			: Sequence,
	'RandomSelector' 			: RandomSelector,
	'RandomSequence' 			: RandomSequence,
	'Decorator'			 			: Decorator,
	'Inverter'			 			: Inverter,
	'Limit'					 			: Limit,
	'Condition'			 			: Condition,
	'Find'					 			: Find,
	'Count'					 			: Count,
	'Succeeder'						: Succeeder,
	'Failer'							: Failer,
	'Repeater'						: Repeater,
	'RepeatUntilSucceeds'	: RepeatUntilSucceeds,
	'RepeatUntilFail'			: RepeatUntilFail,
	'Action'				 			: Action
};

},{}]},{},[1])(1)
});
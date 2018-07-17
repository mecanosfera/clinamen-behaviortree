/// <reference path='./interfaces.ts' />
/// <reference path='./agent.ts' />
/// <reference path='./world.ts' />
/// <reference path='./composite.ts' />
/// <reference path='./decorator.ts' />
/// <reference path='./action.ts' />
var clinamen;
(function (clinamen) {
    clinamen.FAILURE = 0;
    clinamen.SUCCESS = 1;
    clinamen.RUNNING = 2;
    clinamen.IDLE = 3;
    clinamen.ERROR = 4;
    class Node {
        constructor(data) {
            this.mainType = 'node';
            this.type = 'node';
            this.prop = {};
            this.children = [];
            this.stack = new Stack();
            this.index = 0;
            this.op = {
                "+": (a, b) => { return a + b; },
                "-": (a, b) => { return a - b; },
                "*": (a, b) => { return a * b; },
                "/": (a, b) => { return a / b; },
                "%": (a, b) => { return a % b; },
                "==": (a, b) => { return a == b; },
                "===": (a, b) => { return a === b; },
                "!=": (a, b) => { return a != b; },
                "!==": (a, b) => { return a !== b; },
                ">": (a, b) => { return a > b; },
                ">=": (a, b) => { return a >= b; },
                "<": (a, b) => { return a < b; },
                "<=": (a, b) => { return a <= b; },
                "&&": (a, b) => { return a && b; },
                "||": (a, b) => { return a || b; },
                "?": (a, b, c) => { return a ? b : c; }
            };
            this.mainType = 'node';
            this.type = 'node';
            this._id = data._id || this.uuid();
            this.name = data.name;
            if (data.prop != null) {
                for (let s in data.prop) {
                    this.prop[s] = data.prop[s];
                }
            }
        }
        //evaluates a Node object usign a filter
        filterEval(obj, filter) {
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
            if (!obj[filter.prop]) {
                return false;
            }
            propVal = obj[filter.prop];
            //}
            //if(filter.val instanceof Object){
            //  return this.op[filter.op](propVal,this.filterEval(obj,(filter as Filter).val));
            //}
            return this.op[filter.op](propVal, filter.val);
        }
        searchChildren(obj, filter) {
            var res = [];
            for (let n of obj.children) {
                if (this.filterEval(n, filter)) {
                    res.push(n);
                }
            }
            return res;
        }
        traverse(obj, filter = {}) {
            var fk = Object.keys(filter);
            var val = obj[fk[0]][filter[fk[0]]];
            if (val != null) {
                if (val instanceof Object && !(val instanceof Array)) {
                    return this.traverse(val, filter[fk[0]]);
                }
                else {
                    return val;
                }
            }
            return null;
        }
        uuid() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        }
        nodeConstructor(node) {
            switch (node.type.toLowerCase()) {
                case "selector":
                    return new clinamen.Selector(node);
                case "sequence":
                    return new clinamen.Sequence(node);
                case "randomselector":
                    return new clinamen.RandomSelector(node);
                case "randomsequence":
                    return new clinamen.RandomSequence(node);
                case "inverter":
                    return new clinamen.Inverter(node);
                case "limit":
                    return new clinamen.Limit(node);
                case "find":
                    return new clinamen.Find(node);
                /*case "test":
                  return new Test(node);*/
                case "count":
                    return new clinamen.Count(node);
                case "condition":
                    return new clinamen.Condition(node);
                case "action":
                    return new clinamen.Action(node);
            }
            return null;
        }
        add(node) {
            return this;
        }
        remove(filter = null) {
            if (filter instanceof Node) {
                for (let i = 0; i < this.children.length; i++) {
                    if (filter._id && this.children[i]._id == filter._id) {
                        this.children.splice(i, 1);
                        return this;
                    }
                }
                return this;
            }
            if (!filter) {
                if (this['agent'] && this['agent'] != null) {
                    let agent = this['agent'];
                    for (let c of this.children) {
                        agent.removeChildIndex(c._id);
                    }
                }
                this.children = [];
                return this;
            }
            for (let i = this.children.length - 1; i > -1; i--) {
                if (this.children.length == 0) {
                    return this;
                }
                if (this.filterEval(this.children[i], filter)) {
                    if (this['agent'] && this['agent'] != null) {
                        var agent = this['agent'].removeChildIndex(this.children[i]._id);
                    }
                    this.children.splice(i, 1);
                }
            }
            return this;
        }
        next(stack = null) {
            return clinamen.FAILURE;
        }
        success(stack) {
            stack.state = clinamen.SUCCESS;
            stack.pop();
            this.index = 0;
            return clinamen.SUCCESS;
        }
        failure(stack) {
            stack.state = clinamen.FAILURE;
            stack.pop();
            this.index = 0;
            return clinamen.FAILURE;
        }
        running(stack) {
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            return false;
        }
        copy(data = {}) {
            return this.nodeConstructor(this.copyJson(data));
        }
        copyJson(data = {}) {
            var js = this.json(false);
            js._id = this.uuid();
            js.name = data.name || js.name;
            for (let c of this.children) {
                js.push(c.copyJson());
            }
            return js;
        }
        json(children = true) {
            var js = {
                _id: this._id,
                type: this.type,
                name: this.name,
                prop: this.prop,
                children: []
            };
            if (children && this.children != null) {
                for (let c of this.children) {
                    js.children.push(c.json());
                }
            }
            return js;
        }
        shuffle(ar, copy = true) {
            var a = ar;
            if (copy) {
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
    clinamen.Node = Node;
    class Stack {
        constructor() {
            this._stack = [];
            this.state = clinamen.IDLE;
        }
        push(node) {
            this._stack.push(node);
        }
        pop() {
            return this._stack.pop();
        }
        next() {
            if (this._stack.length == 0) {
                return clinamen.FAILURE;
            }
            return this.last().next(this);
        }
        last() {
            if (this._stack.length == 0) {
                return null;
            }
            return this._stack[this._stack.length - 1];
        }
        get length() {
            return this._stack.length;
        }
    }
    clinamen.Stack = Stack;
})(clinamen || (clinamen = {}));

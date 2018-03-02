import { Selector, Sequence, RandomSelector, RandomSequence, Count, Find, Condition, Limit, Inverter, Action } from "export";
export const FAILURE = 0;
export const SUCCESS = 1;
export const RUNNING = 2;
export const IDLE = 3;
export class Filter {
    constructor(f) {
        this.prop = f.prop;
        this.op = f.op;
        this.val = f.val;
    }
}
export class Node {
    constructor(data = {}) {
        this.mainType = 'node';
        this.type = 'node';
        this.temp = {};
        this.prop = {};
        this.state = IDLE;
        this.running = false;
        this.children = [];
        this.stack = new Stack();
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
            "||": (a, b) => { return a || b; }
        };
        this.mainType = 'node';
        this.type = 'node';
        this.id = data.id || this.uuid();
        this.name = data.name;
        this.temp = data.temp || true;
        this.prop = {};
        this.children = [];
        if (data.prop != null) {
            for (let s in data.prop) {
                this.prop[s] = data.prop[s];
            }
        }
    }
    //evaluates a Node object acording to a filter
    filterEval(obj, f) {
        var filter = f instanceof Filter ? f : new Filter(f);
        var propVal;
        if (filter.prop instanceof Array) {
            var pval = obj;
            for (let p of filter.prop) {
                if (!pval[p]) {
                    return false;
                }
                pval = pval[p];
            }
            propVal = pval;
        }
        else {
            if (!obj[filter.prop]) {
                return false;
            }
            propVal = obj[filter.prop];
        }
        if (filter.val instanceof Object) {
            return this.op[filter.op](propVal, this.filterEval(obj, filter.val));
        }
        return this.op[filter.op](propVal, filter.val);
    }
    searchChildren(obj, f) {
        var filter = f instanceof Filter ? f : new Filter(f);
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
    add(node) {
        return this;
    }
    remove(filter = null) {
        if (filter instanceof Node) {
            for (let i = 0; i < this.children.length; i++) {
                if (filter.id && this.children[i].id == filter.id) {
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
                    agent.removeChildIndex(c.id);
                }
            }
            this.children = [];
            return this;
        }
        let toRemove = [];
        for (let i = 0; i < this.children.length; i++) {
            if (this.filterEval(this.children[i], filter)) {
                toRemove.push(i);
            }
        }
        while (toRemove.length) {
            let i = toRemove.pop();
            if (this['agent'] && this['agent'] != null) {
                var agent = this['agent'].removeChildIndex(this.children[i].id);
            }
            this.children.splice(i, 1);
        }
        return this;
    }
    tick(stack = null) {
        return FAILURE;
    }
    run() {
        return false;
    }
    json() {
        var js = {
            type: this.type,
            name: this.name,
            prop: this.prop,
            temp: this.temp,
            children: []
        };
        if (this.children != null) {
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
export class Stack {
    constructor() {
        this._stack = [];
    }
    push(node, root = false) {
        this._stack.push(node);
    }
    pop() {
        return this._stack.pop();
    }
    tick() {
        if (this._stack.length == 0) {
            return FAILURE;
        }
        return this.last().tick(this);
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

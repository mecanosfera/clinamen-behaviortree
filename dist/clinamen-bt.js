/// <reference path='./interfaces.ts' />
/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    function shuffle(ar, copy = true) {
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
    clinamen.shuffle = shuffle;
    function test(exp, func = null, funcParam = null) {
        return clinamen.logical[exp[1]](exp[0] instanceof Array ? test(exp[0], func) : (func != null ? func(exp[0], funcParam) : exp[0]), exp[2] instanceof Array ? test(exp[2], func) : (func != null ? func(exp[2], funcParam) : exp[2]));
    }
    clinamen.test = test;
    function calc(exp, func = null, funcParam = null) {
        //return op[exp[1]](exp[0],exp[2]);
        return clinamen.op[exp[1]](exp[0] instanceof Array ? calc(exp[0], func) : (func != null ? func(exp[0], funcParam) : exp[0]), exp[2] instanceof Array ? calc(exp[2], func) : (func != null ? func(exp[2], funcParam) : exp[2]));
    }
    clinamen.calc = calc;
    function parseVal(val, agent) {
        if (val instanceof Object) {
            if (!val['self'] || !agent.blackboard[val['self']]) {
                return null;
            }
            return agent.blackboard[val['self']];
        }
        return val;
    }
    clinamen.parseVal = parseVal;
    clinamen.logical = {
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
    clinamen.op = {
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
/// <reference path='./interfaces.ts' />
/// <reference path='./util.ts' />
/*/// <reference path='./agent.ts' />
/// <reference path='./composite.ts' />
/// <reference path='./decorator.ts' />
/// <reference path='./action.ts' />*/
var clinamen;
(function (clinamen) {
    clinamen.FAILURE = 0;
    clinamen.SUCCESS = 1;
    clinamen.RUNNING = 2;
    clinamen.IDLE = 3;
    clinamen.ERROR = 4;
    var nodeIndex = null;
    function getIndex() {
        return nodeIndex;
    }
    clinamen.getIndex = getIndex;
    function setIndex(nIndex) {
        nodeIndex = nIndex;
    }
    clinamen.setIndex = setIndex;
    class Node {
        constructor(data = {}, nodeIndex = null) {
            this.type = 'node';
            this.children = [];
            this.stack = new clinamen.Stack();
            this.index = 0;
            this.type = 'node';
            this._id = data._id || this.uuid();
            this.name = data.name || null;
            this.comment = data.comment || null;
            this.nodeIndex = nodeIndex || getIndex();
            if (this.nodeIndex) {
                this.nodeIndex[this._id] = this;
            }
            this.addChildren(data, this.nodeIndex);
        }
        uuid() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
        }
        get(data, nodeIndex = null) {
            switch (data.type.toLowerCase()) {
                case "selector":
                    return new clinamen.Selector(data, nodeIndex);
                case "sequence":
                    return new clinamen.Sequence(data, nodeIndex);
                case "randomselector":
                    return new clinamen.RandomSelector(data, nodeIndex);
                case "randomsequence":
                    return new clinamen.RandomSequence(data, nodeIndex);
                case "inverter":
                    return new clinamen.Inverter(data, nodeIndex);
                case "limit":
                    return new clinamen.Limit(data, nodeIndex);
                case "tester":
                    return new clinamen.Tester(data, nodeIndex);
                case "jump":
                    return new clinamen.Jump(data, nodeIndex);
                case "action":
                    return new clinamen.Action(data, nodeIndex);
            }
        }
        add(data, nodeIndex = null) {
            if (!(data instanceof Node)) {
                this.children.push(this.get(data, nodeIndex));
                return this;
            }
            this.children.push(data);
            return this;
        }
        addChildren(data, nodeIndex = null) {
            if (data.children) {
                for (let c of data.children) {
                    this.add(c, this.nodeIndex);
                }
            }
            return this;
        }
        remove(_id) {
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i]._id === _id) {
                    this.children.splice(i, 1);
                    return;
                }
            }
        }
        next(stack = null, agent = null) {
            return clinamen.FAILURE;
        }
        success(stack, agent = null) {
            stack.state = clinamen.SUCCESS;
            stack.pop();
            this.index = 0;
            return clinamen.SUCCESS;
        }
        failure(stack, agent = null) {
            stack.state = clinamen.FAILURE;
            stack.pop();
            this.index = 0;
            return clinamen.FAILURE;
        }
        running(stack, agent = null) {
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        copy() {
            return this;
        }
        json(children = true) {
            let js = {
                _id: this._id,
                type: this.type,
                name: this.name,
                comment: this.comment,
                children: []
            };
            if (children && this.children != null) {
                for (let c of this.children) {
                    js.children.push(c.json());
                }
            }
            return js;
        }
    }
    clinamen.Node = Node;
})(clinamen || (clinamen = {}));
/// <reference path='./node.ts' />
/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Composite extends clinamen.Node {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.children = [];
            this.type = 'composite';
        }
        addChildren(data, nodeIndex = null) {
            if (data.children) {
                for (let c of data.children) {
                    this.add(c, nodeIndex);
                }
            }
            return this;
        }
        add(data, nodeIndex = null) {
            if (!(data instanceof Composite)) {
                this.children.push(this.get(data, nodeIndex));
                return this;
            }
            this.children.push(data);
            return this;
        }
    }
    clinamen.Composite = Composite;
    class Selector extends Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = "selector";
        }
        next(stack, agent = null) {
            if (!stack) {
                stack = this.stack;
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack, agent);
            }
            if (this.index >= this.children.length) {
                return this.failure(stack, agent);
            }
            var nextNode = this.children[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.Selector = Selector;
    class Sequence extends Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = "sequence";
        }
        next(stack, agent = null) {
            if (!stack) {
                stack = this.stack;
            }
            if (stack.state === clinamen.FAILURE) {
                return this.failure(stack, agent);
            }
            if (this.index >= this.children.length) {
                return this.success(stack, agent);
            }
            console.log(this.index);
            var nextNode = this.children[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.Sequence = Sequence;
    class RandomSelector extends Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.rchildren = null;
            this.type = "randomSelector";
        }
        next(stack, agent = null) {
            if (!this.rchildren) {
                this.rchildren = clinamen.shuffle(this.children);
            }
            if (stack.state === clinamen.SUCCESS) {
                this.rchildren = null;
                return this.success(stack, agent);
            }
            if (this.index >= this.children.length) {
                this.rchildren = null;
                return this.failure(stack, agent);
            }
            var nextNode = this.rchildren[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.RandomSelector = RandomSelector;
    class RandomSequence extends Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.rchildren = null;
            this.type = "randomSequence";
        }
        next(stack, agent = null) {
            if (!this.rchildren) {
                this.rchildren = clinamen.shuffle(this.children);
            }
            if (stack.state === clinamen.FAILURE) {
                this.rchildren = null;
                return this.failure(stack, agent);
            }
            if (this.index >= this.children.length) {
                this.rchildren = null;
                return this.success(stack, agent);
            }
            var nextNode = this.rchildren[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.RandomSequence = RandomSequence;
})(clinamen || (clinamen = {}));
/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Decorator extends clinamen.Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = 'decorator';
        }
        addChildren(data, nodeIndex = null) {
            if (data.child != null) {
                this.add(data.child, nodeIndex);
            }
            else {
                this.child = null;
            }
            return this;
        }
        add(data, nodeIndex = null) {
            if (!(data instanceof clinamen.Node)) {
                this.child = this.get(data, nodeIndex);
                return this;
            }
            this.child = data;
            return this;
        }
        next(stack, agent = null) {
            if (!this.child || stack.state === clinamen.FAILURE) {
                return this.failure(stack, agent);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack, agent);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
        json(children = true) {
            var js = super.json(false);
            console.log(this);
            if (children) {
                js.child = this.child.json();
            }
            return js;
        }
    }
    clinamen.Decorator = Decorator;
    class Jump extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = 'jump';
            this.targetId = data.targetId || null;
        }
        addChildren(data, nodeIndex = null) {
            if (!data.targetId) {
                this.child = null;
                return this;
            }
            if (!nodeIndex || !nodeIndex[data.targetId]) {
                this.child = null;
                return this;
            }
            this.child = nodeIndex[data.targetId];
            return this;
        }
        next(stack, agent = null) {
            if (!this.targetId) {
                return this.failure(stack, agent);
            }
            if (!this.nodeIndex) {
                return this.failure(stack, agent);
            }
            if (!this.child && !this.nodeIndex[this.targetId]) {
                return this.failure(stack, agent);
            }
            this.child = this.nodeIndex[this.targetId];
            stack.pop();
            stack.push(this.child);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        json() {
            let js = super.json();
            js.targetId = this.targetId;
            return js;
        }
    }
    clinamen.Jump = Jump;
    class Inverter extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = "inverter";
        }
        next(stack, agent = null) {
            if (!this.child || stack.state === clinamen.SUCCESS) {
                return this.failure(stack, agent);
            }
            if (stack.state === clinamen.FAILURE) {
                return this.success(stack, agent);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
    }
    clinamen.Inverter = Inverter;
    class Limit extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.runs = 0;
            this.type = 'limit';
            this.max = data.max || 0;
            this.reset = data.reset || false;
        }
        next(stack, agent = null) {
            if (!this.child || this.runs >= this.max) {
                if (this.reset) {
                    this.runs = 0;
                }
                return this.failure(stack, agent);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            this.runs++;
            return clinamen.RUNNING;
        }
        json() {
            var js = super.json();
            js.max = this.max;
            js.runs = this.runs;
            return js;
        }
    }
    clinamen.Limit = Limit;
    //Finds another Agent id
    class Tester extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = 'tester';
            this.exp = data.exp || null;
        }
        next(stack, agent = null) {
            if (!this.child || stack.state === clinamen.FAILURE || !this.exp) {
                return this.failure(stack, agent);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack, agent);
            }
            if ((agent && !agent.test(this.exp)) || (!agent && !clinamen.test(this.exp))) {
                return this.failure(stack, agent);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
    }
    clinamen.Tester = Tester;
    class Succeeder extends Decorator {
        next(stack, agent = null) {
            if (stack.state === clinamen.RUNNING) {
                stack.push(this.child);
                return clinamen.RUNNING;
            }
            return this.success(stack, agent);
        }
    }
    clinamen.Succeeder = Succeeder;
    class Failer extends Decorator {
        next(stack, agent = null) {
            if (stack.state === clinamen.RUNNING) {
                stack.push(this.child);
                return clinamen.RUNNING;
            }
            return this.failure(stack, agent);
        }
    }
    clinamen.Failer = Failer;
    class RepeatUntilSucceeds extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = "repeatuntilsucceeds";
        }
        next(stack, agent = null) {
            if (!this.child) {
                return this.failure(stack, agent);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack, agent);
            }
            if (stack.last()._id != this.child._id) {
                stack.push(this.child);
            }
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.RepeatUntilSucceeds = RepeatUntilSucceeds;
    class RepeatUntilFail extends Decorator {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = "repeatuntilfails";
        }
        next(stack, agent = null) {
            if (!this.child) {
                return this.failure(stack, agent);
            }
            if (stack.state === clinamen.FAILURE) {
                return this.failure(stack, agent);
            }
            if (stack.last()._id != this.child._id) {
                stack.push(this.child);
            }
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
    }
    clinamen.RepeatUntilFail = RepeatUntilFail;
})(clinamen || (clinamen = {}));
/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Action extends clinamen.Composite {
        constructor(data = {}, nodeIndex = null) {
            super(data, nodeIndex);
            this.type = data.type || 'action';
            this.act = data.act || null;
            this.val = data.val || null;
        }
        addChildren(node) {
            this.children = null;
            return this;
        }
        add(data) {
            return this;
        }
        next(stack, agent = null) {
            if (!agent || !this.act) {
                return this.failure(stack, agent);
            }
            let res = agent.act(this.act, this.val);
            if (res === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (res === clinamen.SUCCESS) {
                return this.success(stack);
            }
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        json(children = true) {
            var js = super.json(children);
            js.act = this.act;
            js.val = this.val;
            return js;
        }
    }
    clinamen.Action = Action;
})(clinamen || (clinamen = {}));
/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Agent extends clinamen.Node {
        constructor(data = {}, nodeIndex = null) {
            super(data);
            this.blackboard = data.blackboard || {};
            this.stack = new clinamen.Stack();
            this.nodeIndex = nodeIndex || clinamen.getIndex();
        }
        test(exp) {
            return clinamen.test(exp, clinamen.parseVal, this);
        }
        act(act, val = null) {
            switch (act) {
                case 'wait':
                    return this.wait();
                case 'change':
                    return this.change(val);
            }
            return clinamen.FAILURE;
        }
        wait() {
            return clinamen.SUCCESS;
        }
        change(val) {
            for (let k in val) {
                if (val[k] instanceof Array) {
                    this.blackboard[k] = clinamen.calc(val[k], clinamen.parseVal, this);
                }
                else if (val[k] instanceof Object) {
                    if (!val[k]['self'] || !this.blackboard[val[k]['self']]) {
                        this.blackboard[k] = null;
                    }
                    else {
                        this.blackboard[k] = this.blackboard[val[k]['self']];
                    }
                }
                else {
                    this.blackboard[k] = val[k];
                }
            }
            return clinamen.SUCCESS;
        }
        tick(stack = null) {
            stack = (stack == null) ? this.stack : stack;
            if (this.children.length == 0) {
                return clinamen.FAILURE;
            }
            if (stack.length == 0 && stack.state !== clinamen.IDLE) {
                var state = stack.state;
                stack.state = clinamen.IDLE;
                return state;
            }
            if (stack.length == 0 && stack.state === clinamen.IDLE) {
                stack.push(this.children[0]);
            }
            var last = stack.last();
            var res = last.next(stack, this);
            if (last.type == 'action') {
                if (res === clinamen.SUCCESS || res === clinamen.RUNNING) {
                    return res;
                }
            }
            return this.tick(stack);
        }
        json() {
            let js = super.json();
            js.blackboard = this.blackboard;
            return js;
        }
    }
    clinamen.Agent = Agent;
})(clinamen || (clinamen = {}));

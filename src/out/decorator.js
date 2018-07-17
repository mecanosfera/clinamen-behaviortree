/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Decorator extends clinamen.Composite {
        constructor(data) {
            super(data);
            this.mainType = 'decorator';
            this.type = 'decorator';
            this.result = data.result || null;
            this.filter = data.filter || {};
            this.target = data.target || null;
            //this.child = null;
            //this.setChildren(data);
        }
        setChildren(data) {
            if (data.child != null) {
                this.add(data.child);
            }
            else {
                this.child = null;
            }
            return this;
        }
        setAgent(agent) {
            if (agent != null) {
                this.agent = agent;
                if (this.child != null) {
                    this.child.setAgent(agent);
                }
            }
            return this;
        }
        add(node) {
            var child = node;
            if (!(node instanceof clinamen.Node)) {
                child = this.nodeConstructor(node);
            }
            this.child = child;
            child.setAgent(this.agent);
            return this;
        }
        next(stack) {
            if (!this.child || stack.state === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack);
            }
            if (!this.testCondition()) {
                return this.failure(stack);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
        testCondition() {
            return false;
        }
        run() {
            if (!this.child) {
                return false;
            }
            if (this.testCondition()) {
                return this.child.run();
            }
            return false;
        }
        copyJson(data) {
            var js = this.json(false);
            js._id = this.uuid();
            js.name = data.name || js.name;
            js.child = this.child ? this.child.copyJson() : null;
            return js;
        }
        json(children = true) {
            var js = super.json(false);
            if (children) {
                js.child = this.child.json();
            }
            js.filter = this.filter;
            js.result = this.result;
            return js;
        }
    }
    clinamen.Decorator = Decorator;
    class Jump extends Decorator {
        constructor(data) {
            super(data);
            this.type = "jump";
            this.childName = data.childName || null;
        }
        setChildren(data) {
            this.child = null;
            return this;
        }
        next(stack) {
            if (!this.childName || !this.agent.nameIndex[this.childName] || stack.state === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.agent.nameIndex[this.childName]);
            return clinamen.RUNNING;
        }
        copy(data) {
            return super.copy(data);
        }
    }
    clinamen.Jump = Jump;
    class Inverter extends Decorator {
        constructor(data) {
            super(data);
            this.type = "inverter";
        }
        copy(data) {
            return super.copy(data);
        }
        next(stack) {
            if (!this.child || stack.state === clinamen.SUCCESS) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.FAILURE) {
                return this.success(stack);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
        run() {
            if (this.child == null) {
                return false;
            }
            return !this.child.run();
        }
    }
    clinamen.Inverter = Inverter;
    class Limit extends Decorator {
        constructor(data) {
            super(data);
            this.runs = 0;
            this.type = 'limit';
            this.max = data.max || 0;
            this.reset = data.reset || false;
        }
        next(stack) {
            if (!this.child || this.runs >= this.max) {
                if (this.reset) {
                    this.runs = 0;
                }
                return this.failure(stack);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            this.runs++;
            return clinamen.RUNNING;
        }
        copy(data) {
            return super.copy(data);
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
    class Find extends Decorator {
        constructor(data) {
            super(data);
            this.type = "find";
            this.selector = data.selector || 'first';
            this.test = data.test || null;
        }
        testCondition() {
            if (!this.result) {
                return false;
            }
            var res = [];
            res = this.agent.world.find(this.filter, this.selector);
            if (this.selector == 'all') {
                this.agent.prop[this.result] = [];
                for (let r of res) {
                    this.agent.prop[this.result].push(r._id);
                }
                return true;
            }
            var agent = null;
            if (this.selector == 'first' && res.length > 0) {
                agent = res[0];
            }
            if (this.selector == 'last' && res.length > 0) {
                agent = res[res.length - 1];
            }
            if (this.selector == 'random' && res.length > 0) {
                agent = res[0];
            }
            this.agent.prop[this.result] = agent;
            return true;
        }
        copy(data) {
            return super.copy(data);
        }
        json(children = false) {
            var js = super.json(children);
            js.selector = this.selector;
            return js;
        }
    }
    clinamen.Find = Find;
    class Condition extends Decorator {
        constructor(data) {
            super(data);
            this.type = 'condition';
        }
        testCondition() {
            if (!this.child) {
                return false;
            }
            var target = !this.target ? this.agent : this.agent.world.agentIndex[this.target._id];
            return this.filterEval(target, this.filter);
        }
    }
    clinamen.Condition = Condition;
    class Count extends Decorator {
        constructor(data) {
            super(data);
            this.type = "count";
            this.test = data.test || null;
            this.selector = data.selector || 'all';
        }
        next(stack) {
            if (!this.child || stack.state === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack);
            }
            if (!this.count()) {
                return this.failure(stack);
            }
            stack.state = clinamen.RUNNING;
            stack.push(this.child);
            return clinamen.RUNNING;
        }
        count() {
            if (!this.result && !this.test) {
                return false;
            }
            var res = this.agent.world.find(this.filter, this.selector).length;
            if (this.result) {
                this.agent.prop[this.result] = res;
            }
            if (this.test) {
                return this.op[this.test.op](res, this.test.val);
            }
            return true;
        }
        run() {
            return false;
        }
    }
    clinamen.Count = Count;
    class Succeeder extends Decorator {
        next(stack) {
            if (stack.state === clinamen.RUNNING) {
                stack.push(this.child);
                return clinamen.RUNNING;
            }
            return this.success(stack);
        }
        run() {
            this.child.run();
            return true;
        }
    }
    clinamen.Succeeder = Succeeder;
    class Failer extends Decorator {
        next(stack) {
            if (stack.state === clinamen.RUNNING) {
                stack.push(this.child);
                return clinamen.RUNNING;
            }
            return this.failure(stack);
        }
        run() {
            this.child.run();
            return false;
        }
    }
    clinamen.Failer = Failer;
    class RepeatUntilSucceeds extends Decorator {
        constructor(data) {
            super(data);
            this.type = "repeatuntilsucceeds";
        }
        next(stack) {
            if (!this.child) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack);
            }
            if (stack.last()._id != this.child._id) {
                stack.push(this.child);
            }
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            if (this.child.run()) {
                return true;
            }
        }
    }
    clinamen.RepeatUntilSucceeds = RepeatUntilSucceeds;
    class RepeatUntilFail extends Decorator {
        constructor(data) {
            super(data);
            this.type = "repeatuntilfails";
        }
        next(stack) {
            if (!this.child) {
                return this.failure(stack);
            }
            if (stack.state === clinamen.FAILURE) {
                return this.failure(stack);
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

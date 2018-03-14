/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Composite extends clinamen.Node {
        constructor(data) {
            super(data);
            this.children = [];
            this.index = 0;
            this.mainType = 'composite';
            this.type = 'composite';
            this.agent = data.agent || null;
            this.setChildren(data);
        }
        setChildren(data) {
            if (data.children) {
                for (let c of data.children) {
                    this.add(c);
                }
            }
            return this;
        }
        setAgent(agent) {
            if (agent != null) {
                this.agent = agent;
                this.agent.childrenIndex[this.id] = this;
                if (this.children != null) {
                    for (let c of this.children) {
                        c.setAgent(agent);
                    }
                }
            }
            return this;
        }
        add(node) {
            let child;
            if (!(node instanceof Composite)) {
                child = this.nodeConstructor(node);
            }
            child.setAgent(this.agent);
            this.children.push(child);
            return this;
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
    }
    clinamen.Composite = Composite;
    class Selector extends Composite {
        constructor(data) {
            super(data);
            this.type = "selector";
        }
        next(stack) {
            if (!stack) {
                stack = this.stack;
            }
            if (stack.state === clinamen.SUCCESS) {
                return this.success(stack);
            }
            if (this.index >= this.children.length) {
                return this.failure(stack);
            }
            var nextNode = this.children[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            for (let c of this.children) {
                if (c.run()) {
                    return true;
                }
            }
            return false;
        }
    }
    clinamen.Selector = Selector;
    class Sequence extends Composite {
        constructor(data) {
            super(data);
            this.type = "sequence";
        }
        next(stack) {
            if (!stack) {
                stack = this.stack;
            }
            if (stack.state === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (this.index >= this.children.length) {
                return this.success(stack);
            }
            var nextNode = this.children[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            for (let c of this.children) {
                if (!c.run()) {
                    return false;
                }
            }
            return true;
        }
    }
    clinamen.Sequence = Sequence;
    class RandomSelector extends Composite {
        constructor(data) {
            super(data);
            this.rchildren = null;
            this.type = "randomSelector";
        }
        next(stack) {
            if (!this.rchildren) {
                this.rchildren = this.shuffle(this.children);
            }
            if (stack.state === clinamen.SUCCESS) {
                this.rchildren = null;
                return this.success(stack);
            }
            if (this.index >= this.children.length) {
                this.rchildren = null;
                return this.failure(stack);
            }
            var nextNode = this.rchildren[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            var rchildren = this.shuffle(this.children);
            for (let c of rchildren) {
                if (c.run()) {
                    return true;
                }
            }
            return false;
        }
    }
    clinamen.RandomSelector = RandomSelector;
    class RandomSequence extends Composite {
        constructor(data) {
            super(data);
            this.rchildren = null;
            this.type = "randomSequence";
        }
        next(stack) {
            if (!this.rchildren) {
                this.rchildren = this.shuffle(this.children);
            }
            if (stack.state === clinamen.FAILURE) {
                this.rchildren = null;
                return this.failure(stack);
            }
            if (this.index >= this.children.length) {
                this.rchildren = null;
                return this.success(stack);
            }
            var nextNode = this.rchildren[this.index];
            this.index++;
            stack.push(nextNode);
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            var rchildren = this.shuffle(this.children);
            for (let c of rchildren) {
                if (!c.run()) {
                    return false;
                }
            }
            return true;
        }
    }
    clinamen.RandomSequence = RandomSequence;
})(clinamen || (clinamen = {}));

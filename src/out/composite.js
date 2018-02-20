var clinamen;
(function (clinamen) {
    class Composite extends clinamen.Node {
        constructor(data) {
            super(data);
            this.children = [];
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
    }
    clinamen.Composite = Composite;
    class Selector extends Composite {
        constructor(data) {
            super(data);
            this.type = "selector";
        }
        fail(stack) {
            //stack.last().index++;
            return this;
        }
        success(stack) {
            stack.last().index = 0;
            stack.pop();
            if (stack.length > 0) {
                stack.last().node.success(stack);
            }
            return this;
        }
        next(stack) {
            if (!stack) {
                stack = this.stack;
            }
            var index = stack.last().index;
            var previous = stack.last();
            if (index < this.children.length) {
                stack.push(this.children[index]);
                previous.index++;
            }
            else {
                stack.pop();
                if (stack.length > 0) {
                    stack.last().node.fail(stack);
                }
            }
            return this;
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
        success(stack) {
            //stack.last().index++;
            return this;
        }
        fail(stack) {
            stack.pop();
            if (stack.length > 0) {
                stack.last().node.fail(stack);
            }
            return this;
        }
        next(stack) {
            if (!stack) {
                stack = this.stack;
            }
            if (stack.done) {
                stack.done = false;
            }
            var previous = stack.last();
            var index = previous.index;
            if (index < this.children.length) {
                stack.push(this.children[index]);
                previous.index++;
            }
            else {
                stack.pop();
                if (stack.length > 0) {
                    stack.last().node.success(stack);
                }
            }
            return this;
        }
        run() {
            console.log(this.children.length);
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
            this.type = "randomSelector";
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
            this.type = "randomSequence";
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

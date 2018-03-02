import { RUNNING, SUCCESS, FAILURE, Node } from "export";
export class Composite extends Node {
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
}
export class Selector extends Composite {
    constructor(data) {
        super(data);
        this.type = "selector";
    }
    tick(stack) {
        if (!stack) {
            stack = this.stack;
        }
        if (stack.state === SUCCESS) {
            stack.state = SUCCESS;
            stack.pop();
            this.index = 0;
            return SUCCESS;
        }
        if (this.index >= this.children.length) {
            stack.state = FAILURE;
            stack.pop();
            this.index = 0;
            return FAILURE;
        }
        var next = this.children[this.index];
        this.index++;
        stack.push(next);
        stack.state = RUNNING;
        return RUNNING;
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
export class Sequence extends Composite {
    constructor(data) {
        super(data);
        this.type = "sequence";
    }
    tick(stack) {
        if (!stack) {
            stack = this.stack;
        }
        if (stack.state === FAILURE) {
            stack.state = FAILURE;
            stack.pop();
            this.index = 0;
            return FAILURE;
        }
        if (this.index >= this.children.length) {
            stack.state = SUCCESS;
            stack.pop();
            this.index = 0;
            return SUCCESS;
        }
        var next = this.children[this.index];
        this.index++;
        stack.push(next);
        stack.state = RUNNING;
        return RUNNING;
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
export class RandomSelector extends Composite {
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
export class RandomSequence extends Composite {
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

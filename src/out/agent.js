import { RUNNING, SUCCESS, FAILURE, Node, Composite } from "export";
export class Agent extends Node {
    //children: Array<Composite> = [];
    constructor(data) {
        super(data);
        this.mainType = 'agent';
        this.type = data.type || 'agent';
        this.template = data.template || this.type;
        this.world = data.world;
        this.childrenIndex = {};
        if (data.children != null) {
            for (let c of data.children) {
                this.add(c);
            }
        }
    }
    add(node) {
        if (this.children.length == 0) {
            if (node instanceof Composite) {
                this.children.push(node);
            }
            else {
                this.children.push(this.nodeConstructor(node));
            }
            this.children[0].setAgent(this);
        }
        return this;
    }
    removeChildIndex(id) {
        if (this.childrenIndex[id]) {
            this.childrenIndex[id] = null;
            delete this.childrenIndex[id];
        }
        return this;
    }
    find(filter) {
        return this.world.find(filter);
    }
    act(action, value) {
        this.stack.state = RUNNING;
        if (this[action]) {
            return this[action](value);
        }
        this.stack.state = FAILURE;
        return FAILURE;
    }
    wait() {
        return true;
    }
    //{prop:['teste','prop'],val}
    //{prop:'teste',val:15}
    //{prop:[['teste','teste2'],'g'],val:16}
    change(val) {
        var prop = this.prop;
        var propName = val.prop;
        if (val.prop instanceof Array) {
            var ob = this.prop;
            for (let p of val.prop[0]) {
                if (!ob[p]) {
                    ob[p] = {};
                }
                ob = ob[p];
            }
            prop = ob;
            propName = val.prop[1];
        }
        prop[propName] = val.val;
        this.stack.state = SUCCESS;
        return SUCCESS;
    }
    tick(stack = null) {
        if (this.children.length == 0) {
            return FAILURE;
        }
        if (this.stack.length == 0) {
            this.stack.push(this.children[0]);
        }
        return this.stack.tick();
    }
    run() {
        if (this.children.length > 0) {
            return this.children[0].run();
        }
        return false;
    }
    json() {
        var js = super.json();
        js.template = this.template;
        return js;
    }
}

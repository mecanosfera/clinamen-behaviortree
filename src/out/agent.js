/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Agent extends clinamen.Node {
        //children: Array<Composite> = [];
        constructor(data) {
            super(data);
            this.childrenIndex = {};
            this.nameIndex = {};
            this.mainType = 'agent';
            this.type = data.type || 'agent';
            if (data.children != null) {
                for (let c of data.children) {
                    this.add(c);
                }
            }
        }
        add(node) {
            var child;
            if (node instanceof clinamen.Composite) {
                child = node;
            }
            else {
                child = this.nodeConstructor(node);
            }
            this.children.push(child);
            this.childrenIndex[child._id] = child;
            if (child.name != child.type) {
                this.nameIndex[child.name] = child;
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
            if (this[action]) {
                return this[action](value);
            }
            return clinamen.FAILURE;
        }
        wait() {
            return true;
        }
        tick(stack) {
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
            var res = last.next(stack);
            if (last.type == 'action') {
                if (res === clinamen.SUCCESS || res === clinamen.RUNNING) {
                    return res;
                }
            }
            return this.tick(stack);
        }
        //{prop:['teste','prop'],val}
        //{prop:'teste',val:15}
        //{prop:[['teste','teste2'],'g'],val:16}
        //mudar prop ou outras coisas?
        change(filter) {
            if (!filter.create && !this.prop[filter.prop]) {
                return clinamen.FAILURE;
            }
            if (!filter.op) {
                this.prop[filter.prop] = filter.val;
                return clinamen.SUCCESS;
            }
            if (!this.prop[filter.prop]) {
                this.prop[filter.prop] = 0;
            }
            if (filter.op === '+') {
                this.prop[filter.prop] += filter.val;
                return clinamen.SUCCESS;
            }
            if (filter.op === '-') {
                this.prop[filter.prop] -= filter.val;
                return clinamen.SUCCESS;
            }
            if (filter.op === '*') {
                this.prop[filter.prop] *= filter.val;
                return clinamen.SUCCESS;
            }
            if (filter.op === '/') {
                this.prop[filter.prop] /= filter.val;
                return clinamen.SUCCESS;
            }
            return clinamen.SUCCESS;
        }
        next(stack = null) {
            if (this.children.length == 0) {
                return clinamen.FAILURE;
            }
            if (this.stack.length == 0) {
                this.stack.push(this.children[0]);
            }
            return this.stack.next();
        }
        run() {
            if (this.children.length > 0) {
                return this.children[0].run();
            }
            return false;
        }
        copy(data) {
            return super.copy(data);
        }
        json(children = true) {
            var js = super.json(children);
            return js;
        }
    }
    clinamen.Agent = Agent;
})(clinamen || (clinamen = {}));

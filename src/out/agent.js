/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Agent extends clinamen.Node {
        //children: Array<Composite> = [];
        constructor(data) {
            super(data);
            this.mainType = 'agent';
            this.type = data.type || 'agent';
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
                if (node instanceof clinamen.Composite) {
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
            this.stack.state = clinamen.RUNNING;
            if (this[action]) {
                return this[action](value);
            }
            this.stack.state = clinamen.FAILURE;
            return clinamen.FAILURE;
        }
        wait() {
            return true;
        }
        tick(stack) {
            if (stack.length == 0) {
                return stack.state;
            }
            var last = stack.last();
            var res = last.next(stack);
            //if(last.type=='action' && )
            //var res:number = stack.last().next(stack);
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
                        //					ob[p] = {};
                    }
                    //			ob = ob[p];
                }
                prop = ob;
                propName = val.prop[1];
            }
            prop[propName] = val.val;
            this.stack.state = clinamen.SUCCESS;
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
        copy() {
            return super.copy();
        }
        json(children = true) {
            var js = super.json();
            js.template = this.template;
            return js;
        }
    }
    clinamen.Agent = Agent;
})(clinamen || (clinamen = {}));

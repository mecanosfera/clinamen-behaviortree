/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class Action extends clinamen.Composite {
        constructor(data) {
            super(data);
            this.mainType = 'action';
            this.type = data.type || 'action';
            this.target = data.target || 'self';
            this.act = data.act || 'wait';
            this.value = data.value || {};
        }
        setChildren(node) {
            this.children = null;
            return this;
        }
        add(node) {
            return this;
        }
        next(stack) {
            var res;
            if (!this.target) {
                res = this.agent.act(this.act, this.value);
            }
            else if (this.agent.world.agentIndex[this.target]) {
                res = this.agent.world.agentIndex[this.target].act(this.act, this.value);
            }
            else {
                res = clinamen.FAILURE;
            }
            if (res === clinamen.FAILURE) {
                return this.failure(stack);
            }
            if (res === clinamen.SUCCESS) {
                return this.success(stack);
            }
            stack.state = clinamen.RUNNING;
            return clinamen.RUNNING;
        }
        run() {
            return true;
            /*if(this.target=='self'){
                return this.agent.act(this.act,this.value);
            }
            if(this.target=='world'){
                return this.agent.world.act(this.act,this.value);
            }
            if(!this.agent.world.agentIndex[this.target]){
                return false;
            }
            return this.agent.world.agentIndex[this.target].act(this.act,this.value);*/
        }
        copy(data) {
            return super.copy(data);
        }
        copyJson(data) {
            var js = this.json(false);
            js._id = this.uuid();
            js.name = data.name || js.name;
            return js;
        }
        json(children = true) {
            var js = super.json(children);
            js.target = this.target;
            js.act = this.act;
            js.value = this.value;
            return js;
        }
    }
    clinamen.Action = Action;
})(clinamen || (clinamen = {}));

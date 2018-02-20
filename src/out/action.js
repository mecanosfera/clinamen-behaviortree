var clinamen;
(function (clinamen) {
    class Action extends clinamen.Composite {
        constructor(data) {
            super(data);
            this.mainType = 'action';
            this.type = data.type || 'action';
            this.target = data.target || 'self';
            this.act = data.act || 'wait';
            this.value = data.value || null;
        }
        setChildren(node) {
            this.children = null;
            return this;
        }
        add(node) {
            return this;
        }
        next(stack) {
            stack.pop();
            if (this.run()) {
                stack.done = true;
                stack.last().node.success(stack);
            }
            else {
                stack.last().node.fail(stack);
            }
            return this;
        }
        run() {
            if (this.target == 'self') {
                return this.agent.act(this.act, this.value);
            }
            if (this.target == 'world') {
                return this.agent.world.act(this.act, this.value);
            }
            if (!this.agent.world.agentIndex[this.target]) {
                return false;
            }
            return this.agent.world.agentIndex[this.target].act(this.act, this.value);
        }
        json() {
            var js = super.json();
            js.target = this.target;
            js.act = this.act;
            js.value = this.value;
            return js;
        }
    }
    clinamen.Action = Action;
})(clinamen || (clinamen = {}));

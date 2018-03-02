import { RUNNING, FAILURE, Composite } from "export";
export class Action extends Composite {
    constructor(data) {
        super(data);
        this.waitingReponse = false;
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
    tick(stack) {
        if (stack.state !== RUNNING) {
            stack.pop();
            this.waitingReponse = false;
            return stack.state;
        }
        if (!this.waitingReponse) {
            this.waitingReponse = true;
            if (this.target == 'self') {
                this.agent.act(this.act, this.value);
            }
            else if (this.target == 'world') {
                this.agent.world.act(this.act, this.value);
            }
            else {
                if (!this.agent.world.agentIndex[this.target]) {
                    stack.state = FAILURE;
                    stack.pop();
                    return FAILURE;
                }
                this.agent.world.agentIndex[this.target].act(this.act, this.value);
            }
        }
        stack.state = RUNNING;
        return RUNNING;
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
    json() {
        var js = super.json();
        js.target = this.target;
        js.act = this.act;
        js.value = this.value;
        return js;
    }
}

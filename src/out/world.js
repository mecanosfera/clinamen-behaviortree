/// <reference path='./node.ts' />
var clinamen;
(function (clinamen) {
    class World extends clinamen.Node {
        constructor(data) {
            super(data);
            this.agentIndex = {};
            this.children = [];
            this.mainType = 'world';
            this.type = data.type || 'world';
        }
        setChildren(data) {
            if (data.children) {
                for (let c of data.childre) {
                    this.add(c);
                }
            }
        }
        add(data) {
            var ag;
            if (!(data instanceof clinamen.Node)) {
                ag = new clinamen.Agent(data);
            }
            else {
                ag = data;
            }
            ag.world = this;
            this.children.push(ag);
            if (ag._id) {
                this.agentIndex[ag._id] = ag;
            }
            return this;
        }
        next(stack = null) {
            for (let agent of this.children) {
                agent.next();
            }
            return clinamen.SUCCESS;
        }
        run() {
            for (let c of this.children) {
                c.run();
            }
            return true;
        }
        find(filter, selector = 'all') {
            if (!filter) {
                return this.children;
            }
            else {
                var r = [];
                for (let c of this.children) {
                    if (this.filterEval(c, filter)) {
                        r.push(c);
                    }
                }
                return r;
            }
        }
    }
    clinamen.World = World;
})(clinamen || (clinamen = {}));

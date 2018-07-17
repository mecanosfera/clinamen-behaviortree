/// <reference path='./node.ts' />

namespace clinamen {



  export class World extends Node{

    agentIndex: Dict<Agent> = {};
    children: Array<Agent> = [];

    constructor(data){
      super(data);
      this.mainType = 'world';
  		this.type = data.type || 'world';
    }

    setChildren(data):void{
      if(data.children){
        for(let c of data.childre){
          this.add(c);
        }
      }
    }


    add(data:JsonData | Node){
      var ag:Agent;
      if(!(data instanceof Node)){
        ag = new Agent(data);
      } else {
        ag = data as Agent;
      }
      ag.world = this;
      this.children.push(ag);
      if(ag._id){
        this.agentIndex[ag._id] = ag;
      }
      return this;
    }

    next(stack:Stack=null):number{
      for(let agent of this.children){
        agent.next();
      }
      return SUCCESS;
    }


    run(){
      for(let c of this.children){
        c.run();
      }
      return true;
    }

    find(filter:Filter,selector:string='all'):Array<Agent>{
      if(!filter){
        return this.children as Array<Agent>;
      } else {
        var r:Array<Agent> = [];
        for(let c of this.children){
          if(this.filterEval(c,filter)){
            r.push(c as Agent);
          }
        }
        return r;
      }
    }


  }
}

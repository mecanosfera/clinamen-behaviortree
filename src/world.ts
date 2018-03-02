import {RUNNING, SUCCESS, FAILURE, Dict, Stack, Node, Agent, Composite, Decorator, Selector, Sequence, RandomSelector,RandomSequence,Count,Find,Condition, Limit, Inverter, Action} from "export";

export interface DictAgent{
  [index:string]:Agent;
}

export class World extends Node{

  instances: any[];
  templates: any;
  started: boolean = false;
  agentIndex: DictAgent = {};
  ///children: Agent[];

  constructor(data){
    super(data);
    this.mainType = 'world';
		this.type = data.type || 'world';
    this.children = [];

    if(data.instances){
        for(let i of data.instances){
          this.instances.push(i);
        }
    }

    if(data.templates){
      for(let t of data.templates){
        this.templates[t["name"]] = t;
      }
    }
  }

  act(action:string,value:any):boolean{
    return false;
  }

  start(){
    if(this.children.length==0){
      for(let a of this.instances){
        this.startInstance(a);
      }
      this.started=true;
    }
    return this;
  }

  startInstance(instance){
    if(this.templates[instance.template]){
      var ag = new Agent(this.templates[instance.template]);
      ag.id = instance.id || ag.id;
      ag.name = instance.name || instance.template;
      ag.template = instance.template;
      ag.world = this;
      if(instance.prop){
        ag.prop = instance.prop;
      }
      this.agentIndex[ag.id] = ag;
      this.children.push(ag);
    }
    return this;
  }

  add(data){
    if(data.template){
      this.templates[data.template[name]] = data.template;
    }
    if(data.instance){
      this.instances.push(data.instance);
      if(this.started){
        //this.setInstance(data.instance);
      }
    }
    return this;
  }

  tick(stack:Stack=null):number{
    for(let agent of this.children){
      agent.tick();
    }
    return SUCCESS;
  }


  run(){
    for(let c of this.children){
      c.run();
    }
    return true;
  }

  find(filter){
    if(filter=={}){
      return this.children;
    } else {
      var r = [];
      for(let c of this.children){

      }
      return r;
      //implement
    }
  }

  json(){
    var js = super.json();
    js.instances = [];
    for(let a of this.instances){
      var name = null;
      if(a.name!=null){
        name = a.name;
      }
      js.instances.push({
        template: a.template,
        name: name,
        position: a.position
      });
    }
    js.templates = [];
    for(let t in this.templates){
      js.templates.push(this.templates[t]);
    }
    return js;

  }

}

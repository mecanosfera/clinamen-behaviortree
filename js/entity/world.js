var Node = require('./node.js');

class World extends Node{

  init(args){
      super.init(args);
      this.mainType = 'world';
  		this.type = args.type || 'world';
      this.instances = [];
      this.templates = {};
      this.children = [];
      this.started = false;

      if(args.instances!=null){
          for(let i of args.instances){
            this.instances.push(i);
          }
      }

      if(args.templates!=null){
        for(let t of args.templates){
          this.templates[t["name"]] = t;
        }
      }
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
      ag.name = instance.name || instance.template;
      ag.template = instance.template;
      ag.world = this;
      if(instance.prop){
        ag.prop = instance.prop;
      }
      this.children.push(ag);
    }
    return this;
  }

  add(args){
    if(args.template){
      this.templates[args.template[name]] = args.template;
    }
    if(args.instance){
      this.instances.push(args.instance);
      if(this.started){
        this.setInstance(args.instance);
      }
    }
    return this;
  }


  run(iterator=false){
    for(let c of this.children){
      c.run(iterator);
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
    for(a of this.instances){
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
    for(t in this.templates){
      js.templates.push(this.templates[t]);
    }
    return js;

  }

}

module.exports = World;

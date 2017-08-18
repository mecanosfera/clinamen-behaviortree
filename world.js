class World extends Entity{

  init(args){
      super.init(args);
      this.mainType = 'world';
  		this.type = args.type || 'world';
      this.instances = [];
      this.templates = {};
      this.children = [];

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
        var ag = new Agent(this.templates[a.template]);
        if(a.name!=null){
          ag.name = a.name;
        } else {
          ag.name = a.template;
        }
        ag.template = a.template;
        ag.world = this;
        if(a.prop!=null){
          ag.prop = a.prop;
        }
        this.children.push(ag);
      }
    }
  }

  remove(){

  }

  run(iterator=false){
    for(let c of this.children){
      c.run(iterator);
    }
  }

  find(filter){
    if(filter=={}){
      return this.children;
    } else {

    }
  }


  toJson(){
    var js = super.toJson();
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

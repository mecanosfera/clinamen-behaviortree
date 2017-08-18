var Entity = require('./entity.js');

class Behavior extends Entity{

	init(args){
		super.init(args);
		this.mainType = 'behavior';
		this.type = 'behavior';
		this.temp = args.temp || true;
		this.agent = args.agent || null;
		this.children = [];
		this.setChildren(args);
	}

	setChildren(args){
		if(args.children!=null){
			for(let c of args.children){
				this.add(c);
			}
		}
	}

	setAgent(agent){
		if(agent!=null){
			this.agent = agent;
			if(this.children!=null){
				for(let c of this.children){
					c.setAgent(agent);
				}
			}
		}
	}

	add(behavior){
		var child = behavior;
		if(!(behavior instanceof Behavior)){
			child = this.behaviorConstructor(behavior);
		}
		child.setAgent(this.agent);
		this.children.push(child);
	}


}


class Selector extends Behavior{

	init(args){
		super.init(args);
		this.type="selector";
	}

	run(iterator=false){
		for(let c of this.children){
			if(c.run(iterator)){
				return true;
			}
		}
		return false;
	}

}


class Sequence extends Behavior{

	init(args){
		super.init(args);
		this.type="sequence";
	}

	run(iterator=false){
		if(!iterator){
			for(let c of this.children){
				if(!c.run(iterator)){
					return false;
				}
			}
		} else {
			//iterating code
		}
		return true;
	}
}


class RandomSelector extends Behavior {

	init(args){
		super.init(args);
		this.type="randomSelector";
	}

	run(iterator=false){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(c.run(iterator)){
				return true;
			}
		}
		return false;
	}

}

class RandomSequence extends Behavior {

	init(args){
		super.init(args);
		this.type="randomSequence";
	}

	run(iterator=false){
		var rchildren = this.shuffle(this.children);
		for(let c of rchildren){
			if(!c.run(iterator)){
				return false;
			}
		}
		return true;
	}

}

module.exports = {
	behavior: Behavior,
	selector: Selector,
	sequence: Sequence
};

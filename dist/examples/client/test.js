//var clinamen = require('/clinamen-bt.js');
var Agent = clinamenbt.Agent;
var Selector = clinamenbt.Selector;
var Sequence = clinamenbt.Sequence;
var Condition = clinamenbt.Condition;
var Action = clinamenbt.Action;

class TuringMachine extends Agent {

  printHead(){
    var st = 'TAPE( '+this.prop.state+' ): '+this.prop.tape;
    var hd = 'HEAD( '+this.prop.head+' ): ';
    for(let i=0;i<this.prop.index;i++){
      hd+=' ';
    }
    hd+='^';
    console.log(st);
    console.log(hd);
    console.log('----------');
  }

  left(){
    if(this.prop.index>0){
      this.prop.index--;
      this.prop.head = this.prop.tape[this.prop.index];
      this.printHead();
      return true;
    }
    return false;
  }

  right(){
    this.prop.index++;
    if(this.prop.index>=this.prop.tape.length){
      this.prop.tape += '_';
    }
    this.prop.head = this.prop.tape[this.prop.index];
    this.printHead();
    return true;
  }

  write(value){
    var str = '';
    for(let i=0;i<this.prop.tape.length;i++){
      if(i==this.prop.index){
        str += value;
      } else {
        str += this.prop.tape[i];
      }
    }
    this.prop.tape = str;
    this.prop.head = this.prop.tape[this.prop.index];
    this.printHead();
    return true;
  }

  change(val){
    var res = super.change(val);
    console.log('??? '+res);
    this.printHead();
    return res;

  }

}



var machine1 =
    {
      mainType: 'agent',
      type:'agent',
      template: 'turing_machine',
      prop:{
        state: 'b',
        head: null,
        index: 0,
        tape: '_'
      },
      children:[
        {
          type:'selector',
          children: [
            {
              type:'condition',
              filter: {prop:'state', op:'==', val:'b'},
              child:
                {
                  type:'sequence',
                  children: [
                    {
                      type: 'action',
                      act: 'write',
                      value: '0'
                    },
                    {
                      type: 'action',
                      act: 'right'
                    },
                    {
                      type: 'action',
                      act: 'change',
                      value: {
                        state : 'c'
                      }
                    }
                  ]
                }
            },
            {
              type:'condition',
              filter: {prop:'state', op:'==', val:'c'},
              child:
                {
                  type:'sequence',
                  children: [
                    {
                      type: 'action',
                      act: 'right'
                    },
                    {
                      type: 'action',
                      act: 'change',
                      value: {
                        state : 'e'
                      }
                    }
                  ]
                }
            },
            {
              type:'condition',
              filter: {prop:'state', op:'==', val:'e'},
              child:
                {
                  type:'sequence',
                  children: [
                    {
                      type: 'action',
                      act: 'write',
                      value: '1'
                    },
                    {
                      type: 'action',
                      act: 'right'
                    },
                    {
                      type: 'action',
                      act: 'change',
                      value: {
                        state : 'f'
                      }
                    }
                  ]
                }
            },
            {
              type:'condition',
              filter: {prop:'state', op:'==', val:'f'},
              child:
                {
                  type:'sequence',
                  children: [
                    {
                      type: 'action',
                      act: 'right'
                    },
                    {
                      type: 'action',
                      act: 'change',
                      value: {
                        state : 'b'
                      }
                    }
                  ]
                }
            }

          ]
        }
      ]
    }


var machine2 = new TuringMachine({
      name: 'machine2',
      prop: {
        state: 'b',
        tape: '_',
        index: 0,
        head: '_'
      }
    }
  )
  .add(new Selector({name:"first"})
    .add(new Condition({filter: {prop:'state',op:'==',val:'b'}})
      .add(new Condition({filter: {prop:'head',op:'==',val:'_'}})
        .add(new Sequence()
          .add(new Action({act: 'write',value: 'e'}))
          .add(new Action({act: 'right'}))
          .add(new Action({act: 'write',value: 'e'}))
          .add(new Action({act: 'right'}))
          .add(new Action({act: 'write',value: '0'}))
          .add(new Action({act: 'right'}))
          .add(new Action({act: 'right'}))
          .add(new Action({act: 'write',value: '0'}))
          .add(new Action({act: 'left'}))
          .add(new Action({act: 'left'}))
          .add(new Action({act: 'change',value: {state:'o'}}))
          )
        )
      )
      .add(new Condition({filter: {prop:'state',op:'==',val:'o'}})
        .add(new Selector()
          .add(new Condition({filter: {prop:'head',op:'==',val:'1'}})
            .add(new Sequence()
              .add(new Action({act:'right'}))
              .add(new Action({act:'write',value:'x'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'change',value:{state:'o'}}))
            )
          )
          .add(new Condition({filter: {prop:'head',op:'==',val:'0'}})
            .add(new Action({act:'change',value:{state:'q'}}))
          )
        )
      )
      .add(new Condition({filter: {prop:'state',op:'==',val:'q'}})
        .add(new Selector()
          .add(new Condition({filter: {prop:'head',op:'==',val:'_'}})
            .add(new Sequence()
              .add(new Action({act:'write',value:'1'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'change',value:{state:'p'}}))
            )
          )
          .add(new Condition({filter: {prop:'head',op:'==',val:'0'}})
            .add(new Sequence()
              .add(new Action({act:'right'}))
              .add(new Action({act:'right'}))
              .add(new Action({act:'change',value:{state:'q'}}))
            )
          )
          .add(new Condition({filter: {prop:'head',op:'==',val:'1'}})
            .add(new Sequence()
              .add(new Action({act:'right'}))
              .add(new Action({act:'right'}))
              .add(new Action({act:'change',value:{state:'q'}}))
            )
          )
        )
      )
      .add(new Condition({filter: {prop:'state',op:'==',val:'p'}})
        .add(new Selector()
          .add(new Condition({filter: {prop:'head',op:'==',val:'x'}})
            .add(new Sequence()
              .add(new Action({act:'write',value:'_'}))
              .add(new Action({act:'right'}))
              .add(new Action({act:'change',value:{state:'q'}}))
            )
          )
          .add(new Condition({filter: {prop:'head',op:'==',val:'e'}})
            .add(new Sequence()
              .add(new Action({act:'right'}))
              .add(new Action({act:'change',value:{state:'f'}}))
            )
          )
          .add(new Condition({filter: {prop:'head',op:'==',val:'_'}})
            .add(new Sequence()
              .add(new Action({act:'left'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'change',value:{state:'p'}}))
            )
          )
        )
      )
      .add(new Condition({filter: {prop:'state',op:'==',val:'f'}})
        .add(new Selector()
          .add(new Condition({filter: {prop:'head',op:'==',val:'_'}})
            .add(new Sequence()
              .add(new Action({act:'write',value:'0'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'left'}))
              .add(new Action({act:'change',value:{state:'o'}}))
            )
          )
          .add(new Sequence()
            .add(new Action({act:'right'}))
            .add(new Action({act:'right'}))
            .add(new Action({act:'change',value:{state:'f'}}))
          )
        )
      )
  );

  //console.log(JSON.stringify(machine2.json()));

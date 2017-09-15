var clinamenbt = require('../../../index.js');//var clinamen = require('/clinamen-bt.js');
var Agent = clinamenbt.Agent;

class TuringMachine extends Agent {

  left(){
    if(this.prop.index>0){
      this.prop.index--;
      this.prop.head = this.prop.tape[this.prop.index];
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
    return true;
  }

  write(value){
    var str = '';
    for(let i=0;i<this.prop.tape.length;i++){
      if(i==this.prop.index){
        str += value;
      } else {
        str = this.prop.tape[i];
      }
    }
    this.prop.tape = str;
    console.log(this.prop.state+'('+this.prop.head+'): '+this.prop.tape);
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
        position: 0,
        tape: ''
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


    var tmachine1 = new TuringMachine(machine1);

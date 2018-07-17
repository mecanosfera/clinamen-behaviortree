/// <reference path='./node.ts' />

namespace clinamen {

  export interface Vector2 {
    x:number,
    y:number
  }

  export interface Dict<T>{
    [index:string]:T
  }

  export interface JsonData{
    [index:string]:any;
  }

  export interface NodeData{
    type:string;
    [index:string]:any;
  }

  export interface DictOp{
    [index:string]:Function
  }

  export interface Prop{
    [index:string]: any;
  }

  export interface Filter{
    prop: string;
    op?: string;
    val: number | string | boolean | null | Vector2 | Filter;
    mod?: string;
    create?: boolean;
  }



}

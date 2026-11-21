export type Mode = 'explore' | 'desk' | 'paused';
export type Command = {kind:'strike';char:string} | {kind:'backspace'|'enter'} | {kind:'select';workId:string} | {kind:'buy';upgrade:'arms'|'return'};
export interface Work { id:string; title:string; subtitle:string; lines:readonly {id:string;display:string;target:string}[];bonusCents:number }
export interface Progress {line:number;buffer:string;complete:boolean}
export interface State { schema:1;elapsed:number;workId:string;progress:Record<string,Progress>;cents:number;rewarded:Record<string,true>;armsLevel:number;automaticReturn:boolean;mechanism:{acceptedAt:number;readyAt:number;rejectedAt:number;rejectedChar:string|null} }
export interface FrameInput {moveX:number;moveZ:number;lookX:number;lookY:number;jump:boolean;interact:boolean;leave:boolean;commands:Command[]}
export interface Input {setMode(mode:Mode):void;sample():FrameInput;dispose():void}
export interface World { update(dt:number,input:FrameInput,mode:Mode,state:State):void;setMode(mode:Mode):void;canInteract():boolean;resize():void;dispose():void }
export interface Desk {render(state:State,mode:Mode):void;dispose():void}


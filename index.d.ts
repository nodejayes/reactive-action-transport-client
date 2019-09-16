declare module 'debug-logger' {
	export function debugLog(debugMode: any, ...message: any[]): void;

}
declare module 'socket' {
	import { Chars, EventHandler } from 'ts-tooling';
	import { IWebSocketAction } from 'reactive-action-transport-data'; class BackendSocket {
	    private _socket;
	    private _msgCache;
	    private _debug;
	    MessageStream: EventHandler<BackendSocket, IWebSocketAction<any>>;
	    setDebugMode(value: boolean): void;
	    Start(url: Chars): Promise<void>;
	    Send(data: IWebSocketAction<any>): void;
	    private connect;
	}
	export const RAT_BACKEND: BackendSocket;
	export {};

}
declare module 'action-stream' {
	import { IWebSocketAction } from 'web-socket-action';
	import { EventHandler } from 'ts-tooling'; class ActionStream {
	    private _stream;
	    private _hooks;
	    private _debug;
	    constructor();
	    setDebugMode(value: boolean): void;
	    dispatch(action: IWebSocketAction<any>): void;
	    hook(action: new (payload?: any) => IWebSocketAction<any>): EventHandler<ActionStream, IWebSocketAction<any>>;
	}
	export const RAT_ACTION_STREAM: ActionStream;
	export {};

}
declare module 'reactive-action-transport-client' {
	export { RAT_ACTION_STREAM } from 'action-stream';
	export { RAT_BACKEND } from 'socket';

}

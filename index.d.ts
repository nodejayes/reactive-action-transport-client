declare module 'socket' {
	import { Chars, EventHandler } from 'ts-tooling';
	import { IWebSocketAction } from 'reactive-action-transport-data'; class BackendSocket {
	    private _socket;
	    private _msgCache;
	    MessageStream: EventHandler<BackendSocket, IWebSocketAction<any>>;
	    Start(url: Chars): Promise<void>;
	    Send(data: IWebSocketAction<any>): void;
	    private connect;
	}
	export const BACKEND: BackendSocket;
	export {};

}
declare module 'action-stream' {
	import { IWebSocketAction } from 'web-socket-action';
	import { EventHandler } from 'ts-tooling'; class ActionStream {
	    private _stream;
	    private _hooks;
	    constructor();
	    dispatch(action: IWebSocketAction<any>): void;
	    hook(action: new () => IWebSocketAction<any>): EventHandler<ActionStream, IWebSocketAction<any>>;
	}
	export const ACTION_STREAM: ActionStream;
	export {};

}
declare module 'reactive-action-transport-client' {
	export { ACTION_STREAM } from 'action-stream';
	export { BACKEND } from 'socket';

}

import {IWebSocketAction} from 'web-socket-action';
import {Dictionary, EventHandler} from 'ts-tooling';
import {BACKEND} from './socket';
import {DispatchType} from 'reactive-action-transport-data';
import {debugLog} from "./debug-logger";

class ActionStream {
    private _stream = new EventHandler<ActionStream, IWebSocketAction<any>>(this);
    private _hooks = new Dictionary<EventHandler<ActionStream, IWebSocketAction<any>>>();
    private _debug = false;

    constructor() {
        this._stream.Subscribe((sender, a) => {
            debugLog(this._debug, '[reactive-action-transport-client]: get action from client stream ', a.type);
            if (this._hooks.ContainsKey(a.type.ToChars())) {
                debugLog(this._debug, '[reactive-action-transport-client]: invoke action ', a.type);
                this._hooks.GetObject()[a.type].Invoke(a);
            }
        });

        // Subscribe the Backend Stream to dispatch actions when it was a Action handled by Client
        BACKEND.MessageStream.Subscribe((sender, action) => {
            debugLog(this._debug, '[reactive-action-transport-client]: get action from backend ', action.type);
            if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.CLIENT) {
                debugLog(this._debug, '[reactive-action-transport-client]: is client action so it was dispatched ', action.type);
                this.dispatch(action);
            }
        });
    }

    setDebugMode(value: boolean): void {
        this._debug = value;
    }

    dispatch(action: IWebSocketAction<any>): void {
        // handle the action in the Client
        if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.CLIENT) {
            debugLog(this._debug, '[reactive-action-transport-client]: invoke stream', action);
            this._stream.Invoke(action);
        }
        // Send the Action to the Server when the Action was handled by Server
        if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.SERVER) {
            debugLog(this._debug, '[reactive-action-transport-client]: send backend', action);
            BACKEND.Send(action);
        }
    }

    hook(action: new (payload?: any) => IWebSocketAction<any>): EventHandler<ActionStream, IWebSocketAction<any>> {
        const key = new action().type.ToChars();
        if (!this._hooks.ContainsKey(key)) {
            debugLog(this._debug, '[reactive-action-transport-client]: add hook on action ', key);
            this._hooks.Add(key, new EventHandler<ActionStream, IWebSocketAction<any>>(this));
        }
        return this._hooks.GetObject()[key.Value];
    }
}

export const ACTION_STREAM = new ActionStream();

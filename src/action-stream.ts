import {IWebSocketAction} from 'web-socket-action';
import {Dictionary, EventHandler} from 'ts-tooling';
import {BACKEND} from './socket';
import {DispatchType} from 'reactive-action-transport-data';

class ActionStream {
    private _stream = new EventHandler<ActionStream, IWebSocketAction<any>>(this);
    private _hooks = new Dictionary<EventHandler<ActionStream, IWebSocketAction<any>>>();

    constructor() {
        this._stream.Subscribe((sender, a) => {
            if (this._hooks.ContainsKey(a.type.ToChars())) {
                this._hooks.GetObject()[a.type].Invoke(a);
            }
        });

        // Subscribe the Backend Stream to dispatch actions when it was a Action handled by Client
        BACKEND.MessageStream.Subscribe((sender, action) => {
            if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.CLIENT) {
                this.dispatch(action);
            }
        });
    }

    dispatch(action: IWebSocketAction<any>): void {
        // handle the action in the Client
        if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.CLIENT) {
            this._stream.Invoke(action);
        }
        // Send the Action to the Server when the Action was handled by Server
        if (action.dispatchOn === DispatchType.BOTH || action.dispatchOn === DispatchType.SERVER) {
            BACKEND.Send(action);
        }
    }

    hook(action: new (payload?: any) => IWebSocketAction<any>): EventHandler<ActionStream, IWebSocketAction<any>> {
        const key = new action().type.ToChars();
        if (!this._hooks.ContainsKey(key)) {
            this._hooks.Add(key, new EventHandler<ActionStream, IWebSocketAction<any>>(this));
        }
        return this._hooks.GetObject()[key.Value];
    }
}

export const ACTION_STREAM = new ActionStream();

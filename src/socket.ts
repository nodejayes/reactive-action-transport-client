import {Chars, Dictionary, List, LZCompression} from 'ts-tooling';
import {IWebSocketAction} from 'reactive-action-transport-data';

const RECONNECT_TIMEOUT = 500;

class BackendSocket {
    private _socket: WebSocket = null;
    private _actions: Dictionary<(payload: any, backend: BackendSocket) => void> = new Dictionary();
    private _msgCache = new List<IWebSocketAction<any>>();

    async Start(url: Chars): Promise<void> {
        await this.connect(url);
        setInterval(() => {
            if (this._msgCache.Count.Value < 1 || this._socket.readyState !== 1) {
                return;
            }
            const toDelete = new List<Chars>();
            for (const idx in this._msgCache.ToArray()) {
                const msg = this._msgCache.ElementAt(idx.ToInteger());
                this._socket.send(LZCompression.Compress(msg).Value);
                toDelete.Add(idx.ToChars());
            }
            for (const idx of toDelete.ToArray()) {
                this._msgCache.RemoveAt(idx.Value.ToInteger());
            }
        }, 20);
    }

    RegisterAction<T>(type: Chars, cb: (payload: T, backend: BackendSocket) => void): void {
        this._actions.Add(type, cb);
    }

    Send(data: IWebSocketAction<any>): void {
        this._msgCache.Add(data);
    }

    private connect(url: Chars): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._socket = new WebSocket(url.Value);
                this._socket.onmessage = (e) => {
                    const action = LZCompression.Decompress(new Chars(e.data)) as IWebSocketAction<any>;
                    const todo = this._actions.TryGetValue(action.type.ToChars());
                    if (!todo) {
                        console.warn(`action not found ${action.type}`);
                        return;
                    }
                    todo(action.payload, this);
                };
                this._socket.onerror = (err) => {
                    console.error(err);
                };
                this._socket.onclose = () => {
                    setTimeout(async () => await this.connect(url), RECONNECT_TIMEOUT);
                };
                resolve();
            } catch (err) {
                setTimeout(async () => await this.connect(url), RECONNECT_TIMEOUT);
            }
        });

    }
}

export const BACKEND = new BackendSocket();

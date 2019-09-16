import {Chars, EventHandler, List, LZCompression} from 'ts-tooling';
import {IWebSocketAction} from 'reactive-action-transport-data';
import {debugLog} from "./debug-logger";

const RECONNECT_TIMEOUT = 500;

class BackendSocket {
    private _socket: WebSocket = null;
    private _msgCache = new List<IWebSocketAction<any>>();
    private _debug = false;

    MessageStream = new EventHandler<BackendSocket, IWebSocketAction<any>>(this);

    setDebugMode(value: boolean): void {
        this._debug = value;
    }

    async Start(url: Chars): Promise<void> {
        await this.connect(url);
        setInterval(() => {
            if (this._msgCache.Count.Value < 1 || this._socket.readyState !== 1) {
                return;
            }
            const toDelete = new List<Chars>();
            for (const idx in this._msgCache.ToArray()) {
                const msg = this._msgCache.ElementAt(idx.ToInteger());
                debugLog(this._debug, '[reactive-action-transport-client]: send through socket', msg);
                this._socket.send(LZCompression.Compress(msg).Value);
                toDelete.Add(idx.ToChars());
            }
            for (const idx of toDelete.ToArray()) {
                this._msgCache.RemoveAt(idx.Value.ToInteger());
            }
        }, 20);
    }

    Send(data: IWebSocketAction<any>): void {
        debugLog(this._debug, '[reactive-action-transport-client]: add to message cache', data);
        this._msgCache.Add(data);
    }

    private connect(url: Chars): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._socket = new WebSocket(url.Value);
                this._socket.onmessage = (e) => {
                    debugLog(this._debug, '[reactive-action-transport-client]: get message try to decompress');
                    const action = LZCompression.Decompress(new Chars(e.data)) as IWebSocketAction<any>;
                    debugLog(this._debug, '[reactive-action-transport-client]: decompress ok invoke message');
                    this.MessageStream.Invoke(action);
                };
                this._socket.onerror = (err) => {
                    debugLog(this._debug, '[reactive-action-transport-client]: socket error!');
                    console.error(err);
                };
                this._socket.onclose = () => {
                    debugLog(this._debug, '[reactive-action-transport-client]: close socket');
                    setTimeout(async () => await this.connect(url), RECONNECT_TIMEOUT);
                };
                resolve();
            } catch (err) {
                debugLog(this._debug, '[reactive-action-transport-client]: error on connection');
                setTimeout(async () => await this.connect(url), RECONNECT_TIMEOUT);
            }
        });

    }
}

export const RAT_BACKEND = new BackendSocket();

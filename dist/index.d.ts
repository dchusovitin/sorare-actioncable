import { Subscription, Callbacks } from './subscription';
export declare type Options = {
    url?: string;
    origin?: string;
    headers?: Record<string, string>;
};
export declare class ActionCable {
    private url;
    private origin?;
    private headers;
    private connection?;
    private connectionPromise;
    private subscriptions;
    private lastHeartbeatTimestamp;
    private heartbeatInterval?;
    constructor(options: Options);
    subscribe(query: string, callbacks: Callbacks): Subscription;
    private connect;
    private disconnect;
    private handleMessage;
    private checkHeartbeat;
}

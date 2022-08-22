import WebSocket from 'ws';
export declare type Callbacks = {
    connected?: () => void;
    disconnected?: (error?: any) => void;
    rejected?: () => void;
    received: (data: any) => void;
};
export declare class Subscription {
    callbacks: Callbacks;
    constructor(query: string, identifier: string, connectionPromise: Promise<WebSocket>, callbacks: Callbacks);
}

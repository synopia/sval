import { Variable } from './variable';
import { ESTree } from "meriyah";
export interface ExecutionListener {
    beforeNode: (node: ESTree.Node) => void;
    afterNode: (node: ESTree.Node, result?: unknown, error?: Error) => unknown;
}
export declare class Scope {
    private readonly parent;
    private readonly isolated;
    private readonly context;
    readonly listener: ExecutionListener | undefined;
    constructor(parent?: Scope, isolated?: boolean, listener?: ExecutionListener);
    global(): Scope;
    clone(): Scope;
    find(name: string): Variable;
    var(name: string, value?: any): void;
    let(name: string, value: any): void;
    const(name: string, value: any): void;
    func(name: string, value: any): void;
}

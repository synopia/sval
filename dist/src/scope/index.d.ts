import { Variable } from './variable';
import { ESTree } from "meriyah";
export interface ExecutionListener {
    beforeNode: (node: ESTree.Node) => void;
    afterNode: (node: ESTree.Node, result: unknown) => unknown;
    afterNodeError: (node: ESTree.Node, error: Error) => Error | undefined;
}
export declare class Scope {
    private readonly parent;
    private readonly isolated;
    private readonly context;
    listener: ExecutionListener | undefined;
    private _isHoisting;
    constructor(parent?: Scope, isolated?: boolean, listener?: ExecutionListener);
    beforeNode(node: ESTree.Node): void;
    afterNode(node: ESTree.Node, result?: unknown): unknown;
    afterNodeError(node: ESTree.Node, error?: Error): Error | undefined;
    isHoisting(): boolean;
    startHoisting(): void;
    endHoisting(): void;
    global(): Scope;
    clone(): Scope;
    find(name: string): Variable;
    var(name: string, value?: any): void;
    let(name: string, value: any): void;
    const(name: string, value: any): void;
    func(name: string, value: any): void;
}

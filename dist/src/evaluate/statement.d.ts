import { Scope } from '../scope';
import { ESTree } from "meriyah";
export declare function ExpressionStatement(node: ESTree.ExpressionStatement, scope: Scope): Generator<any, void, any>;
export interface BlockOptions {
    invasived?: boolean;
    hoisted?: boolean;
}
export declare function BlockStatement(block: ESTree.BlockStatement, scope: Scope, options?: BlockOptions): Generator<any, string | object, any>;
export declare function EmptyStatement(): IterableIterator<any>;
export declare function DebuggerStatement(): IterableIterator<any>;
export declare function ReturnStatement(node: ESTree.ReturnStatement, scope: Scope): Generator<any, {
    RES: any;
}, any>;
export declare function BreakStatement(): Generator<never, string, unknown>;
export declare function ContinueStatement(): Generator<never, string, unknown>;
export declare function IfStatement(node: ESTree.IfStatement, scope: Scope): Generator<any, unknown, any>;
export declare function SwitchStatement(node: ESTree.SwitchStatement, scope: Scope): Generator<any, string | object, any>;
export declare function SwitchCase(node: ESTree.SwitchCase, scope: Scope): Generator<any, string | object, any>;
export declare function ThrowStatement(node: ESTree.ThrowStatement, scope: Scope): Generator<any, void, any>;
export declare function TryStatement(node: ESTree.TryStatement, scope: Scope): Generator<any, string | object, any>;
export declare function CatchClause(node: ESTree.CatchClause, scope: Scope): Generator<any, string | object, any>;
export declare function WhileStatement(node: ESTree.WhileStatement, scope: Scope): Generator<any, object, any>;
export declare function DoWhileStatement(node: ESTree.DoWhileStatement, scope: Scope): Generator<any, object, any>;
export declare function ForStatement(node: ESTree.ForStatement, scope: Scope): Generator<any, any, any>;
export declare function ForInStatement(node: ESTree.ForInStatement, scope: Scope): Generator<any, any, any>;
export declare function ForOfStatement(node: ESTree.ForOfStatement, scope: Scope): Generator<any, any, any>;

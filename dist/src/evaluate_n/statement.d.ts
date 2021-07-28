import Scope from '../scope';
import { ESTree } from "meriyah";
export declare function ExpressionStatement(node: ESTree.ExpressionStatement, scope: Scope): void;
export interface BlockOptions {
    invasived?: boolean;
    hoisted?: boolean;
}
export declare function BlockStatement(block: ESTree.BlockStatement, scope: Scope, options?: BlockOptions): any;
export declare function EmptyStatement(): any;
export declare function DebuggerStatement(): any;
export declare function ReturnStatement(node: ESTree.ReturnStatement, scope: Scope): {
    RES: any;
};
export declare function BreakStatement(): string;
export declare function ContinueStatement(): string;
export declare function IfStatement(node: ESTree.IfStatement, scope: Scope): any;
export declare function SwitchStatement(node: ESTree.SwitchStatement, scope: Scope): any;
export declare function SwitchCase(node: ESTree.SwitchCase, scope: Scope): any;
export declare function ThrowStatement(node: ESTree.ThrowStatement, scope: Scope): void;
export declare function TryStatement(node: ESTree.TryStatement, scope: Scope): any;
export declare function CatchClause(node: ESTree.CatchClause, scope: Scope): any;
export declare function WhileStatement(node: ESTree.WhileStatement, scope: Scope): any;
export declare function DoWhileStatement(node: ESTree.DoWhileStatement, scope: Scope): any;
export declare function ForStatement(node: ESTree.ForStatement, scope: Scope): any;
export declare function ForInStatement(node: ESTree.ForInStatement, scope: Scope): any;
export declare function ForOfStatement(node: ESTree.ForOfStatement, scope: Scope): any;

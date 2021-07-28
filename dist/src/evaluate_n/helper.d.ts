import { Scope } from '../scope';
import { ESTree } from "meriyah";
import { PatternOptions } from './pattern';
export interface hoistOptions {
    onlyBlock?: boolean;
}
export declare function hoist(block: ESTree.Program | ESTree.BlockStatement, scope: Scope, options?: hoistOptions): void;
export declare function pattern(node: ESTree.Pattern, scope: Scope, options?: PatternOptions): any;
export interface CtorOptions {
    superClass?: (...args: any[]) => any;
    isCtor?: boolean;
}
export declare function createFunc(node: ESTree.FunctionDeclaration | ESTree.FunctionExpression | ESTree.ArrowFunctionExpression, scope: Scope, options?: CtorOptions): any;
export declare function createClass(node: ESTree.ClassDeclaration | ESTree.ClassExpression, scope: Scope): () => void;
export interface ForXHandlerOptions {
    value: any;
}
export declare function ForXHandler(node: ESTree.ForInStatement | ESTree.ForOfStatement, scope: Scope, options: ForXHandlerOptions): any;

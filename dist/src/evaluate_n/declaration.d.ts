import { VarKind } from '../scope/variable';
import { Scope } from '../scope';
import { ESTree } from "meriyah";
export declare function FunctionDeclaration(node: ESTree.FunctionDeclaration, scope: Scope): any;
export interface VariableDeclarationOptions {
    hoist?: boolean;
    onlyBlock?: boolean;
    feed?: any;
}
export declare function VariableDeclaration(node: ESTree.VariableDeclaration, scope: Scope, options?: VariableDeclarationOptions): void;
export interface VariableDeclaratorOptions {
    kind?: VarKind;
}
export declare function VariableDeclarator(node: ESTree.VariableDeclarator, scope: Scope, options?: VariableDeclaratorOptions & VariableDeclarationOptions): void;
export declare function ClassDeclaration(node: ESTree.ClassDeclaration, scope: Scope): any;
export interface ClassOptions {
    klass?: (...args: any[]) => void;
    superClass?: (...args: any[]) => void;
}
export declare function ClassBody(node: ESTree.ClassBody, scope: Scope, options?: ClassOptions): void;
export declare function MethodDefinition(node: ESTree.MethodDefinition, scope: Scope, options?: ClassOptions): void;

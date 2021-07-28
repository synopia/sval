import { VarKind } from '../scope/variable';
import { Scope } from '../scope';
import { ESTree } from "meriyah";
export interface PatternOptions {
    kind?: VarKind;
    hoist?: boolean;
    onlyBlock?: boolean;
    feed?: any;
}
export declare function ObjectPattern(node: ESTree.ObjectPattern, scope: Scope, options?: PatternOptions): void;
export declare function ArrayPattern(node: ESTree.ArrayPattern, scope: Scope, options?: PatternOptions): any[];
export declare function RestElement(node: ESTree.RestElement, scope: Scope, options?: PatternOptions): void;
export declare function AssignmentPattern(node: ESTree.AssignmentPattern, scope: Scope, options?: PatternOptions): void;

import { Scope } from '../scope';
import { ESTree } from "meriyah";
export interface IdentifierOptions {
    getVar?: boolean;
    throwErr?: boolean;
}
export declare function Identifier(node: ESTree.Identifier, scope: Scope, options?: IdentifierOptions): Generator<never, any, unknown>;

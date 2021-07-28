import { Scope } from '../scope';
import { ESTree } from "meriyah";
export declare function Literal(node: ESTree.Literal, scope: Scope): Generator<never, string | number | bigint | boolean | RegExp, unknown>;

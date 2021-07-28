import { Scope } from '../scope';
import { ESTree } from "meriyah";
export default function evaluate(node: ESTree.Node, scope: Scope): Generator<any, any, any>;

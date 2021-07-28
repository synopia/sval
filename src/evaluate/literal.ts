import Scope from '../scope'
import {ESTree} from "meriyah";

export function* Literal(node: ESTree.Literal, scope: Scope) {
  return node.value
}

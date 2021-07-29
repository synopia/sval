import { assign } from '../share/util'
import {Scope} from '../scope'

import * as declaration from './declaration'
import * as expression from './expression'
import * as identifier from './identifier'
import * as statement from './statement'
import * as literal from './literal'
import * as pattern from './pattern'
import {ESTree} from "meriyah";
/*<add>*//*import * as program from './program'*//*</add>*/

let evaluateOps: any

export default function* evaluate(node: ESTree.Node, scope: Scope) {
  if (!node) return

  // delay initalizing to remove circular reference issue for jest
  if (!evaluateOps) {
    evaluateOps = assign(
      {},
      declaration,
      expression,
      identifier,
      statement,
      literal,
      pattern,
      /*<add>*//*program*//*</add>*/
    )
  }

  const handler = evaluateOps[node.type]
  if (handler) {
    try {
      scope.beforeNode(node)

      const result = yield* handler(node, scope);

      return scope.afterNode(node, result)
    } catch (error) {

      const rethrow = scope.afterNodeError(node, error)
      if( rethrow ) {
        throw rethrow
      }
    }
  } else {
    throw new Error(`${node.type} isn't implemented`)
  }
}

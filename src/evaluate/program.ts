import Scope from '../scope'
import evaluate from '.'
import {ESTree} from "meriyah";

export function* Program(program: ESTree.Program, scope: Scope) {
  for (let i = 0; i < program.body.length; i++) {
    yield* evaluate(program.body[i], scope)
  }
}

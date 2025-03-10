import { BREAK, CONTINUE, RETURN, AWAIT } from '../share/const'
import { hoist, pattern, ForXHandler } from './helper'
import {Scope} from '../scope'
import evaluate from '.'
import {ESTree} from "meriyah";
import {getAsyncIterator} from "../share/util";

export function* ExpressionStatement(node: ESTree.ExpressionStatement, scope: Scope) {
  yield* evaluate(node.expression, scope)
}

export interface BlockOptions {
  invasived?: boolean
  hoisted?: boolean
}

export function* BlockStatement(
  block: ESTree.BlockStatement,
  scope: Scope,
  options: BlockOptions = {},
) {
  const {
    invasived = false,
    hoisted = false,
  } = options

  const subScope = invasived ? scope : new Scope(scope)

  if (!hoisted) {
    yield* hoist(block, subScope, { onlyBlock: true })
  }

  for (let i = 0; i < block.body.length; i++) {
    const result = yield* evaluate(block.body[i], subScope)
    if (result === BREAK || result === CONTINUE || result === RETURN) {
      return result
    }
  }
}

export function* EmptyStatement(): IterableIterator<any> {
  // No operation here
}

export function* DebuggerStatement(): IterableIterator<any> {
  debugger
}

export function* ReturnStatement(node: ESTree.ReturnStatement, scope: Scope) {
  RETURN.RES = node.argument ? (yield* evaluate(node.argument, scope)) : undefined
  return RETURN
}

export function* BreakStatement() {
  return BREAK
}

export function* ContinueStatement() {
  return CONTINUE
}

export function* IfStatement(node: ESTree.IfStatement, scope: Scope) {
  if (yield* evaluate(node.test, scope)) {
    return yield* evaluate(node.consequent, scope)
  } else {
    return yield* evaluate(node.alternate, scope)
  }
}

export function* SwitchStatement(node: ESTree.SwitchStatement, scope: Scope) {
  const discriminant = yield* evaluate(node.discriminant, scope)
  let matched = false
  for (let i = 0; i < node.cases.length; i++) {
    const eachCase = node.cases[i]
    if (
      !matched
      && (
        !eachCase.test  // default
        || (yield* evaluate(eachCase.test, scope)) === discriminant
      )
    ) {
      matched = true
    }
    if (matched) {
      const result = yield* SwitchCase(eachCase, scope)
      if (result === BREAK) {
        break
      }
      if (result === CONTINUE || result === RETURN) {
        return result
      }
    }
  }
}

export function* SwitchCase(node: ESTree.SwitchCase, scope: Scope) {
  for (let i = 0; i < node.consequent.length; i++) {
    const result = yield* evaluate(node.consequent[i], scope)
    if (result === BREAK || result === CONTINUE || result === RETURN) {
      return result
    }
  }
}

export function* ThrowStatement(node: ESTree.ThrowStatement, scope: Scope) {
  throw yield* evaluate(node.argument, scope)
}

export function* TryStatement(node: ESTree.TryStatement, scope: Scope) {
  try {
    return yield* BlockStatement(node.block, scope)
  } catch (err) {
    if (node.handler) {
      const subScope = new Scope(scope)
      const param = node.handler.param
      if (param) {
        if (param.type === 'Identifier') {
          const name = param.name
          subScope.var(name, err)
        } else {
          yield* pattern(param, scope, { feed: err })
        }
      }
      return yield* CatchClause(node.handler, subScope)
    } else {
      throw err
    }
  } finally {
    if (node.finalizer) {
      const result = yield* BlockStatement(node.finalizer, scope)
      if (result === BREAK || result === CONTINUE || result === RETURN) {
        return result
      }
    }
  }
}

export function* CatchClause(node: ESTree.CatchClause, scope: Scope) {
  return yield* BlockStatement(node.body, scope, { invasived: true })
}

export function* WhileStatement(node: ESTree.WhileStatement, scope: Scope) {
  while (yield* evaluate(node.test, scope)) {
    const result = yield* evaluate(node.body, scope)
    if (result === BREAK) {
      break
    } else if (result === CONTINUE) {
      continue
    } else if (result === RETURN) {
      return result
    }
  }
}

export function* DoWhileStatement(node: ESTree.DoWhileStatement, scope: Scope) {
  do {
    const result = yield* evaluate(node.body, scope)
    if (result === BREAK) {
      break
    } else if (result === CONTINUE) {
      continue
    } else if (result === RETURN) {
      return result
    }
  } while (yield* evaluate(node.test, scope))
}

export function* ForStatement(node: ESTree.ForStatement, scope: Scope) {
  const forScope = new Scope(scope)
  
  for (
    yield* evaluate(node.init, forScope);
    node.test ? (yield* evaluate(node.test, forScope)) : true;
    yield* evaluate(node.update, forScope)
  ) {
    const subScope = new Scope(forScope)
    let result: any
    if (node.body.type === 'BlockStatement') {
      result = yield* BlockStatement(node.body, subScope, { invasived: true })
    } else {
      result = yield* evaluate(node.body, subScope)
    }

    if (result === BREAK) {
      break
    } else if (result === CONTINUE) {
      continue
    } else if (result === RETURN) {
      return result
    }
  }
}

export function* ForInStatement(node: ESTree.ForInStatement, scope: Scope) {
  for (const value in yield* evaluate(node.right, scope)  as any) {
    const result = yield* ForXHandler(node, scope, { value })
    if (result === BREAK) {
      break
    } else if (result === CONTINUE) {
      continue
    } else if (result === RETURN) {
      return result
    }
  }
}

export function* ForOfStatement(node: ESTree.ForOfStatement, scope: Scope) {
  const right = yield* evaluate(node.right, scope)  as any
  /*<remove>*/
  if ((node as any).await) {
    const iterator = getAsyncIterator(right)
    let ret: any
    for (
      // @ts-ignore
      AWAIT.RES = iterator.next(), ret = yield AWAIT;
      !ret.done;
      // @ts-ignore
      AWAIT.RES = iterator.next(), ret = yield AWAIT
    ) {
      const result = yield* ForXHandler(node, scope, { value: ret.value })
      if (result === BREAK) {
        break
      } else if (result === CONTINUE) {
        continue
      } else if (result === RETURN) {
        return result
      }
    }
  } else {
  /*</remove>*/
    for (const value of right) {
      const result = yield* ForXHandler(node, scope, { value })
      if (result === BREAK) {
        break
      } else if (result === CONTINUE) {
        continue
      } else if (result === RETURN) {
        return result
      }
    }
  /*<remove>*/
  }
  /*</remove>*/
}

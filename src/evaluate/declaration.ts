import { pattern, createFunc, createClass } from './helper'
import { define, getDptor, assign } from '../share/util'
import { NOINIT, DEADZONE } from '../share/const'
import { VarKind } from '../scope/variable'
import {Scope} from '../scope'
import evaluate from '.'
import {ESTree} from "meriyah";

export function* FunctionDeclaration(
  node: ESTree.FunctionDeclaration,
  scope: Scope
): IterableIterator<any> {
  scope.func(node.id.name, createFunc(node, scope))
}

export interface VariableDeclarationOptions {
  hoist?: boolean
  onlyBlock?: boolean
  feed?: any
}

export function* VariableDeclaration(
  node: ESTree.VariableDeclaration,
  scope: Scope,
  options: VariableDeclarationOptions = {},
) {
  for (let i = 0; i < node.declarations.length; i++) {
    yield* VariableDeclarator(node.declarations[i], scope, assign({ kind: node.kind }, options))
  }
}

export interface VariableDeclaratorOptions {
  kind?: VarKind
}

export function* VariableDeclarator(
  node: ESTree.VariableDeclarator,
  scope: Scope,
  options: VariableDeclaratorOptions & VariableDeclarationOptions = {},
) {
  const { kind = 'var', hoist = false, onlyBlock = false, feed } = options
  if (hoist) {
    if (onlyBlock || kind === 'var') {
      if (node.id.type === 'Identifier') {
        scope[kind](node.id.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined)
      } else {
        yield* pattern(node.id as any, scope, { kind, hoist, onlyBlock })
      }
    }
  } else {
    const hasFeed = 'feed' in options
    const value = hasFeed ? feed : yield* evaluate(node.init, scope)
    if (node.id.type === 'Identifier') {
      const name = node.id.name
      if (kind === 'var' && !node.init && !hasFeed) {
        scope.var(name, NOINIT)
      } else {
        scope[kind](name, value)
      }
      if (
        node.init
        && ['ClassExpression', 'FunctionExpression', 'ArrowFunctionExpression']
          .indexOf(node.init.type) !== -1
        && !value.name
      ) {
        define(value, 'name', {
          value: name,
          configurable: true
        })
      }
    } else {
      yield* pattern(node.id as any, scope, { kind, feed: value })
    }
  }
}

export function* ClassDeclaration(
  node: ESTree.ClassDeclaration,
  scope: Scope
): IterableIterator<any> {
  scope.func(node.id.name, yield* createClass(node, scope))
}

export interface ClassOptions {
  klass?: (...args: any[]) => void,
  superClass?: (...args: any[]) => void
}

export function* ClassBody(node: ESTree.ClassBody, scope: Scope, options: ClassOptions = {}) {
  const { klass, superClass } = options

  for (let i = 0; i < node.body.length; i++) {
    yield* MethodDefinition(node.body[i] as any, scope, {klass, superClass})
  }
}

export function* MethodDefinition(node: ESTree.MethodDefinition, scope: Scope, options: ClassOptions = {}) {
  const { klass, superClass } = options

  let key: string
  if (node.computed) {
    key = yield* evaluate(node.key, scope) as any
  } else if (node.key.type === 'Identifier') {
    key = node.key.name
  } else {
    throw new SyntaxError('Unexpected token')
  }

  const obj = node.static ? klass : klass.prototype
  const value = createFunc(node.value, scope, { superClass })

  switch (node.kind) {
    case 'constructor':
      break
    case 'method':
      define(obj, key, {
        value,
        writable: true,
        configurable: true,
      })
      break
    case 'get': {
      const oriDptor = getDptor(obj, key)
      define(obj, key, {
        get: value,
        set: oriDptor && oriDptor.set,
        configurable: true,
      })
      break
    }
    case 'set': {
      const oriDptor = getDptor(obj, key)
      define(obj, key, {
        get: oriDptor && oriDptor.get,
        set: value,
        configurable: true,
      })
      break
    }
    default:
      throw new SyntaxError('Unexpected token')
  } 
}

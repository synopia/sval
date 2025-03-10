import { define, freeze, getGetter, getSetter, createSymbol, assign, getDptor, WINDOW } from '../share/util'
import { SUPER, NOCTOR, AWAIT, CLSCTOR, NEWTARGET, SUPERCALL } from '../share/const'
import { pattern, createFunc, createClass } from './helper'
import { Variable, Prop } from '../scope/variable'
import { Identifier } from './identifier'
import { Literal } from './literal'
import {Scope} from '../scope'
import evaluate from '.'
import {ESTree} from "meriyah";

export function* ThisExpression(node: ESTree.ThisExpression, scope: Scope) {
  const superCall = scope.find(SUPERCALL)
  if (superCall && !superCall.get()) {
    throw new ReferenceError('Must call super constructor in derived class '
      + 'before accessing \'this\' or returning from derived constructor')
  } else {
    return scope.find('this').get()
  }
}

export function* ArrayExpression(node: ESTree.ArrayExpression, scope: Scope) {
  let results: any[] = []
  for (let i = 0; i < node.elements.length; i++) {
    const item = node.elements[i]
    if (item.type === 'SpreadElement') {
      results = results.concat(yield* SpreadElement(item, scope))
    } else {
      results.push(yield* evaluate(item, scope))
    }
  }
  return results
}

export function* ObjectExpression(node: ESTree.ObjectExpression, scope: Scope) {
  const object: { [key: string]: any } = {}
  for (let i = 0; i < node.properties.length; i++) {
    const property = node.properties[i]
    if (property.type as any === 'SpreadElement') {
      assign(object, yield* SpreadElement(property as any, scope))
    } else {
      let key: string
      const propKey = (property as any).key
      if ((property as any).computed) {
        key = yield* evaluate(propKey, scope) as any
      } else {
        if (propKey.type === 'Identifier') {
          key = propKey.name
        } else {
          key = '' + (yield* Literal(propKey as ESTree.Literal, scope))
        }
      }
  
      const value = yield* evaluate((property as any).value, scope) as any
  
      const propKind = (property as any).kind
      if (propKind === 'init') {
        object[key] = value
      } else if (propKind === 'get') {
        const oriDptor = getDptor(object, key)
        define(object, key, {
          get: value,
          set: oriDptor && oriDptor.set,
          enumerable: true,
          configurable: true
        })
      } else { // propKind === 'set'
        const oriDptor = getDptor(object, key)
        define(object, key, {
          get: oriDptor && oriDptor.get,
          set: value,
          enumerable: true,
          configurable: true
        })
      }
    }
  }
  return object
}

export function* FunctionExpression(node: ESTree.FunctionExpression, scope: Scope) {
  if (node.id && node.id.name) {
    // it's for accessing function expression by its name inside
    // e.g. const a = function b() { console.log(b) }
    const tmpScope = new Scope(scope)
    const func = createFunc(node, tmpScope)
    tmpScope.const(node.id.name, func)
    return func
  } else {
    return createFunc(node, scope)
  }
}

export function* UnaryExpression(node: ESTree.UnaryExpression, scope: Scope) {
  const arg = node.argument
  switch (node.operator) {
    case '+': return +(yield* evaluate(arg, scope))
    case '-': return -(yield* evaluate(arg, scope))
    case '!': return !(yield* evaluate(arg, scope))
    case '~': return ~(yield* evaluate(arg, scope))
    case 'void': return void (yield* evaluate(arg, scope))
    case 'typeof':
      if (arg.type === 'Identifier') {
        return typeof (yield* Identifier(arg, scope, { throwErr: false }))
      } else {
        return typeof (yield* evaluate(arg, scope))
      }
    case 'delete':
      if (arg.type === 'MemberExpression') {
        const variable: Prop = yield* MemberExpression(arg, scope, { getVar: true })
        return variable.del()
      } else if (arg.type === 'Identifier') {
        throw new SyntaxError('Delete of an unqualified identifier in strict mode')
      } else {
        yield* evaluate(arg, scope)
        return true
      }
    /* istanbul ignore next */
    default: throw new SyntaxError(`Unexpected token ${node.operator}`)
  }
}

export function* UpdateExpression(node: ESTree.UpdateExpression, scope: Scope) {
  const arg = node.argument
  
  let variable: Variable
  if (arg.type === 'Identifier') {
    variable = yield* Identifier(arg, scope, { getVar: true })
  } else if (arg.type === 'MemberExpression') {
    variable = yield* MemberExpression(arg, scope, { getVar: true })
  } else {
    /* istanbul ignore next */
    throw new SyntaxError('Unexpected token')
  }

  const value = variable.get()
  if (node.operator === '++') {
    variable.set(value + 1)
    return node.prefix ? variable.get() : value
  } else if (node.operator === '--') {
    variable.set(value - 1)
    return node.prefix ? variable.get() : value
  } else {
    /* istanbul ignore next */
    throw new SyntaxError(`Unexpected token ${node.operator}`)
  }
}

export function* BinaryExpression(node: ESTree.BinaryExpression, scope: Scope) {
  const left = yield* evaluate(node.left, scope) as any
  const right = yield* evaluate(node.right, scope) as any

  switch (node.operator) {
    case '==': return left == right
    case '!=': return left != right
    case '===': return left === right
    case '!==': return left !== right
    case '<': return left < right
    case '<=': return left <= right
    case '>': return left > right
    case '>=': return left >= right
    case '<<': return left << right
    case '>>': return left >> right
    case '>>>': return left >>> right
    case '+': return left + right
    case '-': return left - right
    case '*': return left * right
    case '**': return left ** right
    case '/': return left / right
    case '%': return left % right
    case '|': return left | right
    case '^': return left ^ right
    case '&': return left & right
    case 'in': return left in right
    case 'instanceof': return left instanceof right
    /* istanbul ignore next */
    default: throw new SyntaxError(`Unexpected token ${node.operator}`)
  }
}

export function* AssignmentExpression(node: ESTree.AssignmentExpression, scope: Scope) {
  const value = yield* evaluate(node.right, scope) as any

  const left = node.left

  let variable: Variable
  if (left.type === 'Identifier') {
    variable = yield* Identifier(left, scope, { getVar: true, throwErr: false })
    if (!variable) {
      const win = scope.global().find('window').get()
      variable = new Prop(win, left.name)
    }
  } else if (left.type === 'MemberExpression') {
    variable = yield* MemberExpression(left, scope, { getVar: true })
  } else {
    return yield* pattern(left as any, scope, { feed: value })
  }

  switch (node.operator) {
    case '=': variable.set(value); return variable.get()
    case '+=': variable.set(variable.get() + value); return variable.get()
    case '-=': variable.set(variable.get() - value); return variable.get()
    case '*=': variable.set(variable.get() * value); return variable.get()
    case '/=': variable.set(variable.get() / value); return variable.get()
    case '%=': variable.set(variable.get() % value); return variable.get()
    case '**=': variable.set(variable.get() ** value); return variable.get()
    case '<<=': variable.set(variable.get() << value); return variable.get()
    case '>>=': variable.set(variable.get() >> value); return variable.get()
    case '>>>=': variable.set(variable.get() >>> value); return variable.get()
    case '|=': variable.set(variable.get() | value); return variable.get()
    case '^=': variable.set(variable.get() ^ value); return variable.get()
    case '&=': variable.set(variable.get() & value); return variable.get()
    /* istanbul ignore next */
    default: throw new SyntaxError(`Unexpected token ${node.operator}`)
  }
}

export function* LogicalExpression(node: ESTree.LogicalExpression, scope: Scope) {
  switch (node.operator) {
    case '||':
      return (yield* evaluate(node.left, scope)) || (yield* evaluate(node.right, scope))
    case '&&':
      return (yield* evaluate(node.left, scope)) && (yield* evaluate(node.right, scope))
    default:
      /* istanbul ignore next */
      throw new SyntaxError(`Unexpected token ${node.operator}`)
  }
}

export interface MemberExpressionOptions {
  getObj?: boolean
  getVar?: boolean
}

export function* MemberExpression(
  node: ESTree.MemberExpression,
  scope: Scope,
  options: MemberExpressionOptions = {},
) {
  const { getObj = false, getVar = false } = options

  let object: any
  if (node.object.type === 'Super') {
    object = yield* Super(node.object, scope, { getProto: true })
  } else {
    object = yield* evaluate(node.object, scope)
  }

  if (getObj) return object

  let key: string
  if (node.computed) {
    key = yield* evaluate(node.property, scope) as any
  } else {
    key = (node.property as ESTree.Identifier).name
  }

  if (getVar) {
    // left value
    const setter = getSetter(object, key)
    if (node.object.type === 'Super' && setter) {
      // transfer the setter from super to this with a private key
      const thisObject = scope.find('this').get()
      const privateKey = createSymbol(key)
      define(thisObject, privateKey, { set: setter })
      return new Prop(thisObject, privateKey)
    } else {
      return new Prop(object, key)
    }
  } else {
    // right value
    const getter = getGetter(object, key)
    if (node.object.type === 'Super' && getter) {
      const thisObject = scope.find('this').get()
      return getter.call(thisObject)
    } else {
      return object[key]
    }
  }
}

export function* ConditionalExpression(node: ESTree.ConditionalExpression, scope: Scope) {
  return (yield* evaluate(node.test, scope))
    ? (yield* evaluate(node.consequent, scope))
    : (yield* evaluate(node.alternate, scope))
}

export function* CallExpression(node: ESTree.CallExpression, scope: Scope) {
  let func: any
  let object: any

  if (node.callee.type === 'MemberExpression') {
    object = yield* MemberExpression(node.callee, scope, { getObj: true })
  
    // get key
    let key: string
    if (node.callee.computed) {
      key = yield* evaluate(node.callee.property, scope) as any
    } else {
      key = (node.callee.property as ESTree.Identifier).name
    }

    // right value
    if (node.callee.object.type === 'Super') {
      const thisObject = scope.find('this').get()
      func = object[key].bind(thisObject)
    } else {
      func = object[key]
    }

    if (typeof func !== 'function') {
      throw new TypeError(`${key} is not a function`)
    } else if (func[CLSCTOR]) {
      throw new TypeError(`Class constructor ${key} cannot be invoked without 'new'`)
    }
  } else {
    object = scope.find('this').get()
    func = yield* evaluate(node.callee, scope)
    if (typeof func !== 'function' || node.callee.type !== 'Super' && func[CLSCTOR]) {
      let name: string
      if (node.callee.type === 'Identifier') {
        name = node.callee.name
      } else {
        try {
          name = JSON.stringify(func)
        } catch (err) {
          name = '' + func
        }
      }
      if (typeof func !== 'function') {
        throw new TypeError(`${name} is not a function`)
      } else {
        throw new TypeError(`Class constructor ${name} cannot be invoked without 'new'`)
      }
    }
  }

  let args: any[] = []
  for (let i = 0; i < node.arguments.length; i++) {
    const arg = node.arguments[i]
    if (arg.type === 'SpreadElement') {
      args = args.concat(yield* SpreadElement(arg, scope))
    } else {
      args.push(yield* evaluate(arg, scope))
    }
  }

  if (node.callee.type === 'Super') {
    const superCall = scope.find(SUPERCALL)
    if (superCall.get()) {
      throw new ReferenceError('Super constructor may only be called once')
    } else {
      scope.find(SUPERCALL).set(true)
    }
  }

  if (object && object[WINDOW] && func.toString().indexOf('[native code]') !== -1) {
    // you will get "TypeError: Illegal invocation" if not binding native function with window
    return func.apply(object[WINDOW], args)
  }

  return func.apply(object, args)
}

export function* NewExpression(node: ESTree.NewExpression, scope: Scope) {
  const constructor = yield* evaluate(node.callee, scope) as any

  if (typeof constructor !== 'function') {
    let name: string
    if (node.callee.type === 'Identifier') {
      name = node.callee.name
    } else {
      try {
        name = JSON.stringify(constructor)
      } catch (err) {
        name = '' + constructor
      }
    }
    throw new TypeError(`${name} is not a constructor`)
  } else if (constructor[NOCTOR]) {
    throw new TypeError(`${constructor.name || '(intermediate value)'} is not a constructor`)
  }

  let args: any[] = []
  for (let i = 0; i < node.arguments.length; i++) {
    const arg = node.arguments[i]
    if (arg.type === 'SpreadElement') {
      args = args.concat(yield* SpreadElement(arg, scope))
    } else {
      args.push(yield* evaluate(arg, scope))
    }
  }

  return new constructor(...args)
}

export function* MetaProperty(node: ESTree.MetaProperty, scope: Scope) {
  return scope.find(NEWTARGET).get()
}

export function* SequenceExpression(node: ESTree.SequenceExpression, scope: Scope) {
  let result: any
  for (let i = 0; i < node.expressions.length; i++) {
    result = yield* evaluate(node.expressions[i], scope)
  }
  return result
}

export function* ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression, scope: Scope) {
  return createFunc(node, scope)
}

export function* TemplateLiteral(node: ESTree.TemplateLiteral, scope: Scope) {
  const quasis = node.quasis.slice()
  const expressions = node.expressions.slice()

  let result = ''
  let temEl: ESTree.TemplateElement
  let expr: ESTree.Expression

  while (temEl = quasis.shift()) {
    result += yield* TemplateElement(temEl, scope)
    expr = expressions.shift()
    if (expr) {
      result += yield* evaluate(expr, scope)
    }
  }

  return result
}

export function* TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression, scope: Scope) {
  const tagFunc = yield* evaluate(node.tag, scope) as any

  const quasis = node.quasi.quasis
  const str = quasis.map(v => v.value.cooked)
  const raw = quasis.map(v => v.value.raw)

  define(str, 'raw', {
    value: freeze(raw)
  })

  const expressions = node.quasi.expressions

  const args = []
  if (expressions) {
    for (let i = 0; i < expressions.length; i++) {
      args.push(yield* evaluate(expressions[i], scope))
    }
  }

  return tagFunc(freeze(str), ...args)
}

export function* TemplateElement(node: ESTree.TemplateElement, scope: Scope) {
  return node.value.raw
}

export function* ClassExpression(node: ESTree.ClassExpression, scope: Scope) {
  if (node.id && node.id.name) {
    // it's for accessing class expression by its name inside
    // e.g. const a = class b { log() { console.log(b) } }
    const tmpScope = new Scope(scope)
    const klass = yield* createClass(node, tmpScope)
    tmpScope.const(node.id.name, klass)
    return klass
  } else {
    return yield* createClass(node, scope)
  }
}

export interface SuperOptions {
  getProto?: boolean
}

export function* Super(
  node: ESTree.Super,
  scope: Scope,
  options: SuperOptions = {},
) {
  const { getProto = false } = options
  const superClass = scope.find(SUPER).get()
  return getProto ? superClass.prototype: superClass
}

export function* SpreadElement(node: ESTree.SpreadElement, scope: Scope) {
  return yield* evaluate(node.argument, scope)
}

/*<remove>*/
export function* YieldExpression(node: ESTree.YieldExpression, scope: Scope) {
  const res = yield* evaluate(node.argument, scope)
  // @ts-ignore
  return node.delegate ? yield* res : yield res
}

export function* AwaitExpression(node: ESTree.AwaitExpression, scope: Scope) {
  AWAIT.RES = yield* evaluate(node.argument, scope)
  // @ts-ignore
  return yield AWAIT
}
/*</remove>*/

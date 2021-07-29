import { NOINIT, DEADZONE } from '../share/const'
import { Variable, Var, Prop } from './variable'
import { create, define } from '../share/util'
import {ESTree} from "meriyah";


export interface ExecutionListener {
  beforeNode:(node: ESTree.Node)=>void
  afterNode:(node: ESTree.Node, result: unknown)=>unknown
  afterNodeError:(node: ESTree.Node, error: Error)=>Error|undefined
}

/**
 * Scope simulation class
 */
export class Scope {
  /**
   * The parent scope along the scope chain
   * @private
   * @readonly
   */
  private readonly parent: Scope | null
  /**
   * To distinguish function scope and block scope
   * The value is true for function scope or false for block scope
   * @private
   * @readonly
   */
  private readonly isolated: boolean

  /**
   * Context simulation object
   * @private
   * @readonly
   */
  private readonly context: { [key: string]: Var } = create(null)

  listener: ExecutionListener | undefined
  private _isHoisting = false

  /**
   * Create a simulated scope
   * @param parent the parent scope along the scope chain (default: null)
   * @param isolated true for function scope or false for block scope (default: false)
   * @param listener that gets informed when start / end a node
   */
  constructor(
    parent: Scope = null,
    isolated: boolean = false,
    listener: ExecutionListener = undefined
  ) {
    this.parent = parent
    this.isolated = isolated
    this.listener = listener
  }

  beforeNode(node: ESTree.Node) {
    if( !this.listener && this.parent ) {
      this.parent.beforeNode(node)
    } else if( this.listener ) {
      this.listener.beforeNode(node)
    }
  }

  afterNode(node: ESTree.Node, result?: unknown): unknown {
    if( !this.listener && this.parent ) {
      return this.parent.afterNode(node, result)
    } else if( this.listener ) {
      return this.listener.afterNode(node, result)
    }
    return result
  }

  afterNodeError(node: ESTree.Node, error?: Error): Error|undefined {
    if( !this.listener && this.parent ) {
      return this.parent.afterNodeError(node, error)
    } else if( this.listener ) {
      return this.listener.afterNodeError(node, error)
    }
    return error
  }

  isHoisting() {
    return this._isHoisting
  }
  startHoisting() {
    this._isHoisting = true
  }
  endHoisting() {
    this._isHoisting = false
  }

  /**
   * Get global scope
   */
  global(): Scope {
    let scope: Scope = this
    while(scope.parent) {
      scope = scope.parent
    }
    return scope
  }

  /**
   * Clone current scope
   */
  clone(): Scope {
    const cloneScope = new Scope(this.parent, this.isolated)
    for (const name in this.context) {
      const variable = this.context[name]
      cloneScope[variable.kind](name, variable.get())
    }
    return cloneScope
  }

  /**
   * Find a variable along scope chain
   * @param name variable identifier name
   */
  find(name: string): Variable {
    if (this.context[name]) {
      // The variable locates in the scope
      return this.context[name]
    } else if (this.parent) {
      // Find variable along the scope chain
      return this.parent.find(name)
    } else {
      // If enter this branch, the scope will be the global scope
      // And the global scope should have window object
      const win = this.global().find('window').get()
      if (name in win) {
        // Find property in window
        return new Prop(win, name)
      } else {
        // Not found
        return null
      }
    }
  }

  /**
   * Declare a var variable
   * @param name variable identifier name
   * @param value variable value
   */
  var(name: string, value?: any) {
    let scope: Scope = this

    // Find the closest function scope
    while(scope.parent && !scope.isolated) {
      scope = scope.parent
    }

    const variable = scope.context[name]
    if (!variable) {
      scope.context[name] = new Var('var', value === NOINIT ? undefined : value)
    } else {
      if (variable.kind === 'var') {
        if (value !== NOINIT) {
          variable.set(value)
        }
      } else {
        throw new SyntaxError(`Identifier '${name}' has already been declared`)
      }
    }

    if (!scope.parent) {
      const win = scope.find('window').get()
      if (value !== NOINIT) {
        define(win, name, { value, writable: true, enumerable: true })
      }
    }
  }

  /**
   * Declare a let variable
   * @param name variable identifier name
   * @param value variable value
   */
  let(name: string, value: any) {
    const variable = this.context[name]
    if (!variable || variable.get() === DEADZONE) {
      this.context[name] = new Var('let', value)
    } else {
      throw new SyntaxError(`Identifier '${name}' has already been declared`)
    }
  }

  /**
   * Declare a const variable
   * @param name variable identifier name
   * @param value variable value
   */
  const(name: string, value: any) {
    const variable = this.context[name]
    if (!variable || variable.get() === DEADZONE) {
      this.context[name] = new Var('const', value)
    } else {
      throw new SyntaxError(`Identifier '${name}' has already been declared`)
    }
  }

  /**
   * Declare a function
   * @param name function name
   * @param value function
   */
  func(name: string, value: any) {
    const variable = this.context[name]
    if (!variable || variable.kind === 'var') {
      this.context[name] = new Var('var', value)
    } else {
      throw new SyntaxError(`Identifier '${name}' has already been declared`)
    }
  }
}

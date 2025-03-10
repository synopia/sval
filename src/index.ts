import {ESTree, Options, parseScript} from "meriyah";
import {assign, createSandBox, getOwnNames, globalObj} from './share/util'
import {version} from '../package.json'
import {ExecutionListener, Scope} from './scope'
import {hoist} from './evaluate_n/helper'
import evaluate from './evaluate_n'

export type SvalOptions = Options & {
  sandBox?: boolean
  executionListener?: ExecutionListener
}

export class Sval {
  static version: string = version

  readonly options: Options = {}
  readonly scope : Scope
  exports: { [name: string]: any } = {}

  constructor(options: SvalOptions = {}) {
    this.options = options
    this.scope = new Scope(null, true, options.executionListener)

    const { sandBox = true } = options

    if (sandBox) {
      // Shallow clone to create a sandbox
      const win = createSandBox()
      this.scope.let('window', win)
      this.scope.let('this', win)
    } else {
      this.scope.let('window', globalObj)
      this.scope.let('this', globalObj)
    }
    
    this.scope.const('exports', this.exports = {})
  }

  import(nameOrModules: string | { [name: string]: any }, mod?: any) {
    if (typeof nameOrModules === 'string') {
      nameOrModules = { [nameOrModules]: mod }
    }

    if (typeof nameOrModules !== 'object') return

    const names = getOwnNames(nameOrModules)
    
    for (let i = 0; i < names.length; i++) {
      const name = names[i]
      this.scope.var(name, nameOrModules[name])
    }
  }

  parse(code: string, parser?: (code: string, options: SvalOptions) => Node) {
    if (typeof parser === 'function') {
      return parser(code, assign({}, this.options))
    }
    return parseScript(code, this.options)
  }

  run(code: string | ESTree.Program) {
    let ast: ESTree.Program
    if( typeof code === 'string' ) {
      ast = parseScript(code, this.options)
    } else {
      ast = code
    }
    this.scope.startHoisting()
    hoist(ast, this.scope)
    this.scope.endHoisting()

    evaluate(ast, this.scope)
  }
}


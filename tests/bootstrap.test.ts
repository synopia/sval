import {Sval} from '../src'

const code = "const msg = 'first build'"

describe('testing src/index.ts', () => {
  it('should compile normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`!async function(){${code}}()`) // also test for generator env
    interpreter.run(code)
  })

  it('should compile normally in generator env', () => {  
    const interpreter = new Sval()
    interpreter.run(`!async function(){${code}}()`)
  })

  it('should support global mode', () => {
    const interpreter = new Sval({
      sandBox: false
    })

    interpreter.run(`
      window.x1 = 5
      this.y1 = 6
    `)

    expect((window as any).x1).toBe(5)
    expect((window as any).y1).toBe(6)

    delete (window as any).x1
    delete (window as any).y1
  })

  it('should support sandbox mode', () => {
    const interpreter = new Sval({
      sandBox: true
    })

    interpreter.run(`
      window.x2 = 5
      this.y2 = 6
    `)

    expect((window as any).x2).toBeUndefined()
    expect((window as any).y2).toBeUndefined()
  })


  it('should support import module object to engine', () => {
    const bar = 'bar'
    const modules = {
      foo: 'foo',
      bar: function() { return bar } 
    }

    const interpreter = new Sval()
    interpreter.import(modules)

    interpreter.run(`
      exports.foo = foo
      exports.bar = bar()
    `)
    expect(interpreter.exports.foo).toBe('foo')
    expect(interpreter.exports.bar).toBe('bar')

    // append more modules
    interpreter.import('hello', 'world')
    interpreter.import([3,2]) // support array, supported but should be avoided
    interpreter.run(`
      exports.hello = hello
      exports.idx0 = window[0]
    `)
    expect(interpreter.exports.hello).toBe('world')
    expect(interpreter.exports.idx0).toBe(3)

    // override existing modules
    interpreter.import('foo', 'foo2')
    interpreter.run(`
      exports.foo = foo
    `)
    expect(interpreter.exports.foo).toBe('foo2')

    // other than string / object, other types are not supported
    interpreter.import(2 as any)
    interpreter.import(undefined)
    interpreter.import(function() {})
    interpreter.import(true as any)
    interpreter.import(Symbol('hello') as any)
  })
})

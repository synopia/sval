import {Sval} from '../src'

describe('testing src/expression.ts', () => {
  it('should call expression run normally', () => {  
    const interpreter = new Sval()

    class A {
      a = 1
      then() {
        this.a++
        return this
      }
    }

    interpreter.import({ A })
    interpreter.run('exports.inst = new A().then()')

    expect(interpreter.exports.inst.a).toBe(2)
  })
  it('should unary expression run normally', () => {
    const interpreter = new Sval()

    const code = `
      exports.a = !(~(+(-1)))
      exports.b = void 0
      exports.c = typeof x // shouldn't throw err
      exports.d = 1
      exports.e = delete exports.d
      exports.f = typeof exports.e
    `
    interpreter.run(`!async function(){${code}}()`) // also test for generator env
    interpreter.run(code)

    expect(interpreter.exports.a).toBeTruthy()
    expect(interpreter.exports.b).toBeUndefined()
    expect(interpreter.exports.c).toBe('undefined')
    expect(interpreter.exports.d).toBeUndefined()
    expect(interpreter.exports.e).toBeTruthy()
    expect(interpreter.exports.f).toBe('boolean')
  })
  it('should binary expression run normally', () => {
    const interpreter = new Sval()

    const code = `
      // comparison
      exports.a = 1 == '1'
      exports.b = 1 != '1'
      exports.c = 1 === '1'
      exports.d = 1 !== '1'
      exports.e = 1 < 1
      exports.f = 1 <= 1
      exports.g = 1 > 1
      exports.h = 1 >= 1
      // bitwise offset
      exports.i = 1 << 1
      exports.j = 1 >> 1
      exports.k = 1 >>> 1
      exports.l = 1 | 2 // 01 | 10 = 11
      exports.m = 1 & 2 // 01 & 10 = 00
      exports.n = 1 ^ 1 // 01 ^ 01 = 00
      // calculate
      exports.o = 1 + 1
      exports.p = 1 - 1
      exports.q = 1 * 2
      exports.r = 2 / 2
      exports.s = 2 ** 2
      exports.t = 3 % 2
      // others
      const a = { b: 1 }
      exports.u = 'b' in a
      function b() {}
      const c = new b
      exports.v = c instanceof b
    `
    interpreter.run(`!async function(){${code}}()`) // also test for generator env
    interpreter.run(code)
    // comparison
    expect(interpreter.exports.a).toBeTruthy()
    expect(interpreter.exports.b).toBeFalsy()
    expect(interpreter.exports.c).toBeFalsy()
    expect(interpreter.exports.d).toBeTruthy()
    expect(interpreter.exports.e).toBeFalsy()
    expect(interpreter.exports.f).toBeTruthy()
    expect(interpreter.exports.g).toBeFalsy()
    expect(interpreter.exports.h).toBeTruthy()
    // bitwise offset
    expect(interpreter.exports.i).toBe(2)
    expect(interpreter.exports.j).toBe(0)
    expect(interpreter.exports.k).toBe(0)
    expect(interpreter.exports.l).toBe(3)
    expect(interpreter.exports.m).toBe(0)
    expect(interpreter.exports.n).toBe(0)
    // calculate
    expect(interpreter.exports.o).toBe(2)
    expect(interpreter.exports.p).toBe(0)
    expect(interpreter.exports.q).toBe(2)
    expect(interpreter.exports.r).toBe(1)
    expect(interpreter.exports.s).toBe(4)
    expect(interpreter.exports.t).toBe(1)
    // others
    expect(interpreter.exports.u).toBeTruthy()
    expect(interpreter.exports.v).toBeTruthy()
  })
  it('should assignment expression run normally', () => {
    const interpreter = new Sval()
    const code = `
      exports.a = 2
      expect(exports.a).toBe(2)
      exports.a -= 1
      expect(exports.a).toBe(1)
      exports.a *= 2
      expect(exports.a).toBe(2)
      exports.a **= 2
      expect(exports.a).toBe(4)
      exports.a /= 2
      expect(exports.a).toBe(2)
      exports.a %= 1
      expect(exports.a).toBe(0)
      exports.a += 1
      expect(exports.a).toBe(1)
      exports.a <<= 2
      expect(exports.a).toBe(4)
      exports.a >>= 1
      expect(exports.a).toBe(2)
      exports.a >>>= 1
      expect(exports.a).toBe(1)
      exports.a |= 1
      expect(exports.a).toBe(1)
      exports.a &= 1
      expect(exports.a).toBe(1)
      exports.a ^= 1
      expect(exports.a).toBe(0)
    `
    interpreter.import({ expect })
    interpreter.run(`!async function(){${code}}()`) // also test for generator env
    interpreter.run(code)
  })

  it ('should throw TypeError when assigning to constant', () => {
    const interpreter = new Sval()
    let error = null
    try {
      interpreter.run(`
        const x = 5
        x = 6
      `)
    } catch (ex) {
      error = ex
    }

    expect(error).toBeInstanceOf(TypeError)
  })

  it('should parse spread element normally', () => {
    const interpreter = new Sval()

    interpreter.run(`
      const arr = [1, 2]
      exports.a = [...arr]
      exports.b = [...[1, 2, 3]]
      
      f(...arr)
      function f(m, n) {
        exports.c = m
        exports.d = n
      }
    `)

    expect(interpreter.exports.a).toEqual([1, 2])
    expect(interpreter.exports.b).toEqual([1, 2, 3])
    expect(interpreter.exports.c).toBe(1)
    expect(interpreter.exports.d).toBe(2)
  })
  it('should parse regular expression normally', () => {  
    const interpreter = new Sval()
    interpreter.import({ expect })
    interpreter.run(`
      const re = /\\/\\*<([^>]+?)>\\*\\/([\\s\\S]*?)\\/\\*<\\/([^>]+?)>\\*\\//g
      exports.a = '/*<add>*//*hello*//*</add>*/ /*<add>*//*world*//*</add>*/'
        .replace(re, (_, start, content, end) => {
          expect(start).toBe('add')
          expect(end).toBe('add')
          return content.match(/\\/\\*([\\s\\S]*)\\*\\//)[1]
        })
    `)
    expect(interpreter.exports.a).toBe('hello world')
  })

  it('should support object expression', () => {  
    const interpreter = new Sval()
    interpreter.import({ expect })
    interpreter.run(`
      const name = 'y'
      const values = { a: 1, b: 2 }
      const a = {
        x: 5,
        [name]: 6,
        ...values
      }

      expect(a).toEqual(result = {
        x: 5,
        y: 6,
        a: 1,
        b: 2
      })

      // object with getter+setter
      const b = {
        _t: 1,
        get t() {
          return this._t
        },
        set t(v) {
          this._t = v
        }
      }

      b.t = 2

      exports.b = b
    `)

    const b = {
      _t: 1,
      get t() {
        return this._t
      },
      set t(v) {
        this._t = v
      }
    }

    b.t = 2

    expect(interpreter.exports.b).toEqual(b)
  })

  it('should support object expression with correct property descriptor', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      const a = {
        x: 5,
        get y() {
          return this.x + 1
        },
        set y(v) {
          this.x = v - 1
        }
      }

      exports.a = a
    `)

    const a = interpreter.exports.a;
    expect(Object.keys(a)).toEqual(['x', 'y'])

    const xPD = Object.getOwnPropertyDescriptor(a, 'x')
    expect(xPD).toEqual({
      configurable: true,
      enumerable: true,
      value: 5,
      writable: true
    })
    
    const yPD = Object.getOwnPropertyDescriptor(a, 'y')
    expect({
      configurable: yPD.configurable,
      enumerable: yPD.enumerable,
    }).toEqual({
      configurable: true,
      enumerable: true,
    })
  })

  it('should support logic expression', () => {  
    const interpreter = new Sval()
    interpreter.import({ expect })
    interpreter.run(`
      const x = 0
      const y = true

      expect(x && y).toBe(0)
      expect(x || y).toBe(true)
    `)
  })

  it('should support method call with super + getter', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      class X {
        get say() {
          return function() { return 1}
        }
      }

      class Y extends X {
        say() {
          return super.say()
        }
      }

      exports.result = new Y().say()
    `)

    expect(interpreter.exports.result).toEqual(1);
  })

  it('should support method call with computed name', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      var x = {
        say() {
          return 1
        }
      }

      exports.result = x['say']()
    `)

    expect(interpreter.exports.result).toEqual(1);
  })

  it('should call methods with undefined and null', () => {
    const interpreter = new Sval()
    const outerUnd = (msg)=>{
      expect(msg).toBeUndefined()
    }
    const outerNull = (msg)=>{
      expect(msg).toBeNull()
    }
    interpreter.import({outerUnd, outerNull})
    interpreter.run(`
      const a = undefined
      const b = null
      outerUnd(a)
      outerNull(b)
      
      const callX = (x,y)=>{
        exports.x = x 
        exports.y = y 
      }
      const callU = (u,v)=>{
        exports.u = u 
        exports.v = v 
      }

      callX(undefined,null) 
      callU(a,b) 
    `)

    expect(interpreter.exports.x).toBeUndefined()
    expect(interpreter.exports.y).toBeNull()
    expect(interpreter.exports.u).toBeUndefined()
    expect(interpreter.exports.v).toBeNull()
  })

  it('should support method call with computed name', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      exports.result = 1+!!2
    `)

    expect(interpreter.exports.result).toEqual(2);
  })

  it('should support all kinds of delete actions', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      var x = {}

      // normal behavior for 'delete' in strict mode
      delete x.x

      // delete any literal except undefined, undefined is an identifier in js
      let result = true
      result &= delete 1
      result &= '1'
      result &= delete true
      result &= delete Symbol('xx')
      result &= delete null
      result &= delete {}
      result &= delete function () {}
      result &= delete /x/

      exports.result = result
    `)

    expect(interpreter.exports.result).toBeTruthy()

    let error = null;
    try {
      interpreter.run(`
        // trying to delete a regular identifier in strict mode
        var y = {}
        delete y
      `)
    } catch (ex) {
      error = ex
    }

    expect(error).toBeInstanceOf(SyntaxError);
  })
})

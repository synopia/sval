import {Sval} from '../src'

describe('testing src/index.ts', () => {
  it('should parse object pattern normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      const tmp = 'd'
      const { a, b, c = 3, [tmp]: d, e = 2 } = { a: 1, b: 2, d: 4, e: 3 }
      exports.a = a
      exports.b = b
      exports.c = c
      exports.d = d
      exports.e = e
    `)
    expect(interpreter.exports.a).toBe(1)
    expect(interpreter.exports.b).toBe(2)
    expect(interpreter.exports.c).toBe(3)
    expect(interpreter.exports.d).toBe(4)
    expect(interpreter.exports.e).toBe(3)
  })
  it('should parse assign pattern normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      const [a, b] = [1, 2]
      exports.a = a
      exports.b = b
    `)
    expect(interpreter.exports.a).toBe(1)
    expect(interpreter.exports.b).toBe(2)
  })
  it('should parse array pattern normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      let a = 1, b = 2;
      [a, b] = [b, a]
      exports.a = a
      exports.b = b
    `)
    expect(interpreter.exports.a).toBe(2)
    expect(interpreter.exports.b).toBe(1)
  })
  it('should parse rest element normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      let a;
      [...a] = [1, 2]
      const [...b] = [1, 2, 3]
      const [c, ...d] = [1, 2, 3]
      exports.a = a
      exports.b = b
      exports.c = c
      exports.d = d
      const o = { a: 1, b: 2, c: 3 }
      const { ...e } = o
      const { a: f, ...g } = o
      const h = { a: 2, ...o, d: 4}
      const [i = 3, [j, ...k], ...[x, y]] = [1, [2, 3, 4], 5, 6]
      const [ , z] = [7, 8]
      exports.e = e
      exports.f = f
      exports.g = g
      exports.h = h
      exports.i = i
      exports.j = j
      exports.k = k
      exports.x = x
      exports.y = y
      exports.z = z
    `)
    expect(interpreter.exports.a).toEqual([1, 2])
    expect(interpreter.exports.b).toEqual([1, 2, 3])
    expect(interpreter.exports.c).toBe(1)
    expect(interpreter.exports.d).toEqual([2, 3])
    expect(interpreter.exports.e).toEqual({ a: 1, b: 2, c: 3 })
    expect(interpreter.exports.f).toBe(1)
    expect(interpreter.exports.g).toEqual({ b: 2, c: 3 })
    expect(interpreter.exports.h).toEqual({ a: 1, b: 2, c: 3, d: 4 })
    expect(interpreter.exports.i).toEqual(1)
    expect(interpreter.exports.j).toEqual(2)
    expect(interpreter.exports.k).toEqual([3,4])
    expect(interpreter.exports.x).toEqual(5)
    expect(interpreter.exports.y).toEqual(6)
    expect(interpreter.exports.z).toEqual(8)
  })
  it('should parse rest element of function params normally', () => {  
    const interpreter = new Sval()
    interpreter.run(`
      a(1, 2)
      c(1, 2, 3)
      function a(...b) {
        exports.b = b
      }
      function c(d = 4, ...e) {
        exports.d = d
        exports.e = e
      }
    `)
    expect(interpreter.exports.b).toEqual([1, 2])
    expect(interpreter.exports.e).toEqual([2, 3])
    expect(interpreter.exports.d).toBe(1)
  })
})

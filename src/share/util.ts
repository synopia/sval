export const freeze = Object.freeze

export const define = Object.defineProperty

export const getDptor = Object.getOwnPropertyDescriptor

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn(obj: any, key: string): boolean {
  return hasOwnProperty.call(obj, key)
}

export const getOwnNames = Object.getOwnPropertyNames

const setPrototypeOf = Object.setPrototypeOf
export function setProto(obj: any, proto: any) {
  setPrototypeOf ? setPrototypeOf(obj, proto) : obj.__proto__ = proto
}

const getPrototypeOf = Object.getPrototypeOf
export function getProto(obj: any) {
  return getPrototypeOf ? getPrototypeOf(obj) : obj.__proto__
}

const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
function getGetterOrSetter(method: 'get' | 'set', obj: any, key: string) {
  while (obj) {
    const descriptor = getOwnPropertyDescriptor(obj, key)
    const value = typeof descriptor !== 'undefined'
      && typeof descriptor.writable === 'undefined'
      && typeof descriptor[method] === 'function'
      && descriptor[method]
    if (value) {
      return value
    } else {
      obj = getProto(obj)
    }
  }
}
export function getGetter(obj: any, key: string) {
  return getGetterOrSetter('get', obj, key)
}
export function getSetter(obj: any, key: string) {
  return getGetterOrSetter('set', obj, key)
}

export const create = Object.create
export function inherits(
  subClass: (...args: any[]) => any,
  superClass: (...args: any[]) => any,
) {
  setProto(subClass, superClass) // allow to access static methods from derived class
  subClass.prototype = create(superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
    }
  })
}

export function _assign(target: any): any {
    for (let i = 1; i < arguments.length; ++i) {
      const source = arguments[i]
      for (const key in source) {
        if (hasOwn(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
}
export const assign = Object.assign ||  _assign

let names: string[] = []
export let globalObj = create(null)
try {
  // Browser environment
  if (!(window as any).Object) throw 0
  names = getOwnNames(globalObj = window).filter(n => n !== 'webkitStorageInfo')
} catch (err) {
}
const win = create({})
for (let i = 0; i < names.length; i++) {
  const name = names[i]
  try { win[name] = globalObj[name] } catch (err) { /* empty */ }
}
export const WINDOW = createSymbol('window')
export function createSandBox() {
  return assign(create({ [WINDOW]: globalObj }), win)
}

export function createSymbol(key: string) {
  return key + Math.random().toString(36).substring(2)
}

export function getAsyncIterator(obj: any) {
  let iterator: any
  if (typeof Symbol === 'function') {
    iterator = obj[Symbol.asyncIterator]
    !iterator && (iterator = obj[Symbol.iterator])
  }
  if (iterator) {
    return iterator.call(obj)
  } else if (typeof obj.next === 'function') {
    return obj
  } else {
    let i = 0
    return {
      next() {
        if (obj && i >= obj.length) obj = undefined
        return { value: obj && obj[i++], done: !obj }
      }
    }
  }
}

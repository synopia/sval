import { parseScript } from 'meriyah';

var declaration$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get FunctionDeclaration () { return FunctionDeclaration$1; },
  get VariableDeclaration () { return VariableDeclaration$1; },
  get VariableDeclarator () { return VariableDeclarator$1; },
  get ClassDeclaration () { return ClassDeclaration$1; },
  get ClassBody () { return ClassBody$1; },
  get MethodDefinition () { return MethodDefinition$1; }
});
var declaration = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get FunctionDeclaration () { return FunctionDeclaration; },
  get VariableDeclaration () { return VariableDeclaration; },
  get VariableDeclarator () { return VariableDeclarator; },
  get ClassDeclaration () { return ClassDeclaration; },
  get ClassBody () { return ClassBody; },
  get MethodDefinition () { return MethodDefinition; }
});

const freeze = Object.freeze;
const define = Object.defineProperty;
const getDptor = Object.getOwnPropertyDescriptor;
const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}
const getOwnNames = Object.getOwnPropertyNames;
const setPrototypeOf = Object.setPrototypeOf;
function setProto(obj, proto) {
    setPrototypeOf ? setPrototypeOf(obj, proto) : obj.__proto__ = proto;
}
const getPrototypeOf = Object.getPrototypeOf;
function getProto(obj) {
    return getPrototypeOf ? getPrototypeOf(obj) : obj.__proto__;
}
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
function getGetterOrSetter(method, obj, key) {
    while (obj) {
        const descriptor = getOwnPropertyDescriptor(obj, key);
        const value = typeof descriptor !== 'undefined'
            && typeof descriptor.writable === 'undefined'
            && typeof descriptor[method] === 'function'
            && descriptor[method];
        if (value) {
            return value;
        }
        else {
            obj = getProto(obj);
        }
    }
}
function getGetter(obj, key) {
    return getGetterOrSetter('get', obj, key);
}
function getSetter(obj, key) {
    return getGetterOrSetter('set', obj, key);
}
const create = Object.create;
function inherits(subClass, superClass) {
    setProto(subClass, superClass);
    subClass.prototype = create(superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
        }
    });
}
function _assign(target) {
    for (let i = 1; i < arguments.length; ++i) {
        const source = arguments[i];
        for (const key in source) {
            if (hasOwn(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}
const assign = Object.assign || _assign;
let names = [];
let globalObj = create(null);
try {
    if (!window.Object)
        throw 0;
    names = getOwnNames(globalObj = window).filter(n => n !== 'webkitStorageInfo');
}
catch (err) {
}
const win = create({});
for (let i = 0; i < names.length; i++) {
    const name = names[i];
    try {
        win[name] = globalObj[name];
    }
    catch (err) { }
}
const WINDOW = createSymbol('window');
function createSandBox() {
    return assign(create({ [WINDOW]: globalObj }), win);
}
function createSymbol(key) {
    return key + Math.random().toString(36).substring(2);
}
function getAsyncIterator(obj) {
    let iterator;
    if (typeof Symbol === 'function') {
        iterator = obj[Symbol.asyncIterator];
        !iterator && (iterator = obj[Symbol.iterator]);
    }
    if (iterator) {
        return iterator.call(obj);
    }
    else if (typeof obj.next === 'function') {
        return obj;
    }
    else {
        let i = 0;
        return {
            next() {
                if (obj && i >= obj.length)
                    obj = undefined;
                return { value: obj && obj[i++], done: !obj };
            }
        };
    }
}

var version = "0.5.0";

const AWAIT = { RES: undefined };
const RETURN = { RES: undefined };
const CONTINUE = createSymbol('continue');
const BREAK = createSymbol('break');
const SUPER = createSymbol('super');
const SUPERCALL = createSymbol('supercall');
const NOCTOR = createSymbol('noctor');
const CLSCTOR = createSymbol('clsctor');
const NEWTARGET = createSymbol('newtarget');
const NOINIT = createSymbol('noinit');
const DEADZONE = createSymbol('deadzone');

class Var {
    kind;
    value;
    constructor(kind, value) {
        this.kind = kind;
        this.value = value;
    }
    get() {
        return this.value;
    }
    set(value) {
        if (this.kind === 'const') {
            throw new TypeError('Assignment to constant variable');
        }
        else {
            return this.value = value;
        }
    }
}
class Prop {
    object;
    property;
    constructor(object, property) {
        this.object = object;
        this.property = property;
    }
    get() {
        return this.object[this.property];
    }
    set(value) {
        this.object[this.property] = value;
        return true;
    }
    del() {
        return delete this.object[this.property];
    }
}

class Scope {
    parent;
    isolated;
    context = create(null);
    listener;
    constructor(parent = null, isolated = false, listener = undefined) {
        this.parent = parent;
        this.isolated = isolated;
        this.listener = listener;
    }
    global() {
        let scope = this;
        while (scope.parent) {
            scope = scope.parent;
        }
        return scope;
    }
    clone() {
        const cloneScope = new Scope(this.parent, this.isolated);
        for (const name in this.context) {
            const variable = this.context[name];
            cloneScope[variable.kind](name, variable.get());
        }
        return cloneScope;
    }
    find(name) {
        if (this.context[name]) {
            return this.context[name];
        }
        else if (this.parent) {
            return this.parent.find(name);
        }
        else {
            const win = this.global().find('window').get();
            if (name in win) {
                return new Prop(win, name);
            }
            else {
                return null;
            }
        }
    }
    var(name, value) {
        let scope = this;
        while (scope.parent && !scope.isolated) {
            scope = scope.parent;
        }
        const variable = scope.context[name];
        if (!variable) {
            scope.context[name] = new Var('var', value === NOINIT ? undefined : value);
        }
        else {
            if (variable.kind === 'var') {
                if (value !== NOINIT) {
                    variable.set(value);
                }
            }
            else {
                throw new SyntaxError(`Identifier '${name}' has already been declared`);
            }
        }
        if (!scope.parent) {
            const win = scope.find('window').get();
            if (value !== NOINIT) {
                define(win, name, { value, writable: true, enumerable: true });
            }
        }
    }
    let(name, value) {
        const variable = this.context[name];
        if (!variable || variable.get() === DEADZONE) {
            this.context[name] = new Var('let', value);
        }
        else {
            throw new SyntaxError(`Identifier '${name}' has already been declared`);
        }
    }
    const(name, value) {
        const variable = this.context[name];
        if (!variable || variable.get() === DEADZONE) {
            this.context[name] = new Var('const', value);
        }
        else {
            throw new SyntaxError(`Identifier '${name}' has already been declared`);
        }
    }
    func(name, value) {
        const variable = this.context[name];
        if (!variable || variable.kind === 'var') {
            this.context[name] = new Var('var', value);
        }
        else {
            throw new SyntaxError(`Identifier '${name}' has already been declared`);
        }
    }
}

function Identifier$1(node, scope, options = {}) {
    const { getVar = false, throwErr = true } = options;
    if (node.name === 'undefined') {
        return undefined;
    }
    const variable = scope.find(node.name);
    if (variable) {
        if (getVar) {
            return variable;
        }
        else {
            const value = variable.get();
            if (value === DEADZONE) {
                throw new ReferenceError(`${node.name} is not defined`);
            }
            else {
                return value;
            }
        }
    }
    else if (throwErr) {
        throw new ReferenceError(`${node.name} is not defined`);
    }
    else {
        return undefined;
    }
}

var identifier$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Identifier: Identifier$1
});

function Literal$1(node, scope) {
    return node.value;
}

var literal$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Literal: Literal$1
});

function ThisExpression$1(node, scope) {
    const superCall = scope.find(SUPERCALL);
    if (superCall && !superCall.get()) {
        throw new ReferenceError('Must call super constructor in derived class '
            + 'before accessing \'this\' or returning from derived constructor');
    }
    else {
        return scope.find('this').get();
    }
}
function ArrayExpression$1(node, scope) {
    let results = [];
    for (let i = 0; i < node.elements.length; i++) {
        const item = node.elements[i];
        if (item.type === 'SpreadElement') {
            results = results.concat(SpreadElement$1(item, scope));
        }
        else {
            results.push(evaluate$1(item, scope));
        }
    }
    return results;
}
function ObjectExpression$1(node, scope) {
    const object = {};
    for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i];
        if (property.type === 'SpreadElement') {
            assign(object, SpreadElement$1(property, scope));
        }
        else {
            let key;
            const propKey = property.key;
            if (property.computed) {
                key = evaluate$1(propKey, scope);
            }
            else {
                if (propKey.type === 'Identifier') {
                    key = propKey.name;
                }
                else {
                    key = '' + (Literal$1(propKey));
                }
            }
            const value = evaluate$1(property.value, scope);
            const propKind = property.kind;
            if (propKind === 'init') {
                object[key] = value;
            }
            else if (propKind === 'get') {
                const oriDptor = getDptor(object, key);
                define(object, key, {
                    get: value,
                    set: oriDptor && oriDptor.set,
                    enumerable: true,
                    configurable: true
                });
            }
            else {
                const oriDptor = getDptor(object, key);
                define(object, key, {
                    get: oriDptor && oriDptor.get,
                    set: value,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    }
    return object;
}
function FunctionExpression$1(node, scope) {
    if (node.id && node.id.name) {
        const tmpScope = new Scope(scope);
        const func = createFunc(node, tmpScope);
        tmpScope.const(node.id.name, func);
        return func;
    }
    else {
        return createFunc(node, scope);
    }
}
function UnaryExpression$1(node, scope) {
    const arg = node.argument;
    switch (node.operator) {
        case '+': return +(evaluate$1(arg, scope));
        case '-': return -(evaluate$1(arg, scope));
        case '!': return !(evaluate$1(arg, scope));
        case '~': return ~(evaluate$1(arg, scope));
        case 'void': return void (evaluate$1(arg, scope));
        case 'typeof':
            if (arg.type === 'Identifier') {
                return typeof (Identifier$1(arg, scope, { throwErr: false }));
            }
            else {
                return typeof (evaluate$1(arg, scope));
            }
        case 'delete':
            if (arg.type === 'MemberExpression') {
                const variable = MemberExpression$1(arg, scope, { getVar: true });
                return variable.del();
            }
            else if (arg.type === 'Identifier') {
                throw new SyntaxError('Delete of an unqualified identifier in strict mode');
            }
            else {
                evaluate$1(arg, scope);
                return true;
            }
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function UpdateExpression$1(node, scope) {
    const arg = node.argument;
    let variable;
    if (arg.type === 'Identifier') {
        variable = Identifier$1(arg, scope, { getVar: true });
    }
    else if (arg.type === 'MemberExpression') {
        variable = MemberExpression$1(arg, scope, { getVar: true });
    }
    else {
        throw new SyntaxError('Unexpected token');
    }
    const value = variable.get();
    if (node.operator === '++') {
        variable.set(value + 1);
        return node.prefix ? variable.get() : value;
    }
    else if (node.operator === '--') {
        variable.set(value - 1);
        return node.prefix ? variable.get() : value;
    }
    else {
        throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function BinaryExpression$1(node, scope) {
    const left = evaluate$1(node.left, scope);
    const right = evaluate$1(node.right, scope);
    switch (node.operator) {
        case '==': return left == right;
        case '!=': return left != right;
        case '===': return left === right;
        case '!==': return left !== right;
        case '<': return left < right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '>=': return left >= right;
        case '<<': return left << right;
        case '>>': return left >> right;
        case '>>>': return left >>> right;
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '**': return left ** right;
        case '/': return left / right;
        case '%': return left % right;
        case '|': return left | right;
        case '^': return left ^ right;
        case '&': return left & right;
        case 'in': return left in right;
        case 'instanceof': return left instanceof right;
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function AssignmentExpression$1(node, scope) {
    const value = evaluate$1(node.right, scope);
    const left = node.left;
    let variable;
    if (left.type === 'Identifier') {
        variable = Identifier$1(left, scope, { getVar: true, throwErr: false });
        if (!variable) {
            const win = scope.global().find('window').get();
            variable = new Prop(win, left.name);
        }
    }
    else if (left.type === 'MemberExpression') {
        variable = MemberExpression$1(left, scope, { getVar: true });
    }
    else {
        return pattern(left, scope, { feed: value });
    }
    switch (node.operator) {
        case '=':
            variable.set(value);
            return variable.get();
        case '+=':
            variable.set(variable.get() + value);
            return variable.get();
        case '-=':
            variable.set(variable.get() - value);
            return variable.get();
        case '*=':
            variable.set(variable.get() * value);
            return variable.get();
        case '/=':
            variable.set(variable.get() / value);
            return variable.get();
        case '%=':
            variable.set(variable.get() % value);
            return variable.get();
        case '**=':
            variable.set(variable.get() ** value);
            return variable.get();
        case '<<=':
            variable.set(variable.get() << value);
            return variable.get();
        case '>>=':
            variable.set(variable.get() >> value);
            return variable.get();
        case '>>>=':
            variable.set(variable.get() >>> value);
            return variable.get();
        case '|=':
            variable.set(variable.get() | value);
            return variable.get();
        case '^=':
            variable.set(variable.get() ^ value);
            return variable.get();
        case '&=':
            variable.set(variable.get() & value);
            return variable.get();
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function LogicalExpression$1(node, scope) {
    switch (node.operator) {
        case '||':
            return (evaluate$1(node.left, scope)) || (evaluate$1(node.right, scope));
        case '&&':
            return (evaluate$1(node.left, scope)) && (evaluate$1(node.right, scope));
        default:
            throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function MemberExpression$1(node, scope, options = {}) {
    const { getObj = false, getVar = false } = options;
    let object;
    if (node.object.type === 'Super') {
        object = Super$1(node.object, scope, { getProto: true });
    }
    else {
        object = evaluate$1(node.object, scope);
    }
    if (getObj)
        return object;
    let key;
    if (node.computed) {
        key = evaluate$1(node.property, scope);
    }
    else {
        key = node.property.name;
    }
    if (getVar) {
        const setter = getSetter(object, key);
        if (node.object.type === 'Super' && setter) {
            const thisObject = scope.find('this').get();
            const privateKey = createSymbol(key);
            define(thisObject, privateKey, { set: setter });
            return new Prop(thisObject, privateKey);
        }
        else {
            return new Prop(object, key);
        }
    }
    else {
        const getter = getGetter(object, key);
        if (node.object.type === 'Super' && getter) {
            const thisObject = scope.find('this').get();
            return getter.call(thisObject);
        }
        else {
            return object[key];
        }
    }
}
function ConditionalExpression$1(node, scope) {
    return (evaluate$1(node.test, scope))
        ? (evaluate$1(node.consequent, scope))
        : (evaluate$1(node.alternate, scope));
}
function CallExpression$1(node, scope) {
    let func;
    let object;
    if (node.callee.type === 'MemberExpression') {
        object = MemberExpression$1(node.callee, scope, { getObj: true });
        let key;
        if (node.callee.computed) {
            key = evaluate$1(node.callee.property, scope);
        }
        else {
            key = node.callee.property.name;
        }
        if (node.callee.object.type === 'Super') {
            const thisObject = scope.find('this').get();
            func = object[key].bind(thisObject);
        }
        else {
            func = object[key];
        }
        if (typeof func !== 'function') {
            throw new TypeError(`${key} is not a function`);
        }
        else if (func[CLSCTOR]) {
            throw new TypeError(`Class constructor ${key} cannot be invoked without 'new'`);
        }
    }
    else {
        object = scope.find('this').get();
        func = evaluate$1(node.callee, scope);
        if (typeof func !== 'function' || node.callee.type !== 'Super' && func[CLSCTOR]) {
            let name;
            if (node.callee.type === 'Identifier') {
                name = node.callee.name;
            }
            else {
                try {
                    name = JSON.stringify(func);
                }
                catch (err) {
                    name = '' + func;
                }
            }
            if (typeof func !== 'function') {
                throw new TypeError(`${name} is not a function`);
            }
            else {
                throw new TypeError(`Class constructor ${name} cannot be invoked without 'new'`);
            }
        }
    }
    let args = [];
    for (let i = 0; i < node.arguments.length; i++) {
        const arg = node.arguments[i];
        if (arg.type === 'SpreadElement') {
            args = args.concat(SpreadElement$1(arg, scope));
        }
        else {
            args.push(evaluate$1(arg, scope));
        }
    }
    if (node.callee.type === 'Super') {
        const superCall = scope.find(SUPERCALL);
        if (superCall.get()) {
            throw new ReferenceError('Super constructor may only be called once');
        }
        else {
            scope.find(SUPERCALL).set(true);
        }
    }
    if (object && object[WINDOW] && func.toString().indexOf('[native code]') !== -1) {
        return func.apply(object[WINDOW], args);
    }
    return func.apply(object, args);
}
function NewExpression$1(node, scope) {
    const constructor = evaluate$1(node.callee, scope);
    if (typeof constructor !== 'function') {
        let name;
        if (node.callee.type === 'Identifier') {
            name = node.callee.name;
        }
        else {
            try {
                name = JSON.stringify(constructor);
            }
            catch (err) {
                name = '' + constructor;
            }
        }
        throw new TypeError(`${name} is not a constructor`);
    }
    else if (constructor[NOCTOR]) {
        throw new TypeError(`${constructor.name || '(intermediate value)'} is not a constructor`);
    }
    let args = [];
    for (let i = 0; i < node.arguments.length; i++) {
        const arg = node.arguments[i];
        if (arg.type === 'SpreadElement') {
            args = args.concat(SpreadElement$1(arg, scope));
        }
        else {
            args.push(evaluate$1(arg, scope));
        }
    }
    return new constructor(...args);
}
function MetaProperty$1(node, scope) {
    return scope.find(NEWTARGET).get();
}
function SequenceExpression$1(node, scope) {
    let result;
    for (let i = 0; i < node.expressions.length; i++) {
        result = evaluate$1(node.expressions[i], scope);
    }
    return result;
}
function ArrowFunctionExpression$1(node, scope) {
    return createFunc(node, scope);
}
function TemplateLiteral$1(node, scope) {
    const quasis = node.quasis.slice();
    const expressions = node.expressions.slice();
    let result = '';
    let temEl;
    let expr;
    while (temEl = quasis.shift()) {
        result += TemplateElement$1(temEl);
        expr = expressions.shift();
        if (expr) {
            result += evaluate$1(expr, scope);
        }
    }
    return result;
}
function TaggedTemplateExpression$1(node, scope) {
    const tagFunc = evaluate$1(node.tag, scope);
    const quasis = node.quasi.quasis;
    const str = quasis.map(v => v.value.cooked);
    const raw = quasis.map(v => v.value.raw);
    define(str, 'raw', {
        value: freeze(raw)
    });
    const expressions = node.quasi.expressions;
    const args = [];
    if (expressions) {
        for (let i = 0; i < expressions.length; i++) {
            args.push(evaluate$1(expressions[i], scope));
        }
    }
    return tagFunc(freeze(str), ...args);
}
function TemplateElement$1(node, scope) {
    return node.value.raw;
}
function ClassExpression$1(node, scope) {
    if (node.id && node.id.name) {
        const tmpScope = new Scope(scope);
        const klass = createClass(node, tmpScope);
        tmpScope.const(node.id.name, klass);
        return klass;
    }
    else {
        return createClass(node, scope);
    }
}
function Super$1(node, scope, options = {}) {
    const { getProto = false } = options;
    const superClass = scope.find(SUPER).get();
    return getProto ? superClass.prototype : superClass;
}
function SpreadElement$1(node, scope) {
    return evaluate$1(node.argument, scope);
}

var expression$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ThisExpression: ThisExpression$1,
  ArrayExpression: ArrayExpression$1,
  ObjectExpression: ObjectExpression$1,
  FunctionExpression: FunctionExpression$1,
  UnaryExpression: UnaryExpression$1,
  UpdateExpression: UpdateExpression$1,
  BinaryExpression: BinaryExpression$1,
  AssignmentExpression: AssignmentExpression$1,
  LogicalExpression: LogicalExpression$1,
  MemberExpression: MemberExpression$1,
  ConditionalExpression: ConditionalExpression$1,
  CallExpression: CallExpression$1,
  NewExpression: NewExpression$1,
  MetaProperty: MetaProperty$1,
  SequenceExpression: SequenceExpression$1,
  ArrowFunctionExpression: ArrowFunctionExpression$1,
  TemplateLiteral: TemplateLiteral$1,
  TaggedTemplateExpression: TaggedTemplateExpression$1,
  TemplateElement: TemplateElement$1,
  ClassExpression: ClassExpression$1,
  Super: Super$1,
  SpreadElement: SpreadElement$1
});

function ExpressionStatement$1(node, scope) {
    evaluate$1(node.expression, scope);
}
function BlockStatement$1(block, scope, options = {}) {
    const { invasived = false, hoisted = false, } = options;
    const subScope = invasived ? scope : new Scope(scope);
    if (!hoisted) {
        hoist(block, subScope, { onlyBlock: true });
    }
    for (let i = 0; i < block.body.length; i++) {
        const result = evaluate$1(block.body[i], subScope);
        if (result === BREAK || result === CONTINUE || result === RETURN) {
            return result;
        }
    }
}
function EmptyStatement$1() {
}
function DebuggerStatement$1() {
    debugger;
}
function ReturnStatement$1(node, scope) {
    RETURN.RES = node.argument ? (evaluate$1(node.argument, scope)) : undefined;
    return RETURN;
}
function BreakStatement$1() {
    return BREAK;
}
function ContinueStatement$1() {
    return CONTINUE;
}
function IfStatement$1(node, scope) {
    if (evaluate$1(node.test, scope)) {
        return evaluate$1(node.consequent, scope);
    }
    else {
        return evaluate$1(node.alternate, scope);
    }
}
function SwitchStatement$1(node, scope) {
    const discriminant = evaluate$1(node.discriminant, scope);
    let matched = false;
    for (let i = 0; i < node.cases.length; i++) {
        const eachCase = node.cases[i];
        if (!matched
            && (!eachCase.test
                || (evaluate$1(eachCase.test, scope)) === discriminant)) {
            matched = true;
        }
        if (matched) {
            const result = SwitchCase$1(eachCase, scope);
            if (result === BREAK) {
                break;
            }
            if (result === CONTINUE || result === RETURN) {
                return result;
            }
        }
    }
}
function SwitchCase$1(node, scope) {
    for (let i = 0; i < node.consequent.length; i++) {
        const result = evaluate$1(node.consequent[i], scope);
        if (result === BREAK || result === CONTINUE || result === RETURN) {
            return result;
        }
    }
}
function ThrowStatement$1(node, scope) {
    throw evaluate$1(node.argument, scope);
}
function TryStatement$1(node, scope) {
    try {
        return BlockStatement$1(node.block, scope);
    }
    catch (err) {
        if (node.handler) {
            const subScope = new Scope(scope);
            const param = node.handler.param;
            if (param) {
                if (param.type === 'Identifier') {
                    const name = param.name;
                    subScope.var(name, err);
                }
                else {
                    pattern(param, scope, { feed: err });
                }
            }
            return CatchClause$1(node.handler, subScope);
        }
        else {
            throw err;
        }
    }
    finally {
        if (node.finalizer) {
            const result = BlockStatement$1(node.finalizer, scope);
            if (result === BREAK || result === CONTINUE || result === RETURN) {
                return result;
            }
        }
    }
}
function CatchClause$1(node, scope) {
    return BlockStatement$1(node.body, scope, { invasived: true });
}
function WhileStatement$1(node, scope) {
    while (evaluate$1(node.test, scope)) {
        const result = evaluate$1(node.body, scope);
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function DoWhileStatement$1(node, scope) {
    do {
        const result = evaluate$1(node.body, scope);
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    } while (evaluate$1(node.test, scope));
}
function ForStatement$1(node, scope) {
    const forScope = new Scope(scope);
    for (evaluate$1(node.init, forScope); node.test ? (evaluate$1(node.test, forScope)) : true; evaluate$1(node.update, forScope)) {
        const subScope = new Scope(forScope);
        let result;
        if (node.body.type === 'BlockStatement') {
            result = BlockStatement$1(node.body, subScope, { invasived: true });
        }
        else {
            result = evaluate$1(node.body, subScope);
        }
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function ForInStatement$1(node, scope) {
    for (const value in evaluate$1(node.right, scope)) {
        const result = ForXHandler(node, scope, { value });
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function ForOfStatement$1(node, scope) {
    const right = evaluate$1(node.right, scope);
    for (const value of right) {
        const result = ForXHandler(node, scope, { value });
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}

var statement$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ExpressionStatement: ExpressionStatement$1,
  BlockStatement: BlockStatement$1,
  EmptyStatement: EmptyStatement$1,
  DebuggerStatement: DebuggerStatement$1,
  ReturnStatement: ReturnStatement$1,
  BreakStatement: BreakStatement$1,
  ContinueStatement: ContinueStatement$1,
  IfStatement: IfStatement$1,
  SwitchStatement: SwitchStatement$1,
  SwitchCase: SwitchCase$1,
  ThrowStatement: ThrowStatement$1,
  TryStatement: TryStatement$1,
  CatchClause: CatchClause$1,
  WhileStatement: WhileStatement$1,
  DoWhileStatement: DoWhileStatement$1,
  ForStatement: ForStatement$1,
  ForInStatement: ForInStatement$1,
  ForOfStatement: ForOfStatement$1
});

function ObjectPattern$1(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed = {} } = options;
    const fedKeys = [];
    for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i];
        if (hoist) {
            if (onlyBlock || kind === 'var') {
                if (property.type === 'Property') {
                    const value = property.value;
                    if (value.type === 'Identifier') {
                        scope[kind](value.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
                    }
                    else {
                        pattern(value, scope, { kind, hoist, onlyBlock });
                    }
                }
                else {
                    RestElement$1(property, scope, { kind, hoist, onlyBlock });
                }
            }
        }
        else if (property.type === 'Property') {
            let key;
            if (property.computed) {
                key = evaluate$1(property.key, scope);
            }
            else {
                key = property.key.name;
            }
            fedKeys.push(key);
            const value = property.value;
            if (value.type === 'Identifier') {
                scope[kind](value.name, feed[key]);
            }
            else {
                pattern(value, scope, { kind, feed: feed[key] });
            }
        }
        else {
            const rest = assign({}, feed);
            for (let i = 0; i < fedKeys.length; i++)
                delete rest[fedKeys[i]];
            RestElement$1(property, scope, { kind, feed: rest });
        }
    }
}
function ArrayPattern$1(node, scope, options = {}) {
    const { kind, hoist = false, onlyBlock = false, feed = [] } = options;
    const result = [];
    for (let i = 0; i < node.elements.length; i++) {
        const element = node.elements[i];
        if (!element)
            continue;
        if (hoist) {
            if (onlyBlock || kind === 'var') {
                if (element.type === 'Identifier') {
                    scope[kind](element.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
                }
                else {
                    pattern(element, scope, { kind, hoist, onlyBlock });
                }
            }
        }
        else if (element.type === 'Identifier') {
            if (kind) {
                scope[kind](element.name, feed[i]);
            }
            else {
                const variable = Identifier$1(element, scope, { getVar: true });
                variable.set(feed[i]);
                result.push(variable.get());
            }
        }
        else if (element.type === 'RestElement') {
            RestElement$1(element, scope, { kind, feed: feed.slice(i) });
        }
        else {
            pattern(element, scope, { kind, feed: feed[i] });
        }
    }
    if (result.length) {
        return result;
    }
}
function RestElement$1(node, scope, options = {}) {
    const { kind, hoist = false, onlyBlock = false, feed = [] } = options;
    const arg = node.argument;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (arg.type === 'Identifier') {
                scope[kind](arg.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                pattern(arg, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else if (arg.type === 'Identifier') {
        if (kind) {
            scope[kind](arg.name, feed);
        }
        else {
            const variable = Identifier$1(arg, scope, { getVar: true });
            variable.set(feed);
        }
    }
    else {
        pattern(arg, scope, { kind, feed });
    }
}
function AssignmentPattern$1(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed = evaluate$1(node.right, scope) } = options;
    const left = node.left;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (left.type === 'Identifier') {
                scope[kind](left.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                pattern(left, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else if (left.type === 'Identifier') {
        scope[kind](left.name, feed);
    }
    else {
        pattern(left, scope, { kind, feed });
    }
}

var pattern$3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ObjectPattern: ObjectPattern$1,
  ArrayPattern: ArrayPattern$1,
  RestElement: RestElement$1,
  AssignmentPattern: AssignmentPattern$1
});

function Program(program, scope) {
    for (let i = 0; i < program.body.length; i++) {
        evaluate$1(program.body[i], scope);
    }
}

var program = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Program: Program
});

let evaluateOps$1;
function evaluate$1(node, scope) {
    if (!node)
        return;
    if (!evaluateOps$1) {
        evaluateOps$1 = assign({}, declaration$1, expression$1, identifier$1, statement$1, literal$1, pattern$3, program);
    }
    const handler = evaluateOps$1[node.type];
    if (handler) {
        try {
            scope.listener?.beforeNode(node);
            const result = handler(node, scope);
            return scope.listener ? scope.listener.afterNode(node, result, null) : result;
        }
        catch (error) {
            const rethrow = scope.listener ? scope.listener.afterNode(node, null, error) : error;
            if (rethrow) {
                throw rethrow;
            }
        }
    }
    else {
        throw new Error(`${node.type} isn't implemented`);
    }
}

function FunctionDeclaration$1(node, scope) {
    scope.func(node.id.name, createFunc(node, scope));
}
function VariableDeclaration$1(node, scope, options = {}) {
    for (let i = 0; i < node.declarations.length; i++) {
        VariableDeclarator$1(node.declarations[i], scope, assign({ kind: node.kind }, options));
    }
}
function VariableDeclarator$1(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed } = options;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (node.id.type === 'Identifier') {
                scope[kind](node.id.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                pattern(node.id, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else {
        const hasFeed = 'feed' in options;
        const value = hasFeed ? feed : evaluate$1(node.init, scope);
        if (node.id.type === 'Identifier') {
            const name = node.id.name;
            if (kind === 'var' && !node.init && !hasFeed) {
                scope.var(name, NOINIT);
            }
            else {
                scope[kind](name, value);
            }
            if (node.init
                && ['ClassExpression', 'FunctionExpression', 'ArrowFunctionExpression']
                    .indexOf(node.init.type) !== -1
                && !value.name) {
                define(value, 'name', {
                    value: name,
                    configurable: true
                });
            }
        }
        else {
            pattern(node.id, scope, { kind, feed: value });
        }
    }
}
function ClassDeclaration$1(node, scope) {
    scope.func(node.id.name, createClass(node, scope));
}
function ClassBody$1(node, scope, options = {}) {
    const { klass, superClass } = options;
    for (let i = 0; i < node.body.length; i++) {
        MethodDefinition$1(node.body[i], scope, { klass, superClass });
    }
}
function MethodDefinition$1(node, scope, options = {}) {
    const { klass, superClass } = options;
    let key;
    if (node.computed) {
        key = evaluate$1(node.key, scope);
    }
    else if (node.key.type === 'Identifier') {
        key = node.key.name;
    }
    else {
        throw new SyntaxError('Unexpected token');
    }
    const obj = node.static ? klass : klass.prototype;
    const value = createFunc(node.value, scope, { superClass });
    switch (node.kind) {
        case 'constructor':
            break;
        case 'method':
            define(obj, key, {
                value,
                writable: true,
                configurable: true,
            });
            break;
        case 'get': {
            const oriDptor = getDptor(obj, key);
            define(obj, key, {
                get: value,
                set: oriDptor && oriDptor.set,
                configurable: true,
            });
            break;
        }
        case 'set': {
            const oriDptor = getDptor(obj, key);
            define(obj, key, {
                get: oriDptor && oriDptor.get,
                set: value,
                configurable: true,
            });
            break;
        }
        default:
            throw new SyntaxError('Unexpected token');
    }
}

function* Identifier(node, scope, options = {}) {
    const { getVar = false, throwErr = true } = options;
    if (node.name === 'undefined') {
        return undefined;
    }
    const variable = scope.find(node.name);
    if (variable) {
        if (getVar) {
            return variable;
        }
        else {
            const value = variable.get();
            if (value === DEADZONE) {
                throw new ReferenceError(`${node.name} is not defined`);
            }
            else {
                return value;
            }
        }
    }
    else if (throwErr) {
        throw new ReferenceError(`${node.name} is not defined`);
    }
    else {
        return undefined;
    }
}

var identifier = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Identifier: Identifier
});

function* Literal(node, scope) {
    return node.value;
}

var literal = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Literal: Literal
});

function* ThisExpression(node, scope) {
    const superCall = scope.find(SUPERCALL);
    if (superCall && !superCall.get()) {
        throw new ReferenceError('Must call super constructor in derived class '
            + 'before accessing \'this\' or returning from derived constructor');
    }
    else {
        return scope.find('this').get();
    }
}
function* ArrayExpression(node, scope) {
    let results = [];
    for (let i = 0; i < node.elements.length; i++) {
        const item = node.elements[i];
        if (item.type === 'SpreadElement') {
            results = results.concat(yield* SpreadElement(item, scope));
        }
        else {
            results.push(yield* evaluate(item, scope));
        }
    }
    return results;
}
function* ObjectExpression(node, scope) {
    const object = {};
    for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i];
        if (property.type === 'SpreadElement') {
            assign(object, yield* SpreadElement(property, scope));
        }
        else {
            let key;
            const propKey = property.key;
            if (property.computed) {
                key = yield* evaluate(propKey, scope);
            }
            else {
                if (propKey.type === 'Identifier') {
                    key = propKey.name;
                }
                else {
                    key = '' + (yield* Literal(propKey));
                }
            }
            const value = yield* evaluate(property.value, scope);
            const propKind = property.kind;
            if (propKind === 'init') {
                object[key] = value;
            }
            else if (propKind === 'get') {
                const oriDptor = getDptor(object, key);
                define(object, key, {
                    get: value,
                    set: oriDptor && oriDptor.set,
                    enumerable: true,
                    configurable: true
                });
            }
            else {
                const oriDptor = getDptor(object, key);
                define(object, key, {
                    get: oriDptor && oriDptor.get,
                    set: value,
                    enumerable: true,
                    configurable: true
                });
            }
        }
    }
    return object;
}
function* FunctionExpression(node, scope) {
    if (node.id && node.id.name) {
        const tmpScope = new Scope(scope);
        const func = createFunc$1(node, tmpScope);
        tmpScope.const(node.id.name, func);
        return func;
    }
    else {
        return createFunc$1(node, scope);
    }
}
function* UnaryExpression(node, scope) {
    const arg = node.argument;
    switch (node.operator) {
        case '+': return +(yield* evaluate(arg, scope));
        case '-': return -(yield* evaluate(arg, scope));
        case '!': return !(yield* evaluate(arg, scope));
        case '~': return ~(yield* evaluate(arg, scope));
        case 'void': return void (yield* evaluate(arg, scope));
        case 'typeof':
            if (arg.type === 'Identifier') {
                return typeof (yield* Identifier(arg, scope, { throwErr: false }));
            }
            else {
                return typeof (yield* evaluate(arg, scope));
            }
        case 'delete':
            if (arg.type === 'MemberExpression') {
                const variable = yield* MemberExpression(arg, scope, { getVar: true });
                return variable.del();
            }
            else if (arg.type === 'Identifier') {
                throw new SyntaxError('Delete of an unqualified identifier in strict mode');
            }
            else {
                yield* evaluate(arg, scope);
                return true;
            }
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function* UpdateExpression(node, scope) {
    const arg = node.argument;
    let variable;
    if (arg.type === 'Identifier') {
        variable = yield* Identifier(arg, scope, { getVar: true });
    }
    else if (arg.type === 'MemberExpression') {
        variable = yield* MemberExpression(arg, scope, { getVar: true });
    }
    else {
        throw new SyntaxError('Unexpected token');
    }
    const value = variable.get();
    if (node.operator === '++') {
        variable.set(value + 1);
        return node.prefix ? variable.get() : value;
    }
    else if (node.operator === '--') {
        variable.set(value - 1);
        return node.prefix ? variable.get() : value;
    }
    else {
        throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function* BinaryExpression(node, scope) {
    const left = yield* evaluate(node.left, scope);
    const right = yield* evaluate(node.right, scope);
    switch (node.operator) {
        case '==': return left == right;
        case '!=': return left != right;
        case '===': return left === right;
        case '!==': return left !== right;
        case '<': return left < right;
        case '<=': return left <= right;
        case '>': return left > right;
        case '>=': return left >= right;
        case '<<': return left << right;
        case '>>': return left >> right;
        case '>>>': return left >>> right;
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '**': return left ** right;
        case '/': return left / right;
        case '%': return left % right;
        case '|': return left | right;
        case '^': return left ^ right;
        case '&': return left & right;
        case 'in': return left in right;
        case 'instanceof': return left instanceof right;
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function* AssignmentExpression(node, scope) {
    const value = yield* evaluate(node.right, scope);
    const left = node.left;
    let variable;
    if (left.type === 'Identifier') {
        variable = yield* Identifier(left, scope, { getVar: true, throwErr: false });
        if (!variable) {
            const win = scope.global().find('window').get();
            variable = new Prop(win, left.name);
        }
    }
    else if (left.type === 'MemberExpression') {
        variable = yield* MemberExpression(left, scope, { getVar: true });
    }
    else {
        return yield* pattern$1(left, scope, { feed: value });
    }
    switch (node.operator) {
        case '=':
            variable.set(value);
            return variable.get();
        case '+=':
            variable.set(variable.get() + value);
            return variable.get();
        case '-=':
            variable.set(variable.get() - value);
            return variable.get();
        case '*=':
            variable.set(variable.get() * value);
            return variable.get();
        case '/=':
            variable.set(variable.get() / value);
            return variable.get();
        case '%=':
            variable.set(variable.get() % value);
            return variable.get();
        case '**=':
            variable.set(variable.get() ** value);
            return variable.get();
        case '<<=':
            variable.set(variable.get() << value);
            return variable.get();
        case '>>=':
            variable.set(variable.get() >> value);
            return variable.get();
        case '>>>=':
            variable.set(variable.get() >>> value);
            return variable.get();
        case '|=':
            variable.set(variable.get() | value);
            return variable.get();
        case '^=':
            variable.set(variable.get() ^ value);
            return variable.get();
        case '&=':
            variable.set(variable.get() & value);
            return variable.get();
        default: throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function* LogicalExpression(node, scope) {
    switch (node.operator) {
        case '||':
            return (yield* evaluate(node.left, scope)) || (yield* evaluate(node.right, scope));
        case '&&':
            return (yield* evaluate(node.left, scope)) && (yield* evaluate(node.right, scope));
        default:
            throw new SyntaxError(`Unexpected token ${node.operator}`);
    }
}
function* MemberExpression(node, scope, options = {}) {
    const { getObj = false, getVar = false } = options;
    let object;
    if (node.object.type === 'Super') {
        object = yield* Super(node.object, scope, { getProto: true });
    }
    else {
        object = yield* evaluate(node.object, scope);
    }
    if (getObj)
        return object;
    let key;
    if (node.computed) {
        key = yield* evaluate(node.property, scope);
    }
    else {
        key = node.property.name;
    }
    if (getVar) {
        const setter = getSetter(object, key);
        if (node.object.type === 'Super' && setter) {
            const thisObject = scope.find('this').get();
            const privateKey = createSymbol(key);
            define(thisObject, privateKey, { set: setter });
            return new Prop(thisObject, privateKey);
        }
        else {
            return new Prop(object, key);
        }
    }
    else {
        const getter = getGetter(object, key);
        if (node.object.type === 'Super' && getter) {
            const thisObject = scope.find('this').get();
            return getter.call(thisObject);
        }
        else {
            return object[key];
        }
    }
}
function* ConditionalExpression(node, scope) {
    return (yield* evaluate(node.test, scope))
        ? (yield* evaluate(node.consequent, scope))
        : (yield* evaluate(node.alternate, scope));
}
function* CallExpression(node, scope) {
    let func;
    let object;
    if (node.callee.type === 'MemberExpression') {
        object = yield* MemberExpression(node.callee, scope, { getObj: true });
        let key;
        if (node.callee.computed) {
            key = yield* evaluate(node.callee.property, scope);
        }
        else {
            key = node.callee.property.name;
        }
        if (node.callee.object.type === 'Super') {
            const thisObject = scope.find('this').get();
            func = object[key].bind(thisObject);
        }
        else {
            func = object[key];
        }
        if (typeof func !== 'function') {
            throw new TypeError(`${key} is not a function`);
        }
        else if (func[CLSCTOR]) {
            throw new TypeError(`Class constructor ${key} cannot be invoked without 'new'`);
        }
    }
    else {
        object = scope.find('this').get();
        func = yield* evaluate(node.callee, scope);
        if (typeof func !== 'function' || node.callee.type !== 'Super' && func[CLSCTOR]) {
            let name;
            if (node.callee.type === 'Identifier') {
                name = node.callee.name;
            }
            else {
                try {
                    name = JSON.stringify(func);
                }
                catch (err) {
                    name = '' + func;
                }
            }
            if (typeof func !== 'function') {
                throw new TypeError(`${name} is not a function`);
            }
            else {
                throw new TypeError(`Class constructor ${name} cannot be invoked without 'new'`);
            }
        }
    }
    let args = [];
    for (let i = 0; i < node.arguments.length; i++) {
        const arg = node.arguments[i];
        if (arg.type === 'SpreadElement') {
            args = args.concat(yield* SpreadElement(arg, scope));
        }
        else {
            args.push(yield* evaluate(arg, scope));
        }
    }
    if (node.callee.type === 'Super') {
        const superCall = scope.find(SUPERCALL);
        if (superCall.get()) {
            throw new ReferenceError('Super constructor may only be called once');
        }
        else {
            scope.find(SUPERCALL).set(true);
        }
    }
    if (object && object[WINDOW] && func.toString().indexOf('[native code]') !== -1) {
        return func.apply(object[WINDOW], args);
    }
    return func.apply(object, args);
}
function* NewExpression(node, scope) {
    const constructor = yield* evaluate(node.callee, scope);
    if (typeof constructor !== 'function') {
        let name;
        if (node.callee.type === 'Identifier') {
            name = node.callee.name;
        }
        else {
            try {
                name = JSON.stringify(constructor);
            }
            catch (err) {
                name = '' + constructor;
            }
        }
        throw new TypeError(`${name} is not a constructor`);
    }
    else if (constructor[NOCTOR]) {
        throw new TypeError(`${constructor.name || '(intermediate value)'} is not a constructor`);
    }
    let args = [];
    for (let i = 0; i < node.arguments.length; i++) {
        const arg = node.arguments[i];
        if (arg.type === 'SpreadElement') {
            args = args.concat(yield* SpreadElement(arg, scope));
        }
        else {
            args.push(yield* evaluate(arg, scope));
        }
    }
    return new constructor(...args);
}
function* MetaProperty(node, scope) {
    return scope.find(NEWTARGET).get();
}
function* SequenceExpression(node, scope) {
    let result;
    for (let i = 0; i < node.expressions.length; i++) {
        result = yield* evaluate(node.expressions[i], scope);
    }
    return result;
}
function* ArrowFunctionExpression(node, scope) {
    return createFunc$1(node, scope);
}
function* TemplateLiteral(node, scope) {
    const quasis = node.quasis.slice();
    const expressions = node.expressions.slice();
    let result = '';
    let temEl;
    let expr;
    while (temEl = quasis.shift()) {
        result += yield* TemplateElement(temEl);
        expr = expressions.shift();
        if (expr) {
            result += yield* evaluate(expr, scope);
        }
    }
    return result;
}
function* TaggedTemplateExpression(node, scope) {
    const tagFunc = yield* evaluate(node.tag, scope);
    const quasis = node.quasi.quasis;
    const str = quasis.map(v => v.value.cooked);
    const raw = quasis.map(v => v.value.raw);
    define(str, 'raw', {
        value: freeze(raw)
    });
    const expressions = node.quasi.expressions;
    const args = [];
    if (expressions) {
        for (let i = 0; i < expressions.length; i++) {
            args.push(yield* evaluate(expressions[i], scope));
        }
    }
    return tagFunc(freeze(str), ...args);
}
function* TemplateElement(node, scope) {
    return node.value.raw;
}
function* ClassExpression(node, scope) {
    if (node.id && node.id.name) {
        const tmpScope = new Scope(scope);
        const klass = yield* createClass$1(node, tmpScope);
        tmpScope.const(node.id.name, klass);
        return klass;
    }
    else {
        return yield* createClass$1(node, scope);
    }
}
function* Super(node, scope, options = {}) {
    const { getProto = false } = options;
    const superClass = scope.find(SUPER).get();
    return getProto ? superClass.prototype : superClass;
}
function* SpreadElement(node, scope) {
    return yield* evaluate(node.argument, scope);
}
function* YieldExpression(node, scope) {
    const res = yield* evaluate(node.argument, scope);
    return node.delegate ? yield* res : yield res;
}
function* AwaitExpression(node, scope) {
    AWAIT.RES = yield* evaluate(node.argument, scope);
    return yield AWAIT;
}

var expression = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ThisExpression: ThisExpression,
  ArrayExpression: ArrayExpression,
  ObjectExpression: ObjectExpression,
  FunctionExpression: FunctionExpression,
  UnaryExpression: UnaryExpression,
  UpdateExpression: UpdateExpression,
  BinaryExpression: BinaryExpression,
  AssignmentExpression: AssignmentExpression,
  LogicalExpression: LogicalExpression,
  MemberExpression: MemberExpression,
  ConditionalExpression: ConditionalExpression,
  CallExpression: CallExpression,
  NewExpression: NewExpression,
  MetaProperty: MetaProperty,
  SequenceExpression: SequenceExpression,
  ArrowFunctionExpression: ArrowFunctionExpression,
  TemplateLiteral: TemplateLiteral,
  TaggedTemplateExpression: TaggedTemplateExpression,
  TemplateElement: TemplateElement,
  ClassExpression: ClassExpression,
  Super: Super,
  SpreadElement: SpreadElement,
  YieldExpression: YieldExpression,
  AwaitExpression: AwaitExpression
});

function* ExpressionStatement(node, scope) {
    yield* evaluate(node.expression, scope);
}
function* BlockStatement(block, scope, options = {}) {
    const { invasived = false, hoisted = false, } = options;
    const subScope = invasived ? scope : new Scope(scope);
    if (!hoisted) {
        yield* hoist$1(block, subScope, { onlyBlock: true });
    }
    for (let i = 0; i < block.body.length; i++) {
        const result = yield* evaluate(block.body[i], subScope);
        if (result === BREAK || result === CONTINUE || result === RETURN) {
            return result;
        }
    }
}
function* EmptyStatement() {
}
function* DebuggerStatement() {
    debugger;
}
function* ReturnStatement(node, scope) {
    RETURN.RES = node.argument ? (yield* evaluate(node.argument, scope)) : undefined;
    return RETURN;
}
function* BreakStatement() {
    return BREAK;
}
function* ContinueStatement() {
    return CONTINUE;
}
function* IfStatement(node, scope) {
    if (yield* evaluate(node.test, scope)) {
        return yield* evaluate(node.consequent, scope);
    }
    else {
        return yield* evaluate(node.alternate, scope);
    }
}
function* SwitchStatement(node, scope) {
    const discriminant = yield* evaluate(node.discriminant, scope);
    let matched = false;
    for (let i = 0; i < node.cases.length; i++) {
        const eachCase = node.cases[i];
        if (!matched
            && (!eachCase.test
                || (yield* evaluate(eachCase.test, scope)) === discriminant)) {
            matched = true;
        }
        if (matched) {
            const result = yield* SwitchCase(eachCase, scope);
            if (result === BREAK) {
                break;
            }
            if (result === CONTINUE || result === RETURN) {
                return result;
            }
        }
    }
}
function* SwitchCase(node, scope) {
    for (let i = 0; i < node.consequent.length; i++) {
        const result = yield* evaluate(node.consequent[i], scope);
        if (result === BREAK || result === CONTINUE || result === RETURN) {
            return result;
        }
    }
}
function* ThrowStatement(node, scope) {
    throw yield* evaluate(node.argument, scope);
}
function* TryStatement(node, scope) {
    try {
        return yield* BlockStatement(node.block, scope);
    }
    catch (err) {
        if (node.handler) {
            const subScope = new Scope(scope);
            const param = node.handler.param;
            if (param) {
                if (param.type === 'Identifier') {
                    const name = param.name;
                    subScope.var(name, err);
                }
                else {
                    yield* pattern$1(param, scope, { feed: err });
                }
            }
            return yield* CatchClause(node.handler, subScope);
        }
        else {
            throw err;
        }
    }
    finally {
        if (node.finalizer) {
            const result = yield* BlockStatement(node.finalizer, scope);
            if (result === BREAK || result === CONTINUE || result === RETURN) {
                return result;
            }
        }
    }
}
function* CatchClause(node, scope) {
    return yield* BlockStatement(node.body, scope, { invasived: true });
}
function* WhileStatement(node, scope) {
    while (yield* evaluate(node.test, scope)) {
        const result = yield* evaluate(node.body, scope);
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function* DoWhileStatement(node, scope) {
    do {
        const result = yield* evaluate(node.body, scope);
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    } while (yield* evaluate(node.test, scope));
}
function* ForStatement(node, scope) {
    const forScope = new Scope(scope);
    for (yield* evaluate(node.init, forScope); node.test ? (yield* evaluate(node.test, forScope)) : true; yield* evaluate(node.update, forScope)) {
        const subScope = new Scope(forScope);
        let result;
        if (node.body.type === 'BlockStatement') {
            result = yield* BlockStatement(node.body, subScope, { invasived: true });
        }
        else {
            result = yield* evaluate(node.body, subScope);
        }
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function* ForInStatement(node, scope) {
    for (const value in yield* evaluate(node.right, scope)) {
        const result = yield* ForXHandler$1(node, scope, { value });
        if (result === BREAK) {
            break;
        }
        else if (result === CONTINUE) {
            continue;
        }
        else if (result === RETURN) {
            return result;
        }
    }
}
function* ForOfStatement(node, scope) {
    const right = yield* evaluate(node.right, scope);
    if (node.await) {
        const iterator = getAsyncIterator(right);
        let ret;
        for (AWAIT.RES = iterator.next(), ret = yield AWAIT; !ret.done; AWAIT.RES = iterator.next(), ret = yield AWAIT) {
            const result = yield* ForXHandler$1(node, scope, { value: ret.value });
            if (result === BREAK) {
                break;
            }
            else if (result === CONTINUE) {
                continue;
            }
            else if (result === RETURN) {
                return result;
            }
        }
    }
    else {
        for (const value of right) {
            const result = yield* ForXHandler$1(node, scope, { value });
            if (result === BREAK) {
                break;
            }
            else if (result === CONTINUE) {
                continue;
            }
            else if (result === RETURN) {
                return result;
            }
        }
    }
}

var statement = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ExpressionStatement: ExpressionStatement,
  BlockStatement: BlockStatement,
  EmptyStatement: EmptyStatement,
  DebuggerStatement: DebuggerStatement,
  ReturnStatement: ReturnStatement,
  BreakStatement: BreakStatement,
  ContinueStatement: ContinueStatement,
  IfStatement: IfStatement,
  SwitchStatement: SwitchStatement,
  SwitchCase: SwitchCase,
  ThrowStatement: ThrowStatement,
  TryStatement: TryStatement,
  CatchClause: CatchClause,
  WhileStatement: WhileStatement,
  DoWhileStatement: DoWhileStatement,
  ForStatement: ForStatement,
  ForInStatement: ForInStatement,
  ForOfStatement: ForOfStatement
});

function* ObjectPattern(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed = {} } = options;
    const fedKeys = [];
    for (let i = 0; i < node.properties.length; i++) {
        const property = node.properties[i];
        if (hoist) {
            if (onlyBlock || kind === 'var') {
                if (property.type === 'Property') {
                    const value = property.value;
                    if (value.type === 'Identifier') {
                        scope[kind](value.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
                    }
                    else {
                        yield* pattern$1(value, scope, { kind, hoist, onlyBlock });
                    }
                }
                else {
                    yield* RestElement(property, scope, { kind, hoist, onlyBlock });
                }
            }
        }
        else if (property.type === 'Property') {
            let key;
            if (property.computed) {
                key = yield* evaluate(property.key, scope);
            }
            else {
                key = property.key.name;
            }
            fedKeys.push(key);
            const value = property.value;
            if (value.type === 'Identifier') {
                scope[kind](value.name, feed[key]);
            }
            else {
                yield* pattern$1(value, scope, { kind, feed: feed[key] });
            }
        }
        else {
            const rest = assign({}, feed);
            for (let i = 0; i < fedKeys.length; i++)
                delete rest[fedKeys[i]];
            yield* RestElement(property, scope, { kind, feed: rest });
        }
    }
}
function* ArrayPattern(node, scope, options = {}) {
    const { kind, hoist = false, onlyBlock = false, feed = [] } = options;
    const result = [];
    for (let i = 0; i < node.elements.length; i++) {
        const element = node.elements[i];
        if (!element)
            continue;
        if (hoist) {
            if (onlyBlock || kind === 'var') {
                if (element.type === 'Identifier') {
                    scope[kind](element.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
                }
                else {
                    yield* pattern$1(element, scope, { kind, hoist, onlyBlock });
                }
            }
        }
        else if (element.type === 'Identifier') {
            if (kind) {
                scope[kind](element.name, feed[i]);
            }
            else {
                const variable = yield* Identifier(element, scope, { getVar: true });
                variable.set(feed[i]);
                result.push(variable.get());
            }
        }
        else if (element.type === 'RestElement') {
            yield* RestElement(element, scope, { kind, feed: feed.slice(i) });
        }
        else {
            yield* pattern$1(element, scope, { kind, feed: feed[i] });
        }
    }
    if (result.length) {
        return result;
    }
}
function* RestElement(node, scope, options = {}) {
    const { kind, hoist = false, onlyBlock = false, feed = [] } = options;
    const arg = node.argument;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (arg.type === 'Identifier') {
                scope[kind](arg.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                yield* pattern$1(arg, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else if (arg.type === 'Identifier') {
        if (kind) {
            scope[kind](arg.name, feed);
        }
        else {
            const variable = yield* Identifier(arg, scope, { getVar: true });
            variable.set(feed);
        }
    }
    else {
        yield* pattern$1(arg, scope, { kind, feed });
    }
}
function* AssignmentPattern(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed = yield* evaluate(node.right, scope) } = options;
    const left = node.left;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (left.type === 'Identifier') {
                scope[kind](left.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                yield* pattern$1(left, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else if (left.type === 'Identifier') {
        scope[kind](left.name, feed);
    }
    else {
        yield* pattern$1(left, scope, { kind, feed });
    }
}

var pattern$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ObjectPattern: ObjectPattern,
  ArrayPattern: ArrayPattern,
  RestElement: RestElement,
  AssignmentPattern: AssignmentPattern
});

let evaluateOps;
function* evaluate(node, scope) {
    if (!node)
        return;
    if (!evaluateOps) {
        evaluateOps = assign({}, declaration, expression, identifier, statement, literal, pattern$2);
    }
    const handler = evaluateOps[node.type];
    if (handler) {
        try {
            scope.listener?.beforeNode(node);
            const result = yield* handler(node, scope);
            return scope.listener ? scope.listener.afterNode(node, result, null) : result;
        }
        catch (error) {
            const rethrow = scope.listener ? scope.listener.afterNode(node, null, error) : error;
            if (rethrow) {
                throw rethrow;
            }
        }
    }
    else {
        throw new Error(`${node.type} isn't implemented`);
    }
}

function* FunctionDeclaration(node, scope) {
    scope.func(node.id.name, createFunc$1(node, scope));
}
function* VariableDeclaration(node, scope, options = {}) {
    for (let i = 0; i < node.declarations.length; i++) {
        yield* VariableDeclarator(node.declarations[i], scope, assign({ kind: node.kind }, options));
    }
}
function* VariableDeclarator(node, scope, options = {}) {
    const { kind = 'var', hoist = false, onlyBlock = false, feed } = options;
    if (hoist) {
        if (onlyBlock || kind === 'var') {
            if (node.id.type === 'Identifier') {
                scope[kind](node.id.name, onlyBlock ? DEADZONE : kind === 'var' ? NOINIT : undefined);
            }
            else {
                yield* pattern$1(node.id, scope, { kind, hoist, onlyBlock });
            }
        }
    }
    else {
        const hasFeed = 'feed' in options;
        const value = hasFeed ? feed : yield* evaluate(node.init, scope);
        if (node.id.type === 'Identifier') {
            const name = node.id.name;
            if (kind === 'var' && !node.init && !hasFeed) {
                scope.var(name, NOINIT);
            }
            else {
                scope[kind](name, value);
            }
            if (node.init
                && ['ClassExpression', 'FunctionExpression', 'ArrowFunctionExpression']
                    .indexOf(node.init.type) !== -1
                && !value.name) {
                define(value, 'name', {
                    value: name,
                    configurable: true
                });
            }
        }
        else {
            yield* pattern$1(node.id, scope, { kind, feed: value });
        }
    }
}
function* ClassDeclaration(node, scope) {
    scope.func(node.id.name, yield* createClass$1(node, scope));
}
function* ClassBody(node, scope, options = {}) {
    const { klass, superClass } = options;
    for (let i = 0; i < node.body.length; i++) {
        yield* MethodDefinition(node.body[i], scope, { klass, superClass });
    }
}
function* MethodDefinition(node, scope, options = {}) {
    const { klass, superClass } = options;
    let key;
    if (node.computed) {
        key = yield* evaluate(node.key, scope);
    }
    else if (node.key.type === 'Identifier') {
        key = node.key.name;
    }
    else {
        throw new SyntaxError('Unexpected token');
    }
    const obj = node.static ? klass : klass.prototype;
    const value = createFunc$1(node.value, scope, { superClass });
    switch (node.kind) {
        case 'constructor':
            break;
        case 'method':
            define(obj, key, {
                value,
                writable: true,
                configurable: true,
            });
            break;
        case 'get': {
            const oriDptor = getDptor(obj, key);
            define(obj, key, {
                get: value,
                set: oriDptor && oriDptor.set,
                configurable: true,
            });
            break;
        }
        case 'set': {
            const oriDptor = getDptor(obj, key);
            define(obj, key, {
                get: oriDptor && oriDptor.get,
                set: value,
                configurable: true,
            });
            break;
        }
        default:
            throw new SyntaxError('Unexpected token');
    }
}

function runAsync(iterator, options = {}) {
    const { res, err, ret, fullRet } = options;
    return new Promise((resolve, reject) => {
        if ('ret' in options) {
            return resolve(iterator.return(ret));
        }
        if ('err' in options) {
            onRejected(err);
        }
        else {
            onFulfilled(res);
        }
        function onFulfilled(res) {
            let ret;
            try {
                ret = iterator.next(res);
            }
            catch (e) {
                return reject(e);
            }
            next(ret);
            return null;
        }
        function onRejected(err) {
            let ret;
            try {
                ret = iterator.throw(err);
            }
            catch (e) {
                return reject(e);
            }
            next(ret);
        }
        function next(ret) {
            if (ret.done)
                return resolve(fullRet ? ret : ret.value);
            if (ret.value !== AWAIT)
                return resolve(ret);
            const awaitValue = ret.value.RES;
            const value = awaitValue && awaitValue.then === 'function'
                ? awaitValue : Promise.resolve(awaitValue);
            return value.then(onFulfilled, onRejected);
        }
    });
}

function* hoist$1(block, scope, options = {}) {
    const { onlyBlock = false } = options;
    const funcDclrList = [];
    const funcDclrIdxs = [];
    for (let i = 0; i < block.body.length; i++) {
        const statement = block.body[i];
        if (statement.type === 'FunctionDeclaration') {
            funcDclrList.push(statement);
            funcDclrIdxs.push(i);
        }
        else if (statement.type === 'VariableDeclaration'
            && ['const', 'let'].indexOf(statement.kind) !== -1) {
            yield* VariableDeclaration(statement, scope, { hoist: true, onlyBlock: true });
        }
        else if (!onlyBlock) {
            yield* hoistVarRecursion$1(statement, scope);
        }
    }
    if (funcDclrIdxs.length) {
        for (let i = funcDclrIdxs.length - 1; i > -1; i--) {
            block.body.splice(funcDclrIdxs[i], 1);
        }
        block.body = funcDclrList.concat(block.body);
    }
}
function* hoistVarRecursion$1(statement, scope) {
    switch (statement.type) {
        case 'VariableDeclaration':
            yield* VariableDeclaration(statement, scope, { hoist: true });
            break;
        case 'ForInStatement':
        case 'ForOfStatement':
            if (statement.left.type === 'VariableDeclaration') {
                yield* VariableDeclaration(statement.left, scope, { hoist: true });
            }
        case 'ForStatement':
            if (statement.type === 'ForStatement' && statement.init?.type === 'VariableDeclaration') {
                yield* VariableDeclaration(statement.init, scope, { hoist: true });
            }
        case 'WhileStatement':
        case 'DoWhileStatement':
            yield* hoistVarRecursion$1(statement.body, scope);
            break;
        case 'IfStatement':
            yield* hoistVarRecursion$1(statement.consequent, scope);
            if (statement.alternate) {
                yield* hoistVarRecursion$1(statement.alternate, scope);
            }
            break;
        case 'BlockStatement':
            for (let i = 0; i < statement.body.length; i++) {
                yield* hoistVarRecursion$1(statement.body[i], scope);
            }
            break;
        case 'SwitchStatement':
            for (let i = 0; i < statement.cases.length; i++) {
                for (let j = 0; j < statement.cases[i].consequent.length; j++) {
                    yield* hoistVarRecursion$1(statement.cases[i].consequent[j], scope);
                }
            }
            break;
        case 'TryStatement': {
            const tryBlock = statement.block.body;
            for (let i = 0; i < tryBlock.length; i++) {
                yield* hoistVarRecursion$1(tryBlock[i], scope);
            }
            const catchBlock = statement.handler && statement.handler.body.body;
            if (catchBlock) {
                for (let i = 0; i < catchBlock.length; i++) {
                    yield* hoistVarRecursion$1(catchBlock[i], scope);
                }
            }
            const finalBlock = statement.finalizer && statement.finalizer.body;
            if (finalBlock) {
                for (let i = 0; i < finalBlock.length; i++) {
                    yield* hoistVarRecursion$1(finalBlock[i], scope);
                }
            }
            break;
        }
    }
}
function* pattern$1(node, scope, options = {}) {
    switch (node.type) {
        case 'ObjectPattern':
            return yield* ObjectPattern(node, scope, options);
        case 'ArrayPattern':
            return yield* ArrayPattern(node, scope, options);
        case 'RestElement':
            return yield* RestElement(node, scope, options);
        case 'AssignmentPattern':
            return yield* AssignmentPattern(node, scope, options);
        default:
            throw new SyntaxError('Unexpected token');
    }
}
function createFunc$1(node, scope, options = {}) {
    const n = node;
    if (!n.generator && !n.async) {
        return createFunc(node, scope, options);
    }
    const { superClass, isCtor } = options;
    const params = node.params;
    const tmpFunc = function* (...args) {
        const subScope = new Scope(scope, true);
        if (node.type !== 'ArrowFunctionExpression') {
            subScope.const('this', this);
            subScope.let('arguments', arguments);
            subScope.const(NEWTARGET, new.target);
            if (superClass) {
                subScope.const(SUPER, superClass);
                if (isCtor)
                    subScope.let(SUPERCALL, false);
            }
        }
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (param.type === 'Identifier') {
                subScope.var(param.name, args[i]);
            }
            else if (param.type === 'RestElement') {
                yield* RestElement(param, subScope, { kind: 'var', feed: args.slice(i) });
            }
            else {
                yield* pattern$1(param, subScope, { feed: args[i] });
            }
        }
        let result;
        if (node.body.type === 'BlockStatement') {
            yield* hoist$1(node.body, subScope);
            result = yield* BlockStatement(node.body, subScope, {
                invasived: true,
                hoisted: true
            });
        }
        else {
            result = yield* evaluate(node.body, subScope);
            if (node.type === 'ArrowFunctionExpression') {
                RETURN.RES = result;
                result = RETURN;
            }
        }
        if (result === RETURN) {
            return result.RES;
        }
    };
    let func;
    if (node.async && node.generator) {
        func = function () {
            const iterator = tmpFunc.apply(this, arguments);
            let last = Promise.resolve();
            let hasCatch = false;
            const run = (opts) => last = last
                .then(() => runAsync(iterator, assign({ fullRet: true }, opts)))
                .catch(err => {
                if (!hasCatch) {
                    hasCatch = true;
                    return Promise.reject(err);
                }
            });
            const asyncIterator = {
                next: (res) => run({ res }),
                throw: (err) => run({ err }),
                return: (ret) => run({ ret })
            };
            if (typeof Symbol === 'function') {
                asyncIterator[Symbol.iterator] = function () { return this; };
            }
            return asyncIterator;
        };
    }
    else if (node.async) {
        func = function () { return runAsync(tmpFunc.apply(this, arguments)); };
    }
    else {
        func = tmpFunc;
    }
    define(func, NOCTOR, { value: true });
    define(func, 'name', {
        value: node.id
            && node.id.name
            || '',
        configurable: true
    });
    define(func, 'length', {
        value: params.length,
        configurable: true
    });
    return func;
}
function* createClass$1(node, scope) {
    const superClass = yield* evaluate(node.superClass, scope);
    let klass = function () {
        if (superClass) {
            superClass.apply(this);
        }
    };
    const methodBody = node.body.body;
    for (let i = 0; i < methodBody.length; i++) {
        const method = methodBody[i];
        if (method.type === 'MethodDefinition' && method.kind === 'constructor') {
            klass = createFunc$1(method.value, scope, { superClass, isCtor: true });
            break;
        }
    }
    if (superClass) {
        inherits(klass, superClass);
    }
    yield* ClassBody(node.body, scope, { klass, superClass });
    define(klass, CLSCTOR, { value: true });
    define(klass, 'name', {
        value: node.id && node.id.name || '',
        configurable: true
    });
    return klass;
}
function* ForXHandler$1(node, scope, options) {
    const { value } = options;
    const left = node.left;
    const subScope = new Scope(scope);
    if (left.type === 'VariableDeclaration') {
        yield* VariableDeclaration(left, subScope, { feed: value });
    }
    else if (left.type === 'Identifier') {
        const variable = yield* Identifier$1(left, scope, { getVar: true });
        variable.set(value);
    }
    else {
        yield* pattern$1(left, scope, { feed: value });
    }
    let result;
    if (node.body.type === 'BlockStatement') {
        result = yield* BlockStatement(node.body, subScope, { invasived: true });
    }
    else {
        result = yield* evaluate(node.body, subScope);
    }
    return result;
}

function hoist(block, scope, options = {}) {
    const { onlyBlock = false } = options;
    const funcDclrList = [];
    const funcDclrIdxs = [];
    for (let i = 0; i < block.body.length; i++) {
        const statement = block.body[i];
        if (statement.type === 'FunctionDeclaration') {
            funcDclrList.push(statement);
            funcDclrIdxs.push(i);
        }
        else if (statement.type === 'VariableDeclaration'
            && ['const', 'let'].indexOf(statement.kind) !== -1) {
            VariableDeclaration$1(statement, scope, { hoist: true, onlyBlock: true });
        }
        else if (!onlyBlock) {
            hoistVarRecursion(statement, scope);
        }
    }
    if (funcDclrIdxs.length) {
        for (let i = funcDclrIdxs.length - 1; i > -1; i--) {
            block.body.splice(funcDclrIdxs[i], 1);
        }
        block.body = funcDclrList.concat(block.body);
    }
}
function hoistVarRecursion(statement, scope) {
    switch (statement.type) {
        case 'VariableDeclaration':
            VariableDeclaration$1(statement, scope, { hoist: true });
            break;
        case 'ForInStatement':
        case 'ForOfStatement':
            if (statement.left.type === 'VariableDeclaration') {
                VariableDeclaration$1(statement.left, scope, { hoist: true });
            }
        case 'ForStatement':
            if (statement.type === 'ForStatement' && statement.init?.type === 'VariableDeclaration') {
                VariableDeclaration$1(statement.init, scope, { hoist: true });
            }
        case 'WhileStatement':
        case 'DoWhileStatement':
            hoistVarRecursion(statement.body, scope);
            break;
        case 'IfStatement':
            hoistVarRecursion(statement.consequent, scope);
            if (statement.alternate) {
                hoistVarRecursion(statement.alternate, scope);
            }
            break;
        case 'BlockStatement':
            for (let i = 0; i < statement.body.length; i++) {
                hoistVarRecursion(statement.body[i], scope);
            }
            break;
        case 'SwitchStatement':
            for (let i = 0; i < statement.cases.length; i++) {
                for (let j = 0; j < statement.cases[i].consequent.length; j++) {
                    hoistVarRecursion(statement.cases[i].consequent[j], scope);
                }
            }
            break;
        case 'TryStatement': {
            const tryBlock = statement.block.body;
            for (let i = 0; i < tryBlock.length; i++) {
                hoistVarRecursion(tryBlock[i], scope);
            }
            const catchBlock = statement.handler && statement.handler.body.body;
            if (catchBlock) {
                for (let i = 0; i < catchBlock.length; i++) {
                    hoistVarRecursion(catchBlock[i], scope);
                }
            }
            const finalBlock = statement.finalizer && statement.finalizer.body;
            if (finalBlock) {
                for (let i = 0; i < finalBlock.length; i++) {
                    hoistVarRecursion(finalBlock[i], scope);
                }
            }
            break;
        }
    }
}
function pattern(node, scope, options = {}) {
    switch (node.type) {
        case 'ObjectPattern':
            return ObjectPattern$1(node, scope, options);
        case 'ArrayPattern':
            return ArrayPattern$1(node, scope, options);
        case 'RestElement':
            return RestElement$1(node, scope, options);
        case 'AssignmentPattern':
            return AssignmentPattern$1(node, scope, options);
        default:
            throw new SyntaxError('Unexpected token');
    }
}
function createFunc(node, scope, options = {}) {
    const n = node;
    if (n.generator || n.async) {
        return createFunc$1(node, scope, options);
    }
    const { superClass, isCtor } = options;
    const params = node.params;
    const tmpFunc = function (...args) {
        const subScope = new Scope(scope, true);
        if (node.type !== 'ArrowFunctionExpression') {
            subScope.const('this', this);
            subScope.let('arguments', arguments);
            subScope.const(NEWTARGET, new.target);
            if (superClass) {
                subScope.const(SUPER, superClass);
                if (isCtor)
                    subScope.let(SUPERCALL, false);
            }
        }
        for (let i = 0; i < params.length; i++) {
            const param = params[i];
            if (param.type === 'Identifier') {
                subScope.var(param.name, args[i]);
            }
            else if (param.type === 'RestElement') {
                RestElement$1(param, subScope, { kind: 'var', feed: args.slice(i) });
            }
            else {
                pattern(param, subScope, { feed: args[i] });
            }
        }
        let result;
        if (node.body.type === 'BlockStatement') {
            hoist(node.body, subScope);
            result = BlockStatement$1(node.body, subScope, {
                invasived: true,
                hoisted: true
            });
        }
        else {
            result = evaluate$1(node.body, subScope);
            if (node.type === 'ArrowFunctionExpression') {
                RETURN.RES = result;
                result = RETURN;
            }
        }
        if (result === RETURN) {
            return result.RES;
        }
    };
    let func = tmpFunc;
    if (node.type === 'ArrowFunctionExpression') {
        define(func, NOCTOR, { value: true });
    }
    define(func, 'name', {
        value: node.id
            && node.id.name
            || '',
        configurable: true
    });
    define(func, 'length', {
        value: params.length,
        configurable: true
    });
    return func;
}
function createClass(node, scope) {
    const superClass = evaluate$1(node.superClass, scope);
    let klass = function () {
        if (superClass) {
            superClass.apply(this);
        }
    };
    const methodBody = node.body.body;
    for (let i = 0; i < methodBody.length; i++) {
        const method = methodBody[i];
        if (method.type === 'MethodDefinition' && method.kind === 'constructor') {
            klass = createFunc(method.value, scope, { superClass, isCtor: true });
            break;
        }
    }
    if (superClass) {
        inherits(klass, superClass);
    }
    ClassBody$1(node.body, scope, { klass, superClass });
    define(klass, CLSCTOR, { value: true });
    define(klass, 'name', {
        value: node.id && node.id.name || '',
        configurable: true
    });
    return klass;
}
function ForXHandler(node, scope, options) {
    const { value } = options;
    const left = node.left;
    const subScope = new Scope(scope);
    if (left.type === 'VariableDeclaration') {
        VariableDeclaration$1(left, subScope, { feed: value });
    }
    else if (left.type === 'Identifier') {
        const variable = Identifier$1(left, scope, { getVar: true });
        variable.set(value);
    }
    else {
        pattern(left, scope, { feed: value });
    }
    let result;
    if (node.body.type === 'BlockStatement') {
        result = BlockStatement$1(node.body, subScope, { invasived: true });
    }
    else {
        result = evaluate$1(node.body, subScope);
    }
    return result;
}

class Sval {
    static version = version;
    options = {};
    scope = new Scope(null, true);
    exports = {};
    constructor(options = {}) {
        let { sandBox = true } = options;
        if (sandBox) {
            const win = createSandBox();
            this.scope.let('window', win);
            this.scope.let('this', win);
        }
        else {
            this.scope.let('window', globalObj);
            this.scope.let('this', globalObj);
        }
        this.scope.const('exports', this.exports = {});
    }
    import(nameOrModules, mod) {
        if (typeof nameOrModules === 'string') {
            nameOrModules = { [nameOrModules]: mod };
        }
        if (typeof nameOrModules !== 'object')
            return;
        const names = getOwnNames(nameOrModules);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            this.scope.var(name, nameOrModules[name]);
        }
    }
    parse(code, parser) {
        if (typeof parser === 'function') {
            return parser(code, assign({}, this.options));
        }
        return parseScript(code, this.options);
    }
    run(code) {
        let ast;
        if (typeof code === 'string') {
            ast = parseScript(code, this.options);
        }
        else {
            ast = code;
        }
        hoist(ast, this.scope);
        evaluate$1(ast, this.scope);
    }
}

export { Sval };

import { Scope } from '../scope';
import { ESTree } from "meriyah";
export declare function ThisExpression(node: ESTree.ThisExpression, scope: Scope): Generator<never, any, unknown>;
export declare function ArrayExpression(node: ESTree.ArrayExpression, scope: Scope): Generator<any, any[], any>;
export declare function ObjectExpression(node: ESTree.ObjectExpression, scope: Scope): Generator<any, {
    [key: string]: any;
}, any>;
export declare function FunctionExpression(node: ESTree.FunctionExpression, scope: Scope): Generator<never, any, unknown>;
export declare function UnaryExpression(node: ESTree.UnaryExpression, scope: Scope): Generator<any, number | boolean | "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function", any>;
export declare function UpdateExpression(node: ESTree.UpdateExpression, scope: Scope): Generator<any, any, any>;
export declare function BinaryExpression(node: ESTree.BinaryExpression, scope: Scope): Generator<any, any, any>;
export declare function AssignmentExpression(node: ESTree.AssignmentExpression, scope: Scope): Generator<any, any, any>;
export declare function LogicalExpression(node: ESTree.LogicalExpression, scope: Scope): Generator<any, any, any>;
export interface MemberExpressionOptions {
    getObj?: boolean;
    getVar?: boolean;
}
export declare function MemberExpression(node: ESTree.MemberExpression, scope: Scope, options?: MemberExpressionOptions): Generator<any, any, any>;
export declare function ConditionalExpression(node: ESTree.ConditionalExpression, scope: Scope): Generator<any, any, any>;
export declare function CallExpression(node: ESTree.CallExpression, scope: Scope): Generator<any, any, any>;
export declare function NewExpression(node: ESTree.NewExpression, scope: Scope): Generator<any, any, any>;
export declare function MetaProperty(node: ESTree.MetaProperty, scope: Scope): Generator<never, any, unknown>;
export declare function SequenceExpression(node: ESTree.SequenceExpression, scope: Scope): Generator<any, any, any>;
export declare function ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression, scope: Scope): Generator<never, any, unknown>;
export declare function TemplateLiteral(node: ESTree.TemplateLiteral, scope: Scope): Generator<any, string, any>;
export declare function TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression, scope: Scope): Generator<any, any, any>;
export declare function TemplateElement(node: ESTree.TemplateElement, scope: Scope): Generator<never, string, unknown>;
export declare function ClassExpression(node: ESTree.ClassExpression, scope: Scope): Generator<any, () => void, any>;
export interface SuperOptions {
    getProto?: boolean;
}
export declare function Super(node: ESTree.Super, scope: Scope, options?: SuperOptions): Generator<never, any, unknown>;
export declare function SpreadElement(node: ESTree.SpreadElement, scope: Scope): Generator<any, any, any>;
export declare function YieldExpression(node: ESTree.YieldExpression, scope: Scope): Generator<any, any, any>;
export declare function AwaitExpression(node: ESTree.AwaitExpression, scope: Scope): Generator<any, any, any>;

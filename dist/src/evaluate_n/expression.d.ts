import Scope from '../scope';
import { ESTree } from "meriyah";
export declare function ThisExpression(node: ESTree.ThisExpression, scope: Scope): any;
export declare function ArrayExpression(node: ESTree.ArrayExpression, scope: Scope): any[];
export declare function ObjectExpression(node: ESTree.ObjectExpression, scope: Scope): {
    [key: string]: any;
};
export declare function FunctionExpression(node: ESTree.FunctionExpression, scope: Scope): any;
export declare function UnaryExpression(node: ESTree.UnaryExpression, scope: Scope): number | boolean | "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
export declare function UpdateExpression(node: ESTree.UpdateExpression, scope: Scope): any;
export declare function BinaryExpression(node: ESTree.BinaryExpression, scope: Scope): any;
export declare function AssignmentExpression(node: ESTree.AssignmentExpression, scope: Scope): any;
export declare function LogicalExpression(node: ESTree.LogicalExpression, scope: Scope): any;
export interface MemberExpressionOptions {
    getObj?: boolean;
    getVar?: boolean;
}
export declare function MemberExpression(node: ESTree.MemberExpression, scope: Scope, options?: MemberExpressionOptions): any;
export declare function ConditionalExpression(node: ESTree.ConditionalExpression, scope: Scope): any;
export declare function CallExpression(node: ESTree.CallExpression, scope: Scope): any;
export declare function NewExpression(node: ESTree.NewExpression, scope: Scope): any;
export declare function MetaProperty(node: ESTree.MetaProperty, scope: Scope): any;
export declare function SequenceExpression(node: ESTree.SequenceExpression, scope: Scope): any;
export declare function ArrowFunctionExpression(node: ESTree.ArrowFunctionExpression, scope: Scope): any;
export declare function TemplateLiteral(node: ESTree.TemplateLiteral, scope: Scope): string;
export declare function TaggedTemplateExpression(node: ESTree.TaggedTemplateExpression, scope: Scope): any;
export declare function TemplateElement(node: ESTree.TemplateElement, scope: Scope): string;
export declare function ClassExpression(node: ESTree.ClassExpression, scope: Scope): () => void;
export interface SuperOptions {
    getProto?: boolean;
}
export declare function Super(node: ESTree.Super, scope: Scope, options?: SuperOptions): any;
export declare function SpreadElement(node: ESTree.SpreadElement, scope: Scope): any;

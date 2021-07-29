import { ESTree, Options } from "meriyah";
import { ExecutionListener, Scope } from './scope';
export declare type SvalOptions = Options & {
    sandBox?: boolean;
    executionListener?: ExecutionListener;
};
export declare class Sval {
    static version: string;
    readonly options: Options;
    readonly scope: Scope;
    exports: {
        [name: string]: any;
    };
    constructor(options?: SvalOptions);
    import(nameOrModules: string | {
        [name: string]: any;
    }, mod?: any): void;
    parse(code: string, parser?: (code: string, options: SvalOptions) => Node): Node | ESTree.Program;
    run(code: string | ESTree.Program): void;
}

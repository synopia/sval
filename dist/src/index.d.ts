import { ESTree, Options } from "meriyah";
export declare type SvalOptions = Options & {
    sandBox?: boolean;
};
export declare class Sval {
    static version: string;
    private options;
    private scope;
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

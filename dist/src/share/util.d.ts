export declare const freeze: {
    <T>(a: T[]): readonly T[];
    <T_1 extends Function>(f: T_1): T_1;
    <T_2>(o: T_2): Readonly<T_2>;
};
export declare const define: <T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>) => T;
export declare const getDptor: (o: any, p: PropertyKey) => PropertyDescriptor;
export declare function hasOwn(obj: any, key: string): boolean;
export declare const getOwnNames: (o: any) => string[];
export declare function setProto(obj: any, proto: any): void;
export declare function getProto(obj: any): any;
export declare function getGetter(obj: any, key: string): (() => any) | ((v: any) => void);
export declare function getSetter(obj: any, key: string): (() => any) | ((v: any) => void);
export declare const create: {
    (o: object): any;
    (o: object, properties: PropertyDescriptorMap & ThisType<any>): any;
};
export declare function inherits(subClass: (...args: any[]) => any, superClass: (...args: any[]) => any): void;
export declare function _assign(target: any): any;
export declare const assign: {
    <T, U>(target: T, source: U): T & U;
    <T_1, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
    <T_2, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
    (target: object, ...sources: any[]): any;
};
export declare let globalObj: any;
export declare const WINDOW: string;
export declare function createSandBox(): any;
export declare function createSymbol(key: string): string;
export declare function getAsyncIterator(obj: any): any;

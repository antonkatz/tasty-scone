import {Observable}      from "rxjs"
import {OperationStream} from "../execution/OperationStream"
import {BasicOperation}  from "./BasicOperation";

export const OperationSymbol = Symbol();

export type OrEmpty<T> = T extends never ? {} : T
export type VoidIfEmpty<T> = {} extends T ? void : T
export type OmitIntoVoid<T, K extends keyof any> = Exclude<keyof T, K> extends never ? void : Pick<T, Exclude<keyof T, K>>;

export interface Operation<In, Out, Context> {
    readonly symbol: Symbol
    operation: (ctx: Context, inObs: Observable<In>) => Observable<Out>
    security: (ctx: Context) => boolean

    getOpName(): string
    withContext<PCtx extends Partial<Context>>(andContext: PCtx):
        Operation<In, Out, OmitIntoVoid<Context, keyof PCtx>>

    chain<NextOut, NextCtx>(op: Operation<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, VoidIfEmpty<OrEmpty<NextCtx> & OrEmpty<Context>>>
    chain<NextOut, NextCtx>(opStream: OperationStream<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, VoidIfEmpty<OrEmpty<NextCtx> & OrEmpty<Context>>>

    toJSON(): {opName: string, ctx: any}
}

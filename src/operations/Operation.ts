import {Observable} from "rxjs"
import {BasicOperationStream, buildOpStream, OperationStream, OperationStreamSymbol} from "../execution/OperationStream"
import {List} from "immutable"

export const OperationSymbol = Symbol();

export type OrEmpty<T> = T extends never ? {} : T

export interface Operation<In, Out, Context> {
    readonly symbol: Symbol
    readonly operation: (ctx: Context, inObs: Observable<In>) => Observable<Out>
    readonly security: (ctx: Context) => boolean

    getOpName(): string
    withContext<PCtx extends Partial<Context>, NextCtx extends OrEmpty<Omit<Context, keyof PCtx>>>(andContext: PCtx):
        BasicOperation<In, Out, NextCtx>

    chain<NextOut, NextCtx>(op: Operation<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, NextCtx & Context>
    chain<NextOut, NextCtx>(opStream: OperationStream<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, NextCtx & Context>

    toJSON(): {opName: string, ctx: Partial<Context>}
}
export abstract class BasicOperation<In, Out, Context> implements Operation<In, Out, Context> {
    readonly symbol = OperationSymbol;

    context = {};
    protected abstract name: string;

    abstract security(ctx: Context): boolean
    abstract operation(ctx: Context, inObs: Observable<In>): Observable<Out>

    getOpName() {
        return this.name
    }

    withContext<PCtx extends Partial<Context>, NextCtx extends OrEmpty<Omit<Context, keyof PCtx>>>(andContext: PCtx):
        BasicOperation<In, Out, NextCtx> {
        const _s = this;

        return new class extends BasicOperation<In, Out, NextCtx> {
            context = {..._s.context, ...andContext};
            name = _s.getOpName();

            operation(ctx: NextCtx, inObs: Observable<In>): Observable<Out> {
                const fullCtx = {...andContext, ...ctx} as unknown as Context;
                return _s.operation(fullCtx, inObs)
            }

            security(ctx: NextCtx): boolean {
                const fullCtx = {...andContext, ...ctx} as unknown as Context;
                return _s.security(fullCtx)
            }
        }
    }

    chain<NextOut, NextCtx>(op: Operation<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, NextCtx & Context>
    chain<NextOut, NextCtx>(opStream: OperationStream<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, NextCtx & Context>
    chain<NextOut, NextCtx>(opOrStream: Operation<Out, NextOut, NextCtx> | OperationStream<Out, NextOut, NextCtx>):
        OperationStream<In, NextOut, NextCtx & Context> {

        if (opOrStream.symbol === OperationSymbol) {
            const op = opOrStream as Operation<Out, NextOut, NextCtx>;
            return new BasicOperationStream(List([this, op]))
        } else if (opOrStream.symbol === OperationStreamSymbol) {
            const stream = opOrStream as OperationStream<Out, NextOut, NextCtx>;
            const thisStream = new BasicOperationStream<In, Out, Context>(List([this]));
            return thisStream.join(stream)
        }
        throw new Error('An operation can only be chained with another or a stream')
    }

    toJSON() {
        return {opName: this.getOpName(), ctx: this.context}
    }
}


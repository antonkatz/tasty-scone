import {Table, TableRecord}               from "../../table/Table"
import {Observable}                                 from "rxjs"
import {filter, first, flatMap, map, mergeMap, tap} from "rxjs/operators"
import {registerOperation}                          from "../operationRegistry"
import {BasicOperation}                   from "../BasicOperation";

export class TableGetOp<V>
    extends BasicOperation<string, V | undefined, { table: Table<V> }> {
    protected name: string = "TableGetOp";

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<string>):
        Observable<V | undefined> {
        // console.log(`TableGetOp ${JSON.stringify(ctx)}`)

        return inObs.pipe(
            flatMap(key => ctx.table.get(key))
        )
    }
}

registerOperation(TableGetOp)

export class TableGetFirstOp<V>
    extends BasicOperation<string, V | undefined, { table: Table<V> }> {
    protected name: string = "TableGetFirstOp";

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<string>):
        Observable<V | undefined> {
        // console.log(`TableGetFirstOp ${JSON.stringify(ctx)}`)

        return inObs.pipe(
            flatMap(key => ctx.table.get(key)),
            first()
        )
    }
}

registerOperation(TableGetFirstOp)

export class TableGetForUpdate<V>
    extends BasicOperation<string, TableRecord<V>, { table: Table<V> }> {
    protected name: string = "TableGetForUpdate";

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<string>):
        Observable<TableRecord<V>> {
        // console.log(`TableGetForUpdate ${JSON.stringify(ctx)}`)

        return inObs.pipe(
            flatMap(key => ctx.table.get(key).pipe(
                // making sure is not empty and then reconstructing the record
                filter(v => !!v),
                map(v => {
                    const value = v as V
                    // console.debug(`Got for update ${JSON.stringify(v)}`)
                    return {key, value}
                })
            )),
            first()
        )
    }
}

registerOperation(TableGetForUpdate)

export class TableGetStreamingRange<V>
    extends BasicOperation<[string | null, string | null], TableRecord<V>, { table: Table<V> }> {
    protected name: string = "TableGetStreamingRange";

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<[string | null, string | null]>): Observable<TableRecord<V>> {
        return inObs.pipe(
            mergeMap(([start, end]) => {
                const out$ = ctx.table.range(start || undefined, end || undefined)
                return out$
            })
        )
    }
}

registerOperation(TableGetStreamingRange)

export class TablePutOp<V>
    extends BasicOperation<{key: string, value: V}, string | undefined, { table: Table<V> }> {

    protected name: string = "TablePutOp";

    constructor() {
        super();
    }

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<{key: string, value: V}>):
        Observable<string | undefined> {
        return inObs.pipe(
            flatMap(kv => {
                // console.log(`Putting:\n${JSON.stringify(kv.value, null, 2)}`)
                return ctx.table.put(kv.key, kv.value)
            })
        )
    }
}

registerOperation(TablePutOp)

export class TableFilterNotExists<V> extends BasicOperation<{key: string, value: V}, {key: string, value: V}, {table: Table<V>}> {
    protected name = "TableFilterNotExists"

    constructor() {
        super();
    }

    _security(ctx: { table: Table<V> }): boolean {
        return true
    }

    _operation(ctx: { table: Table<V> }, inObs: Observable<{ key: string }>): Observable<{key: string, value: V}> {
        return inObs.pipe(
            flatMap(kv => {
                // console.log('filtering on ' + JSON.stringify(kv))
                return ctx.table.get(kv.key).pipe(
                    map(existing => [!!existing, kv] as [boolean, {key: string, value: V}]),
                    first()
                )
            }),
            tap(we => console.log(`Filter res ${this.getOpName()} : ${we}`)),
            filter(withExisting => !withExisting[0]),
            map(withExisting => withExisting[1])
        )
    }
}

registerOperation(TableFilterNotExists)



// export class UpdateRecordByActionOp<V, Z extends TableRecord<V>, A> extends BasicOperation<Z, Z, {action: A}> {
//     protected name: string = 'UpdateRecordOp';
//
//     constructor(readonly updateWith: (inObs: Observable<Z>, action: A) => Observable<Z>) {
//         super();
//     }
//
//     _operation(ctx: { action: A }, inObs: Observable<Z>): Observable<Z> {
//         return this.updateWith(inObs, ctx.action);
//     }
//
//     _security(ctx: { action: A }): boolean {
//         return true;
//     }
// }
//
// registerOperation()

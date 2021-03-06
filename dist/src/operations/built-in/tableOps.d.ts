import { Table, TableRecord } from "../../table/Table";
import { Observable } from "rxjs";
import { BasicOperation } from "../BasicOperation";
export declare class TableGetOp<V> extends BasicOperation<string, V | undefined, {
    table: Table<V>;
}> {
    protected name: string;
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<string>): Observable<V | undefined>;
}
export declare class TableGetFirstOp<V> extends BasicOperation<string, V | undefined, {
    table: Table<V>;
}> {
    protected name: string;
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<string>): Observable<V | undefined>;
}
export declare class TableGetForUpdate<V> extends BasicOperation<string, TableRecord<V>, {
    table: Table<V>;
}> {
    protected name: string;
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<string>): Observable<TableRecord<V>>;
}
export declare class TableGetStreamingRange<V> extends BasicOperation<[string | null, string | null], TableRecord<V>, {
    table: Table<V>;
}> {
    protected name: string;
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<[string | null, string | null]>): Observable<TableRecord<V>>;
}
export declare class TablePutOp<V> extends BasicOperation<{
    key: string;
    value: V;
}, string | undefined, {
    table: Table<V>;
}> {
    protected name: string;
    constructor();
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<{
        key: string;
        value: V;
    }>): Observable<string | undefined>;
}
export declare class TableFilterNotExists<V> extends BasicOperation<{
    key: string;
    value: V;
}, {
    key: string;
    value: V;
}, {
    table: Table<V>;
}> {
    protected name: string;
    constructor();
    _security(ctx: {
        table: Table<V>;
    }): boolean;
    _operation(ctx: {
        table: Table<V>;
    }, inObs: Observable<{
        key: string;
    }>): Observable<{
        key: string;
        value: V;
    }>;
}
//# sourceMappingURL=tableOps.d.ts.map
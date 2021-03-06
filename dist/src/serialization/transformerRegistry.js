"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tableTransformer_1 = require("./tableTransformer");
const operationTransformer_1 = require("./operationTransformer");
const operationStreamTransformer_1 = require("./operationStreamTransformer");
const rxjsContextTransformer_1 = require("./rxjsContextTransformer");
exports.transformerRegistry = [
    rxjsContextTransformer_1.objToRxjsContext,
    tableTransformer_1.objToTable,
    operationTransformer_1.objToOp,
    operationStreamTransformer_1.objToStream
];

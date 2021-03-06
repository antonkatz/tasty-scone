"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_1 = require("../database/adapter");
const Codec_1 = require("./Codec");
const Table_1 = require("./Table");
const levelup_1 = __importDefault(require("levelup"));
const tableRegistry_1 = require("./tableRegistry");
const fp_1 = require("lodash/fp");
const DbBasePath_1 = __importDefault(require("../database/DbBasePath"));
/** @deprecated use `buildTable()` instead */
exports.TableBuilder = fp_1.curry(_buildTable)(adapter_1.DB_ADAPTER);
exports.buildTable = fp_1.curry(_buildTable)(adapter_1.DB_ADAPTER);
function _buildTable(adapter, options, codec = Codec_1.buildJsonCodec()) {
    const relPath = options.relativePath || '';
    const db = DbBasePath_1.default.path.then(async (basePath) => {
        const _a = await adapter;
        const path = basePath + relPath + 'db-' + options.name;
        console.debug('Opening DB on path ' + path);
        const _db = _a(path);
        return levelup_1.default(_db);
    });
    const table = new Table_1.Table(options.name, db, codec);
    tableRegistry_1.registerTable(options.name, table);
    return table;
}

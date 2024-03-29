"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cast = exports.PaginationIterator = exports.getVersionData = exports.isStream = exports.isBuffer = exports.isNode = exports.sliceArrayByByteLength = exports.maybeGzipValue = exports.stringifyWebhooksToBase64 = exports.parseDateFields = exports.catchNotFoundOrThrow = exports.pluckData = void 0;
const tslib_1 = require("tslib");
// import util from 'util';
// import zlib from 'zlib';
const ow_1 = tslib_1.__importDefault(require("ow"));
const NOT_FOUND_STATUS_CODE = 404;
const RECORD_NOT_FOUND_TYPE = 'record-not-found';
const RECORD_OR_TOKEN_NOT_FOUND_TYPE = 'record-or-token-not-found';
const MIN_GZIP_BYTES = 1024;
/**
 * Returns object's 'data' property or throws if parameter is not an object,
 * or an object without a 'data' property.
 */
function pluckData(obj) {
    if (typeof obj === 'object' && obj) {
        if (typeof obj.data !== 'undefined')
            return obj.data;
    }
    throw new Error(`Expected response object with a "data" property, but received: ${obj}`);
}
exports.pluckData = pluckData;
/**
 * If given HTTP error has NOT_FOUND_STATUS_CODE status code then returns undefined.
 * Otherwise rethrows error.
 */
function catchNotFoundOrThrow(err) {
    const isNotFoundStatus = err.statusCode === NOT_FOUND_STATUS_CODE;
    const isNotFoundMessage = err.type === RECORD_NOT_FOUND_TYPE ||
        err.type === RECORD_OR_TOKEN_NOT_FOUND_TYPE ||
        err.httpMethod === 'head';
    const isNotFoundError = isNotFoundStatus && isNotFoundMessage;
    if (!isNotFoundError)
        throw err;
}
exports.catchNotFoundOrThrow = catchNotFoundOrThrow;
/**
 * Traverses JSON structure and converts fields that end with "At" to a Date object (fields such as "modifiedAt" or
 * "createdAt").
 *
 * If you want parse other fields as well, you can provide a custom matcher function shouldParseField(). This
 * admittedly awkward approach allows this function to be reused for various purposes without introducing potential
 * breaking changes.
 *
 * If the field cannot be converted to Date, it is left as is.
 */
function parseDateFields(input, shouldParseField = null, depth = 0) {
    // Don't go too deep to avoid stack overflows (especially if there is a circular reference). The depth of 3
    // corresponds to obj.data.someArrayField.[x].field and should be generally enough.
    // TODO: Consider removing this limitation. It might came across as an annoying surprise as it's not communicated.
    if (depth > 3) {
        return input;
    }
    if (Array.isArray(input))
        return input.map((child) => parseDateFields(child, shouldParseField, depth + 1));
    if (!input || typeof input !== 'object')
        return input;
    return Object.entries(input).reduce((output, [k, v]) => {
        const isValObject = !!v && typeof v === 'object';
        if (k.endsWith('At') || (shouldParseField && shouldParseField(k))) {
            if (v) {
                const d = new Date(v);
                output[k] = Number.isNaN(d.getTime()) ? v : d;
            }
            else {
                output[k] = v;
            }
        }
        else if (isValObject || Array.isArray(v)) {
            output[k] = parseDateFields(v, shouldParseField, depth + 1);
        }
        else {
            output[k] = v;
        }
        return output;
    }, {});
}
exports.parseDateFields = parseDateFields;
/**
 * Helper function that converts array of webhooks to base64 string
 */
function stringifyWebhooksToBase64(webhooks) {
    if (!webhooks)
        return;
    const webhooksJson = JSON.stringify(webhooks);
    if (isNode()) {
        return Buffer.from(webhooksJson, 'utf8').toString('base64');
    }
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(webhooksJson);
    return btoa(String.fromCharCode(...uint8Array));
}
exports.stringifyWebhooksToBase64 = stringifyWebhooksToBase64;
// let gzipPromise: ReturnType<typeof util['promisify']>;
// if (isNode()) gzipPromise = util.promisify(zlib.gzip);
/**
 * Gzip provided value, otherwise returns undefined.
 */
// export async function maybeGzipValue(value: unknown): Promise<Buffer | undefined> {
//     if (!isNode()) return;
//     if (typeof value !== 'string' && !Buffer.isBuffer(value)) return;
//     // Request compression is not that important so let's
//     // skip it instead of throwing for unsupported types.
//     const areDataLargeEnough = Buffer.byteLength(value as string) >= MIN_GZIP_BYTES;
//     if (areDataLargeEnough) {
//         return gzipPromise(value);
//     }
//     return undefined;
// }
async function maybeGzipValue(value) {
    if (typeof value !== 'string' && !(value instanceof Uint8Array))
        return;
    const encoder = new TextEncoder();
    const encoded = typeof value === 'string' ? encoder.encode(value) : value;
    if (encoded.byteLength < MIN_GZIP_BYTES)
        return encoded;
    const stream = toStream(encoded);
    if (typeof CompressionStream !== 'undefined') {
        const compressionStream = stream.pipeThrough(new CompressionStream('gzip'));
        const reader = compressionStream === null || compressionStream === void 0 ? void 0 : compressionStream.getReader();
        let result = new Uint8Array();
        while (true) {
            const { done, value } = (await (reader === null || reader === void 0 ? void 0 : reader.read())) || {};
            if (done)
                break;
            const tmp = new Uint8Array(result.length + value.length);
            tmp.set(result);
            tmp.set(value, result.length);
            result = tmp;
        }
        return result;
    }
    return undefined; // Fallback if CompressionStream is not supported
}
exports.maybeGzipValue = maybeGzipValue;
function toStream(input) {
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(input);
            controller.close();
        },
    });
    return stream;
    // eslint-disable-next-line no-confusing-arrow
}
/**
 * Helper function slice the items from array to fit the max byte length.
 */
function sliceArrayByByteLength(array, maxByteLength, startIndex) {
    const stringByteLength = (str) => isNode() ? Buffer.byteLength(str) : new Blob([str]).size;
    const arrayByteLength = stringByteLength(JSON.stringify(array));
    if (arrayByteLength < maxByteLength)
        return array;
    const slicedArray = [];
    let byteLength = 2; // 2 bytes for the empty array []
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        const itemByteSize = stringByteLength(JSON.stringify(item));
        if (itemByteSize > maxByteLength) {
            throw new Error(`RequestQueueClient.batchAddRequests: The size of the request with index: ${startIndex + i} ` +
                `exceeds the maximum allowed size (${maxByteLength} bytes).`);
        }
        if (byteLength + itemByteSize >= maxByteLength)
            break;
        byteLength += itemByteSize;
        slicedArray.push(item);
    }
    return slicedArray;
}
exports.sliceArrayByByteLength = sliceArrayByByteLength;
function isNode() {
    return !!(typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node);
}
exports.isNode = isNode;
function isBuffer(value) {
    return ow_1.default.isValid(value, ow_1.default.any(ow_1.default.buffer, ow_1.default.arrayBuffer, ow_1.default.typedArray));
}
exports.isBuffer = isBuffer;
function isStream(value) {
    return ow_1.default.isValid(value, ow_1.default.object.hasKeys('on', 'pipe'));
}
exports.isStream = isStream;
function getVersionData() {
    if (typeof BROWSER_BUILD !== 'undefined') {
        return { version: VERSION };
    }
    // eslint-disable-next-line
    return require('../package.json');
}
exports.getVersionData = getVersionData;
/**
 * Helper class to create async iterators from paginated list endpoints with exclusive start key.
 */
class PaginationIterator {
    constructor(options) {
        Object.defineProperty(this, "maxPageLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getPage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "exclusiveStartId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.maxPageLimit = options.maxPageLimit;
        this.limit = options.limit;
        this.exclusiveStartId = options.exclusiveStartId;
        this.getPage = options.getPage;
    }
    async *[Symbol.asyncIterator]() {
        let nextPageExclusiveStartId;
        let iterateItemCount = 0;
        while (true) {
            const pageLimit = this.limit
                ? Math.min(this.maxPageLimit, this.limit - iterateItemCount)
                : this.maxPageLimit;
            const pageExclusiveStartId = nextPageExclusiveStartId || this.exclusiveStartId;
            const page = await this.getPage({
                limit: pageLimit,
                exclusiveStartId: pageExclusiveStartId,
            });
            // There are no more pages to iterate
            if (page.items.length === 0)
                return;
            yield page;
            iterateItemCount += page.items.length;
            // Limit reached stopping to iterate
            if (this.limit && iterateItemCount >= this.limit)
                return;
            nextPageExclusiveStartId = page.items[page.items.length - 1].id;
        }
    }
}
exports.PaginationIterator = PaginationIterator;
function cast(input) {
    return input;
}
exports.cast = cast;
//# sourceMappingURL=utils.js.map
/// <reference types="node" />
/// <reference types="node" />
import type { Readable } from 'node:stream';
import type { TypedArray, JsonValue } from 'type-fest';
import { ApifyApiError } from './apify_api_error';
import { RequestQueueClientListRequestsOptions, RequestQueueClientListRequestsResult } from './resource_clients/request_queue';
import { WebhookUpdateData } from './resource_clients/webhook';
export interface MaybeData<R> {
    data?: R;
}
/**
 * Returns object's 'data' property or throws if parameter is not an object,
 * or an object without a 'data' property.
 */
export declare function pluckData<R>(obj: MaybeData<R>): R;
/**
 * If given HTTP error has NOT_FOUND_STATUS_CODE status code then returns undefined.
 * Otherwise rethrows error.
 */
export declare function catchNotFoundOrThrow(err: ApifyApiError): void;
type ReturnJsonValue = string | number | boolean | null | Date | ReturnJsonObject | ReturnJsonArray;
type ReturnJsonObject = {
    [Key in string]?: ReturnJsonValue;
};
type ReturnJsonArray = Array<ReturnJsonValue>;
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
export declare function parseDateFields(input: JsonValue, shouldParseField?: ((key: string) => boolean) | null, depth?: number): ReturnJsonValue;
/**
 * Helper function that converts array of webhooks to base64 string
 */
export declare function stringifyWebhooksToBase64(webhooks: WebhookUpdateData[]): string | undefined;
/**
 * Gzip provided value, otherwise returns undefined.
 */
export declare function maybeGzipValue(value: unknown): Promise<Uint8Array | undefined>;
/**
 * Helper function slice the items from array to fit the max byte length.
 */
export declare function sliceArrayByByteLength<T>(array: T[], maxByteLength: number, startIndex: number): T[];
export declare function isNode(): boolean;
export declare function isBuffer(value: unknown): value is Buffer | ArrayBuffer | TypedArray;
export declare function isStream(value: unknown): value is Readable;
export declare function getVersionData(): {
    version: string;
};
/**
 * Helper class to create async iterators from paginated list endpoints with exclusive start key.
 */
export declare class PaginationIterator {
    private readonly maxPageLimit;
    private readonly getPage;
    private readonly limit?;
    private readonly exclusiveStartId?;
    constructor(options: PaginationIteratorOptions);
    [Symbol.asyncIterator](): AsyncIterator<RequestQueueClientListRequestsResult>;
}
declare global {
    export const BROWSER_BUILD: boolean | undefined;
    export const VERSION: string | undefined;
}
export interface PaginationIteratorOptions {
    maxPageLimit: number;
    getPage: (opts: RequestQueueClientListRequestsOptions) => Promise<RequestQueueClientListRequestsResult>;
    limit?: number;
    exclusiveStartId?: string;
}
export interface PaginatedList<Data> {
    /** Total count of entries in the dataset. */
    total: number;
    /** Count of dataset entries returned in this set. */
    count: number;
    /** Position of the first returned entry in the dataset. */
    offset: number;
    /** Maximum number of dataset entries requested. */
    limit: number;
    /** Should the results be in descending order. */
    desc: boolean;
    /** Dataset entries based on chosen format parameter. */
    items: Data[];
}
export declare function cast<T>(input: unknown): T;
export type Dictionary<T = unknown> = Record<PropertyKey, T>;
export type DistributiveOptional<T, K extends keyof T> = T extends any ? Omit<T, K> & Partial<Pick<T, K>> : never;
export {};
//# sourceMappingURL=utils.d.ts.map
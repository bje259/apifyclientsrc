import { WEBHOOK_EVENT_TYPES } from '@apify/consts';
import { WebhookDispatch } from './webhook_dispatch';
import { WebhookDispatchCollectionClient } from './webhook_dispatch_collection';
import { ApiClientSubResourceOptions } from '../base/api_client';
import { ResourceClient } from '../base/resource_client';
export declare class WebhookClient extends ResourceClient {
    /**
     * @hidden
     */
    constructor(options: ApiClientSubResourceOptions);
    /**
     * https://docs.apify.com/api/v2#/reference/webhooks/webhook-object/get-webhook
     */
    get(): Promise<Webhook | undefined>;
    /**
     * https://docs.apify.com/api/v2#/reference/webhooks/webhook-object/update-webhook
     */
    update(newFields: WebhookUpdateData): Promise<Webhook>;
    /**
     * https://docs.apify.com/api/v2#/reference/webhooks/webhook-object/delete-webhook
     */
    delete(): Promise<void>;
    /**
     * https://docs.apify.com/api/v2#/reference/webhooks/webhook-test/test-webhook
     */
    test(): Promise<WebhookDispatch | undefined>;
    /**
     * https://docs.apify.com/api/v2#/reference/webhooks/dispatches-collection
     */
    dispatches(): WebhookDispatchCollectionClient;
}
export interface Webhook {
    id: string;
    userId: string;
    createdAt: Date;
    modifiedAt: Date;
    isAdHoc: boolean;
    eventTypes: WebhookEventType[];
    condition: WebhookCondition;
    ignoreSslErrors: boolean;
    doNotRetry: boolean;
    requestUrl: string;
    payloadTemplate: string;
    lastDispatch: string;
    stats: WebhookStats;
    shouldInterpolateStrings: boolean;
    isApifyIntegration?: boolean;
    headersTemplate?: string;
    description?: string;
}
export interface WebhookIdempotencyKey {
    idempotencyKey?: string;
}
export type WebhookUpdateData = Partial<Pick<Webhook, 'isAdHoc' | 'eventTypes' | 'condition' | 'ignoreSslErrors' | 'doNotRetry' | 'requestUrl' | 'payloadTemplate' | 'shouldInterpolateStrings' | 'isApifyIntegration' | 'headersTemplate' | 'description'>> & WebhookIdempotencyKey;
export interface WebhookStats {
    totalDispatches: number;
}
export type WebhookEventType = typeof WEBHOOK_EVENT_TYPES[keyof typeof WEBHOOK_EVENT_TYPES];
export type WebhookCondition = WebhookAnyRunOfActorCondition | WebhookAnyRunOfActorTaskCondition | WebhookCertainRunCondition;
export interface WebhookAnyRunOfActorCondition {
    actorId: string;
}
export interface WebhookAnyRunOfActorTaskCondition {
    actorTaskId: string;
}
export interface WebhookCertainRunCondition {
    actorRunId: string;
}
//# sourceMappingURL=webhook.d.ts.map
import { Task, TaskUpdateData } from './task';
import { ApiClientSubResourceOptions } from '../base/api_client';
import { ResourceCollectionClient } from '../base/resource_collection_client';
import { PaginatedList } from '../utils';
export declare class TaskCollectionClient extends ResourceCollectionClient {
    /**
     * @hidden
     */
    constructor(options: ApiClientSubResourceOptions);
    /**
     * https://docs.apify.com/api/v2#/reference/actor-tasks/task-collection/get-list-of-tasks
     * @param {object} [options]
     * @param {number} [options.limit]
     * @param {number} [options.offset]
     * @param {boolean} [options.desc]
     * @return {Promise<PaginationList>}
     */
    list(options?: TaskCollectionListOptions): Promise<PaginatedList<TaskList>>;
    /**
     * https://docs.apify.com/api/v2#/reference/actor-tasks/task-collection/create-task
     */
    create(task: TaskCreateData): Promise<Task>;
}
export interface TaskCollectionListOptions {
    limit?: number;
    offset?: number;
    desc?: boolean;
}
export type TaskList = Omit<Task, 'options' | 'input'>;
export interface TaskCreateData extends TaskUpdateData {
    actId: string;
}
//# sourceMappingURL=task_collection.d.ts.map
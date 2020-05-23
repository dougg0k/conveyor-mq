import { Redis } from 'ioredis';
import moment from 'moment';
import { callLuaScript } from '../utils/redis';
import {
  getQueueTaskProcessingChannel,
  getStallingHashKey,
  getTaskKeyPrefix,
} from '../utils/keys';
import { deSerializeTask } from '../domain/tasks/deserialize-task';
import { EventTypes } from '../domain/events/event-types';
import { TaskStatuses } from '../domain/tasks/task-statuses';
import { ScriptNames } from '../lua';

/**
 * @ignore
 */
export const markTaskProcessing = async ({
  taskId,
  stallTimeout,
  queue,
  client,
}: {
  taskId: string;
  stallTimeout: number;
  queue: string;
  client: Redis;
}) => {
  const taskString = (await callLuaScript({
    client,
    script: ScriptNames.markTaskProcessing,
    args: [
      taskId,
      getTaskKeyPrefix({ queue }),
      stallTimeout,
      queue,
      moment().toISOString(),
      getQueueTaskProcessingChannel({ queue }),
      getStallingHashKey({ queue }),
      EventTypes.TaskProcessing,
      TaskStatuses.Processing,
    ],
  })) as string;
  const task = deSerializeTask(taskString);
  return task;
};

import { Redis } from 'ioredis';
import { Moment } from 'moment';
import { markTasksFailed } from './mark-tasks-failed';
import { Task } from '../domain/tasks/task';

export const markTaskFailed = async ({
  task,
  queue,
  client,
  error,
  asOf,
}: {
  task: Task;
  queue: string;
  client: Redis;
  error?: any;
  asOf: Moment;
}) => {
  const [failedTask] = await markTasksFailed({
    tasksAndErrors: [{ task, error }],
    queue,
    client,
    asOf,
  });
  return failedTask;
};

import { Redis } from 'ioredis';
import { enqueueTask } from '../../actions/enqueue-task';
import { takeTask } from '../../actions/take-task';
import { markTaskSuccess } from '../../actions/mark-task-success';
import { flushAll, quit, createClient, lrange } from '../../utils/redis';
import { createUuid } from '../../utils/general';
import { redisConfig } from '../config';
import { Task } from '../../domain/tasks/task';
import { TaskStatuses } from '../../domain/tasks/task-statuses';
import { getTask } from '../../actions/get-task';
import { getSuccessListKey } from '../../utils/keys';

describe('markTaskSuccessful', () => {
  const queue = createUuid();
  let client: Redis;

  beforeAll(async () => {
    client = await createClient(redisConfig);
  });

  beforeEach(async () => {
    await flushAll({ client });
  });

  afterAll(async () => {
    await quit({ client });
  });

  it('markTaskSuccessful marks task successful', async () => {
    const task = { id: 'g', data: 'h' };
    await enqueueTask({ queue, client, task });
    const acquiredTask = (await takeTask({ queue, client })) as Task;
    const successfulTask = await markTaskSuccess({
      task: acquiredTask,
      queue,
      client,
      result: 'horaay!',
      asOf: new Date(),
    });
    expect(successfulTask).toHaveProperty('status', TaskStatuses.Success);
    expect(successfulTask).toHaveProperty('result', 'horaay!');

    const fetchedSuccessfulTask = await getTask({
      queue,
      taskId: task.id,
      client,
    });
    expect(fetchedSuccessfulTask).toHaveProperty(
      'status',
      TaskStatuses.Success,
    );
    expect(fetchedSuccessfulTask).toHaveProperty('result', 'horaay!');

    const successfulTaskIds = await lrange({
      key: getSuccessListKey({ queue }),
      start: 0,
      stop: -1,
      client,
    });
    expect(successfulTaskIds.length).toBe(1);
    expect(successfulTaskIds[0]).toBe(task.id);
  });
});

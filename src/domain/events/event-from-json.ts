import moment from 'moment';
import { Event } from './event';
import { taskFromJson } from '../tasks/task-from-json';
import { EventTypes } from './event-types';

export const eventFromJson = (eventJson: any): Event => {
  return {
    createdAt: moment(eventJson),
    type: eventJson.type as EventTypes,
    task: eventJson.task ? taskFromJson(eventJson.task) : undefined,
  };
};

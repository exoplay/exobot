import Shell from './adapters/shell';
import HTTP from './adapters/http';
import Event from './adapters/event';

export { default as Adapter } from './adapter';
export const Adapters = {
  Shell,
  HTTP,
  Event,
};

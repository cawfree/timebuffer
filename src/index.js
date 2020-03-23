import EventEmitter from "events";
import nanoid from "nanoid";
import { typeCheck } from "type-check";

const props = (handles, data, t, duration) =>
  handles.reduce(
    (obj, handle) => ({
      ...obj,
      [handle]: data[handle]
        .filter(([lt]) => lt < t && lt >= t - duration)
        .map(([_, v]) => v),
    }),
    {}
  );

export default class TimeBuffer {
  constructor() {
    const emitter = new EventEmitter();
    const handlers = [];
    const data = {};
    const intervals = {};
    Object.assign(this, {
      use: (...args) => {
        if (typeCheck("([String], Number, Function)", args)) {
          const id = nanoid();
          const [handles, duration, handler] = args;
          if (duration < 0 || !Number.isInteger(duration)) {
            throw new Error(
              `Expected positive integer duration, encountered ${duration}.`
            );
          } else if (handles.length === 0) {
            throw new Error(`Expected at least a single handler.`);
          }
          handlers.push([handles, duration]);
          return handles.reduce((buf, handle) => {
            if (handle === "use") {
              throw new Error(
                "Attempted to overwrite reserved handler, use()."
              );
            } else if (!data.hasOwnProperty(handle)) {
              Object.assign(data, { [handle]: [] });
              emitter.on(handle, (value) => {
                const t = new Date().getTime();
                data[handle].push([t, value]);
                return undefined;
              });
            }
            Object.assign(intervals, {
              [id]: setInterval(() => {
                const t = new Date().getTime();
                const nextProps = props(handles, data, t, duration);
                const lastProps = props(handles, data, t - duration, duration);
                Object.assign(
                  data,
                  Object.keys(data).reduce((obj, handle) => {
                    const max = Math.max(
                      ...handlers
                        .filter(
                          ([sensitiveTo]) => sensitiveTo.indexOf(handle) >= 0
                        )
                        .map(([_, duration]) => duration)
                    );
                    return {
                      ...obj,
                      [handle]: obj[handle].filter(([lt]) => lt >= t - 2 * max),
                    };
                  }, data)
                );
                return handler(nextProps, lastProps, t);
              }, duration),
            });
            return Object.assign(buf, {
              [handle]: (value) => emitter.emit(handle, value),
            });
          }, this);
        }
        throw new Error(
          `Expected ([String], Number, Function), encountered {args.join(',')}.`
        );
      },
    });
  }
}

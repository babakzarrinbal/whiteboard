export default class EventEmitter {
  constructor() {
    this.callbacks = new Map();
  }

  on(events, cb) {
    events = Array.isArray(events) ? events : [events];
    for (let ev of events) this.callbacks.set(ev, cb);
  }

  emit(events, data) {
    events = Array.isArray(events) ? events : [events];
    let runningCallback = new Set();
    for (let ev of events) {
      for (let cbk of this.callbacks.keys) {
        if ((cbk instanceof RegExp && cbk.exec(ev)) || cbk === ev)
          runningCallback.add(cbk);
      }
    }
    for(let cb of runningCallback) this.callbacks.get(cb)(data);
  }
}

export default class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  on(events, cb) {
    events = Array.isArray(events) ? events : [events];
    for (let ev of events)
      this.callbacks[ev.toString()] = {
        cb: cb,
        type: ev instanceof RegExp ? RegExp : String,
      };
  }

  emit(events, data) {
    events = Array.isArray(events) ? events : [events];
    let runningCallback = new Set();
    for (let ev of events) {
      for (let listenerkey in this.callbacks) {
        let listener  = this.callbacks[listenerkey]
        let regex =
          listener.type === RegExp
            ? new RegExp(
                listenerkey.slice(1, listenerkey.lastIndexOf("/")),
                listenerkey.slice(listenerkey.lastIndexOf("/") + 1)
              )
            : null;
        if ((regex && regex.exec(ev)) || listenerkey === ev)
          runningCallback.add(listenerkey);
      }
    }
    for (let listener of runningCallback) {
      this.callbacks[listener].cb(data);}
  }
}

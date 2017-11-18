import initListeners from '../events/listeners';

class EventService {
  constructor() {
    this.listeners = {};
  }

  on(event, cb) {
    if (this.listeners[event]) {
      this.listeners[event].push(cb);
    } else {
      this.listeners[event] = [cb];
    }
  }

  emit(event, data) {
    setImmediate(() =>
      this.listeners[event].forEach(async cb => {
        try {
          await Promise.resolve(cb(data));
        } catch (err) {
          console.error(
            `[EventService]::emit(${event}, ${data}) ---> err: ${err}`
          );
        }
      })
    );
  }
}

const es = new EventService();
initListeners(es);
export default es;

export const universalNextTick = decideNextTickScheduler();

function decideNextTickScheduler(): (callback: () => void) => void {
  if (globalThis.process && globalThis.process.nextTick) {
    return (callback) => globalThis.process.nextTick(callback);
  }

  const { window } = globalThis;
  if (window) {
    if (window.MessageChannel) {
      return (callback) => {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = () => callback();
        port2.postMessage("");
      };
    }
    if (window.setImmediate) {
      console.warn(
        "[batch-dispatch] will use setImmediate to queue macro task"
      );
      return window.setImmediate;
    }
    let triggerNextTick = () => undefined;
    const original = window.onmessage;
    window.onmessage = (ev: MessageEvent<{ type: string }>) => {
      if (ev.data.type === "universalNextTick") {
        triggerNextTick();
      } else {
        original?.call(window, ev);
      }
    };
    return (callback) => {
      const original = triggerNextTick;
      triggerNextTick = () => {
        callback();
        triggerNextTick = original;
      };
      window.postMessage({ type: "universalNextTick" });
    };
  }
  console.warn("[batch-dispatch] will use setTimeout to queue macro task");
  return (callback) => setTimeout(callback);
}

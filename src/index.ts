import { universalNextTick } from "./universalNextTick";

export function batchDispatch<P extends unknown[], R, BR>(
  batch: (params: P[]) => Promise<BR>,
  dispatch: (result: BR, param: P) => R
) {
  let queue: P[] = [];
  let currentTrain: Promise<BR> | undefined;
  // For debug purpose
  let queueOfCurrentTrain: P[] = [];
  return (...params: P): Promise<R> => {
    queue.push(params);

    return new Promise((resolve, reject) => {
      // every call witll queue a macro task
      universalNextTick(() => {
        // ─── Non-first Calls ─────────────────────────

        // every call during the same event loop will be chained on the same promise, train
        if (currentTrain) {
          if (!queueOfCurrentTrain.includes(params)) {
            const error = new Error(
              `call ${batch.name} with params ${params} not invoked`
            );
            console.error(error, queueOfCurrentTrain);
            reject(error);
            return;
          }
          resolve(currentTrain.then((result) => dispatch(result, params)));
          return;
        }
        // ─────────────────────────────────────────────

        // ─── First Call ──────────────────────────────

        queueOfCurrentTrain = queue;
        currentTrain = batch([...queue]);
        queue = [];

        // empty the train so that it can create the next train
        // But why next tick? We need to make time for the subsequent calls in current event loop to chain to this train
        universalNextTick(() => {
          currentTrain = undefined;
        });

        resolve(currentTrain.then((result) => dispatch(result, params)));
        // ─────────────────────────────────────────────
      });
    });
  };
}

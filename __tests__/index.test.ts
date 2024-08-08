import { expect, test, mock } from "bun:test";
import { batchDispatch } from "../src";

test("batch should be called once", async () => {
  const batch = mock(
    (people: string[][]): Promise<{ [name: string]: number }> => {
      return Promise.resolve(
        people.reduce((acc, [name]) => {
          return {
            ...acc,
            [name]: Math.floor(Math.random() * name.length),
          };
        }, {})
      );
    }
  );
  const queryAge = batchDispatch(batch, (res, [name]) => res[name]);
  await Promise.all(["Tom", "John"].map((man) => queryAge(man)));
  expect(batch).toHaveBeenCalledTimes(1);
});

test("send 2 batch", async () => {
  const batch = mock(
    (people: string[][]): Promise<{ [name: string]: number }> => {
      return Promise.resolve(
        people.reduce((acc, [name]) => {
          return {
            ...acc,
            [name]: Math.floor(Math.random() * name.length),
          };
        }, {})
      );
    }
  );
  const queryAge = batchDispatch(batch, (res, [name]) => res[name]);
  const queue = [];
  queue.push(queryAge("Tom"));
  await new Promise((resolve) => {
    process.nextTick(() => {
      queue.push(queryAge("John"));
      resolve(undefined);
    });
  });
  await Promise.all(queue);
  expect(batch).toHaveBeenCalledTimes(2);
});

import { expect, test, mock } from "bun:test";
import { batchDispatch } from "../src";

test("", async () => {
  let batch = mock(
    (people: string[][]): Promise<{ [name: string]: number }> => {
      return Promise.resolve(
        people.reduce((acc, [name]) => {
          return {
            ...acc,
            [name]: Math.floor(Math.random() * name.length * 8),
          };
        }, {})
      );
    }
  );
  const queryAge = batchDispatch(batch, (res, [name]) => res[name]);
  const result = await Promise.all(["Tom", "John"].map((man) => queryAge(man)));
  console.log(result);
  expect(batch).toHaveBeenCalledTimes(1);
});

# batch-dispatch

A small toolkit to allow batch-processing scattering async calls. Inspired by GraphQL's DataLoader

## Install

```bash
npm i batch-dispatch
```

## Usage

```js
import { batchDispatch } from "batch-dispatch";

const getUserInfoById = batchDispatch(
  (paramsList) => {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify({
        list: paramsList.map((params) => params[0]),
      }),
    });
  },
  (result, params) => {
    return result.list.find((item) => item.id === params[0]);
  },
);

getUserInfoById(1).then((user) => {
  // user.id === 1
});

getUserInfoById(2).then((user) => {
  // user.id === 2
});
```

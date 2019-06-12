# lazylol

Small utility to lazyload a resource only once and handle multiple calls with a queue.

## How to use

### Installing

`yarn add lazylol`

### How it works

You call `lazylol` passing a `loader` function which is responsible for loading
a given resource you'll need in the future. When you call it, the `loader` function won't
be executed right away. Instead, it'll wait for you to request loading. In order to request
loading, call the function returned from `lazylol`. Let's call this returned function `requester`.

```js
const requester = lazylol(loader)
```

Once you set up `lazylol` using the code above, you can call the `requester` function multiple times
throughout your application.

In the first time you call the `requester`, it'll call the stored resource loading function you passed
initially (`loader`) and wait for it to resolve, expecting it to return a promise. The `requester`
function will resolve or reject based on the outcome of your `loader` promise.

If there are multiple calls to the `requester` function while the `loader` is still running,
it'll enqueue them and wait for `loader` to complete, calling them in the order they entered the queue
once the resource is ready. If the `loader` call rejects for some reason, all the pending `requester`
calls will also reject.

Once `loader` resolves for the first time, all future calls will access the cached returned value.

If `loader` rejects and you call `requester` afterwards, it'll restart the process and retry loading
the resource by calling `loader` again.

### Example

Here's an example of an Express server that will only start a connection to the database
once the first request arrives, and use the same connection on all next requests.

```js
'use strict'

const lazylol = require('lazylol')
const express = require('express')
const app = express()

// imagine we have a "db" module with a promised function that connects
// to the database and resolves with the connection instance
const { createConnection } = require('./db')
const getConnection = lazylol(createConnection)

app.get('/', (req, res) => {
  getConnection()
    .then(async connection => {
      const result = await connection.query('select * from something')
      console.log(result)
      res.json(result)
    })
    .catch(err => res.status(500).json(err))
})

app.listen(3000)
```

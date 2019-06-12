'use strict'

const States = {
  ASLEEP: 1,
  LOADING: 2,
  LOADED: 3
}

class LazyLoader {
  constructor (loaderFunction) {
    this.loaderFunction = loaderFunction
    this.state = States.ASLEEP
    this.queue = []
    this.result = undefined
  }

  async requestLoad () {
    if (this.state === States.LOADED) {
      return this.result
    }

    if (this.state === States.ASLEEP) {
      this.load()
    }

    return new Promise((resolve, reject) => this.queue.push({ resolve, reject }))
  }

  async load () {
    this.state = States.LOADING

    return this.loaderFunction().then(
      result => {
        this.result = result
        this.state = States.LOADED
        this.dequeueItems()
      },
      err => {
        this.state = States.ASLEEP
        this.dequeueItems(err)
      }
    )
  }

  dequeueItems (err) {
    let item
    while ((item = this.queue.shift())) {
      this.dequeueItem(item, err)
    }
  }

  dequeueItem (item, err) {
    process.nextTick(() => err ? item.reject(err) : item.resolve(this.result))
  }
}

module.exports = function lazylol (loaderFunction) {
  const lazyLoader = new LazyLoader(loaderFunction)
  return () => lazyLoader.requestLoad()
}

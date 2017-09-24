const { Transform } = require('stream')

const map = (fn) => new Stream({
  transform(chunk, encoding, callback) {
    this.push(fn(chunk))
    callback()
  }
})

const filter = (fn) => new Stream({
  transform(chunk, encoding, callback) {
    if(fn(chunk)) {
      this.push(chunk)
    }
    callback()
  }
})

class Stream extends Transform {
  constructor(op) {
    super(op)

    if (!op || !op.transform) {
      this._transform = (chunk, encoding, callback) => {
        this.push(chunk)
        callback()
      }
    }
  }

  map(fn) {
    return this.pipe(map(fn))
  }

  mapTo(value) {
    return this.pipe(map(() => value))
  }

  filter(fn) {
    return this.pipe(filter(fn))
  }

  send(stream) {
    this.pipe(stream)
    return this
  }
}

module.exports = Stream

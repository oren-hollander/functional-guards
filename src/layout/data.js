'use strict'

const id = x => x
const constant = x => () => x
const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]])
const zipWith = (xs, ys, f) => xs.map((x, i) => f(x, ys[i]))

const immutable = (...fields) => (...args) => {
  const zipped = zip(fields, args).map(([field, arg]) => ({[field]: constant(arg)}))
  return zipped.reduce(Object.assign)
}

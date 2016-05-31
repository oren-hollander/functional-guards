'use strict'


const canvas = Canvas(1440, 640)

const linear = id

const elasticEase = (t, start, change, total) => {
  var ts = (t /= total) * t
  var tc = ts * t
  return start + change * (56 * tc * ts + -175 * ts * ts + 200 * tc + -100 * ts + 20 * t)
}

const elastic = x => elasticEase(x, 0, 1/100, 100)
const sin = x => Math.sin(x * 2 * Math.PI)
const range = (l, r) => ({left: () => l, right: () => r, length: () => r - l})

const sequence = (range, steps) => {
  const step = range.length() / steps
  const seq = []

  for(let x = range.left(); x <= range.right(); x += step)
    seq.push(x)

  return seq
}

const map = (f, range) => x => f(x) * (range.right() - range.left()) + range.left()
const map1d = (x, start, end) => x * (end - start) + start
const map2d = (x, start, end) => Point(map1d(x, start.x(), end.x()), map1d(x, start.y(), end.y()))
const map3d = (x, start, end) => Point3D(map1d(x, start.x(), end.x()), map1d(x, start.y(), end.y()), map1d(x, start.z(), end.z()))

const plot = view => f => {
  const xs = sequence(range(0, 1), 100)
  const points = xs.map(x => Point(x * 200, 200 - f(x) * 200))
  view.path(points)
}

const max = (f1, f2) => x => Math.max(f1(x), f2(x))
// const combine = (f1, f2) => (x, y) =>

const plotter = plot(canvas.view(Rect(300, 300, 400, 400)))
// plotter(id)
// plotter(map(id, range(0.3, 0.7)))
// plotter(max(sin, id))

// const f1 = map(linear, range(2, 5))
// const f2 = map(linear, range(3, 5))
//
// console.log(f1(0))
// console.log(f1(0.5))
// console.log(f1(1))
//
// console.log(f2(0))
// console.log(f2(0.5))
// console.log(f2(1))

// window.setTimeout(() => {
//   canvas.clear()
  // canvas.path([{x: 10, y: 10}, {x: 50, y: 30}, {x: 20, y: 100}, {x: 200, y: 200}])
// }, 1000)

// const xs = [100, 120, 170, 300, 200]
// const ys = [100, 150, 120, 300, 200]
//
// let ks = getNaturalKs(xs, ys)
// console.log(ks)
// const pxs = []
// for(let i = xs[0]; i <= xs[xs.length-1]; i++)
//   pxs.push(i)
//
// const pys = pxs.map(x => evalSpline(x, xs, ys, ks))
//
// canvas.screen.path(zipWith(xs, ys, Point))
// canvas.screen.path(zipWith(pxs, pys, Point))

const drawPoint = v => p => {
  v.fill(rgb(255, 0, 0, 0.2))
  v.stroke(rgb(255, 0, 0, 0.5))
  v.circle(p, 20, true)
  v.circle(p, 20, false)
  v.stroke(rgb(0, 0, 0, 0))
  v.fill(rgb(255, 0, 0, 0.2))
  v.circle(p, 10, false)
}

canvas.screen.line(Point(50, 50), Point(150, 150))
drawPoint(canvas.screen)(Point(100, 100))

// const s = MutableSource()


// animate(300, s.update)
// inOutLoop(500, s.update)

// clock(() => {
//   canvas.screen.clear()
  // drawPoint(canvas.screen)(Point(100, 30 + s.value() * 500))
  // drawPoint(canvas.screen)(map2d(s.value(), Point(100, 100), Point(500, 500)))
// })

const Component = immutable('type', 'dim')

const headerScroll = (components, source) => {
  const sum = (a, b) => a + b
  const height = component => component.dim.y()
  const totalHeight = components.map(height).reduce(sum)
  

}

const sources = headerScroll([
  Component('header', Point(100, 20)),
  Component('header', Point(100, 40)),
  Component('header', Point(100, 20)),
  Component('header', Point(100, 60)),
  Component('header', Point(100, 20)),
  Component('header', Point(100, 80))
])

'use strict'

const Rect = immutable('left', 'top', 'right', 'bottom')
const Point = immutable('x', 'y')
const Point3D = immutable('x', 'y', 'z')

const topLeft = rect => Point(rect.left(), rect.top())
const bottomRight = rect => Point(rect.right(), rect.bottom())

const translatePoint = vr => p => Point(vr.left() + p.x(), vr.top() + p.y())
const translateRect =  vr => r => Rect(vr.left() + r.left(), vr.top() + r.top(), vr.right() + r.right(), vr.bottom() + r.bottom())

const rgb = (r, g, b, a = 1) => `rgba(${r},${g},${b},${a})`

const Canvas = (width, height) => {
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${width / 2}px`
  canvas.style.height = `${height / 2}px`
  const ctx = canvas.getContext('2d')

  return {
    screen: View(ctx, Rect(0, 0, width, height)),
    view: rect => View(ctx, rect)
  }
}

const View = (ctx, vr) => {
  let fill = ctx.fillStyle
  let stroke = ctx.strokeStyle

  const setStyles = () => {
    ctx.strokeStyle = stroke
    ctx.fillStyle = fill
  }

  return {
    clear: () => {
      ctx.clearRect(vr.left(), vr.top(), vr.right() - vr.left(), vr.bottom() - vr.top())
    },
    fill: style => {
      fill = style
    },
    stroke: style => {
      stroke = style
    },
    rect: r => {
      setStyles()
      const tr = translateRect(vr)(r)
      ctx.fillRect(tr.left(), tr.top(), tr.right() - tr.left(), tr.bottom() - tr.top())
      ctx.strokeRect(tr.left(), tr.top(), tr.right() - tr.left(), tr.bottom() - tr.top())
    },
    circle: (p, r) => {
      setStyles()
      const tp = translatePoint(vr)(p)
      ctx.beginPath()
      ctx.arc(tp.x(), tp.y(), r, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    },
    line: (tl, br) => {
      setStyles()
      const tx = translatePoint(vr)
      const ttl = tx(tl)
      const tbr = tx(br)
      ctx.beginPath()
      ctx.moveTo(ttl.x(), ttl.y())
      ctx.lineTo(tbr.x(), tbr.y())
      ctx.stroke()
    },
    path: points => {
      setStyles()
      const tp = points.map(translatePoint(vr))
      ctx.beginPath()
      ctx.moveTo(tp[0].x(), tp[0].y())
      tp.slice(1).forEach(p => ctx.lineTo(p.x(), p.y()))
      ctx.stroke()
    }
  }
}

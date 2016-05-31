'use strict'

const Point = (x, y) => ({x, y})
const Rect = (left, top, right, bottom) => ({left, top, right, bottom})
Rect.width = rect => rect.right - rect.left
Rect.height = rect => rect.bottom - rect.top

const MouseHandler = (element, handler) => {
  let point = Point(-1, -1)
  let mouseDown = false

  const fireEvent = () => {
    handler({point, mouseDown})
  }

  element.addEventListener('mousemove', e => {
    point = Point(e.offsetX * 2, e.offsetY * 2)
    fireEvent()
  })

  element.addEventListener('mouseleave', () => {
    mouseDown = false
    point = Point(-1, -1)
    fireEvent()
  })

  element.addEventListener('mousedown', () => {
    mouseDown = true
    fireEvent()
  })

  element.addEventListener('mouseup', () => {
    mouseDown = false
    fireEvent()
  })
}

const MouseState = element => {
  let state = {mouseDown: false, point: Point(-1, -1)}
  let dragOrigin = void 0

  MouseHandler(element, event => {
    if(!state.mouseDown && event.mouseDown)
      dragOrigin = event.point
    state = event
  })

  return () => Object.assign(state, {dragOrigin})
}

const rgba = (r = 0 , g = 0, b = 0, a = 1) => `rgba(${r},${g},${b},${a})`

const Stroke = (color = rgba(0, 0, 0, 1), lineWidth = 1.0, lineDash = []) =>
  ({color, lineWidth, lineDash})

const Canvas = (canvas, width, height) => {
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${width / 2}px`
  canvas.style.height = `${height / 2}px`
  const ctx = canvas.getContext('2d')

  const clear = r => {
    ctx.clearRect(r.left, r.top, Rect.width(r), Rect.height(r))
  }

  const setFill = style => {
    ctx.fillStyle = style
  }

  const setStroke = stroke => {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.lineWidth
    ctx.setLineDash(stroke.lineDash)
  }

  const rect = r => {
    ctx.fillRect(r.left, r.top, Rect.width(r), Rect.height(r))
    ctx.strokeRect(r.left, r.top, Rect.width(r), Rect.height(r))
  }

  const circle = (p, r) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  }

  const line = (tl, br) => {
    ctx.beginPath()
    ctx.moveTo(tl.x, tl.y)
    ctx.lineTo(br.x, br.y)
    ctx.stroke()
  }

  const path = points => {
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach(p => ctx.lineTo(p.x, p.y))
    ctx.stroke()
  }

  return shapes => {
    shapes.forEach(shape => {
      switch (shape.command) {
        case 'clear':
          clear(shape.rect)
          break
        case 'rect':
          setFill(shape.fill)
          setStroke(shape.stroke)
          rect(shape.rect)
          break
        case 'circle':
          setFill(shape.fill)
          setStroke(shape.stroke)
          circle(shape.center, shape.radius)
          break
        case 'line':
          setStroke(shape.stroke)
          line(shape.topLeft, shape.bottomRight)
          break
        case 'path':
          setStroke(shape.stroke)
          path(shape.points)
          break
      }
    })
  }
}

const command = (c, args) => Object.assign({command: c}, args)

const Draw = {
  Clear: rect => command('clear', {rect}),
  Rect: (rect, fill = rgba(0, 0, 0, 0), stroke = Stroke()) => command('rect', {rect, fill, stroke}),
  Circle: (center, radius, fill = rgba(0, 0, 0, 0), stroke = Stroke()) => command('circle', {center, radius, fill, stroke}),
  Line: (topLeft, bottomRight, stroke = Stroke()) => command('line', {topLeft, bottomRight, stroke}),
  Path: (points, stroke = Stroke()) => command('path', {points, stroke})
}

const Box = rect => ({
  render: () => [
    Draw.Clear(rect),
    Draw.Rect(rect),
    Draw.Line(Point(rect.left, rect.top), Point(rect.right, rect.bottom)),
    Draw.Line(Point(rect.left, rect.bottom), Point(rect.right, rect.top))
  ],
  bounds: rect
})

const Container = (rect, ...children) => ({
  render: () => children.map(child => child.render()).reduce((a, b) => a.concat(b)),
  bounds: rect,
  children
})

const inRect = point => rect => point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom

const update = (components, component, replacement) => {
  if(components.length === 0)
    return []

  if(components[0] === component)
    return [replacement, ... components.splice(1)]

  if(components[0].children)
    return [Object.assign({}, {render: components[0].render, bounds: components[0].bounds, children: update(components[0].children, component, replacement)}), ... components.slice(1)]

  return [components[0], ... update(components.slice(1), component, replacement)]
}

const Editor = (page, canvas, canvasElement) => {
  const mouseState = MouseState(canvasElement)

  const collectComponents = () => {
    const bounds = []

    const collectSubComponents = c => {
      bounds.push(c)
      if(c.children)
        c.children.forEach(child => collectSubComponents(child))
    }

    collectSubComponents(page)
    return bounds
  }

  return () => {
    const state = mouseState()
    const color = state.mouseDown ? rgba(0, 0, 210, 0.3) : rgba(210, 0, 0, 0.3)
    const component = collectComponents().slice(1).filter(component => inRect(state.point)(component.bounds)).slice(-1)
    const selection = component.map(c => Draw.Rect(c.bounds, rgba(0, 0, 0, 0), Stroke(color, 8, [10, 10])))
    if(state.mouseDown && component.length > 0){
      const delta = Point(state.point.x - state.dragOrigin.x, state.point.y - state.dragOrigin.y)
      const c = component[0]
      page.children = update(page.children, c, Object.assign({}, {render: c.render, bounds: Rect(Point(c.bounds.left + delta.x, c.bounds.top), Point(c.bounds.right + delta.x, c.bounds.bottom + delta.y))}))
      // console.log(delta.x, delta.y, c.bounds.left, c.bounds.top)
    }

    canvas([Draw.Clear(page.bounds)].concat(page.render().concat(selection)))
  }
}

const paint = render => {
  window.requestAnimationFrame(() => {
    render()
    paint(render)
  })
}

window.addEventListener('load', () => {
  const canvasElement = document.createElement('canvas')
  canvasElement.style = 'border: 1px solid red; position: absolute; left: 100px; top: 100px'
  document.body.appendChild(canvasElement)
  const canvas = Canvas(canvasElement, 1440, 640)

  const b1 = Box(Rect(10, 10, 100, 100))
  const b2 = Box(Rect(50, 50, 500, 200))

  const page = Container(Rect(0, 0, 1440, 640), b1, b2)

  const editor = Editor(page, canvas, canvasElement)
  paint(editor)
})


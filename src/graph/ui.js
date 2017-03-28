const Button = (text, x, y, w, h, onClick) => {
  let highlight = false
  let down = false

  const mouseEnter = () => {
    highlight = true
  }

  const mouseLeave = () => {
    highlight = false
  }

  const mouseDown = () => {
    down = true
  }

  const mouseUp = inside => {
    down = false
    if(inside)
      onClick()
  }

  const render = (canvas) => {
    canvas.line(Point(x, y), Point(x + w, y))
    canvas.line(Point(x + w, y), Point(x + w, y + h))
    canvas.line(Point(x + w, y + h), Point(x, y + h))
    canvas.line(Point(x, y + h), Point(x, y))
    canvas.text(Point(x, y), text)
  }

  return {render, mouseEnter, mouseLeave, mouseDown, mouseUp}
}

const Stage = canvas => {
  let components = []

  const addComponent = (component) => {
    components = [...components, component]
  }

  const render = () => {
    components.forEach(c => c.render(canvas))
  }

  return {addComponent, render}
}
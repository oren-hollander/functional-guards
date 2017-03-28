const maze = [
  [1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1],
  [1, 0, 1, 2, 0, 1],
  [1, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1]
]

const Canvas = (canvas, width, height) => {
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${width / 2}px`
  canvas.style.height = `${height / 2}px`
  const ctx = canvas.getContext('2d')
  ctx.font = '32px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const fill = style => {
    ctx.fillStyle = style
  }

  const stroke = style => {
    ctx.strokeStyle = style
  }

  const clear = () => {
    ctx.clearRect(0, 0, width, height)
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

  const text = (p, t) => {
    ctx.fillText(t, p.x, p.y)
  }

  const lineWidth = w => {
    ctx.lineWidth = w
  }

  return {fill, stroke, clear, circle, line, lineWidth, text}
}

function Maze(maze) {
  const actions = []

  function setAction(x, y, value) {
    actions.push({action: 'set', x, y, value})
  }

  function getAction(x, y, value) {
    actions.push({action: 'get', x, y, value})
  }

  function start() {
    actions.push({action: 'start'})
  }

  maze.forEach((row, y) => {
    row.forEach((value, x) => {
      setAction(x, y, value)
    })
  })
  
  start()
  
  return {
    get: function(x, y) {
      getAction(x, y, maze[y][x])
      return maze[y][x]
    },
    set: function(x, y, v) {
      setAction(x, y, v)
      maze[y][x] = v
    },
    actions: function() {
      return actions
    }
  }  
}

const FREE = 0
const WALL = 1
const TARGET = 2
const VISITED = 3

function solve(maze, x, y) {
  const value = maze.get(x, y)
  if(value === WALL || value === VISITED)
    return false

  if(value === TARGET)
    return true
  
  maze.set(x, y, VISITED)
  
  return solve(maze, x + 1, y) || solve(maze, x - 1, y) || solve(maze, x, y + 1) || solve(maze, x, y - 1);
}

function animateMaze(actions){
  const initActions = _.takeWhile(actions, a => a.action !== 'start')
  const solveActions = _.takeRightWhile(actions, a => a.action !== 'start')

  const canvasElement = document.createElement('canvas')
  canvasElement.style = 'border: 1px solid red; position: absolute; left: 100px; top: 100px'
  document.body.appendChild(canvasElement)
  canvasElement.addEventListener('click', () => {console.log('clicked')})
  const canvas = Canvas(canvasElement, 1440, 640)

  initActions.forEach(action => drawSetCell(action.x, action.y, action.value))
  const maze = initActions.reduce((maze, {x, y, value}) => {
    if(maze.length <= y)
      maze[y] = []
    maze[y][x] = value
    return maze
  }, [])

  function drawGetCell(x, y) {
    canvas.fill('rgba(0, 0, 0, 0)')
    canvas.stroke('#00FF00')
    canvas.lineWidth(4)
    canvas.circle({x: 20 + x * 50, y: 20 + y * 50}, 20)
  }

  function drawSetCell(x, y, value) {
    if(value === FREE)
      canvas.fill('#FFFFFF')
    else if (value === WALL)
      canvas.fill('#000000')
    else if (value === TARGET)
      canvas.fill('#FF0000')
    else if (value === VISITED)
      canvas.fill('#00FF00')

    canvas.circle({x: 20 + x * 50, y: 20 + y * 50}, 20)
  }

  function drawStep() {
    if(solveActions.length === 0)
      return

    const action = solveActions.shift()
    if(action.action === 'get')
      drawGetCell(action.x, action.y)
    else
      drawSetCell(action.x, action.y, action.value)

    setTimeout(drawStep, 1000)
  }

  drawStep()
}

function run(solver, maze) {
  const m = Maze(maze)
  console.log(solver(m, 1, 1))
  animateMaze(m.actions())
}

function main() {
  run(solve, maze)
}

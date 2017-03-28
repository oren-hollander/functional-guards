'use strict'

const scheme = {
  payloads: {
    a: "#FF0000",
    b: "#00FF00",
    c: "#0000FF"
  },
  nodes: [
    {
      label: "1",
      payloads: ["a"],
      x: 100,
      y: 100
    },
    {
      label: "2",
      payloads: ["b", "c"],
      x: 200,
      y: 100
    },
    {
      label: "3",
      payloads: [],
      x: 100,
      y: 200
    },
    {
      label: "4",
      payloads: [],
      x: 200,
      y: 200
    }
  ],
  edges: [
    [1, 2],
    [2, 4],
    [2, 3]
  ],
  units: [
    [
      ["a", "1", "2"],
      ["b", "2", "3"]
    ],
    [
      ["a", "2", "3"],
      ["b", "2", "1"]
    ]
  ]
}

const Node = (label, x, y, payloads = []) => ({label, payloads, x, y})
const Edge = (label1, label2) => ({label1, label2})

Edge.equals = (edge1, edge2) =>
  edge1.label1 === edge2.label1 && edge1.label2 === edge2.label2 ||
  edge1.label1 === edge2.label2 && edge1.label2 === edge2.label1

const Graph = (nodes = [], edges = []) => {
  const addNode = node => {
    if(nodes.some(n => n.label === node.label))
      throw 'Node already exists'

    return Graph([... nodes, node], edges)
  }

  const removeNode = label => Graph(nodes.filter(n => n.label !== label), edges)

  const findNode = label => nodes.find(n => n.label === label)

  const updateNode = (label, x, y) => {
    const node = findNode(label)
    if(node === void 0)
      throw `Node doesn't exist`;

    return removeNode(label).addNode(Node(label, x, y, node.payloads))
  }

  const addEdge = (edge) => {
    const node1 = findNode(edge.label1)
    const node2 = findNode(edge.label2)
    if(node1 === void 0 || node2 == void 0)
      throw `Nodes doesn't exist`

    if (edges.some(e => Edge.equals(e, edge)))
      throw 'edge already exists'

    return Graph(nodes, [... edges, edge])
  }

  const removeEdge = edge => {
    return Graph(nodes, edges.filter(e => !Edge.equals(e, edge)))
  }

  const addPayload = (label, payload) => {
    const node = findNode(label)
    if(node === void 0)
      throw `Node doesn't exist`

    const newNode = Node(node.label, node.x, node.y, node.payloads.concat(payload))
    return removeNode(label).addNode(newNode)
  }

  const removePayload = (label, payload) => {
    const node = findNode(label)
    if(node === void 0)
      throw `Node doesn't exist`

    const newNode = Node(node.label, node.x, node.y, node.payloads.filter(p => p !== payload))
    return removeNode(label).addNode(newNode)
  }

  const transmit = (sourceLabel, targetLabel, payload) => {
    const sourceNode = findNode(sourceLabel)
    const targetNode = findNode(targetLabel)

    if(sourceNode === void 0 || targetNode == void 0)
      throw `Nodes doesn't exist`

    const edge = Edge(sourceLabel, targetLabel)

    if (!edges.some(e => Edge.equals(e, edge)))
      throw `edge does't exist`

    if (!sourceNode.payloads.includes(payload))
      throw `source payload does't exist`

    if (targetNode.payloads.includes(payload))
      throw `target payload already exists`

    return removeNode(targetLabel).addNode(Node(targetNode.label, targetNode.x, targetNode.y, [...targetNode.payloads, payload]))
  }

  const getNodeByLocation = point => nodes.find(node => Point.distance(Point(node.x, node.y), point) <= 15)
  
  return {nodes, edges, addNode, removeNode, findNode, updateNode, addEdge, removeEdge, addPayload, removePayload, transmit, getNodeByLocation}
}

const Point = (x, y) => {
  const shift = (dx, dy) => Point(x + dx, y + dy)
  return {x, y, shift}
}

Point.interpolate = (p1, p2, progress) => {
  const lX = p2.x - p1.x
  const lY = p2.y - p1.y
  return Point(p1.x + lX * progress, p1.y + lY * progress)
}

Point.distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))

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

const Transmission = (source, target, payload) => ({source, target, payload})

const renderGraph = (graph, payloads, canvas, transmissions = [], progress = 0) => {
  const edgeBusy = edge => transmissions.some(t => Edge.equals(edge, Edge(t.source, t.target)))

  canvas.clear()

  canvas.stroke('#000000')
  graph.edges.forEach(edge => {
    const node1 = graph.findNode(edge.label1)
    const node2 = graph.findNode(edge.label2)
    if(edgeBusy(edge)){
      canvas.lineWidth(4)
    }
    else {
      canvas.lineWidth(1)
    }
    canvas.line(Point(node1.x, node1.y), Point(node2.x, node2.y))
  })

  canvas.lineWidth(3)
  transmissions.forEach(t => {
    const source = graph.findNode(t.source)
    const target = graph.findNode(t.target)
    const p = Point.interpolate(Point(source.x, source.y), Point(target.x, target.y), progress)
    const payloadColor = payloads[t.payload]
    canvas.stroke(payloadColor)
    canvas.fill(payloadColor)
    canvas.circle(p, 20)
    canvas.fill('#FFFFFF')
    canvas.text(p, t.payload)
  })

  graph.nodes.forEach(node => {
    const p = Point(node.x, node.y)
    canvas.fill('#FFFFFF')

    if(node.payloads.length > 0) {
      canvas.lineWidth(3)
      canvas.stroke(payloads[node.payloads[0]])
    }
    else {
      canvas.lineWidth(1)
      canvas.stroke('#000000')
    }

    canvas.circle(p, 30)
    canvas.fill('#000000')
    canvas.text(p, node.label)
  })
}

const GraphRenderer = canvas => {
  var graph = void 0
  var transmissions = void 0
  var progress = void 0

  const render = () => {
    if(graph)
      renderGraph(graph,  {'A': '#FF0000'}, canvas, transmissions, progress)

    window.requestAnimationFrame(render)
  }

  render()

  return {
    setGraph: g => {
      graph = g
    },
    setTransmissions: ts => {
      transmissions = ts
    },
    setProgress: p => {
      progress = p
    }
  }
}

window.addEventListener('load', () => {
  const canvasElement = document.createElement('canvas')
  canvasElement.style = 'border: 1px solid red; position: absolute; left: 100px; top: 100px'
  document.body.appendChild(canvasElement)
  canvasElement.addEventListener('click', () => {console.log('clicked')})
  const canvas = Canvas(canvasElement, 1440, 640)


  const graph = Graph()
    .addNode(Node('1', 100, 100, ['A']))
    .addNode(Node('2', 500, 100))
    .addNode(Node('3', 100, 500))
    .addNode(Node('4', 500, 500))
    .addEdge(Edge('1', '2'))
    .addEdge(Edge('2', '3'))
    .addEdge(Edge('2', '4'))


  const transmissions = [[Transmission('1', '2', 'A')], [Transmission('2', '3', 'A'), Transmission('2', '4', 'A')]]
  const renderer = GraphRenderer(canvas)

  const simulate = (graph, transmissions) => {
    renderer.setGraph(graph)
    if(transmissions.length !== 0) {

      var progress = 0

      const render = () => {
        renderer.setTransmissions(transmissions[0])
        renderer.setProgress(progress)
        progress += 0.01
        if (progress < 1) {
          window.setTimeout(render, 1000 / 60)
        }
        else {
          const g = transmissions[0].reduce((g, t) => g.transmit(t.source, t.target, t.payload), graph)
          renderer.setGraph(g)
          renderer.setTransmissions(void 0)
          renderer.setProgress(void 0)
          window.setTimeout(() => {simulate(g, transmissions.slice(1))}, 500)
        }
      }

      render()
    }
  }

  simulate(graph, transmissions)
})

'use strict'

const relative = comp => ({
  right: v => `${comp}.right`
})

const def = (defs = []) => ({
  left: v => def([...defs, {left: v}]),
  right: v => def([...defs, {right: v}]),
  width: v => def([...defs, {width: v}]),
  top: v => def([...defs, {top: v}]),
  bottom: v => def([...defs, {bottom: v}]),
  height: v => def([...defs, {height: v}]),
  children: childDefs => {
    return Object.assign({}, defs.reduce(Object.assign, {}), {children: []})
  }
})

const Def = def()

const page1 = Def.left(0).width(720)
const page = {
  left: 0,
  width: 720,
  top: 0,
  height: 320,
  children: {
    comp1: {
      right: 20,
      width: 0.1,
      top: 10,
      height: 100
    },
    comp2: {
      left: 20,
      right: 20
    },
    comp3: {
      left: 20,
      width: 100
    },
    comp4: {
      left: 0.2,
      right: 0.8
    },
    container1: {
      left: 100,
      top: 100,
      width: 200,
      children: {
        comp1: {
          left: 0.1,
          right: 0.1,
          top: 10,
          height: 20
        },
        comp2: {
          left: 0.1,
          right: 0.1,
          top: relative('comp1').top(10)
        }
      }
    }
  }
}
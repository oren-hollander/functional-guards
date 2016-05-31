'use strict'

const Clock = () => {

  let callbacks = []

  const onFrame = ts => {
    callbacks.forEach((cb, i) => {
      if(cb(ts))
        callbacks.splice(i, 1)
    })
    window.requestAnimationFrame(onFrame)    
  }
  
  window.requestAnimationFrame(onFrame)
  
  return callback => {
    callbacks.push(callback)
    return () => {
      const i = callbacks.findIndex(cb => cb === callback)
      if (i >= 0)
        callbacks = callbacks.slice(0, i).concat(callbacks.slice(i + 1))
    }
  }
} 

const clock = Clock()


const inOutLoop = (duration, f) => {

  const inAnimation = () => {
    animate(duration, f, outAnimation)
  }

  const outAnimation = () => {
    animate(duration, x => f(1 - x), inAnimation)
  }

  inAnimation()
}

const animate = (duration, f, onDone = () => {}) => {
  let delta = void 0
  clock(ts => {
    if(delta === void 0)
      delta = ts
    if(ts - delta < duration){
      f((ts - delta) / duration)
      return false
    }
    else {
      f(1)
      onDone()
      return true
    }
  })
}
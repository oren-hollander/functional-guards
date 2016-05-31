'use strict'

const Overridable = (base, override) => {
  const computeMutual = (a, b) => {

  }

  const diff = (a, b) => {

  }

  const patch = (b, o) => {

  }

  const mutual = computeMutual(base, override)
  const basePartial = diff(base, override)
  const overridePartial = diff(override, base)

  const getBase = () => patch(mutual, basePartial)
  const getOverride = () => patch(mutual, overridePartial)
  const setBase = base => Overridable(base, getOverride())
  const setOverride = override => Overridable(getBase(), override)

  return {getBase, setBase, getOverride, setOverride}
}

const flatten = value => {
  const map = {}

  const addToMap = (key, value) => {
    if(key !== '') {
      key = key.slice(1)
      map[key] = value
    }
  }

  const addValue = (value, prefix) => {
    if (value === null || typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean'){
      addToMap(prefix, value)
    }
    else if(Array.isArray(value)){
      addToMap(prefix, [])
      value.forEach((v, i) => {
        addValue(v, `${prefix}[${i}]`)
      })
    }
    else if (typeof value === 'object'){
      addToMap(prefix, {})
      for (let key of Object.keys(value)){
        addValue(value[key], `${prefix}.${key}`)
      }
    }
  }
  
  addValue(value, '')
  return map
}

// console.log(typeof undefined)
// console.log(flatten({x: 1, y: 2, z: [1, 2, 3, {xx: 1, yy: 'g'}], w: {r: 1, v: [1, null]}}))
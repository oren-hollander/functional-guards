'use strict'

// const JsonPointer = (path = []) => {
//
//   return new Proxy(function() {}, {
//     get: (_, key) => {
//       return JsonPointer(path.concat(key))
//     },
//     set: () => {
//       return false
//     },
//     apply: () => {
//       return path
//     }
//   })
// }

const JsonValue = json => {

  const get = ptr => {
    if(path.length === 0)
      return json
    else
      return JsonValue(json[path[0]], path.slice(1)).get()
  }

  const set = (ptr, value) => {
    if(path.length === 1)
      json[path[0]] = value
    else
      return JsonValue(json[path[0]], path.slice(1)).set(value)
  }

  return {get, set}
}

// const json = {a: {b: 42, c: [1, 2, {d: 9}]}}
// const ptr1 = '/a/b'
// const ptr2 = '/a/c/2/d'
//
// const v = JsonValue(json)
// console.log(v.get(ptr2))
// v.set(ptr2, 10)
// console.log(v.get(ptr2))

const JsonRef = (root, ptr) => {
  if(!root || root === '')
    return {$ref: ptr}
  else
    return {$ref: `${root}#${ptr}`}
}

// const JsonProxyRoot = json => {
//
// }
//
// const JsonProxy = (parent, key) => {
//
//   const get = (target, property) => {
//     return target[property]
//   }
//
//   const set = (target, property, value) => {
//     target[property] = value
//     return true
//   }
//
//   return new Proxy({}, {get, set})
// }
//
// const JsonData = modes => {
//   let modeValues = modes.reduce((obj, mode) => {
//     obj[mode] = {}
//     return obj
//   }, {})
//
//   const json = {}
//   modes.forEach(mode => {
//     Object.defineProperty(json, mode, {
//       value: modeValues[mode]
//     })
//   })
//
//   Object.seal(json)
//   return {
//     mode: m => key => {},
//     master: key => {}
//   }
// }

const JsonRepository = (roots) => {

  const writes = []
  const data = {}

  return {
    mode: m => ({
      get: ptr => {
        if(writes.length === 0){

          writes.length = 0
        }
        return data[m]
      },
      set: (ptr, value) => {
        writes.push([m, ptr, value])
      }
    })
  }
}
//
// const json = JsonData()
// json.mode1.x = 7
// json.mode1.y.x = 5
// json.mode2.y.z = [1, 2, 3]
// json.mode1.y.z[3] = 4
//
//
// json.write('mode1', '', {x: 1, y: 'hello', z: [1, 2, 3], u: {v: 1, w: 3}})
// json.write('mode1', '/z/0', -1)
// const value = json.read('master', '/z/0')
// json.write('mode2', JsonPointer('/p'), JsonReference('data', JsonPointer('/styles/myStyle')))
// json.read('mode2', JsonPointer('/p'), true)

// json['mode1'].y = {z: 4}
//
// console.log(json.mode1.x)
// console.log(json.mode1.y.z)

// const test = () => {
//   const jsr = JsonRepository(['structure', 'data', 'design'], ['m1', 'm2'])
//   jsr['structure']['m1'].x = {y: 10}
//   console.log(jsr['structure']['m1'].x.y)
//   console.log(jsr['structure']['m2'].x)
// }

// test()
// const j = Json()
// j.x = 3
// console.log(j.x)
// console.log(j['x'])
// console.log(j[1])


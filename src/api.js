
const DocumentServices = () => {

  let map = {}
  let queue = []
  let key = 1

  const nextKey = () => `key-${key++}`

  const drain = () => new Promise(resolve => {
    setTimeout(() => {
      console.log('Draining queue')
      queue.forEach(({op, key, value}) => {
        switch(op){
          case 'set':
            map[key] = value
            break
          case 'del':
            delete map[key]
            break
        }
      })
      queue = []
      resolve(map)
    }, 1000)
  })

  const shouldDrain = key => queue.length > 0 && queue.some(q => q.key === key)

  let drainPromise = null

  return {
    create: value => {
      const key = nextKey()
      queue = [...queue, {op: 'set', key, value}]
      return key
    },
    set: (key, value) => {
      queue = [...queue, {op: 'set', key, value}]
    },
    del: key => {
      queue = [...queue, {op: 'del', key}]
    },
    get: key => {
      const getValue = key => map => map[key]

      const resetDrainPromise = map => {
        drainPromise = null
        return map
      }

      if(drainPromise){
        return drainPromise.then(getValue(key))
      }
      else if(shouldDrain(key)){
        drainPromise = drain()
        return drainPromise.then(resetDrainPromise).then(getValue(key))
      }
      else {
        return Promise.resolve(map[key])
      }
    }
  }
}

const print = x => console.log(x)

const ds = DocumentServices()
const p1 = ds.create('value 1')
const p2 = ds.create('value 2')

ds.get(p1).then(print)
ds.get(p2).then(print)

setTimeout(() => {
  ds.set(p1, 'value 3')
  ds.get(p1).then(print)
}, 2000)
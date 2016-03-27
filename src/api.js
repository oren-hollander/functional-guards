
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

  const getValue = key => map => map[key]

  const resetDrainPromise = x => {
    drainPromise = null
    return x
  }

  const readApi = {
    get: key => getValue(key)(map)
  }

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
    },
    read: f => {
      if(drainPromise){
        drainPromise.then(() => f(readApi))
      }
      else if(queue.length > 0){
        drainPromise = drain()
        return drainPromise.then(resetDrainPromise).then(() => f(readApi))
      }
      else {
        f(readApi)
      }
    }
  }
}

const print = x => console.log(x)

const ds = DocumentServices()

console.log('create 3 entries')
const p1 = ds.create('value 1')
const p2 = ds.create('value 2')
const p3 = ds.create('value 3')

console.log('read 2 entries using promises - expect one queue drain for both reads')
ds.get(p1).then(print)
ds.get(p2).then(print)

setTimeout(() => {
  console.log('set and then read an entry - expect one queue drain')
  ds.set(p1, 'value 4')
  ds.get(p1).then(print)
}, 2000)

setTimeout(() => {
  console.log('set and then read two entries - expect one queue drain for both reads')
  ds.set(p1, 'value 5')
  ds.set(p2, 'value 6')
  ds.read((api) => {
    console.log(api.get(p1))
    console.log(api.get(p2))
  })
}, 4000)

setTimeout(() => {
  console.log('set one entry and then read another entry - expect no queue drain')
  ds.set(p3, 'value 7')
  ds.get(p1).then(print)
}, 6000)


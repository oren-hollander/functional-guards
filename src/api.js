
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

  return {
    create: value => {
      const key = nextKey()
      queue = [...queue, {op: 'set', key, value}]
      return Promise.resolve(key)
    },
    set: key => value => {
      queue = [...queue, {op: 'set', key, value}]
      return Promise.resolve()
    },
    del: key => {
      queue = [...queue, {op: 'del', key}]
      return Promise.resolve()
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
    }
  }
}

const print = x => {
  console.log(x)
  return x
}

const ds = DocumentServices()

const mul = x => y => x * y
const getX = _ => ds.get('x')
const setX = ds.set('x')

setX(3)
  .then(getX)
  .then(print)
  .then(mul(2))
  .then(setX)
  .then(getX)
  .then(print)

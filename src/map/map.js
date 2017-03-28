const jsonReducer = (map, value, index) => {
  map[index] = value
  return map
}

function MyMutableMap() {
  const map = []
  return {
    add: function(value) {
      map[map.length] = value
    },
    remove: function(key) {
      delete map[key]
    },
    update: function(key, value) {
      if(!(key in map))
        throw `key ${key} is not in map`

      map[key] = value
    },
    keys: function() {
      return Object.keys(map).map(k => parseInt(k))
    },
    isDefined: function(key) {
      return key in map
    },
    toJSON: function() {
      return map.reduce(jsonReducer, {})
    }
  }
}

const myMutableMap = MyMutableMap()
myMutableMap.add('a')
myMutableMap.add('b')
myMutableMap.add('c')
myMutableMap.add('d')
myMutableMap.add('e')
myMutableMap.add('f')
myMutableMap.remove(1)
myMutableMap.remove(3)
myMutableMap.remove(4)
myMutableMap.add('g')
myMutableMap.update(2, 'cc')

// console.log(JSON.stringify(myMutableMap))
// console.log(myMutableMap.keys())
// console.log(myMutableMap.isDefined(1))
// console.log(myMutableMap.isDefined(2))

const MyImmutableMap = (map = []) => ({
  add: value => {
    const m = Object.assign([], map)
    m[m.length] = value
    return MyImmutableMap(m)
  },
  remove: key => {
    const m = Object.assign([], map)
    delete m[key]
    return MyImmutableMap(m)
  },
  update: (key, value) => {
    if(!(key in map))
      throw `key ${key} is not in map`

    const m = Object.assign([], map)
    m[key] = value
    return MyImmutableMap(m)
  },
  keys: () => Object.keys(map).map(k => parseInt(k)),
  isDefined: key => key in map,
  toJSON: () => map.reduce(jsonReducer, {})
})

const myImmutableMap = MyImmutableMap()
  .add('a')
  .add('b')
  .add('c')
  .add('d')
  .add('e')
  .add('f')
  .remove(1)
  .remove(3)
  .remove(4)
  .add('g')
  .update(2, 'cc')

// console.log(JSON.stringify(myImmutableMap))

const obj = {
  str: 'hello',
  num: 42,
  arr: ['a', 'b', 'c'],
  map: myImmutableMap,
  arrOfMap: [1, 2, myImmutableMap]
}

// console.log(myImmutableMap.keys())
// console.log(myImmutableMap.isDefined(1))
// console.log(myImmutableMap.isDefined(2))
//
// console.log(JSON.stringify(obj, undefined, 2))


const MyFunctionalMap = () => {

  const clone = map => Object.assign([], map)

  function toJSON(){
    return this.reduce(jsonReducer, {})
  }

  return {
    create: () => {
      const m = []
      m.toJSON = toJSON
      return m
    },
    fromArray: array => {
      const m = clone(array)
      m.toJSON = toJSON
      return m
    },
    fromObject: object => {
      const keys = Object.keys(object).map(k => parseInt(k))
      if (keys.some(k => !Number.isInteger(k)))
        throw 'object contains non integer keys'

      const m = keys.sort().map(k => ({key: k, value: object[k]})).reduce((array, {key, value}) => {
        array[key] = value
        return array
      }, [])
      m.toJSON = toJSON
      return m
    },
    add: map => value => {
      const m = clone(map)
      m[m.length] = value
      return m
    },
    remove: map => key => {
      const m = clone(map)
      delete m[key]
      return m
    },
    update: map => (key, value) => {
      if (!(key in map))
        throw `key ${key} is not in map`

      const m = clone(map)
      m[key] = value
      return m
    },
    keys: map => Object.keys(map).map(k => parseInt(k)),
    isDefined: map => key => key in map
  }
}

const api = MyFunctionalMap()

const m1 = api.create()
const m2 = api.add(m1)('a')
const m3 = api.add(m2)('b')
const m4 = api.add(m3)('c')
const m5 = api.add(m4)('d')
const m6 = api.add(m5)('e')
const m7 = api.add(m6)('f')
const m8 = api.remove(m7)(1)
const m9 = api.remove(m8)(3)
const m10 = api.remove(m9)(4)
const m11 = api.add(m10)('g')
const m12 = api.update(m11)(2, 'cc')
// console.log('---------------')
// console.log(JSON.stringify(m12))

const mo1 = api.fromObject({5: 'e', 1: 'a', 2: 'b', 4: 'd'})
// console.log(JSON.stringify(mo1))

// function T () {
//   var x = Object.assign([], this)
//   return x;
// }
//
// T.prototype.x = function(){
//   return 's';
// };
//
// var t = new T();

function AutoMap(map) {
  if(map === undefined)
    map = [];

  map.toJSON = function () {
    return this.reduce(function (m, v, i) {
      m[i] = v;
      return m;
    }, {});
  }
  return map;
}

AutoMap.fromJson = function (json) {

  var keys = Object.keys(json).map(function (key) {
    return parseInt(key);
  });

  if (keys.some(function (key) {
      return !Number.isInteger(key) || key < 0
    }))
    throw 'object should only contain non-negative integer keys';

  return AutoMap(keys
    .map(function (key) {
      return {key: key, value: json[key]};
    })
    .reduce(function (array, kv) {
      array[kv.key] = kv.value;
      return array;
    }, []));
};

var am = AutoMap.fromJson({'0': 'a', '5': 'b'})
// var am = AutoMap(['a', 'b']);
// am.push('a');
// am.push('b');
// am.push('c');
// am.push('d');
// delete am[1];
// delete am[2];
// am[0] = 'aa';
console.log(JSON.stringify(am));




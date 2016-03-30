'use strict'

const DEBUG_TYPES = true

const check = (value, condition, error) => {
  if(condition)
    return value
  else
    throw new TypeError(error)
}

const tryCatch = thunk => {
  try {
    return thunk()
  }
  catch (e) {
    return e
  }
}

const isTypeError = e => e !== void 0 && e.constructor && e.constructor === TypeError

const any = x => x
const unit = v => check(v, v === void 0, 'Expected a unit')

const classOf = c => v => check(v, Function.prototype.call.bind({}.toString)(v) === `[object ${c}]`, `Expected ${c}`)
const typeOf = t => v => check(v, typeof v === t, `Expected ${t}`)

const array = classOf('Array')
const date = classOf('Date')
const regex = classOf('RegExp')

const func = typeOf('function')
const str = typeOf('string')
const obj = typeOf('object')
const bool = typeOf('boolean')
const num = typeOf('number')

const or = (...cs) => v => {
  const typeErrors = arr(func)(cs).map(c => tryCatch(_ => c(v))).filter(isTypeError)
  check(null, typeErrors.length !== cs.length, typeErrors.reduce((te1, te2) => te1.message + ' or ' + te2.message))
  return v
}

const and = (...cs) => v => arr(func)(cs).reduce((v, c) => c(v), v)

const not = c => v => {
  const result = tryCatch(_ => c(v))
  if(isTypeError(result))
    return v
  else
    throw new TypeError(`Didn't expect ${v}`)
}

const instanceOf = ctor => inst => check(v, inst instanceof ctor, `Expected an instance of ${ctor}`)

const int = n => check(n, (n | 0) === n, 'Expected an integer')

const nat = n => check(n, (n | 0) === n && n >= 0, 'Expected a natural')

const arr = c => a => array(a).map(func(c))

const map = c => o => Object.keys(obj(o)).reduce((r, k) => Object.assign(r, {[k]: func(c)(o[k])}), {})

const tuple = cs => args => {
  check(null, args.length === cs.length, `Expected ${cs.length} arguments`)
  return arr(func)(cs).map((c, i) => c(array(args)[i]))
}

const intf = i => v => Object.keys(map(func)(i)).reduce((r, k) => Object.assign(r, {[k]: i[k](obj(v)[k])}), {})

const debugTypes = (f, g) => typeof DEBUG_TYPES === 'undefined' ? f : g

const funx = (...cs) => f => (...args) =>
  fun(...cs)(f)(...args.slice(0, cs.length - 1))

const fun = (...cs) => f => (...args) =>
  debugTypes(f, func(cs[cs.length - 1])(f(...tuple(arr(func)(cs.slice(0, cs.length - 1)))(args))))

const gen = (...cs) => f => f(...cs)

//////////////////////////////////////
//             Tests
//////////////////////////////////////

const expect = exp => ({
  toBe: value => {
    if(_.isEqual(exp, value))
      console.log(value)
    else
      console.error(`${exp} is not ${value}`)
  }
})

const fail = f => {
  try {
    f()
    if(typeof DEBUG_TYPES !== 'undefined')
      console.error('Expected TypeError to be thrown')
  }
  catch (e){
    if(e.constructor === TypeError)
      console.log(e.message)
    else
      console.error('Expected a TypeError')
  }
}

const generalFunction = fun(any, any)(x => x.toString())
expect(generalFunction(4)).toBe('4')
expect(generalFunction(true)).toBe('true')

const aFunctionThatDoesNothing = fun(unit)(() => {})
expect(aFunctionThatDoesNothing()).toBe(void 0)
fail(_ => aFunctionThatDoesNothing(1))

const constantFunction = fun(unit)(() => 3)
fail(_ => constantFunction())

const add = fun(num, num, num)((x, y) => x + y)

const intMap = {a: 1, b: 2, c: 3}
const notAnIntMap = {a: 1, b: 1.1, c: '42'}

expect(map(int)(intMap)).toBe(intMap)
fail(_ => map(int)(notAnIntMap))

expect(add(1, 2)).toBe(3)
fail(_ => add(1, '1'))

const apply = fun(int, int, fun(int, int, int), int)((x, y, f) => f(x, y))
expect(apply(3, 2, (a, b) => a + b)).toBe(5)
expect(apply(3, 2, add)).toBe(5)

const even = v => check(v, v % 2 === 0, 'Expected an even number')
const dividedBy3 = v => check(v, v % 3 === 0, 'Expected a number that is divided by 3')

expect(even(2)).toBe(2)
fail(_ => even(1))

expect(dividedBy3(3)).toBe(3)
fail(_ => dividedBy3(1))

const evenAnDividedBy3 = and(even, dividedBy3)
fail(_ => evenAnDividedBy3(3))
fail(_ => evenAnDividedBy3(2))
expect(evenAnDividedBy3(6)).toBe(6)

const person = intf({name: str, age: nat})

const printPerson = fun(person, str)(p => `My name is ${p.name} and I'm ${p.age} years old.`)
expect(printPerson({name: 'John', age: 42})).toBe('My name is John and I\'m 42 years old.')
fail(_ => printPerson({name: 'John', age: '42'}))
fail(_ => printPerson({name: 'John', age2: 42}))
fail(_ => printPerson({nam: 'John', age2: 42}))

const eitherIntOrString = fun(or(int, str), str)(x => x.toString())
expect(eitherIntOrString(1)).toBe('1')
expect(eitherIntOrString('1')).toBe('1')
fail(_ => eitherIntOrString(true))

const intToString = funx(int, str)(i => i.toString())
// const is2ss = is => is.map(i => intToString(i))
const is2ss = is => is.map(intToString)

const mapIntsToStrings = fun(arr(int), arr(str))(is2ss)
expect(mapIntsToStrings([1, 2, 3])).toBe(['1', '2', '3'])

// const genReduce = gen(any)(t => fun(arr(t), fun(t, t, t), t)((ts, ft) => ts.reduce((a, b) => ft(a, b))))
const genReduce = gen(any)(T => fun(arr(T), funx(T, T, T), T)((ts, ft) => ts.reduce(ft)))

const concat = fun(str, str, str)((a, b) => a + b)

expect(genReduce([1, 2], add)).toBe(3)
expect(genReduce(['a', 'b'], concat)).toBe('ab')
fail(_ => genReduce([1, 2], concat))
fail(_ => genReduce(['a', 'b'], add))

const nonEmptyArr = a => check(array(a), a.length > 0, 'Expected a non empty array')
const nonEmptyIntArray = and(arr(int), nonEmptyArr)
expect(nonEmptyIntArray([1, 2, 3])).toBe([1, 2, 3])
fail(_ => nonEmptyIntArray([]))
fail(_ => nonEmptyIntArray(['1']))

const arrayOfIntOrStr = arr(or(int, str))
expect(arrayOfIntOrStr([1, 2, 3, 4])).toBe([1, 2, 3, 4])
expect(arrayOfIntOrStr(['1', '2', '3', '4'])).toBe(['1', '2', '3', '4'])
expect(arrayOfIntOrStr([1, 2, '3', '4'])).toBe([1, 2, '3', '4'])
fail(_ => arrayOfIntOrStr([1, 2, true, false]))

const arrayOfIntOrArrayOfString = or(arr(int), arr(str))
expect(arrayOfIntOrArrayOfString([1, 2, 3, 4])).toBe([1, 2, 3, 4])
expect(arrayOfIntOrArrayOfString(['1', '2', '3', '4'])).toBe(['1', '2', '3', '4'])
fail(_ => arrayOfIntOrArrayOfString([1, 2, '3', '4']))

// const Person = fun(str, nat, person)((name, age) => Object.assign(Object.create({type: 'Person'}), {name, age}))
const Person = (name, age) => Object.assign(Object.create({type: 'Person'}), {name, age})


const p1 = Person('John', 42)
const p2 = Person('Paul', 43)
console.log(p1)
console.log(p1.type)
console.log(p2)
console.log(p2.type)
console.log(person(p1))
console.log(person(p1).type)
console.log(person(p2))
console.log(person(p2).type)



// const Ord = gen(any)(T => intf({gt: fun(T, T, bool)}))
// console.log(p1.prototype.type)

// const Nil = void 0
//
// const list = function list(v){
//   if(v === Nil)
//     return v
//   else
//     return intf({head: any, tail: list})(v)
// }
//
// const l1 = list(Nil)
//
// const nil = fun(list, bool)(l => l === Nil)
// const cons = fun(any, list, list)((v, l) => ({head: v, tail: l}))
//
// console.log(nil(l1))
//
// const nilError = () => {throw new Error('Nil')}
//
// const head = fun(list, any)(l => nil(l) ? nilError() : l.head)
// const tail = fun(list, list)(l => nil(l) ? nilError() : l.tail)
//
// const l2 = cons(5, Nil)
// console.log(nil(l2))
// console.log(head(l2))
//
// const l3 = cons('6', l2)
// console.log(tail(l3))
// console.log(l3)
//
// const genList = function genList(T) {
//   return v => {
//     if (v === Nil)
//       return v
//     else
//       return intf({head: T, tail: genList(T)})(v)
//   }
// }
//
// const gl1 = genList(int)(Nil)
// console.log(gl1)
//
// const gl2 = genList(int)({head: 1, tail: Nil})
// console.log(gl2)
//
// const gl3 = genList(int)({head: 1, tail: {head: 2, tail: Nil}})
// console.log(gl3)
//
// const genCons = T => fun(T, genList(T), genList(T))((h, t) => ({head: h, tail: t}))
//
// const gl4 = genCons(int)(1, Nil)
// console.log(gl4)
//
// const gl5 = genCons(int)(2, gl4)
// console.log(gl5)
// console.log(genList(int)(gl4))
//
//
// const List = T => ({
//   cons: fun(T, genList(T), genList(T))(cons)
// })
//
// const IntList = List(int)
// const xx1 = IntList.cons(1, Nil)
// const xx2 = IntList.cons(2, xx1)
//
// console.log(xx1)
// console.log(xx2)









// const intList = genList(int)
// const x = genCons(1, Nil)(1, Nil)

// console.log('x', x)

// const append = gen(any)(T => fun(list(T), T, list(T))((l, v) => nil(l) ? cons(v, Nil) : cons(head(l), append(tail(l), v))))
// const reverse = gen(any)(T => fun(list(T), list(T))(l => nil(l) ? l : append(reverse(tail(l)), head(l))))
// const show = gen(any)(T => fun(list(T), str)(l => nil(l) ? 'Nil' : head(l) + ' : ' + show(tail(l))))

// const l1 = cons(1, Nil)
// console.log(show(l1))
//
// const l2 = cons(2, l1)
// console.log(show(l2))
//
// const l3 = append(l2, 3)
// console.log(show(l3))
// const l4 = reverse(l3)
// console.log(show(l4))
//
// console.log(list(l1))
// console.log(list(undefined))
// console.log(list(l1))
//
